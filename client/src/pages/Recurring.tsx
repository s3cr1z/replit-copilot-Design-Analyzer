import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, Calendar } from "lucide-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ErrorPanel, STANDARD_ERROR_COPY } from "@/components/ErrorPanel";
import type { RecurringItem } from "@shared/schema";

export default function Recurring() {
  const { data: items, isLoading, isError, error, refetch } = useQuery<RecurringItem[]>({ queryKey: ["/api/recurring"] });

  const totalMonthly = (items ?? []).filter(i => i.isActive).reduce((s, i) => s + i.amount, 0);

  function getDaysUntil(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getDateLabel(dateStr: string) {
    const days = getDaysUntil(dateStr);
    if (days <= 0) return "Due today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `In ${days} days`;
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Recurring</h2>
        <p className="text-sm text-muted-foreground">Your upcoming scheduled payments</p>
      </div>

      {/* Monthly total */}
      <Card className="bg-card border-card-border p-4" data-testid="card-recurring-total">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Monthly Recurring</div>
            <div className="text-2xl font-bold text-foreground">${totalMonthly.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Card>

      {/* Upcoming */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">Upcoming</div>
        {isError ? (
          <ErrorPanel
            message={STANDARD_ERROR_COPY.query}
            technicalDetail={error instanceof Error ? error.message : undefined}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Card className="bg-card border-card-border divide-y divide-border">
            {(items ?? []).sort((a, b) => a.nextDate.localeCompare(b.nextDate)).map(item => {
              const days = getDaysUntil(item.nextDate);
              const isUrgent = days <= 1;
              return (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3"
                  data-testid={`recurring-item-${item.id}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUrgent ? "bg-yellow-500/20" : "bg-secondary"
                  }`}>
                    <Calendar className={`w-4 h-4 ${isUrgent ? "text-yellow-400" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={item.category} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-foreground">${item.amount.toFixed(2)}</div>
                    <div className={`text-xs mt-0.5 ${isUrgent ? "text-yellow-400" : "text-muted-foreground"}`}>
                      {getDateLabel(item.nextDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
