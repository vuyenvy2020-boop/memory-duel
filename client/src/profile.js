import { useRef, useState } from "react";

const KEY = "memory-duel-accounts";

export const PREMIUM_AVATARS = [
  { e: "🐲", price: 150 },
  { e: "🦁", price: 150 },
  { e: "🦖", price: 200 },
  { e: "🦋", price: 100 },
  { e: "🐬", price: 120 },
  { e: "🦜", price: 120 },
];
export const FRAMES = [
  { id: "none", label: "Không khung", price: 0 },
  { id: "gold", label: "Vàng", price: 100 },
  { id: "neon", label: "Neon", price: 150 },
  { id: "flower", label: "Hoa", price: 200 },
  { id: "rainbow", label: "Cầu vồng", price: 300 },
];
export const MISSIONS = [
  { id: "play3", label: "Chơi 3 ván", goal: 3, reward: 30 },
  { id: "win1", label: "Thắng 1 ván", goal: 1, reward: 50 },
  { id: "pairs10", label: "Tìm được 10 cặp", goal: 10, reward: 40 },
  { id: "human1", label: "Chơi 1 ván với người thật", goal: 1, reward: 40 },
];
export const EVENTS = [
  {
    id: "e1",
    icon: "🌙",
    title: "Đêm trăng rằm",
    desc: "Chơi đủ 3 ván mỗi ngày để nhận xu nhiệm vụ. Càng chơi nhiều, bạn càng sớm mở khóa nhân vật và khung hồ sơ mới!",
  },
  {
    id: "e2",
    icon: "🎁",
    title: "Quà điểm danh",
    desc: "Mỗi ngày vào mục Quà tặng để nhận 50 xu miễn phí.",
  },
];
export const DAILY_COINS = 50;

export const todayStr = () => new Date().toLocaleDateString("sv-SE");
const uid = () => Math.random().toString(36).slice(2, 10);
const note = (type, text, extra = {}) => ({
  id: uid(),
  type,
  text,
  time: Date.now(),
  read: false,
  ...extra,
});

export function addNote(p, type, text, extra = {}) {
  return { ...p, notes: [note(type, text, extra), ...p.notes].slice(0, 50) };
}

export function newProfile(name, avatar) {
  return {
    id: uid() + uid(),
    name,
    avatar,
    frame: "none",
    coins: 100,
    ownedAvatars: [],
    ownedFrames: ["none"],
    stats: { games: 0, wins: 0, draws: 0, pairs: 0 },
    history: [],
    missions: { date: todayStr(), p: {}, claimed: {} },
    dailyDate: "",
    notes: [
      note("event", "Chào mừng bạn đến với Memory Duel! Bạn nhận được 100 xu."),
      note("event", "Sự kiện: Đêm trăng rằm đang diễn ra, xem ở trang chủ."),
    ],
  };
}

// Sang ngày mới thì làm mới nhiệm vụ
export function ensureDay(p) {
  if (p.missions.date === todayStr()) return p;
  return addNote(
    { ...p, missions: { date: todayStr(), p: {}, claimed: {} } },
    "event",
    "Nhiệm vụ hằng ngày mới đã sẵn sàng."
  );
}

// Ghi lại một ván vừa chơi
export function recordGame(p, g) {
  p = ensureDay(p);
  const m = { ...p.missions, p: { ...p.missions.p } };
  const add = (id, n) => (m.p[id] = (m.p[id] || 0) + n);
  add("play3", 1);
  add("pairs10", g.mine);
  if (g.result === "win") add("win1", 1);
  if (g.human) add("human1", 1);
  return addNote(
    {
      ...p,
      coins: p.coins + g.coins,
      stats: {
        games: p.stats.games + 1,
        wins: p.stats.wins + (g.result === "win" ? 1 : 0),
        draws: p.stats.draws + (g.result === "draw" ? 1 : 0),
        pairs: p.stats.pairs + g.mine,
      },
      history: [{ t: Date.now(), ...g }, ...p.history].slice(0, 30),
      missions: m,
    },
    "reward",
    `Bạn nhận ${g.coins} xu từ ván vừa chơi.`
  );
}

export function claimMission(p, id) {
  p = ensureDay(p);
  const m = MISSIONS.find((x) => x.id === id);
  if (!m || p.missions.claimed[id] || (p.missions.p[id] || 0) < m.goal) return p;
  return addNote(
    {
      ...p,
      coins: p.coins + m.reward,
      missions: { ...p.missions, claimed: { ...p.missions.claimed, [id]: true } },
    },
    "reward",
    `Nhận ${m.reward} xu từ nhiệm vụ "${m.label}".`
  );
}

export function claimDaily(p) {
  if (p.dailyDate === todayStr()) return p;
  return addNote(
    { ...p, coins: p.coins + DAILY_COINS, dailyDate: todayStr() },
    "reward",
    `Quà điểm danh: +${DAILY_COINS} xu.`
  );
}

export function buyAvatar(p, e) {
  const a = PREMIUM_AVATARS.find((x) => x.e === e);
  if (!a || p.ownedAvatars.includes(e) || p.coins < a.price) return p;
  return addNote(
    { ...p, coins: p.coins - a.price, ownedAvatars: [...p.ownedAvatars, e], avatar: e },
    "reward",
    `Đã mở khóa nhân vật ${e}.`
  );
}

export function buyFrame(p, id) {
  const f = FRAMES.find((x) => x.id === id);
  if (!f || p.ownedFrames.includes(id) || p.coins < f.price) return p;
  return addNote(
    { ...p, coins: p.coins - f.price, ownedFrames: [...p.ownedFrames, id], frame: id },
    "reward",
    `Đã mở khóa khung "${f.label}".`
  );
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.list) return d;
  } catch {
    /* bỏ qua */
  }
  return { current: null, list: {} };
}

// Hook quản lý các tài khoản lưu trong trình duyệt
export function useProfile() {
  const [db, setDb] = useState(load);
  const ref = useRef(db);

  const save = (next) => {
    ref.current = next;
    setDb(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
  };
  const update = (fn) => {
    const cur = ref.current;
    if (!cur.current) return;
    save({ ...cur, list: { ...cur.list, [cur.current]: fn(cur.list[cur.current]) } });
  };

  const cur = db.current ? db.list[db.current] : null;
  return {
    profile: cur ? ensureDay(cur) : null,
    accounts: Object.values(db.list),
    create(name, avatar) {
      const p = newProfile(name, avatar);
      save({ current: p.id, list: { ...ref.current.list, [p.id]: p } });
    },
    login(id) {
      save({ ...ref.current, current: id });
    },
    logout() {
      save({ ...ref.current, current: null });
    },
    update,
  };
}