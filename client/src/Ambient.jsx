/* Lớp trang trí lung linh: đèn lồng, quầng sáng, cực quang, sao băng, chim, thỏ, cá */

const LANTERNS = [
  { x: 6, size: 26, dur: 46, delay: -4, hue: 0 },
  { x: 17, size: 20, dur: 56, delay: -22, hue: 1 },
  { x: 31, size: 28, dur: 50, delay: -35, hue: 2 },
  { x: 47, size: 18, dur: 62, delay: -12, hue: 0 },
  { x: 63, size: 24, dur: 52, delay: -28, hue: 1 },
  { x: 76, size: 30, dur: 58, delay: -8, hue: 2 },
  { x: 90, size: 22, dur: 48, delay: -40, hue: 0 },
];

const ORBS = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37 + 9) % 96,
  size: 40 + ((i * 29) % 90),
  dur: 22 + ((i * 7) % 20),
  delay: -((i * 5) % 30),
  c: i % 4,
}));

const TWINKLE = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 41 + 5) % 96,
  y: 3 + ((i * 29) % 50),
  s: 10 + ((i * 7) % 14),
  d: (i % 7) * 0.6,
}));

const BIRDS = [
  { top: "9%", dur: 34, delay: -6 },
  { top: "17%", dur: 42, delay: -20 },
  { top: "13%", dur: 38, delay: -30 },
];

export default function Ambient({ mode }) {
  const game = mode === "game";
  const dawn = mode === "login";
  const water = mode === "wait" || mode === "game";
  const lanterns = game ? LANTERNS.slice(0, 4) : LANTERNS;

  return (
    <div className={"amb " + mode} aria-hidden="true">
      {dawn ? (
        <div className="amb-rays" />
      ) : (
        <>
          <div className="amb-aurora a" />
          <div className="amb-aurora b" />
        </>
      )}

      {ORBS.slice(0, game ? 8 : 14).map((o, i) => (
        <span
          key={i}
          className={"amb-orb c" + o.c}
          style={{
            left: o.x + "%",
            width: o.size,
            height: o.size,
            animationDuration: o.dur + "s",
            animationDelay: o.delay + "s",
          }}
        />
      ))}

      {TWINKLE.slice(0, game ? 10 : 18).map((t, i) => (
        <span
          key={i}
          className="amb-tw"
          style={{
            left: t.x + "%",
            top: t.y + "%",
            fontSize: t.s,
            animationDelay: t.d + "s",
          }}
        >
          ✦
        </span>
      ))}

      {!dawn && (
        <>
          <span className="amb-shoot s1" />
          <span className="amb-shoot s2" />
        </>
      )}

      {lanterns.map((l, i) => (
        <span
          key={i}
          className={"amb-lantern h" + l.hue}
          style={{
            left: l.x + "%",
            "--ls": l.size + "px",
            animationDuration: l.dur + "s",
            animationDelay: l.delay + "s",
          }}
        >
          <i />
        </span>
      ))}

      {dawn &&
        BIRDS.map((b, i) => (
          <span
            key={i}
            className="amb-bird"
            style={{ top: b.top, animationDuration: b.dur + "s", animationDelay: b.delay + "s" }}
          >
            🕊️
          </span>
        ))}

      {!water && !game && (
        <span className="amb-rabbit">
          <span>🐇</span>
        </span>
      )}

      {water && (
        <>
          <span className="amb-ring r1" />
          <span className="amb-ring r2" />
          <span className="amb-fish f1">🐟</span>
          <span className="amb-fish f2">🐠</span>
        </>
      )}
    </div>
  );
}