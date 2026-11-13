import { useState } from "react";
import {
  Face,
  Modal,
  MissionsPanel,
  RewardsPanel,
  LeaderboardPanel,
  NotifyPanel,
  HistoryPanel,
} from "./Panels";
import { EVENTS } from "./profile";

const LEVELS = [
  { id: "easy", label: "Dễ", cards: "12 thẻ" },
  { id: "normal", label: "Vừa", cards: "16 thẻ" },
  { id: "hard", label: "Khó", cards: "24 thẻ" },
];
const ACTIONS = [
  { id: "missions", icon: "🎯", label: "Nhiệm vụ" },
  { id: "rewards", icon: "🎁", label: "Quà tặng" },
  { id: "rank", icon: "🏆", label: "Xếp hạng" },
  { id: "history", icon: "📜", label: "Lịch sử" },
  { id: "notify", icon: "🔔", label: "Thông báo" },
];

export default function Home({ profile, api, invite, onMatch, onCreate, onJoin, onAI }) {
  const [level, setLevel] = useState("normal");
  const [code, setCode] = useState(invite || "");
  const [modal, setModal] = useState(null);
  const unread = profile.notes.filter((n) => !n.read).length;
  const event = EVENTS.find((e) => "event:" + e.id === modal);

  const close = () => {
    if (modal === "notify") api.readNotes();
    setModal(null);
  };
  const join = (c) => {
    setModal(null);
    onJoin(c);
  };

  return (
    <div className="home2">
      {/* Thanh trên: hồ sơ, xu, các nút chức năng */}
      <div className="topbar2">
        <button className="chip" onClick={() => setModal("rewards")} title="Hồ sơ và quà tặng">
          <Face avatar={profile.avatar} frame={profile.frame} size={46} />
          <span className="chip-text">
            <b>{profile.name}</b>
            <small>
              {profile.stats.wins} thắng · {profile.stats.games} ván
            </small>
          </span>
        </button>
        <div className="coins">🪙 {profile.coins}</div>
        <div className="top-actions">
          {ACTIONS.map((a) => (
            <button key={a.id} className="ico" onClick={() => setModal(a.id)}>
              <em>{a.icon}</em>
              <span>{a.label}</span>
              {a.id === "notify" && unread > 0 && <i className="badge">{unread}</i>}
            </button>
          ))}
        </div>
      </div>

      {/* Tên game */}
      <header className="hero">
        <div className="mascots">
          <span className="m1">{profile.avatar}</span>
          <span className="m-vs">VS</span>
          <span className="m2">🃏</span>
        </div>
        <h1 className="logo">
          <span className="lx">Memory</span> <span className="lo">Duel</span>
        </h1>
        <p className="tagline">Lật thẻ tìm cặp giống nhau, ai nhiều cặp hơn là thắng</p>
      </header>

      {invite && (
        <div className="invite">
          ✉️ Bạn được mời vào phòng <b>{invite}</b>
          <button className="btn primary" onClick={() => onJoin(invite)}>
            Vào ngay
          </button>
        </div>
      )}

      {/* Sự kiện */}
      <div className="events">
        {EVENTS.map((e) => (
          <button key={e.id} className="event-card" onClick={() => setModal("event:" + e.id)}>
            <span className="event-ico">{e.icon}</span>
            <span>
              <b>{e.title}</b>
              <small>Sự kiện · bấm để xem</small>
            </span>
          </button>
        ))}
      </div>

      {/* Cấp độ */}
      <div className="level-row">
        <span>Cấp độ:</span>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={"mark-btn lv" + (level === l.id ? " on" : "")}
            onClick={() => setLevel(l.id)}
          >
            <b>{l.label}</b>
            <small>{l.cards}</small>
          </button>
        ))}
      </div>

      {/* Ba cách chơi */}
      <section className="modes">
        <div className="mode">
          <h3>⚡ Ghép trận</h3>
          <p>Tìm đối thủ ngẫu nhiên cùng cấp độ</p>
          <button className="btn primary" onClick={() => onMatch(level)}>
            Tìm trận
          </button>
        </div>
        <div className="mode">
          <h3>👥 Chơi với bạn bè</h3>
          <p>Tạo phòng rồi gửi mã hoặc link cho bạn</p>
          <button className="btn primary" onClick={() => onCreate(level)}>
            Tạo phòng mới
          </button>
          <div className="join-row">
            <input
              className="code"
              placeholder="MÃ PHÒNG"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn" onClick={() => onJoin(code)}>
              Vào phòng
            </button>
          </div>
        </div>
        <div className="mode">
          <h3>🤖 Luyện tập</h3>
          <p>Chơi với máy, vào chơi ngay không cần chờ</p>
          <button className="btn primary" onClick={() => onAI(level)}>
            Bắt đầu
          </button>
        </div>
      </section>

      <button className="link-btn" onClick={api.logout}>
        Đổi tài khoản
      </button>

      {/* Các cửa sổ */}
      {modal === "missions" && (
        <Modal title="🎯 Nhiệm vụ hằng ngày" onClose={close}>
          <MissionsPanel profile={profile} onClaim={api.claimMission} />
        </Modal>
      )}
      {modal === "rewards" && (
        <Modal title="🎁 Phần thưởng và hồ sơ" onClose={close}>
          <RewardsPanel profile={profile} api={api} />
        </Modal>
      )}
      {modal === "rank" && (
        <Modal title="🏆 Bảng xếp hạng" onClose={close}>
          <LeaderboardPanel meName={profile.name} />
        </Modal>
      )}
      {modal === "history" && (
        <Modal title="📜 Lịch sử trận đấu" onClose={close}>
          <HistoryPanel profile={profile} />
        </Modal>
      )}
      {modal === "notify" && (
        <Modal title="🔔 Thông báo" onClose={close}>
          <NotifyPanel notes={profile.notes} onJoin={join} />
        </Modal>
      )}
      {event && (
        <Modal title={event.icon + " " + event.title} onClose={close}>
          <p className="event-desc">{event.desc}</p>
        </Modal>
      )}
    </div>
  );
}