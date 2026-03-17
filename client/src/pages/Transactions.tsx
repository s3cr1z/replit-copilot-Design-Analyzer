import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Plus, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryBadge } from "@/components/CategoryBadge";
import { apiRequest } from "@/lib/queryClient";
import { showMutationErrorToast } from "@/lib/showMutationErrorToast";
import { useToast } from "@/hooks/use-toast";
import { ErrorPanel, STANDARD_ERROR_COPY } from "@/components/ErrorPanel";
import { CATEGORIES } from "@shared/schema";
import type { Transaction } from "@shared/schema";

const newTxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Must be positive"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  accountId: z.string().default("acc1"),
  isIncome: z.boolean().default(false),
  isReviewed: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  notes: z.string().nullable().default(null),
});

type NewTxForm = z.infer<typeof newTxSchema>;

function groupByDate(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    const d = tx.date;
    if (!groups[d]) groups[d] = [];
    groups[d].push(tx);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

export default function Transactions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data: transactions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const form = useForm<NewTxForm>({
    resolver: zodResolver(newTxSchema),
    defaultValues: {
      name: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "Food & Drink",
      accountId: "acc1",
      isIncome: false,
      isReviewed: false,
      isRecurring: false,
      notes: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: NewTxForm) => apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transactions"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowAdd(false);
      form.reset();
      toast({ description: "Transaction added" });
    },
    onError: (error: unknown) => {
      showMutationErrorToast({
        toast,
        actionLabel: "add this transaction",
        error,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transactions"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ description: "Transaction deleted" });
    },
    onError: (error: unknown) => {
      showMutationErrorToast({
        toast,
        actionLabel: "delete this transaction",
        error,
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/transactions/${id}`, { isReviewed: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: unknown) => {
      showMutationErrorToast({
        toast,
        actionLabel: "mark this transaction as reviewed",
        error,
      });
    },
  });

  const filtered = (transactions ?? []).filter(tx => {
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || tx.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const grouped = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Search */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-card-border text-foreground placeholder:text-muted-foreground"
            data-testid="input-search-transactions"
          />
        </div>
        <Button
          size="icon"
          variant="secondary"
          data-testid="button-filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 border transition-colors ${
            !selectedCategory
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-card-border text-muted-foreground"
          }`}
          data-testid="filter-all"
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 border transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-card-border text-muted-foreground"
            }`}
            data-testid={`filter-${cat.toLowerCase().replace(/\s/g, "-")}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add New Transaction */}
      <Button
        variant="secondary"
        className="w-full border border-dashed border-border text-muted-foreground tracking-widest text-xs uppercase font-semibold"
        onClick={() => setShowAdd(true)}
        data-testid="button-add-transaction"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add a New Transaction
      </Button>

      {/* Transaction List */}
      {isError ? (
        <ErrorPanel
          message={STANDARD_ERROR_COPY.query}
          technicalDetail={error instanceof Error ? error.message : undefined}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Card className="bg-card border-card-border">
                {[1,2].map(j => (
                  <div key={j} className="px-4 py-3 flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No transactions found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">
                {formatDateLabel(date)}
              </div>
              <Card className="bg-card border-card-border divide-y divide-border">
                {txs.map(tx => (
                  <div
                    key={tx.id}
                    className="px-4 py-3 group"
                    data-testid={`transaction-row-${tx.id}`}
                  >
                    <div className="flex items-center gap-2">
                      {tx.isRecurring && (
                        <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                          <RotateCcw className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground flex-1 truncate">{tx.name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!tx.isReviewed && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                            1
                          </div>
                        )}
                        <CategoryBadge category={tx.category} />
                        <span className={`text-sm font-semibold ${tx.isIncome ? "text-green-400" : "text-foreground"}`}>
                          {tx.isIncome ? "+" : ""}${tx.amount.toFixed(2)}
                        </span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.isReviewed ? "bg-muted-foreground" : "bg-primary"}`} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100 transition-opacity">
                      {!tx.isReviewed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-primary h-11 [@media(hover:hover)_and_(pointer:fine)]:h-7 px-3"
                          onClick={() => reviewMutation.mutate(tx.id)}
                          data-testid={`button-review-${tx.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Review
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive h-11 [@media(hover:hover)_and_(pointer:fine)]:h-7 px-3"
                        onClick={() => deleteMutation.mutate(tx.id)}
                        data-testid={`button-delete-${tx.id}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-card-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Starbucks" className="bg-background border-border" data-testid="input-tx-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" placeholder="0.00" className="bg-background border-border" data-testid="input-tx-amount" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="bg-background border-border" data-testid="input-tx-date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background border-border" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-popover-border">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isIncome" render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded accent-primary"
                      data-testid="checkbox-is-income"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground !mt-0">This is income</FormLabel>
                </FormItem>
              )} />
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
                data-testid="button-submit-transaction"
              >
                {createMutation.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
