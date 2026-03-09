import { useMemo } from "react";
import { LineChart, Line, ReferenceDot, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface SpendingLineChartProps {
  totalBudgeted: number;
  totalSpent: number;
}

export function SpendingLineChart({ totalBudgeted, totalSpent }: SpendingLineChartProps) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();

  const data = useMemo(() => {
    const points = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const expectedSpend = (totalBudgeted / daysInMonth) * d;
      const actualSpend = d <= dayOfMonth ? (totalSpent / dayOfMonth) * d : undefined;
      points.push({ day: d, expected: expectedSpend, actual: actualSpend });
    }
    return points;
  }, [totalBudgeted, totalSpent, daysInMonth, dayOfMonth]);

  const diff = totalBudgeted - totalSpent;
  const isUnder = diff >= 0;
  const diffLabel = `$${Math.abs(diff).toFixed(0)} ${isUnder ? "under" : "over"}`;
  const dotColor = isUnder ? "#22c55e" : "#ef4444";
  const pillBg = isUnder ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)";

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-foreground">
          ${Math.max(0, diff).toFixed(0)} left
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">
          out of ${totalBudgeted.toFixed(0)} budgeted
        </div>
      </div>
      <div className="relative h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="expected"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke={dotColor}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <ReferenceDot
              x={dayOfMonth}
              y={(totalSpent / dayOfMonth) * dayOfMonth}
              r={5}
              fill={dotColor}
              stroke="hsl(222 42% 8%)"
              strokeWidth={2}
              label={{
                value: diffLabel,
                position: "top",
                fill: "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
