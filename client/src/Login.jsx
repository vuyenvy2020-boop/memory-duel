import { useState } from "react";
import AvatarPicker from "./AvatarPicker";
import { Face } from "./Panels";

export default function Login({ accounts, onLogin, onCreate }) {
  const [mode, setMode] = useState(accounts.length ? "pick" : "new");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🦊");

  return (
    <div className="card login-card">
      <h1 className="logo">
        <span className="lx">Memory</span> <span className="lo">Duel</span>
      </h1>

      {mode === "pick" ? (
        <>
          <p className="tagline">Chọn tài khoản để vào chơi</p>
          <div className="acc-list">
            {accounts.map((a) => (
              <button key={a.id} className="acc" onClick={() => onLogin(a.id)}>
                <Face avatar={a.avatar} frame={a.frame} size={44} />
                <span className="acc-name">
                  <b>{a.name}</b>
                  <small>🪙 {a.coins}</small>
                </span>
                <span>Vào →</span>
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => setMode("new")}>
            + Tạo tài khoản mới
          </button>
        </>
      ) : (
        <>
          <p className="tagline">Tạo tài khoản người chơi, nhận ngay 100 xu</p>
          <input
            placeholder="Nhập tên của bạn"
            maxLength={16}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AvatarPicker value={avatar} onChange={setAvatar} />
          <button
            className="btn primary"
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), avatar)}
          >
            Tạo tài khoản
          </button>
          {accounts.length > 0 && (
            <button className="link-btn" onClick={() => setMode("pick")}>
              ← Dùng tài khoản đã có
            </button>
          )}
        </>
      )}
    </div>
  );
}