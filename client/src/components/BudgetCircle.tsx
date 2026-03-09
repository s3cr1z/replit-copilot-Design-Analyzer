import { Car, ShoppingBag, Tv, Zap, Heart, UtensilsCrossed, Home, Bus, Plane, DollarSign } from "lucide-react";
import type { Budget } from "@shared/schema";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  Zap,
  Heart,
  Home,
  Bus,
  Plane,
  DollarSign,
};

interface BudgetCircleProps {
  budget: Budget;
  size?: number;
}

export function BudgetCircle({ budget, size = 72 }: BudgetCircleProps) {
  const pct = Math.min(budget.spentAmount / budget.budgetAmount, 1);
  const isOver = budget.spentAmount > budget.budgetAmount;
  const left = budget.budgetAmount - budget.spentAmount;

  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;
  const strokeColor = isOver ? "#ef4444" : budget.color;

  const IconComp = ICON_MAP[budget.icon] ?? DollarSign;

  return (
    <div className="flex flex-col items-center gap-1" data-testid={`budget-circle-${budget.id}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={5}
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: size * 0.56,
              height: size * 0.56,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          >
            <IconComp className="w-5 h-5" style={{ color: budget.color }} />
          </div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold text-foreground">
          {isOver ? (
            <span className="text-red-400">${Math.abs(left).toFixed(0)} over</span>
          ) : (
            <>${left.toFixed(0)}</>
          )}
        </div>
        <div className="text-xs text-muted-foreground">left</div>
      </div>
    </div>
  );
}
