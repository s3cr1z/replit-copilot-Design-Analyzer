import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetCircle } from "@/components/BudgetCircle";
import { ErrorPanel, STANDARD_ERROR_COPY } from "@/components/ErrorPanel";
import type { Budget } from "@shared/schema";

export default function Categories() {
  const { data: budgets, isLoading, isError, error, refetch } = useQuery<Budget[]>({ queryKey: ["/api/budgets"] });

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Budget Categories</h2>
        <p className="text-sm text-muted-foreground">Track spending across all your categories</p>
      </div>

      {isError ? (
        <ErrorPanel
          message={STANDARD_ERROR_COPY.query}
          technicalDetail={error instanceof Error ? error.message : undefined}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {(budgets ?? []).map(budget => {
            const pct = Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100);
            const isOver = budget.spentAmount > budget.budgetAmount;
            const left = budget.budgetAmount - budget.spentAmount;
            return (
              <Card key={budget.id} className="bg-card border-card-border p-4" data-testid={`category-card-${budget.id}`}>
                <div className="flex items-center gap-4">
                  <BudgetCircle budget={budget} size={64} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">{budget.category}</span>
                      <span className={`text-sm font-bold ${isOver ? "text-red-400" : "text-foreground"}`}>
                        ${budget.spentAmount.toFixed(0)} / ${budget.budgetAmount.toFixed(0)}
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full">
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isOver ? "#ef4444" : budget.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{pct.toFixed(0)}% used</span>
                      <span className={`text-xs font-medium ${isOver ? "text-red-400" : "text-green-400"}`}>
                        {isOver ? `$${Math.abs(left).toFixed(0)} over` : `$${left.toFixed(0)} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Total summary */}
      {!isLoading && budgets && (
        <Card className="bg-card border-card-border p-4 mt-2" data-testid="card-budget-total">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Budgeted</span>
            <span className="text-sm font-bold text-foreground">
              ${budgets.reduce((s, b) => s + b.budgetAmount, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
            <span className="text-sm font-bold text-foreground">
              ${budgets.reduce((s, b) => s + b.spentAmount, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Remaining</span>
            <span className="text-sm font-bold text-green-400">
              ${(budgets.reduce((s, b) => s + b.budgetAmount, 0) - budgets.reduce((s, b) => s + b.spentAmount, 0)).toLocaleString()}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
