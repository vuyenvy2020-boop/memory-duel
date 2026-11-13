const LEVELS = [
  { id: "easy", label: "Dễ", cards: "12 thẻ" },
  { id: "normal", label: "Vừa", cards: "16 thẻ" },
  { id: "hard", label: "Khó", cards: "24 thẻ" },
];

export default function LevelPicker({ value, onChange }) {
  return (
    <section className="mark-pick">
      <div className="mark-label">
        <span className="mp-title">Chọn độ khó</span>
        <span className="mp-note">cho phòng bạn bè</span>
      </div>
      <div className="mark-btns" role="radiogroup" aria-label="Chọn độ khó">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={value === l.id}
            className={"mark-btn lv" + (value === l.id ? " on" : "")}
            onClick={() => onChange(l.id)}
          >
            <b>{l.label}</b>
            <small>{l.cards}</small>
          </button>
        ))}
      </div>
    </section>
  );
}