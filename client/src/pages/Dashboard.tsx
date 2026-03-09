import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, TrendingUp, TrendingDown, CheckCircle2, CircleDot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetCircle } from "@/components/BudgetCircle";
import { SpendingLineChart } from "@/components/SpendingLineChart";
import { CategoryBadge } from "@/components/CategoryBadge";
import type { Transaction, Budget, RecurringItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalBudgeted: number; totalSpent: number; netThisMonth: number; totalIncome: number; totalSpend: number;
  }>({ queryKey: ["/api/dashboard/stats"] });

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({ queryKey: ["/api/budgets"] });
  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({ queryKey: ["/api/transactions"] });
  const { data: recurring } = useQuery<RecurringItem[]>({ queryKey: ["/api/recurring"] });

  const unreviewed = transactions?.filter(t => !t.isReviewed).slice(0, 3) ?? [];

  const reviewMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/transactions/${id}`, { isReviewed: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ description: "Transaction marked as reviewed" });
    },
  });

  const upcoming = recurring?.slice(0, 3) ?? [];

  const netColor = (stats?.netThisMonth ?? 0) >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Budget Overview Card */}
      <Card className="bg-card border-card-border p-5">
        {statsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-40 mx-auto" />
            <Skeleton className="h-4 w-52 mx-auto" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
        ) : (
          <SpendingLineChart
            totalBudgeted={stats?.totalBudgeted ?? 2400}
            totalSpent={stats?.totalSpent ?? 0}
          />
        )}
      </Card>

      {/* To Review Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">To Review</span>
          <button
            className="text-xs text-primary flex items-center gap-0.5"
            onClick={() => setLocation("/transactions")}
            data-testid="link-view-all-review"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {txLoading ? (
          <Card className="bg-card border-card-border p-4">
            <Skeleton className="h-14 w-full" />
          </Card>
        ) : unreviewed.length === 0 ? (
          <Card className="bg-card border-card-border p-5 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No transactions to review</p>
          </Card>
        ) : (
          <Card className="bg-card border-card-border divide-y divide-border">
            <div className="px-4 py-2">
              <p className="text-xs text-muted-foreground text-center">So far today</p>
            </div>
            {unreviewed.map((tx) => (
              <div key={tx.id} className="px-4 py-3" data-testid={`review-item-${tx.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate flex-1">{tx.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CategoryBadge category={tx.category} />
                    <span className={`text-sm font-semibold ${tx.isIncome ? "text-green-400" : "text-foreground"}`}>
                      {tx.isIncome ? "+" : ""}${tx.amount.toFixed(2)}
                    </span>
                    <CircleDot className="w-2 h-2 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs tracking-widest font-semibold uppercase"
                    onClick={() => reviewMutation.mutate(tx.id)}
                    data-testid={`button-mark-reviewed-${tx.id}`}
                    disabled={reviewMutation.isPending}
                  >
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Budgets Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Budgets</span>
          <button
            className="text-xs text-primary flex items-center gap-0.5"
            onClick={() => setLocation("/categories")}
            data-testid="link-categories"
          >
            Categories <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {budgetsLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="w-16 h-24 flex-shrink-0" />)}
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
            {(budgets ?? []).map(budget => (
              <BudgetCircle key={budget.id} budget={budget} />
            ))}
          </div>
        )}
      </div>

      {/* Net This Month */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Net This Month</span>
          <button
            className="text-xs text-primary flex items-center gap-0.5"
            onClick={() => setLocation("/reports")}
            data-testid="link-cash-flow"
          >
            Cash flow <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <Card className="bg-card border-card-border p-4" data-testid="card-net-month">
          {statsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <div className={`text-3xl font-bold ${netColor}`}>
                ${Math.abs(stats?.netThisMonth ?? 0).toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded font-mono">
                  {((stats?.netThisMonth ?? 0) >= 0 ? "+" : "-")}0.00%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs $0.00 · Sep 2024
                </span>
              </div>
              <div className="mt-3 h-1 bg-muted rounded-full" />
              <div className="flex gap-6 mt-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    <span className="text-xs text-muted-foreground">Income</span>
                  </div>
                  <span className="text-sm font-semibold text-green-400" data-testid="text-total-income">
                    ${stats?.totalIncome.toFixed(2) ?? "0.00"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    <span className="text-xs text-muted-foreground">Spend</span>
                  </div>
                  <span className="text-sm font-semibold text-red-400" data-testid="text-total-spend">
                    ${stats?.totalSpend.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Upcoming Recurring */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Upcoming</span>
            <button
              className="text-xs text-primary flex items-center gap-0.5"
              data-testid="link-recurrings"
            >
              Recurrings <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcoming.map(item => {
              const date = new Date(item.nextDate);
              const today = new Date();
              const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const label = diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;
              return (
                <Card
                  key={item.id}
                  className="bg-card border-card-border p-3 flex-shrink-0 min-w-[140px]"
                  data-testid={`upcoming-item-${item.id}`}
                >
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className="text-sm font-semibold text-foreground truncate">{item.name}</div>
                  <div className="text-sm font-bold text-foreground mt-1">${item.amount.toFixed(2)}</div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
