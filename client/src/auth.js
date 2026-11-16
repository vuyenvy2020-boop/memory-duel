import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";
import { newProfile, ensureDay } from "./profile";

const TOKEN_KEY = "md-token"; // sessionStorage: mỗi tab một phiên riêng
const NAME_KEY = "md-last-user"; // localStorage: chỉ nhớ tên đăng nhập để điền sẵn

const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};
const setToken = (t) => {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* bỏ qua */
  }
};
const getLastUser = () => {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
};
const rememberUser = (name) => {
  try {
    if (name) localStorage.setItem(NAME_KEY, name);
    else localStorage.removeItem(NAME_KEY);
  } catch {
    /* bỏ qua */
  }
};

// Gửi yêu cầu lên server, có giới hạn thời gian chờ
function ask(event, payload) {
  return new Promise((resolve) => {
    if (!socket.connected) {
      return resolve({ error: "Chưa kết nối được máy chủ. Hãy kiểm tra server đang chạy." });
    }
    const t = setTimeout(
      () => resolve({ error: "Máy chủ không phản hồi, hãy thử lại sau." }),
      8000
    );
    socket.emit(event, payload, (res) => {
      clearTimeout(t);
      resolve(res || { error: "Máy chủ không phản hồi." });
    });
  });
}

export function useAuth() {
  const [status, setStatus] = useState(() => (getToken() ? "loading" : "out")); // loading | out | in
  const [online, setOnline] = useState(socket.connected);
  const [profile, setProfile] = useState(null);
  const [notice, setNotice] = useState("");
  const ref = useRef(null); // hồ sơ mới nhất

  const setP = (p) => {
    ref.current = p;
    setProfile(p);
  };

  // Vào game: chưa có hồ sơ thì tạo mới và lưu lên server
  const enter = (user, prof) => {
    let p = prof;
    if (!p) {
      p = newProfile(user.display, user.avatar);
      socket.emit("profile:save", { profile: p });
    }
    setP(p);
    setStatus("in");
  };

  useEffect(() => {
    const resume = () => {
      setOnline(true);
      const token = getToken();
      if (!token) return;
      socket.emit("auth:resume", { token }, (res) => {
        if (res?.ok) enter(res.user, res.profile);
        else {
          setToken("");
          setP(null);
          setStatus("out");
        }
      });
    };
    const gone = () => setOnline(false);
    const kicked = () => {
      setToken("");
      setP(null);
      setStatus("out");
      setNotice("Tài khoản này vừa đăng nhập ở một nơi khác nên bạn đã bị đăng xuất.");
    };
    socket.on("connect", resume);
    socket.on("disconnect", gone);
    socket.on("kicked", kicked);
    if (socket.connected) resume();
    return () => {
      socket.off("connect", resume);
      socket.off("disconnect", gone);
      socket.off("kicked", kicked);
    };
  }, []);

  const login = async ({ username, password, remember }) => {
    const res = await ask("auth:login", { username, password });
    if (res.ok) {
      setToken(res.token);
      rememberUser(remember ? username : "");
      setNotice("");
      enter(res.user, res.profile);
    }
    return res;
  };

  const register = async (form) => {
    const res = await ask("auth:register", form);
    if (res.ok) {
      setToken(res.token);
      rememberUser(form.username);
      setNotice("");
      enter(res.user, res.profile);
    }
    return res;
  };

  const logout = () => {
    socket.emit("auth:logout", { token: getToken() });
    setToken("");
    setP(null);
    setStatus("out");
  };

  // Dùng khi không khôi phục được phiên (server tắt, token cũ)
  const forget = () => {
    setToken("");
    setP(null);
    setStatus("out");
  };

  // Cập nhật hồ sơ rồi lưu lên server
  const update = (fn) => {
    if (!ref.current) return;
    const next = fn(ref.current);
    if (next === ref.current) return;
    setP(next);
    socket.emit("profile:save", { profile: next });
  };

  return {
    status,
    online,
    notice,
    lastUser: getLastUser(),
    profile: profile ? ensureDay(profile) : null,
    login,
    register,
    logout,
    forget,
    update,
  };
}