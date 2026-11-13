/* ---------- Cây thông ---------- */
function Pine({ className }) {
  return (
    <svg className={"tree " + className} viewBox="0 0 100 160">
      <rect x="44" y="128" width="12" height="32" rx="3" fill="#2b1b3f" />
      <path
        d="M50 4 L82 52 H66 L92 92 H72 L100 134 H0 L28 92 H8 L34 52 H18 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------- Cây tròn có cú mèo đậu trên cành ---------- */
function OwlTree() {
  return (
    <svg className="owltree" viewBox="0 0 200 260">
      <path d="M88 260 C92 210 90 170 84 134 L116 134 C110 170 108 210 112 260 Z" fill="#2b1b3f" />
      <path
        d="M106 172 C130 168 152 162 178 152"
        stroke="#2b1b3f"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      <g fill="#1d6b57">
        <circle cx="100" cy="78" r="56" />
        <circle cx="54" cy="106" r="38" />
        <circle cx="148" cy="106" r="38" />
      </g>
      <circle cx="80" cy="52" r="16" fill="#fff" opacity="0.07" />
      <g className="owl" transform="translate(150 108)">
        <ellipse cx="18" cy="26" rx="15" ry="18" fill="#9a7650" />
        <ellipse cx="18" cy="31" rx="9" ry="11" fill="#d9bf94" />
        <path d="M5 14 L7 2 L15 10 Z" fill="#9a7650" />
        <path d="M31 14 L29 2 L21 10 Z" fill="#9a7650" />
        <circle cx="11" cy="20" r="7.5" fill="#fff7d6" />
        <circle cx="25" cy="20" r="7.5" fill="#fff7d6" />
        <circle cx="11" cy="20" r="3.5" fill="#1b1340" />
        <circle cx="25" cy="20" r="3.5" fill="#1b1340" />
        <ellipse className="lid" cx="11" cy="20" rx="8" ry="8" fill="#9a7650" />
        <ellipse className="lid" cx="25" cy="20" rx="8" ry="8" fill="#9a7650" />
        <path d="M15.5 25 L20.5 25 L18 30 Z" fill="#f59e0b" />
        <path
          d="M9 44 L9 48 M13 44 L13 48 M23 44 L23 48 M27 44 L27 48"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* ---------- Mèo đen ngồi trên đồi ---------- */
function Cat() {
  return (
    <svg className="cat" viewBox="0 0 160 150">
      <path
        className="tail"
        d="M112 128 C150 128 158 96 140 80"
        stroke="#4a3a7a"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M46 148 C34 110 52 70 80 70 C108 70 126 110 114 148 Z" fill="#4a3a7a" />
      <ellipse cx="64" cy="146" rx="12" ry="6" fill="#4a3a7a" />
      <ellipse cx="96" cy="146" rx="12" ry="6" fill="#4a3a7a" />
      <circle cx="80" cy="58" r="30" fill="#4a3a7a" />
      <path d="M54 42 L52 14 L74 30 Z" fill="#4a3a7a" />
      <path d="M106 42 L108 14 L86 30 Z" fill="#4a3a7a" />
      <path d="M57 36 L56 22 L67 30 Z" fill="#ff8fb8" opacity="0.7" />
      <path d="M103 36 L104 22 L93 30 Z" fill="#ff8fb8" opacity="0.7" />
      <ellipse className="eye" cx="68" cy="58" rx="6" ry="8" fill="#fde047" />
      <ellipse className="eye" cx="92" cy="58" rx="6" ry="8" fill="#fde047" />
      <ellipse cx="68" cy="58" rx="2" ry="6" fill="#1b1340" />
      <ellipse cx="92" cy="58" rx="2" ry="6" fill="#1b1340" />
      <path d="M77 69 L83 69 L80 74 Z" fill="#ff8fb8" />
      <g stroke="#cbb8ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.55">
        <path d="M60 68 L38 63" />
        <path d="M60 72 L38 75" />
        <path d="M100 68 L122 63" />
        <path d="M100 72 L122 75" />
      </g>
    </svg>
  );
}

/* ---------- Bầu trời đêm dùng chung cho mọi màn hình ---------- */
function NightScene({ mode }) {
  const showFlowers = mode !== "game";
  return (
    <div className={"night " + mode} aria-hidden="true">
      {/* Kho hình hoa dùng lại */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <symbol id="flower" viewBox="0 0 100 100">
            <g fill="currentColor">
              <ellipse cx="50" cy="26" rx="14" ry="22" />
              <ellipse cx="50" cy="26" rx="14" ry="22" transform="rotate(72 50 50)" />
              <ellipse cx="50" cy="26" rx="14" ry="22" transform="rotate(144 50 50)" />
              <ellipse cx="50" cy="26" rx="14" ry="22" transform="rotate(216 50 50)" />
              <ellipse cx="50" cy="26" rx="14" ry="22" transform="rotate(288 50 50)" />
            </g>
            <circle cx="50" cy="50" r="12" fill="#facc15" />
          </symbol>
        </defs>
      </svg>

      {/* Trăng khuyết */}
      <svg className="moon" viewBox="0 0 120 120">
        <defs>
          <radialGradient id="moonGlow">
            <stop offset="0" stopColor="#fff7d6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff7d6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#moonGlow)" />
        <path d="M78 24 A42 42 0 1 0 78 96 A36 36 0 1 1 78 24 Z" fill="#fff3c4" />
      </svg>

      {/* Sao nhấp nháy và sao băng */}
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: ((i * 37) % 97) + 1 + "%",
            top: ((i * 53) % 60) + 2 + "%",
            fontSize: 8 + (i % 4) * 5 + "px",
            animationDelay: (i % 7) * 0.5 + "s",
          }}
        >
          {i % 3 === 0 ? "✧" : "✦"}
        </span>
      ))}
      <span className="shoot"></span>

      {/* Dơi bay ngang */}
      {[
        { top: "8%", dur: 19, delay: 0 },
        { top: "22%", dur: 24, delay: 7 },
        { top: "15%", dur: 21, delay: 13 },
      ].map((b, i) => (
        <span
          key={i}
          className="bat"
          style={{ top: b.top, animationDuration: b.dur + "s", animationDelay: b.delay + "s" }}
        >
          🦇
        </span>
      ))}

      {/* Đồi, cây cối, con vật */}
      <svg className="hills" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          d="M0 120 C200 60 380 90 560 110 C760 132 900 70 1100 80 C1260 88 1360 110 1440 100 V220 H0 Z"
          fill="#231a55"
        />
        <path
          d="M0 160 C220 120 420 170 640 150 C860 130 1060 180 1240 150 C1340 134 1400 140 1440 150 V220 H0 Z"
          fill="#190f42"
        />
      </svg>
      <Pine className="p1" />
      <Pine className="p2" />
      <Pine className="p3" />
      <Pine className="p4" />
      <OwlTree />
      <Cat />

      {/* Đom đóm */}
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: ((i * 29) % 90) + 3 + "%",
            top: 45 + ((i * 17) % 42) + "%",
            animationDelay: (i % 6) * 0.9 + "s",
            animationDuration: 6 + (i % 4) * 1.5 + "s",
          }}
        />
      ))}

      {/* Hoa xoay chậm, cánh hoa và lá rơi (không hiện ở màn hình chơi cho đỡ rối) */}
      {showFlowers && (
        <>
          <svg className="fl f1" viewBox="0 0 100 100">
            <use href="#flower" />
          </svg>
          <svg className="fl f2" viewBox="0 0 100 100">
            <use href="#flower" />
          </svg>
          {["🌸", "🍃", "🌸", "🍃", "🌸", "🍃", "🌸"].map((p, i) => (
            <span
              key={i}
              className="petal"
              style={{
                left: 8 + i * 13 + "%",
                animationDuration: 9 + i * 1.3 + "s",
                animationDelay: i * 1.4 + "s",
              }}
            >
              {p}
            </span>
          ))}
        </>
      )}
    </div>
  );
}

/* ---------- Khung nền chung ---------- */
const DECO = [
  { t: "x", x: "6%", y: "10%", s: "70px", d: "0s" },
  { t: "o", x: "85%", y: "14%", s: "90px", d: "1.2s" },
  { t: "o", x: "12%", y: "60%", s: "80px", d: "2.4s" },
  { t: "x", x: "80%", y: "62%", s: "100px", d: "0.6s" },
];

export function Shell({ children, mode = "home" }) {
  return (
    <div className={"app scene-" + mode}>
      <NightScene mode={mode} />
      {mode !== "game" && (
        <div className="deco" aria-hidden="true">
          {DECO.map((d, i) => (
            <span
              key={i}
              className={"deco-item deco-" + d.t}
              style={{ left: d.x, top: d.y, fontSize: d.s, animationDelay: d.d }}
            >
              {d.t === "x" ? "?" : "★"}
            </span>
          ))}
        </div>
      )}
      <main className="content">{children}</main>
    </div>
  );
}

