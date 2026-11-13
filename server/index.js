import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("Memory Duel server đang chạy"));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const TURN_TIME = 20; // giây mỗi lượt (khớp với client)
const EMOJIS = ["👍", "😂", "😮", "😡", "🔥", "👏"];
const AVATARS = [
  "🦊", "🐧", "🐱", "🐶", "🐼", "🐰",
  "🐸", "🦉", "🐯", "🐨", "🦄", "🐙",
];
const FACES = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🥝", "🍍", "🥑", "🍋", "🥥"];
const LEVELS = {
  easy: { label: "Dễ", pairs: 6, cols: 4, remember: 0.3 },
  normal: { label: "Vừa", pairs: 8, cols: 4, remember: 0.65 },
  hard: { label: "Khó", pairs: 12, cols: 6, remember: 0.95 },
};
const rooms = {};
const queues = { easy: [], normal: [], hard: [] }; // hàng chờ ghép trận
const leaderboard = new Map(); // profileId -> thống kê

function leaveQueues(id) {
  for (const k of Object.keys(queues)) queues[k] = queues[k].filter((w) => w.id !== id);
}

// Ghi thống kê sau ván giữa 2 người thật
function recordStats(room, winner) {
  if (room.ai) return;
  for (const p of room.players) {
    const pid = io.sockets.sockets.get(p.id)?.data?.profileId;
    if (!pid) continue;
    const s = leaderboard.get(pid) || {
      name: p.name, avatar: p.avatar, games: 0, wins: 0, draws: 0, points: 0,
    };
    s.name = p.name;
    s.avatar = p.avatar;
    s.games++;
    if (winner === "draw") {
      s.draws++;
      s.points += 1;
    } else if (winner === p.mark) {
      s.wins++;
      s.points += 3;
    }
    leaderboard.set(pid, s);
  }
}

function topPlayers() {
  return [...leaderboard.values()]
    .sort((a, b) => b.points - a.points || b.wins - a.wins)
    .slice(0, 10);
}

const other = (m) => (m === "X" ? "O" : "X");
const PREMIUM_AVATARS = ["🐲", "🦁", "🦖", "🦋", "🐬", "🦜"];
const FRAMES = ["none", "gold", "neon", "flower", "rainbow"];
const cleanAvatar = (a, fallback) =>
  AVATARS.includes(a) || PREMIUM_AVATARS.includes(a) ? a : fallback;
const cleanFrame = (f) => (FRAMES.includes(f) ? f : "none");
const cleanName = (n) => String(n || "Người chơi").trim().slice(0, 16) || "Người chơi";
const newRoomId = () => Math.random().toString(36).slice(2, 7).toUpperCase();

// Tạo bộ thẻ đã xáo trộn
function makeCards(level) {
  const faces = FACES.slice(0, LEVELS[level].pairs);
  const deck = [...faces, ...faces].map((face) => ({ face, state: "down" }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function newRoom(players, level, ai) {
  return {
    players,
    level,
    ai, // null hoặc { mark, memory }
    cards: makeCards(level),
    flipped: [], // các thẻ đang lật trong lượt
    lock: false, // đang chờ úp lại hoặc ghi cặp, chưa cho lật tiếp
    turn: "X",
    starter: "X",
    pairs: { X: 0, O: 0 }, // số cặp của ván hiện tại
    scores: { X: 0, O: 0 }, // số ván thắng trong phòng
    over: false,
    timer: null,
    pairTimer: null,
    botTimer: null,
  };
}

function startInfo(room) {
  return {
    players: room.players.map((p) => ({
      ...p,
      frame: io.sockets.sockets.get(p.id)?.data?.frame || "none",
    })),
    turn: room.turn,
    scores: room.scores,
    pairs: room.pairs,
    total: room.cards.length,
    cols: LEVELS[room.level].cols,
    level: room.level,
    timeLeft: TURN_TIME,
    vsAI: !!room.ai,
    mode: room.mode || (room.ai ? "ai" : "friend"),
  };
}

function clearTimers(room) {
  clearTimeout(room.timer);
  clearTimeout(room.pairTimer);
  clearTimeout(room.botTimer);
}

/* ================= ĐỒNG HỒ LƯỢT ================= */

// Hết giờ: úp thẻ đang lật lại và nhường lượt cho đối thủ
function startTurnTimer(roomId) {
  const room = rooms[roomId];
  if (!room || room.over) return;
  clearTimeout(room.timer);
  if (room.ai && room.turn === room.ai.mark) return; // máy không bị tính giờ
  room.timer = setTimeout(() => {
    if (rooms[roomId] !== room || room.over || room.lock) return;
    const indices = room.flipped;
    indices.forEach((i) => (room.cards[i].state = "down"));
    room.flipped = [];
    room.turn = other(room.turn);
    io.to(roomId).emit("hidden", {
      indices,
      nextTurn: room.turn,
      timeLeft: TURN_TIME,
    });
    startTurnTimer(roomId);
    botTurn(roomId);
  }, TURN_TIME * 1000 + 500);
}

/* ================= MÁY CHƠI ================= */

// Máy chọn thẻ để lật, chỉ dựa vào những thẻ nó "nhớ" đã thấy
function botPickIndex(room) {
  const mem = room.ai.memory; // index -> mặt thẻ
  const down = [];
  room.cards.forEach((c, i) => {
    if (c.state === "down") down.push(i);
  });
  const known = (i) => mem[i] !== undefined;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Thẻ thứ hai: nếu nhớ thẻ giống thẻ đầu thì lật nó
  if (room.flipped.length === 1) {
    const first = room.flipped[0];
    const face = room.cards[first].face;
    const match = down.find((i) => i !== first && mem[i] === face);
    if (match !== undefined) return match;
    const unknown = down.filter((i) => i !== first && !known(i));
    return pick(unknown.length ? unknown : down.filter((i) => i !== first));
  }

  // Thẻ đầu: nếu nhớ được một cặp giống nhau thì lật một thẻ trong cặp đó
  const byFace = {};
  for (const i of down) {
    if (known(i)) (byFace[mem[i]] = byFace[mem[i]] || []).push(i);
  }
  for (const f in byFace) {
    if (byFace[f].length >= 2) return byFace[f][0];
  }
  const unknown = down.filter((i) => !known(i));
  return pick(unknown.length ? unknown : down);
}

function botTurn(roomId) {
  const room = rooms[roomId];
  if (!room?.ai || room.over || room.lock || room.turn !== room.ai.mark) return;
  clearTimeout(room.botTimer);
  room.botTimer = setTimeout(() => {
    if (rooms[roomId] !== room || room.over || room.lock || room.turn !== room.ai.mark) return;
    const idx = botPickIndex(room);
    if (idx !== undefined) handleFlip(roomId, room.ai.mark, idx);
  }, 700 + Math.random() * 500);
}

/* ================= LUẬT CHƠI ================= */

function finishGame(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  room.over = true;
  clearTimers(room);
  const { X, O } = room.pairs;
  const winner = X === O ? "draw" : X > O ? "X" : "O";
  if (winner !== "draw") room.scores[winner]++;
  recordStats(room, winner);
  io.to(roomId).emit("gameOver", { winner, pairs: room.pairs, scores: room.scores });
}

// Sau khi lật đủ 2 thẻ: giống thì ghi cặp (được lật tiếp), khác thì úp lại và nhường lượt
function resolvePair(roomId, room, a, b, match) {
  if (rooms[roomId] !== room || room.over) return;
  room.flipped = [];
  room.lock = false;
  if (match) {
    const mark = room.turn;
    room.cards[a].state = "matched";
    room.cards[b].state = "matched";
    room.pairs[mark]++;
    if (room.ai) {
      delete room.ai.memory[a];
      delete room.ai.memory[b];
    }
    io.to(roomId).emit("matched", {
      indices: [a, b],
      mark,
      pairs: room.pairs,
      timeLeft: TURN_TIME,
    });
    if (room.cards.every((c) => c.state === "matched")) return finishGame(roomId);
  } else {
    room.cards[a].state = "down";
    room.cards[b].state = "down";
    room.turn = other(room.turn);
    io.to(roomId).emit("hidden", {
      indices: [a, b],
      nextTurn: room.turn,
      timeLeft: TURN_TIME,
    });
  }
  startTurnTimer(roomId);
  botTurn(roomId);
}

function handleFlip(roomId, mark, index) {
  const room = rooms[roomId];
  if (!room || room.over || room.lock || room.turn !== mark) return;
  const card = room.cards[index];
  if (!card || card.state !== "down") return;

  card.state = "up";
  room.flipped.push(index);
  // Chỉ gửi mặt của thẻ vừa lật, các thẻ úp vẫn được giữ kín ở server
  io.to(roomId).emit("flipped", { index, face: card.face });
  if (room.ai && Math.random() < LEVELS[room.level].remember) {
    room.ai.memory[index] = card.face;
  }

  if (room.flipped.length < 2) {
    botTurn(roomId); // nếu đang là lượt máy thì máy lật thẻ thứ hai
    return;
  }

  room.lock = true;
  clearTimeout(room.timer);
  const [a, b] = room.flipped;
  const match = room.cards[a].face === room.cards[b].face;
  room.pairTimer = setTimeout(
    () => resolvePair(roomId, room, a, b, match),
    match ? 700 : 1200
  );
}

/* ================= SỰ KIỆN SOCKET ================= */

io.on("connection", (socket) => {
  console.log("Có người kết nối:", socket.id);
  
  // Client báo hồ sơ (để tính bảng xếp hạng và hiện khung)
  socket.on("hello", ({ profileId, frame }) => {
    socket.data.profileId = String(profileId || "").slice(0, 40);
    socket.data.frame = cleanFrame(frame);
  });

  socket.on("getLeaderboard", (cb) => {
    if (typeof cb === "function") cb(topPlayers());
  });

  // Ghép trận: hai người cùng cấp độ được xếp chung phòng
  socket.on("findMatch", ({ name, avatar, level }) => {
    const lv = LEVELS[level] ? level : "normal";
    leaveQueues(socket.id);
    let waiting = null;
    while (queues[lv].length) {
      const w = queues[lv].shift();
      if (io.sockets.sockets.get(w.id)) {
        waiting = w;
        break;
      }
    }
    const me = { id: socket.id, name: cleanName(name), avatar: cleanAvatar(avatar, "🐧") };
    if (!waiting) {
      queues[lv].push(me);
      return;
    }
    const roomId = newRoomId();
    const room = newRoom(
      [
        { ...waiting, mark: "X", avatar: cleanAvatar(waiting.avatar, "🦊") },
        { ...me, mark: "O" },
      ],
      lv,
      null
    );
    room.mode = "match";
    rooms[roomId] = room;
    io.sockets.sockets.get(waiting.id).join(roomId);
    socket.join(roomId);
    io.to(waiting.id).emit("matchFound", { roomId, mark: "X" });
    socket.emit("matchFound", { roomId, mark: "O" });
    io.to(roomId).emit("gameStart", startInfo(room));
    startTurnTimer(roomId);
  });

  socket.on("cancelMatch", () => leaveQueues(socket.id));
  socket.on("disconnect", () => leaveQueues(socket.id));

  // Tạo phòng chờ bạn bè
  socket.on("createRoom", ({ name, avatar, level }, cb) => {
    const lv = LEVELS[level] ? level : "normal";
    const roomId = newRoomId();
    const players = [
      { id: socket.id, name: cleanName(name), mark: "X", avatar: cleanAvatar(avatar, "🦊") },
    ];
    rooms[roomId] = newRoom(players, lv, null);
    socket.join(roomId);
    cb({ roomId, mark: "X" });
  });

  // Chơi với máy: vào chơi ngay
  socket.on("createAIRoom", ({ name, avatar, level }, cb) => {
    const lv = LEVELS[level] ? level : "normal";
    const roomId = newRoomId();
    const players = [
      { id: socket.id, name: cleanName(name), mark: "X", avatar: cleanAvatar(avatar, "🦊") },
      { id: "AI", name: "Máy (" + LEVELS[lv].label + ")", mark: "O", avatar: "🤖" },
    ];
    const room = newRoom(players, lv, { mark: "O", memory: {} });
    rooms[roomId] = room;
    socket.join(roomId);
    cb({ roomId, mark: "X" });
    io.to(roomId).emit("gameStart", startInfo(room));
    startTurnTimer(roomId);
    botTurn(roomId);
  });

  // Vào phòng của bạn bè
  socket.on("joinRoom", ({ roomId, name, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room || room.ai) return cb({ error: "Phòng không tồn tại" });
    if (room.players.length >= 2) return cb({ error: "Phòng đã đầy" });
    room.players.push({
      id: socket.id,
      name: cleanName(name),
      mark: "O",
      avatar: cleanAvatar(avatar, "🐧"),
    });
    socket.join(roomId);
    cb({ roomId, mark: "O" });
    io.to(roomId).emit("gameStart", startInfo(room));
    startTurnTimer(roomId);
  });

  // Lật một thẻ
  socket.on("flip", ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room || !Number.isInteger(index)) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    handleFlip(roomId, player.mark, index);
  });

  // Chơi lại (giữ nguyên tỉ số thắng, đổi người đi trước)
  socket.on("restart", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.over || room.players.length < 2) return;
    clearTimers(room);
    room.cards = makeCards(room.level);
    room.flipped = [];
    room.lock = false;
    room.pairs = { X: 0, O: 0 };
    room.over = false;
    room.starter = other(room.starter);
    room.turn = room.starter;
    if (room.ai) room.ai.memory = {};
    io.to(roomId).emit("gameStart", startInfo(room));
    startTurnTimer(roomId);
    botTurn(roomId);
  });

  // Chat trong phòng
  socket.on("chat", ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    const clean = String(text || "").trim().slice(0, 200);
    if (!clean) return;
    io.to(roomId).emit("chat", { name: player.name, mark: player.mark, text: clean });
  });

  // Biểu cảm bay (chỉ nhận emoji trong danh sách cho phép)
  socket.on("reaction", ({ roomId, emoji }) => {
    const room = rooms[roomId];
    if (!room || !EMOJIS.includes(emoji)) return;
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;
    io.to(roomId).emit("reaction", { emoji, mark: player.mark });
  });

  // Người chơi thoát
  socket.on("disconnect", () => {
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.players.some((p) => p.id === socket.id)) {
        clearTimers(room);
        socket.to(roomId).emit("opponentLeft");
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server chạy ở cổng " + PORT));