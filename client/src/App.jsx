import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { socket } from "./socket";
import { Shell } from "./Scene";
import Login from "./Login";
import Home from "./Home";
import {
  useProfile,
  recordGame,
  addNote,
  claimMission,
  claimDaily,
  buyAvatar,
  buyFrame,
} from "./profile";
import "./App.css";

const TURN_TIME = 20; // khớp với TURN_TIME ở server
const EMOJIS = ["👍", "😂", "😮", "😡", "🔥", "👏"];
const CONFETTI_COLORS = ["#ff5c8a", "#4de1ff", "#facc15", "#8b5cf6", "#34d399"];
const LEVEL_LABEL = { easy: "Dễ", normal: "Vừa", hard: "Khó" };

/* ---------- Âm thanh tự tạo, không cần file ---------- */
let audioCtx;
let soundOn = true;
function beep(freq, dur = 0.1, type = "sine") {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch {
    /* trình duyệt chặn âm thanh thì bỏ qua */
  }
}

/* ---------- Avatar con vật (có khung) ---------- */
function Avatar({ mark, emoji, frame }) {
  return (
    <div className={"avatar " + mark + " frame-" + (frame || "none")}>{emoji || "🙂"}</div>
  );
}

export default function App() {
  const P = useProfile();
  const profile = P.profile;

  const [screen, setScreen] = useState("home"); // home | matching | waiting | playing
  const [level, setLevel] = useState("normal");
  const [roomId, setRoomId] = useState("");
  const [myMark, setMyMark] = useState(null);
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);
  const [cols, setCols] = useState(4);
  const [roomLevel, setRoomLevel] = useState("normal");
  const [gameMode, setGameMode] = useState("friend");
  const [turn, setTurn] = useState("X");
  const [result, setResult] = useState(null);
  const [earned, setEarned] = useState(0);
  const [pairs, setPairs] = useState({ X: 0, O: 0 });
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [reactions, setReactions] = useState([]);
  const [vsAI, setVsAI] = useState(false);
  const chatRef = useRef(null);

  // Mã phòng lấy từ link mời (?room=ABCDE)
  const [invite] = useState(() => {
    try {
      const c = new URLSearchParams(window.location.search).get("room");
      return c && /^[A-Za-z0-9]{5}$/.test(c) ? c.toUpperCase() : "";
    } catch {
      return "";
    }
  });
  const invited = useRef(false);

  // Các thao tác với hồ sơ, truyền xuống trang chủ
  const api = {
    claimMission: (id) => P.update((p) => claimMission(p, id)),
    claimDaily: () => P.update(claimDaily),
    buyAvatar: (e) => P.update((p) => buyAvatar(p, e)),
    buyFrame: (id) => P.update((p) => buyFrame(p, id)),
    setAvatar: (e) => P.update((p) => ({ ...p, avatar: e })),
    setFrame: (id) => P.update((p) => ({ ...p, frame: id })),
    readNotes: () =>
      P.update((p) => ({ ...p, notes: p.notes.map((n) => ({ ...n, read: true })) })),
    logout: P.logout,
  };

  // Các mảnh pháo giấy, tạo một lần
  const confetti = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        dur: 2.5 + Math.random() * 2,
        size: 8 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  /* ----- Báo hồ sơ cho server (để xếp hạng và hiện khung) ----- */
  useEffect(() => {
    if (!profile) return;
    const hello = () => socket.emit("hello", { profileId: profile.id, frame: profile.frame });
    hello();
    socket.on("connect", hello);
    return () => socket.off("connect", hello);
  }, [profile?.id, profile?.frame]);

  /* ----- Thông báo khi mở link mời ----- */
  useEffect(() => {
    if (!invite || !profile || invited.current) return;
    invited.current = true;
    P.update((p) => addNote(p, "invite", `Bạn được mời vào phòng ${invite}.`, { code: invite }));
    window.history.replaceState({}, "", window.location.pathname);
  }, [profile?.id]);

  /* ----- Nhận sự kiện từ server ----- */
  useEffect(() => {
    socket.on("matchFound", ({ roomId, mark }) => {
      setRoomId(roomId);
      setMyMark(mark);
    });
    socket.on("gameStart", (d) => {
      setPlayers(d.players);
      setCards(
        Array.from({ length: d.total }, () => ({ state: "down", face: null, owner: null }))
      );
      setCols(d.cols);
      setRoomLevel(d.level);
      setGameMode(d.mode || "friend");
      setTurn(d.turn);
      setScores(d.scores);
      setPairs(d.pairs);
      setTimeLeft(d.timeLeft ?? TURN_TIME);
      setResult(null);
      setVsAI(!!d.vsAI);
      setScreen("playing");
      beep(660, 0.12);
    });
    socket.on("flipped", ({ index, face }) => {
      setCards((cs) => cs.map((c, i) => (i === index ? { ...c, state: "up", face } : c)));
      beep(520, 0.07);
    });
    socket.on("matched", ({ indices, mark, pairs, timeLeft }) => {
      setCards((cs) =>
        cs.map((c, i) => (indices.includes(i) ? { ...c, state: "matched", owner: mark } : c))
      );
      setPairs(pairs);
      setTimeLeft(timeLeft ?? TURN_TIME);
      beep(784, 0.12);
      setTimeout(() => beep(988, 0.15), 110);
    });
    socket.on("hidden", ({ indices, nextTurn, timeLeft }) => {
      setCards((cs) =>
        cs.map((c, i) => (indices.includes(i) ? { state: "down", face: null, owner: null } : c))
      );
      setTurn(nextTurn);
      setTimeLeft(timeLeft ?? TURN_TIME);
      beep(260, 0.15, "triangle");
    });
    socket.on("gameOver", ({ winner, pairs, scores }) => {
      setResult(winner);
      if (pairs) setPairs(pairs);
      if (scores) setScores(scores);
    });
    socket.on("chat", (msg) => {
      setMessages((m) => [...m.slice(-49), msg]);
    });
    socket.on("reaction", ({ emoji, mark }) => {
      const id = Date.now() + Math.random();
      const left = 10 + Math.random() * 80;
      setReactions((r) => [...r, { id, emoji, mark, left }]);
      setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 2500);
    });
    socket.on("opponentLeft", () => {
      alert("Đối thủ đã thoát");
      window.location.reload();
    });
    return () => {
      socket.off("matchFound");
      socket.off("gameStart");
      socket.off("flipped");
      socket.off("matched");
      socket.off("hidden");
      socket.off("gameOver");
      socket.off("chat");
      socket.off("reaction");
      socket.off("opponentLeft");
    };
  }, []);

  /* ----- Đếm ngược mỗi giây ----- */
  useEffect(() => {
    if (screen !== "playing" || result) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [screen, result]);

  // Tiếng tít cảnh báo 5 giây cuối (chỉ với người đang tới lượt)
  useEffect(() => {
    if (screen === "playing" && !result && turn === myMark && timeLeft > 0 && timeLeft <= 5) {
      beep(880, 0.06, "square");
    }
  }, [timeLeft]);

  // Khi hết ván: âm thanh, cộng xu, ghi lịch sử và nhiệm vụ
  useEffect(() => {
    if (!result) return;
    const r = result === "draw" ? "draw" : result === myMark ? "win" : "lose";
    if (r === "draw") beep(440, 0.25);
    else if (r === "win") {
      beep(784, 0.15);
      setTimeout(() => beep(988, 0.3), 150);
    } else {
      beep(330, 0.2);
      setTimeout(() => beep(220, 0.35), 180);
    }
    if (!profile) return;
    const oppMark = myMark === "X" ? "O" : "X";
    const opp = players.find((p) => p.mark === oppMark);
    const human = !vsAI;
    const coins = r === "win" ? (human ? 20 : 10) : r === "draw" ? 8 : 5;
    setEarned(coins);
    P.update((p) =>
      recordGame(p, {
        result: r,
        opp: opp?.name || "?",
        oppAvatar: opp?.avatar || "",
        mode: gameMode,
        level: roomLevel,
        mine: pairs[myMark],
        theirs: pairs[oppMark],
        human,
        coins,
      })
    );
  }, [result]);

  // Chat tự cuộn xuống tin mới nhất
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [messages]);

  /* ----- Các hành động ----- */
  const toggleMute = () => {
    soundOn = !soundOn;
    setMuted(!soundOn);
  };

  const onCreate = (lv) => {
    setLevel(lv);
    socket.emit(
      "createRoom",
      { name: profile.name, avatar: profile.avatar, level: lv },
      ({ roomId, mark }) => {
        setRoomId(roomId);
        setMyMark(mark);
        setScreen("waiting");
      }
    );
  };

  const onMatch = (lv) => {
    setLevel(lv);
    setScreen("matching");
    socket.emit("findMatch", { name: profile.name, avatar: profile.avatar, level: lv });
  };

  const cancelMatch = () => {
    socket.emit("cancelMatch");
    setScreen("home");
  };

  const onAI = (lv) => {
    socket.emit(
      "createAIRoom",
      { name: profile.name, avatar: profile.avatar, level: lv },
      ({ roomId, mark }) => {
        setRoomId(roomId);
        setMyMark(mark);
      }
    );
  };

  const onJoin = (code) => {
    const c = String(code || "").trim().toUpperCase();
    if (c.length < 5) return alert("Nhập đủ 5 ký tự mã phòng nhé");
    socket.emit("joinRoom", { roomId: c, name: profile.name, avatar: profile.avatar }, (res) => {
      if (res.error) return alert(res.error);
      setRoomId(res.roomId);
      setMyMark(res.mark);
    });
  };

  const flip = (index) => {
    if (result || turn !== myMark) return;
    if (cards[index].state !== "down") return;
    if (cards.filter((c) => c.state === "up").length >= 2) return;
    socket.emit("flip", { roomId, index });
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    socket.emit("chat", { roomId, text });
    setChatInput("");
  };

  const sendReaction = (emoji) => socket.emit("reaction", { roomId, emoji });

  /* ---------- Chưa có tài khoản: màn hình đăng nhập ---------- */
  if (!profile)
    return (
      <Shell mode="home">
        <Login accounts={P.accounts} onLogin={P.login} onCreate={P.create} />
      </Shell>
    );

  /* ---------- Trang chủ ---------- */
  if (screen === "home")
    return (
      <Shell mode="home">
        <Home
          profile={profile}
          api={api}
          invite={invite}
          onMatch={onMatch}
          onCreate={onCreate}
          onJoin={onJoin}
          onAI={onAI}
        />
      </Shell>
    );

  /* ---------- Đang ghép trận ---------- */
  if (screen === "matching")
    return (
      <Shell mode="wait">
        <div className="card wait-card">
          <div className="wait-badge">⚡ Ghép trận · {LEVEL_LABEL[level]}</div>
          <h2 className="title">Đang tìm đối thủ...</h2>
          <p className="tagline">Khi có người cùng cấp độ, trận đấu sẽ tự bắt đầu</p>
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <button className="btn" onClick={cancelMatch}>
            Hủy tìm trận
          </button>
        </div>
      </Shell>
    );

  /* ---------- Phòng chờ ---------- */
  if (screen === "waiting")
    return (
      <Shell mode="wait">
        <div className="card wait-card">
          <div className="wait-badge">🌙 Phòng chờ · {LEVEL_LABEL[level]}</div>
          <h2 className="title">Đang chờ đối thủ...</h2>
          <p className="tagline">Gửi mã hoặc link này cho bạn bè để cùng vào chơi</p>

          <div className="code-tiles">
            {roomId.split("").map((ch, i) => (
              <span key={i} style={{ animationDelay: i * 0.12 + "s" }}>
                {ch}
              </span>
            ))}
          </div>

          <div className="two-btn">
            <button className="btn primary" onClick={() => copy(roomId, "code")}>
              {copied === "code" ? "✓ Đã chép mã" : "Sao chép mã"}
            </button>
            <button
              className="btn"
              onClick={() => copy(window.location.origin + "/?room=" + roomId, "link")}
            >
              {copied === "link" ? "✓ Đã chép link" : "Sao chép link mời"}
            </button>
          </div>

          <div className="slots">
            <div className="slot ready">
              <div className={"wait-avatar " + myMark + " frame-" + profile.frame}>
                {profile.avatar}
              </div>
              <b>{profile.name}</b>
              <small>Sẵn sàng</small>
            </div>
            <div className="vs">VS</div>
            <div className="slot empty">
              <div className="wait-avatar ghost">?</div>
              <b>Đang chờ...</b>
              <small>Chưa có người</small>
            </div>
          </div>

          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <button className="link-btn" onClick={() => window.location.reload()}>
            ← Thoát phòng
          </button>
        </div>
      </Shell>
    );

  /* ---------- Màn hình chơi ---------- */
  const oppMark = myMark === "X" ? "O" : "X";
  const status = result
    ? ""
    : turn === myMark
    ? "✨ Đến lượt bạn lật thẻ!"
    : "Đối thủ đang lật thẻ...";
  const timerClass = timeLeft <= 5 ? "danger" : timeLeft <= 10 ? "warn" : "";

  return (
    <Shell mode="game">
      <div className="game">
        <header className="topbar">
          <h2 className="logo small">
            <span className="lx">Memory</span> <span className="lo">Duel</span>
          </h2>
          <div className="room-tag">
            Phòng {roomId} · {LEVEL_LABEL[roomLevel]}
          </div>
          <div className="tools">
            <button className="icon-btn" onClick={toggleMute} title="Bật/tắt âm thanh">
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              className="icon-btn"
              onClick={() => window.location.reload()}
              title="Thoát phòng"
            >
              ⏻
            </button>
          </div>
        </header>

        <div className={"layout" + (vsAI ? " vs-ai" : "")}>
          <section className="main">
            <div className="players">
              {["X", "O"].map((m, idx) => {
                const p = players.find((pl) => pl.mark === m);
                return (
                  <Fragment key={m}>
                    {idx === 1 && <div className="vs-badge">VS</div>}
                    <div
                      className={"player " + m + (turn === m && !result ? " active" : "")}
                    >
                      <Avatar mark={m} emoji={p?.avatar} frame={p?.frame} />
                      <div className="p-info">
                        <b>{p?.name || "..."}</b>
                        <div className="p-mark">
                          thắng {scores[m]} ván
                          {m === myMark && " · Bạn"}
                        </div>
                      </div>
                      <div className="score">
                        {pairs[m]}
                        <small>cặp</small>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <p className="status">{status}</p>

            {!result && (
              <div className={"timer " + timerClass}>
                <div
                  className="timer-bar"
                  style={{ width: (timeLeft / TURN_TIME) * 100 + "%" }}
                />
                <span>⏱ {timeLeft}s</span>
              </div>
            )}

            <div className="mboard" style={{ "--cols": cols }}>
              {cards.map((c, i) => {
                const canPlay = c.state === "down" && turn === myMark && !result;
                const cls =
                  "mcard " + c.state + (c.owner ? " " + c.owner : "") + (canPlay ? " can" : "");
                return (
                  <button key={i} className={cls} onClick={() => flip(i)}>
                    <div className="mcard-in">
                      <div className="mface mfront">?</div>
                      <div className="mface mback">{c.face}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="chat">
            <div className="chat-title">💬 Trò chuyện</div>
            <div className="chat-list" ref={chatRef}>
              {messages.length === 0 && (
                <p className="chat-empty">Chưa có tin nhắn. Hãy chào đối thủ nhé!</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={"msg " + (m.mark === myMark ? "mine" : "theirs")}>
                  <span className={"msg-name " + m.mark}>{m.name}</span>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="emoji-row">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => sendReaction(e)}>
                  {e}
                </button>
              ))}
            </div>
            <div className="chat-input">
              <input
                placeholder="Nhập tin nhắn..."
                maxLength={200}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button className="btn primary" onClick={sendChat}>
                Gửi
              </button>
            </div>
          </aside>
        </div>

        {/* Biểu cảm bay */}
        <div className="reactions" aria-hidden="true">
          {reactions.map((r) => (
            <span key={r.id} className={"react " + r.mark} style={{ left: r.left + "%" }}>
              {r.emoji}
            </span>
          ))}
        </div>

        {/* Pháo giấy cho người thắng */}
        {result === myMark && (
          <div className="confetti" aria-hidden="true">
            {confetti.map((c, i) => (
              <i
                key={i}
                style={{
                  left: c.left + "%",
                  width: c.size,
                  height: c.size * 0.4,
                  background: c.color,
                  animationDelay: c.delay + "s",
                  animationDuration: c.dur + "s",
                }}
              />
            ))}
          </div>
        )}

        {result && (
          <div className="overlay">
            <div
              className={
                "popup " +
                (result === "draw" ? "draw" : result === myMark ? "win" : "lose")
              }
            >
              <div className="emoji">
                {result === "draw" ? "🤝" : result === myMark ? "🏆" : "😢"}
              </div>
              <h2>
                {result === "draw"
                  ? "Hòa rồi!"
                  : result === myMark
                  ? "Bạn thắng!"
                  : "Bạn thua!"}
              </h2>
              <p className="sub">
                Số cặp: bạn {pairs[myMark]} - đối thủ {pairs[oppMark]}
              </p>
              <p className="sub reward">+{earned} 🪙 xu</p>
              <div className="popup-actions">
                <button
                  className="btn primary"
                  onClick={() => socket.emit("restart", { roomId })}
                >
                  Chơi lại
                </button>
                <button className="btn" onClick={() => window.location.reload()}>
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}