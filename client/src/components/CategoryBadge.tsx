const CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
  "Food & Drink":   { color: "#f59e0b", bg: "rgba(245,158,11,0.2)" },
  "Transportation": { color: "#818cf8", bg: "rgba(129,140,248,0.2)" },
  "Shopping":       { color: "#10b981", bg: "rgba(16,185,129,0.2)" },
  "Entertainment":  { color: "#f43f5e", bg: "rgba(244,63,94,0.2)" },
  "Utilities":      { color: "#3b82f6", bg: "rgba(59,130,246,0.2)" },
  "Rent":           { color: "#f97316", bg: "rgba(249,115,22,0.2)" },
  "Car":            { color: "#ef4444", bg: "rgba(239,68,68,0.2)" },
  "Health":         { color: "#ec4899", bg: "rgba(236,72,153,0.2)" },
  "Travel":         { color: "#06b6d4", bg: "rgba(6,182,212,0.2)" },
  "Other":          { color: "#94a3b8", bg: "rgba(148,163,184,0.2)" },
  "Income":         { color: "#22c55e", bg: "rgba(34,197,94,0.2)" },
  "Transfer":       { color: "#6b7280", bg: "rgba(107,114,128,0.2)" },
  "Insurance":      { color: "#8b5cf6", bg: "rgba(139,92,246,0.2)" },
};

export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.2)" };
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const { color, bg } = getCategoryConfig(category);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {category}
    </span>
  );
}
