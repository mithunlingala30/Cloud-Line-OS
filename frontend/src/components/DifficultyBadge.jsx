const MAP = {
  Easy: { icon: "☀️", tint: "var(--sun-tint)", color: "#b26a00" },
  Medium: { icon: "⛅", tint: "var(--storm-tint)", color: "#5b4bc4" },
  Hard: { icon: "⛈️", tint: "var(--thunder-tint)", color: "#c93737" },
};

export default function DifficultyBadge({ difficulty }) {
  const cfg = MAP[difficulty] || MAP.Easy;
  return (
    <span
      className="difficulty-badge"
      style={{ background: cfg.tint, color: cfg.color }}
    >
      <span aria-hidden="true">{cfg.icon}</span> {difficulty}
    </span>
  );
}
