/* ---------- Hình trang trí dùng chung ---------- */
function Sparkles({ n = 24, maxTop = 50 }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: ((i * 37) % 97) + 1 + "%",
            top: ((i * 53) % maxTop) + 2 + "%",
            fontSize: 8 + (i % 4) * 5 + "px",
            animationDelay: (i % 7) * 0.5 + "s",
          }}
        >
          {i % 3 === 0 ? "✧" : "✦"}
        </span>
      ))}
    </>
  );
}

// Những ngôi sao lớn trên trời: [vị trí ngang %, vị trí dọc %, cỡ px]
const BIG_STARS = [
  [8, 9, 22],
  [27, 6, 16],
  [58, 13, 18],
  [72, 5, 24],
  [84, 15, 16],
  [93, 8, 20],
];

function BigStars() {
  return (
    <>
      {BIG_STARS.map(([x, y, s], i) => (
        <svg
          key={i}
          className="fw-star"
          viewBox="0 0 24 24"
          style={{ left: x + "%", top: y + "%", width: s, height: s, animationDelay: i * 0.6 + "s" }}
        >
          <polygon points="12,1.5 15,8.8 22.5,9.2 16.8,14.2 18.6,21.5 12,17.5 5.4,21.5 7.2,14.2 1.5,9.2 9,8.8" />
        </svg>
      ))}
    </>
  );
}

function Moon() {
  return (
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
  );
}

function Butterflies() {
  const items = [
    { top: "16%", dur: 26, delay: 0 },
    { top: "32%", dur: 32, delay: 9 },
    { top: "24%", dur: 29, delay: 17 },
  ];
  return (
    <>
      {items.map((b, i) => (
        <span
          key={i}
          className="bfly"
          style={{ top: b.top, animationDuration: b.dur + "s", animationDelay: b.delay + "s" }}
        >
          🦋
        </span>
      ))}
    </>
  );
}

function Petals() {
  return (
    <>
      {["🌸", "🌷", "🌸", "🌼", "🌸", "🌷", "🌸"].map((p, i) => (
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
  );
}

function Fireflies({ n = 14 }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="fw-firefly"
          style={{
            left: ((i * 29) % 90) + 3 + "%",
            top: 50 + ((i * 17) % 38) + "%",
            animationDelay: (i % 6) * 0.9 + "s",
            animationDuration: 6 + (i % 4) * 1.5 + "s",
          }}
        />
      ))}
    </>
  );
}

// Hoa trên bãi cỏ: [hình, vị trí ngang %, cách đáy vh]
const FLOWERS = [
  ["🌼", 6, 3],
  ["🌷", 14, 6],
  ["🌸", 22, 2.5],
  ["🌼", 33, 4.5],
  ["🌷", 42, 2.5],
  ["🌸", 52, 5],
  ["🌼", 91, 3],
  ["🌷", 96, 6],
];

function Flowers() {
  return (
    <>
      {FLOWERS.map(([e, x, b], i) => (
        <span key={i} className="fw-flower" style={{ left: x + "%", bottom: b + "vh" }}>
          {e}
        </span>
      ))}
    </>
  );
}

/* ---------- Rừng cây ---------- */
const BACK_TREES = [40, 46, 52, 58, 64, 70, 76, 82, 88, 93, 98].map((x, i) => ({
  x,
  h: 13 + (i % 3) * 3,
}));
const FRONT_TREES = [
  { x: -3, h: 40 },
  { x: 4, h: 28 },
  { x: 87, h: 34 },
  { x: 94, h: 44 },
];

function Trees({ items, back }) {
  return (
    <>
      {items.map((t, i) => (
        <svg
          key={i}
          className={"fw-tree" + (back ? " back" : "")}
          viewBox="0 0 100 140"
          style={{
            left: t.x + "%",
            height: t.h + "vh",
            bottom: back ? "25vh" : "2vh",
            animationDelay: -(i * 1.3) + "s",
          }}
        >
          <rect x="44" y="96" width="12" height="44" rx="3" fill="#b58f73" />
          <circle className="t2" cx="50" cy="82" r="38" />
          <circle className="t1" cx="32" cy="62" r="28" />
          <circle className="t1" cx="68" cy="62" r="28" />
          <circle className="t3" cx="50" cy="40" r="30" />
          <circle cx="40" cy="58" r="4" fill="#ffc2dc" />
          <circle cx="62" cy="48" r="4" fill="#fff3b0" />
          <circle cx="54" cy="76" r="4" fill="#ffc2dc" />
        </svg>
      ))}
    </>
  );
}

/* ---------- Lâu đài lớn ---------- */
function Castle() {
  const win = (cx, y) => (
    <path className="cwin" d={`M${cx - 5} ${y + 16} v-11 a5 5 0 0 1 10 0 v11 z`} />
  );
  const flag = (x, y) => (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 24} stroke="#8b6bb8" strokeWidth="2" />
      <path className="flag" d={`M${x} ${y - 24} l20 6 l-20 6 z`} fill="#ffd166" />
    </g>
  );
  const tower = (x, w, top, key) => {
    const cx = x + w / 2;
    const apex = top - w * 1.25;
    return (
      <g key={key}>
        <rect className="cw" x={x} y={top} width={w} height={440 - top} />
        <polygon className="cr" points={`${x - 6},${top} ${cx},${apex} ${x + w + 6},${top}`} />
        {flag(cx, apex)}
        {win(cx, top + 26)}
        {win(cx, top + 76)}
      </g>
    );
  };
  return (
    <svg className="fw-castle" viewBox="0 0 360 440">
      <rect className="cd" x="30" y="340" width="300" height="100" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect className="cd" key={i} x={32 + i * 38} y="330" width="22" height="12" />
      ))}
      {tower(8, 56, 280, "a")}
      {tower(296, 56, 280, "b")}
      {tower(76, 50, 220, "c")}
      {tower(234, 50, 220, "d")}
      <rect className="cw" x="128" y="260" width="104" height="180" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect className="cw" key={i} x={128 + i * 19} y="250" width="12" height="12" />
      ))}
      <rect className="cw" x="154" y="140" width="52" height="130" />
      <polygon className="cr" points="146,140 180,40 214,140" />
      {flag(180, 40)}
      {win(180, 160)}
      {win(180, 210)}
      {win(150, 300)}
      {win(180, 300)}
      {win(210, 300)}
      <path className="cdoor" d="M158 440 V398 a22 22 0 0 1 44 0 V440 z" />
    </svg>
  );
}

/* ---------- Công chúa (tự vẽ, không phải nhân vật có bản quyền) ---------- */
function Princess() {
  return (
    <svg className="fw-princess" viewBox="0 0 160 300">
      <defs>
        <linearGradient id="fwDress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9a8d4" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id="fwSkirt2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde7f3" />
          <stop offset="1" stopColor="#e9e0ff" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="296" rx="62" ry="5" fill="rgba(40,20,70,0.22)" />

      {/* Tóc phía sau */}
      <path
        className="pr-hair"
        d="M52 62 C38 104 46 150 36 196 C60 208 100 208 124 196 C114 150 122 104 108 62 Z"
        fill="#f4cf5a"
      />

      {/* Váy */}
      <path
        d="M62 128 C42 172 18 240 6 292 C50 306 110 306 154 292 C142 240 118 172 98 128 Z"
        fill="url(#fwDress)"
      />
      <path
        d="M62 150 C44 196 28 244 18 288 C52 298 108 298 142 288 C132 244 116 196 98 150 Z"
        fill="url(#fwSkirt2)"
        opacity="0.75"
      />
      <path
        d="M8 286 q18 14 36 0 q18 14 36 0 q18 14 36 0 q18 14 36 0 L154 292 C110 306 50 306 6 292 Z"
        fill="#f9a8d4"
      />
      <path d="M80 132 C76 190 62 250 48 296" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      <path d="M88 136 C92 196 104 250 118 296" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <circle cx="46" cy="236" r="2.6" fill="#fff" />
      <circle cx="112" cy="250" r="2.2" fill="#fff" />
      <circle cx="82" cy="262" r="2.6" fill="#fff" />
      <circle cx="30" cy="272" r="2" fill="#fff" />

      {/* Thân trên, thắt lưng và nơ */}
      <path
        d="M62 100 C60 116 62 128 66 134 C76 140 84 140 94 134 C98 128 100 116 98 100 Z"
        fill="#f472b6"
      />
      <rect x="62" y="128" width="36" height="9" rx="4.5" fill="#7dd3fc" />
      <path d="M80 132 l-14 -8 v16 z M80 132 l14 -8 v16 z" fill="#38bdf8" />
      <circle cx="80" cy="132" r="4" fill="#bae6fd" />

      {/* Tay, tay áo phồng và đũa phép */}
      <path d="M62 106 C48 124 44 146 54 166" stroke="#ffe3d1" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M98 106 C112 124 118 140 112 160" stroke="#ffe3d1" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="62" cy="106" r="9" fill="#f9a8d4" />
      <circle cx="98" cy="106" r="9" fill="#f9a8d4" />
      <circle cx="54" cy="168" r="6" fill="#ffe3d1" />
      <circle cx="112" cy="162" r="6" fill="#ffe3d1" />
      <line x1="112" y1="162" x2="136" y2="116" stroke="#c08a4a" strokeWidth="3" strokeLinecap="round" />
      <polygon
        className="pr-spark"
        points="136,100 140,110 151,111 143,118 146,129 136,123 126,129 129,118 121,111 132,110"
        fill="#ffd166"
      />

      {/* Cổ và khuôn mặt */}
      <rect x="74" y="92" width="12" height="14" rx="4" fill="#ffe3d1" />
      <circle cx="80" cy="70" r="27" fill="#ffe3d1" />
      <path
        d="M53 68 C50 40 70 28 82 33 C96 30 112 42 107 68 C98 54 89 49 80 49 C70 49 60 56 53 68 Z"
        fill="#f4cf5a"
      />
      <ellipse cx="70" cy="72" rx="3" ry="4.2" fill="#4b2a63" />
      <ellipse cx="90" cy="72" rx="3" ry="4.2" fill="#4b2a63" />
      <circle cx="71" cy="70.5" r="1.1" fill="#fff" />
      <circle cx="91" cy="70.5" r="1.1" fill="#fff" />
      <circle cx="62" cy="82" r="5" fill="#ffb3c7" opacity="0.7" />
      <circle cx="98" cy="82" r="5" fill="#ffb3c7" opacity="0.7" />
      <path d="M74 84 Q80 90 86 84" stroke="#c2417a" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Vương miện */}
      <path d="M62 42 L66 24 L74 34 L80 20 L86 34 L94 24 L98 42 Z" fill="#ffd166" stroke="#f5a524" strokeWidth="1.5" />
      <circle cx="80" cy="34" r="3" fill="#f472b6" />
    </svg>
  );
}

/* ---------- Khung cảnh 1 và 2: lâu đài, sông, rừng cây, công chúa ---------- */
function World({ time }) {
  const dawn = time === "dawn";
  return (
    <div className={"fw " + time} aria-hidden="true">
      {dawn ? (
        <>
          <div className="fw-sun" />
          <span className="fw-cloud c1" />
          <span className="fw-cloud c2" />
          <span className="fw-cloud c3" />
        </>
      ) : (
        <Moon />
      )}
      <Sparkles n={dawn ? 12 : 34} maxTop={dawn ? 36 : 50} />
      <BigStars />

      <svg className="fw-hills" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 110 C240 40 460 120 700 84 C940 48 1180 120 1440 70 V220 H0 Z" fill="var(--hillA)" />
        <path d="M0 150 C260 100 520 170 760 134 C1000 100 1220 150 1440 120 V220 H0 Z" fill="var(--hillB)" />
      </svg>
      <svg className="fw-meadow" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fwGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--grass1)" }} />
            <stop offset="1" style={{ stopColor: "var(--grass2)" }} />
          </linearGradient>
        </defs>
        <path
          d="M0 110 C300 60 600 100 900 70 C1150 45 1300 80 1440 60 V400 H0 Z"
          fill="url(#fwGrass)"
        />
      </svg>
      <svg className="fw-river" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fwWater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--river1)" }} />
            <stop offset="1" style={{ stopColor: "var(--river2)" }} />
          </linearGradient>
        </defs>
        <path
          d="M200 0 C260 90 560 110 700 200 C820 280 900 340 880 400 L1260 400 C1250 330 1130 260 1000 200 C850 130 480 90 310 0 Z"
          fill="url(#fwWater)"
        />
        <path className="ripple" d="M262 14 C340 92 600 122 736 214 C830 280 900 340 916 400" />
        <path className="ripple r2" d="M300 12 C380 84 640 112 790 200 C900 266 1010 330 1040 400" />
        <path className="ripple r3" d="M250 6 C320 90 560 100 700 190 C800 250 840 330 860 400" />
      </svg>

      <Trees items={BACK_TREES} back />
      <Castle />
      <Trees items={FRONT_TREES} />
      <Princess />
      <Flowers />
      {!dawn && <Fireflies n={14} />}
      <Butterflies />
      <Petals />
    </div>
  );
}

/* ---------- Khung cảnh 3: hồ phép thuật (phòng chờ và màn hình chơi) ---------- */
const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  left: ((i * 23 + 7) % 96) + 2,
  size: 8 + ((i * 7) % 19),
  dur: 9 + ((i * 5) % 10),
  delay: -((i * 3) % 14),
}));

function LilyPads() {
  const pads = [
    [110, 74, 70],
    [290, 92, 50],
    [520, 78, 62],
    [780, 92, 54],
    [1010, 74, 68],
    [1240, 90, 52],
    [1390, 76, 56],
  ];
  const lotus = [
    [150, 58],
    [560, 62],
    [1050, 60],
    [1330, 58],
  ];
  return (
    <svg className="fw-lily" viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax slice">
      {pads.map(([x, y, r], i) => (
        <ellipse key={i} className="pad" cx={x} cy={y} rx={r} ry={r * 0.32} />
      ))}
      {lotus.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[-32, -16, 0, 16, 32].map((a) => (
            <ellipse key={a} cx="0" cy="-14" rx="7" ry="16" fill="#f9a8d4" transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="-2" r="5" fill="#fde68a" />
        </g>
      ))}
    </svg>
  );
}

function LakeScene({ game }) {
  return (
    <div className={"fw magic" + (game ? " game" : "")} aria-hidden="true">
      <div className="fw-rays" />
      <Moon />
      <Sparkles n={game ? 14 : 26} maxTop={44} />
      <BigStars />

      {/* Mặt hồ, bờ cây và lâu đài xa */}
      <div className="mg-water" />
      <svg className="mg-shore" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path
          d="M0 120 C200 70 420 112 640 92 C880 70 1100 112 1440 62 V200 H0 Z"
          fill="var(--shoreA)"
        />
        <g fill="var(--shoreB)">
          {[60, 150, 250, 340, 520, 640, 760, 1190, 1290, 1380].map((x, i) => (
            <circle key={i} cx={x} cy={96 - (i % 3) * 8} r={20 + (i % 3) * 5} />
          ))}
        </g>
        <path
          d="M0 150 C260 110 560 160 800 132 C1040 104 1240 150 1440 120 V200 H0 Z"
          fill="var(--shoreA)"
        />
      </svg>
      <Castle />

      <span className="mg-swan s1">🦢</span>
      <span className="mg-swan s2">🦢</span>
      {BUBBLES.slice(0, game ? 9 : 16).map((b, i) => (
        <span
          key={i}
          className="fw-bubble"
          style={{
            left: b.left + "%",
            width: b.size,
            height: b.size,
            animationDuration: b.dur + "s",
            animationDelay: b.delay + "s",
          }}
        />
      ))}
      <LilyPads />
      {!game && <Butterflies />}
      {!game && <Petals />}
    </div>
  );
}

/* ---------- Khung nền chung ---------- */
export function Shell({ children, mode = "home" }) {
  return (
    <div className={"app scene-" + mode}>
      {mode === "login" && <World time="dawn" />}
      {mode === "home" && <World time="dusk" />}
      {(mode === "wait" || mode === "game") && <LakeScene game={mode === "game"} />}
      <main className="content">{children}</main>
    </div>
  );
}