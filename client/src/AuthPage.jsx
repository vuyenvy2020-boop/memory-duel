import { useEffect, useState } from "react";
import AvatarPicker from "./AvatarPicker";

const USER_RE = /^[A-Za-z0-9_]{3,20}$/;
const STRENGTH = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh"];
const POINTS = [
  ["🃏", "Lật thẻ tìm cặp, đấu trực tuyến với bạn bè"],
  ["🤖", "Luyện tập với máy ở 3 cấp độ"],
  ["🎯", "Nhiệm vụ hằng ngày, xu và phần thưởng"],
  ["🏆", "Bảng xếp hạng và lịch sử trận đấu"],
];

function strength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className={"field" + (error ? " err" : "")}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <small className="field-err">{error}</small>
      ) : hint ? (
        <small className="field-hint">{hint}</small>
      ) : null}
    </div>
  );
}

export default function AuthPage({ auth }) {
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({
    username: auth.lastUser || "",
    password: "",
    confirm: "",
    display: "",
    avatar: "🦊",
  });
  const [remember, setRemember] = useState(!!auth.lastUser);
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (auth.status !== "loading") return;
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [auth.status]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isReg = tab === "register";

  // Kiểm tra từng ô
  const errs = {
    username: isReg
      ? USER_RE.test(f.username)
        ? ""
        : "3 đến 20 ký tự: chữ, số hoặc dấu gạch dưới"
      : f.username.trim()
      ? ""
      : "Hãy nhập tên đăng nhập",
    display: isReg && !f.display.trim() ? "Hãy nhập tên hiển thị" : "",
    password: isReg
      ? f.password.length >= 6
        ? ""
        : "Mật khẩu cần ít nhất 6 ký tự"
      : f.password
      ? ""
      : "Hãy nhập mật khẩu",
    confirm: isReg && f.confirm !== f.password ? "Mật khẩu nhập lại chưa khớp" : "",
  };
  const show = (k) => (submitted ? errs[k] : "");

  const switchTab = (t) => {
    setTab(t);
    setError("");
    setSubmitted(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const need = isReg
      ? ["username", "display", "password", "confirm"]
      : ["username", "password"];
    if (need.some((k) => errs[k])) return;
    setBusy(true);
    setError("");
    const res = isReg
      ? await auth.register({
          username: f.username.trim(),
          password: f.password,
          display: f.display.trim(),
          avatar: f.avatar,
        })
      : await auth.login({ username: f.username.trim(), password: f.password, remember });
    setBusy(false);
    if (res && res.error) setError(res.error);
  };

  /* ---------- Đang khôi phục phiên đăng nhập ---------- */
  if (auth.status === "loading")
    return (
      <div className="card wait-card">
        <div className="spin big" />
        <h2 className="title">Đang kết nối...</h2>
        <p className="tagline">
          {slow
            ? "Máy chủ chưa phản hồi. Hãy kiểm tra server đang chạy, hoặc đăng nhập lại."
            : "Đang khôi phục phiên đăng nhập của bạn"}
        </p>
        {slow && (
          <button className="btn" onClick={auth.forget}>
            Đăng nhập lại
          </button>
        )}
      </div>
    );

  const sc = strength(f.password);

  return (
    <div className="auth">
      {/* Bên trái: giới thiệu game */}
      <section className="auth-hero">
        <div className="auth-fcards" aria-hidden="true">
          <div className="fc a">🍓</div>
          <div className="fc b">?</div>
          <div className="fc c">🍇</div>
        </div>
        <h1 className="logo">
          <span className="lx">Memory</span> <span className="lo">Duel</span>
        </h1>
        <p className="tagline">Thử thách trí nhớ: lật thẻ, tìm cặp, đánh bại đối thủ</p>
        <ul className="auth-points">
          {POINTS.map(([ico, text]) => (
            <li key={text}>
              <span>{ico}</span>
              {text}
            </li>
          ))}
        </ul>
        <div className={"pill" + (auth.online ? " on" : "")}>
          <i /> {auth.online ? "Máy chủ: đã kết nối" : "Máy chủ: đang kết nối..."}
        </div>
      </section>

      {/* Bên phải: biểu mẫu */}
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isReg}
            className={"tab" + (!isReg ? " on" : "")}
            onClick={() => switchTab("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isReg}
            className={"tab" + (isReg ? " on" : "")}
            onClick={() => switchTab("register")}
          >
            Đăng ký
          </button>
        </div>

        <div className="auth-title">
          <h2>{isReg ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}</h2>
          <p>
            {isReg
              ? "Đăng ký miễn phí, nhận ngay 100 xu chào mừng"
              : "Đăng nhập để tiếp tục chơi và nhận phần thưởng"}
          </p>
        </div>

        {auth.notice && <div className="banner warn">{auth.notice}</div>}
        {error && <div className="banner err">{error}</div>}

        <Field
          id="au-user"
          label="Tên đăng nhập"
          error={show("username")}
          hint={isReg ? "Dùng để đăng nhập, không đổi được sau này" : ""}
        >
          <input
            id="au-user"
            autoComplete="username"
            maxLength={20}
            placeholder="vd: vy_2004"
            value={f.username}
            onChange={set("username")}
          />
        </Field>

        {isReg && (
          <Field id="au-name" label="Tên hiển thị" error={show("display")}>
            <input
              id="au-name"
              maxLength={16}
              placeholder="Tên mọi người nhìn thấy trong game"
              value={f.display}
              onChange={set("display")}
            />
          </Field>
        )}

        <Field id="au-pw" label="Mật khẩu" error={show("password")}>
          <div className="pw-wrap">
            <input
              id="au-pw"
              type={showPw ? "text" : "password"}
              autoComplete={isReg ? "new-password" : "current-password"}
              maxLength={100}
              placeholder={isReg ? "Ít nhất 6 ký tự" : "Nhập mật khẩu"}
              value={f.password}
              onChange={set("password")}
            />
            <button
              type="button"
              className="eye"
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
          {isReg && f.password && (
            <div className="meter-row">
              <div className={"meter s" + sc}>
                <i />
                <i />
                <i />
                <i />
              </div>
              <small>Độ mạnh: {STRENGTH[sc]}</small>
            </div>
          )}
        </Field>

        {isReg && (
          <>
            <Field id="au-cf" label="Nhập lại mật khẩu" error={show("confirm")}>
              <input
                id="au-cf"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                maxLength={100}
                placeholder="Nhập lại mật khẩu"
                value={f.confirm}
                onChange={set("confirm")}
              />
            </Field>
            <AvatarPicker value={f.avatar} onChange={(a) => setF({ ...f, avatar: a })} />
          </>
        )}

        {!isReg && (
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Nhớ tên đăng nhập
          </label>
        )}

        <button className="btn primary submit" disabled={busy}>
          {busy ? <span className="spin" /> : isReg ? "Tạo tài khoản" : "Đăng nhập"}
        </button>

        <p className="switch">
          {isReg ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button type="button" onClick={() => switchTab(isReg ? "login" : "register")}>
            {isReg ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </p>
        <p className="safe">🔒 Mật khẩu được mã hóa trên máy chủ. Đừng dùng mật khẩu thật của bạn cho game thử nghiệm.</p>
      </form>
    </div>
  );
}