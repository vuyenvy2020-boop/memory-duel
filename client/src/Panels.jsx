import { useEffect, useState } from "react";
import { socket } from "./socket";
import { AVATARS } from "./AvatarPicker";
import { MISSIONS, PREMIUM_AVATARS, FRAMES, DAILY_COINS, todayStr } from "./profile";

const fmt = (t) =>
  new Date(t).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

/* Ảnh đại diện có khung */
export function Face({ avatar, frame = "none", size = 44 }) {
  return (
    <div
      className={"face frame-" + frame}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {avatar}
    </div>
  );
}

/* Cửa sổ nổi */
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* 🎯 Nhiệm vụ hằng ngày */
export function MissionsPanel({ profile, onClaim }) {
  return (
    <>
      <p className="hint">Nhiệm vụ làm mới mỗi ngày. Hoàn thành rồi bấm nhận xu.</p>
      {MISSIONS.map((m) => {
        const cur = Math.min(profile.missions.p[m.id] || 0, m.goal);
        const done = cur >= m.goal;
        const claimed = profile.missions.claimed[m.id];
        return (
          <div className="row" key={m.id}>
            <div className="row-main">
              <b>{m.label}</b>
              <div className="bar">
                <i style={{ width: (cur / m.goal) * 100 + "%" }} />
              </div>
              <small>
                {cur}/{m.goal}
              </small>
            </div>
            <button
              className={"btn" + (done && !claimed ? " primary" : "")}
              disabled={!done || claimed}
              onClick={() => onClaim(m.id)}
            >
              {claimed ? "Đã nhận" : `+${m.reward} 🪙`}
            </button>
          </div>
        );
      })}
    </>
  );
}

/* 🎁 Phần thưởng: xu miễn phí, nhân vật, khung hồ sơ */
export function RewardsPanel({ profile, api }) {
  const claimed = profile.dailyDate === todayStr();
  return (
    <>
      <div className="row">
        <div className="row-main">
          <b>🎁 Quà điểm danh</b>
          <small>Nhận {DAILY_COINS} xu miễn phí mỗi ngày</small>
        </div>
        <button
          className={"btn" + (claimed ? "" : " primary")}
          disabled={claimed}
          onClick={api.claimDaily}
        >
          {claimed ? "Đã nhận hôm nay" : `Nhận +${DAILY_COINS} 🪙`}
        </button>
      </div>

      <h4 className="sub-title">Nhân vật của bạn</h4>
      <div className="shop-grid">
        {AVATARS.map((e) => (
          <button
            key={e}
            className={"shop-item" + (profile.avatar === e ? " on" : "")}
            onClick={() => api.setAvatar(e)}
          >
            {e}
          </button>
        ))}
        {PREMIUM_AVATARS.map((a) =>
          profile.ownedAvatars.includes(a.e) ? (
            <button
              key={a.e}
              className={"shop-item" + (profile.avatar === a.e ? " on" : "")}
              onClick={() => api.setAvatar(a.e)}
            >
              {a.e}
            </button>
          ) : (
            <button
              key={a.e}
              className="shop-item locked"
              disabled={profile.coins < a.price}
              onClick={() => api.buyAvatar(a.e)}
            >
              {a.e}
              <small>🪙 {a.price}</small>
            </button>
          )
        )}
      </div>
      <p className="hint">Nhân vật mờ là chưa mở khóa, đủ xu thì bấm để mua.</p>

      <h4 className="sub-title">Khung hồ sơ</h4>
      <div className="frame-list">
        {FRAMES.map((f) => {
          const owned = profile.ownedFrames.includes(f.id);
          const on = profile.frame === f.id;
          return (
            <div className="frame-item" key={f.id}>
              <Face avatar={profile.avatar} frame={f.id} size={54} />
              <b>{f.label}</b>
              {owned ? (
                <button
                  className={"btn" + (on ? "" : " primary")}
                  disabled={on}
                  onClick={() => api.setFrame(f.id)}
                >
                  {on ? "Đang dùng" : "Dùng"}
                </button>
              ) : (
                <button
                  className="btn"
                  disabled={profile.coins < f.price}
                  onClick={() => api.buyFrame(f.id)}
                >
                  🪙 {f.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* 🏆 Bảng xếp hạng */
export function LeaderboardPanel({ meName }) {
  const [list, setList] = useState(null);
  useEffect(() => {
    socket.emit("getLeaderboard", (l) => setList(l));
    const t = setTimeout(() => setList((l) => l ?? []), 5000);
    return () => clearTimeout(t);
  }, []);

  if (list === null) return <p className="hint">Đang tải...</p>;
  return (
    <>
      <p className="hint">
        Tính từ các ván giữa 2 người thật: thắng 3 điểm, hòa 1 điểm. Top 10.
      </p>
      {list.length === 0 && (
        <p className="empty">Chưa có ai trên bảng (hoặc chưa kết nối được server).</p>
      )}
      {list.map((p, i) => (
        <div className={"rank-row" + (p.name === meName ? " me" : "")} key={i}>
          <span className="rank-n">{["🥇", "🥈", "🥉"][i] || i + 1}</span>
          <span className="rank-av">{p.avatar}</span>
          <b className="rank-name">{p.name}</b>
          <span className="rank-pts">{p.points} đ</span>
          <small>
            {p.wins}T / {p.games} ván
          </small>
        </div>
      ))}
    </>
  );
}

/* 🔔 Thông báo: sự kiện, lời mời, phần thưởng */
const NOTE_ICON = { event: "🎉", reward: "🎁", invite: "✉️" };
export function NotifyPanel({ notes, onJoin }) {
  if (notes.length === 0) return <p className="empty">Chưa có thông báo.</p>;
  return (
    <>
      {notes.map((n) => (
        <div className={"row note" + (n.read ? "" : " unread")} key={n.id}>
          <span className="note-ico">{NOTE_ICON[n.type] || "🔔"}</span>
          <div className="row-main">
            <span>{n.text}</span>
            <small>{fmt(n.time)}</small>
          </div>
          {n.code && (
            <button className="btn primary" onClick={() => onJoin(n.code)}>
              Vào phòng
            </button>
          )}
        </div>
      ))}
    </>
  );
}

/* 📜 Lịch sử trận đấu */
const MODE = { friend: "Bạn bè", match: "Ghép trận", ai: "Với máy" };
const LV = { easy: "Dễ", normal: "Vừa", hard: "Khó" };
const RES = { win: "Thắng", lose: "Thua", draw: "Hòa" };
export function HistoryPanel({ profile }) {
  const s = profile.stats;
  const rate = s.games ? Math.round((s.wins / s.games) * 100) : 0;
  return (
    <>
      <div className="stats">
        <div>
          <b>{s.games}</b>
          <small>ván</small>
        </div>
        <div>
          <b>{s.wins}</b>
          <small>thắng</small>
        </div>
        <div>
          <b>{rate}%</b>
          <small>tỉ lệ thắng</small>
        </div>
        <div>
          <b>{s.pairs}</b>
          <small>cặp đã tìm</small>
        </div>
      </div>
      {profile.history.length === 0 && <p className="empty">Chưa có ván nào.</p>}
      {profile.history.map((h, i) => (
        <div className="row" key={i}>
          <span className={"res " + h.result}>{RES[h.result]}</span>
          <div className="row-main">
            <b>
              {h.oppAvatar} {h.opp}
            </b>
            <small>
              {MODE[h.mode] || "Ván đấu"} · {LV[h.level]} · {fmt(h.t)}
            </small>
          </div>
          <b>
            {h.mine} - {h.theirs}
          </b>
        </div>
      ))}
    </>
  );
}