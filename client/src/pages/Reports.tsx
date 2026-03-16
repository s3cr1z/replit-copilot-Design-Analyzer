import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Settings2 } from "lucide-react";
import { ErrorPanel, STANDARD_ERROR_COPY } from "@/components/ErrorPanel";
import type { Account, Investment } from "@shared/schema";

type TimeRange = "4W" | "3M" | "1Y" | "MTD" | "YTD";
type ReportTab = "cashflow" | "accounts" | "investments";

const INCOME_DATA: Record<TimeRange, { month: string; value: number }[]> = {
  YTD: [
    { month: "Jan", value: 4120 }, { month: "Feb", value: 4120 }, { month: "Mar", value: 4120 },
    { month: "Apr", value: 4120 }, { month: "May", value: 4120 }, { month: "Jun", value: 4120 },
    { month: "Jul", value: 4120 }, { month: "Aug", value: 4120 }, { month: "Sep", value: 820 },
    { month: "Oct", value: 0 }, { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
  ],
  MTD: [{ month: "Sep 1", value: 4120 }, { month: "Sep 6", value: 0 }],
  "1Y": [
    { month: "Oct", value: 3800 }, { month: "Nov", value: 4100 }, { month: "Dec", value: 4200 },
    { month: "Jan", value: 4120 }, { month: "Feb", value: 4120 }, { month: "Mar", value: 4120 },
    { month: "Apr", value: 4120 }, { month: "May", value: 4120 }, { month: "Jun", value: 4120 },
    { month: "Jul", value: 4120 }, { month: "Aug", value: 4120 }, { month: "Sep", value: 820 },
  ],
  "3M": [
    { month: "Jul", value: 4120 }, { month: "Aug", value: 4120 }, { month: "Sep", value: 820 },
  ],
  "4W": [
    { month: "Aug 10", value: 1030 }, { month: "Aug 17", value: 1030 },
    { month: "Aug 24", value: 1030 }, { month: "Aug 31", value: 1030 },
    { month: "Sep 6", value: 820 },
  ],
};

const SPEND_DATA: Record<TimeRange, { month: string; food: number; trans: number; shop: number; other: number }[]> = {
  YTD: [
    { month: "Jan", food: 680, trans: 210, shop: 380, other: 240 },
    { month: "Feb", food: 720, trans: 180, shop: 420, other: 210 },
    { month: "Mar", food: 650, trans: 230, shop: 350, other: 290 },
    { month: "Apr", food: 700, trans: 195, shop: 410, other: 260 },
    { month: "May", food: 680, trans: 220, shop: 390, other: 280 },
    { month: "Jun", food: 760, trans: 205, shop: 440, other: 220 },
    { month: "Jul", food: 710, trans: 215, shop: 370, other: 300 },
    { month: "Aug", food: 690, trans: 200, shop: 400, other: 250 },
    { month: "Sep", food: 124, trans: 67, shop: 156, other: 30 },
    { month: "Oct", food: 0, trans: 0, shop: 0, other: 0 },
    { month: "Nov", food: 0, trans: 0, shop: 0, other: 0 },
    { month: "Dec", food: 0, trans: 0, shop: 0, other: 0 },
  ],
  MTD: [
    { month: "Sep 1-6", food: 124, trans: 67, shop: 156, other: 30 },
  ],
  "1Y": [
    { month: "Oct", food: 650, trans: 190, shop: 340, other: 220 },
    { month: "Nov", food: 720, trans: 210, shop: 390, other: 260 },
    { month: "Dec", food: 810, trans: 195, shop: 480, other: 290 },
    { month: "Jan", food: 680, trans: 210, shop: 380, other: 240 },
    { month: "Feb", food: 720, trans: 180, shop: 420, other: 210 },
    { month: "Mar", food: 650, trans: 230, shop: 350, other: 290 },
    { month: "Apr", food: 700, trans: 195, shop: 410, other: 260 },
    { month: "May", food: 680, trans: 220, shop: 390, other: 280 },
    { month: "Jun", food: 760, trans: 205, shop: 440, other: 220 },
    { month: "Jul", food: 710, trans: 215, shop: 370, other: 300 },
    { month: "Aug", food: 690, trans: 200, shop: 400, other: 250 },
    { month: "Sep", food: 124, trans: 67, shop: 156, other: 30 },
  ],
  "3M": [
    { month: "Jul", food: 710, trans: 215, shop: 370, other: 300 },
    { month: "Aug", food: 690, trans: 200, shop: 400, other: 250 },
    { month: "Sep", food: 124, trans: 67, shop: 156, other: 30 },
  ],
  "4W": [
    { month: "Aug 10", food: 172, trans: 50, shop: 100, other: 62 },
    { month: "Aug 17", food: 175, trans: 55, shop: 105, other: 60 },
    { month: "Aug 24", food: 170, trans: 48, shop: 98, other: 65 },
    { month: "Aug 31", food: 173, trans: 47, shop: 97, other: 63 },
    { month: "Sep 6", food: 124, trans: 67, shop: 156, other: 30 },
  ],
};

const INVESTMENT_HISTORY = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  value: 7600 + Math.sin(i * 0.3) * 200 + i * 16 + Math.random() * 80,
}));

const ACCOUNT_HISTORY = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  assets: 44000 + i * 100 + Math.random() * 200,
  debt: 12200 - i * 15 + Math.random() * 100,
}));

type InvestmentTimeRange = "1W" | "1M" | "3M" | "YTD" | "1Y";

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>("cashflow");
  const [timeRange, setTimeRange] = useState<TimeRange>("YTD");
  const [invRange, setInvRange] = useState<InvestmentTimeRange>("1M");

  const {
    data: accounts,
    isLoading: accLoading,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const {
    data: investments,
    isLoading: invLoading,
    isError: isInvestmentsError,
    error: investmentsError,
    refetch: refetchInvestments,
  } = useQuery<Investment[]>({ queryKey: ["/api/investments"] });

  const totalAssets = (accounts ?? []).filter(a => a.type === "depository").reduce((s, a) => s + a.balance, 0);
  const totalDebt = (accounts ?? []).filter(a => a.type === "credit").reduce((s, a) => s + a.balance, 0);
  const totalInvested = (investments ?? []).reduce((s, i) => s + i.value, 0);

  const incomeData = INCOME_DATA[timeRange];
  const spendData = SPEND_DATA[timeRange];
  const totalIncome = incomeData.reduce((s, d) => s + d.value, 0);
  const totalSpend = spendData.reduce((s, d) => s + (d.food + d.trans + d.shop + d.other), 0);

  const creditCards = (accounts ?? []).filter(a => a.type === "credit");
  const depository = (accounts ?? []).filter(a => a.type === "depository");

  const TIME_RANGES: TimeRange[] = ["4W", "3M", "1Y", "MTD", "YTD"];
  const INV_RANGES: InvestmentTimeRange[] = ["1W", "1M", "3M", "YTD", "1Y"];
  const reportError = accountsError ?? investmentsError;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {isAccountsError || isInvestmentsError ? (
        <ErrorPanel
          message={STANDARD_ERROR_COPY.query}
          technicalDetail={reportError instanceof Error ? reportError.message : undefined}
          onRetry={() => {
            void refetchAccounts();
            void refetchInvestments();
          }}
        />
      ) : null}

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-secondary/40 rounded-lg p-1">
        {(["cashflow", "accounts", "investments"] as ReportTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors capitalize ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
            data-testid={`tab-${t}`}
          >
            {t === "cashflow" ? "Cash flow" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "cashflow" && (
        <div className="flex flex-col gap-4">
          {/* Net Income Chart */}
          <Card className="bg-card border-card-border p-4" data-testid="card-net-income">
            <div className="text-sm font-medium text-muted-foreground mb-1 text-center">Net income</div>
            <div className="text-xs text-muted-foreground text-center mb-2">
              Jan 1 – Sep 6, 2025
            </div>
            <div className="text-2xl font-bold text-green-400 text-center">${totalIncome.toLocaleString()}</div>
            <div className="flex justify-center mt-1 mb-4">
              <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                <TrendingUp className="w-3 h-3" /> 999%
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-center mb-3">vs $0.00 in Jan 1 – Sep 6, 2024</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData} barSize={18}>
                  <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 42% 10%)", border: "1px solid hsl(220 30% 14%)", borderRadius: 6, fontSize: 12 }}
                    labelStyle={{ color: "hsl(210 40% 98%)" }}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, "Income"]}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Spend Chart */}
          <Card className="bg-card border-card-border p-4" data-testid="card-spend">
            <div className="text-sm font-medium text-muted-foreground mb-1 text-center">Spend</div>
            <div className="text-xs text-muted-foreground text-center mb-2">Jan 1 – Sep 6, 2025</div>
            <div className="text-2xl font-bold text-foreground text-center">${totalSpend.toLocaleString()}</div>
            <div className="flex justify-center mt-1 mb-4">
              <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                <TrendingUp className="w-3 h-3" /> 999%
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-center mb-3">vs $0.00 in Jan 1 – Sep 6, 2024</div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendData} barSize={18}>
                  <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 42% 10%)", border: "1px solid hsl(220 30% 14%)", borderRadius: 6, fontSize: 12 }}
                    labelStyle={{ color: "hsl(210 40% 98%)" }}
                  />
                  <Bar dataKey="food" stackId="a" fill="#f59e0b" radius={[0,0,0,0]} name="Food & Drink" />
                  <Bar dataKey="trans" stackId="a" fill="#818cf8" name="Transportation" />
                  <Bar dataKey="shop" stackId="a" fill="#10b981" name="Shopping" />
                  <Bar dataKey="other" stackId="a" fill="#f43f5e" radius={[3,3,0,0]} name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {[
                { color: "#f59e0b", label: "Food & Drink" },
                { color: "#818cf8", label: "Transportation" },
                { color: "#10b981", label: "Shopping" },
                { color: "#f43f5e", label: "Other" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-secondary/40 rounded-lg p-1">
            {TIME_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${
                  timeRange === r
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid={`timerange-${r}`}
              >
                {r}
              </button>
            ))}
            <button className="flex items-center justify-center w-8 h-7 rounded-md text-muted-foreground">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {tab === "accounts" && (
        <div className="flex flex-col gap-4">
          {/* Assets vs Debt Summary */}
          <Card className="bg-card border-card-border p-4" data-testid="card-assets-debt">
            <div className="flex justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  <span className="text-xs text-muted-foreground">Assets</span>
                </div>
                <div className="text-xl font-bold text-foreground">${totalAssets.toLocaleString()}</div>
                <span className="flex items-center gap-0.5 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold mt-1 w-fit">
                  <TrendingUp className="w-3 h-3" /> 8.59%
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 mb-1 justify-end">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  <span className="text-xs text-muted-foreground">Debt</span>
                </div>
                <div className="text-xl font-bold text-foreground">${totalDebt.toLocaleString()}</div>
                <span className="flex items-center gap-0.5 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold mt-1 ml-auto w-fit">
                  <TrendingUp className="w-3 h-3" /> 0.12%
                </span>
              </div>
            </div>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ACCOUNT_HISTORY}>
                  <Line type="monotone" dataKey="assets" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="debt" stroke="#fb923c" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 42% 10%)", border: "1px solid hsl(220 30% 14%)", borderRadius: 6, fontSize: 12 }}
                    formatter={(val: number, name: string) => [`$${val.toLocaleString()}`, name === "assets" ? "Assets" : "Debt"]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs text-muted-foreground mt-2">
              {(["1W", "1M", "3M", "YTD", "1Y"] as InvestmentTimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setInvRange(r)}
                  className={`px-2 py-1 rounded-md ${invRange === r ? "bg-secondary text-foreground font-semibold" : ""}`}
                  data-testid={`acc-range-${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>

          {/* Credit Cards */}
          {accLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Credit cards</span>
                    <span className="text-sm text-muted-foreground">${totalDebt.toLocaleString()}</span>
                  </div>
                  <button className="text-xs text-primary">Add &rsaquo;</button>
                </div>
                <div className="space-y-3">
                  {creditCards.map(acc => (
                    <div key={acc.id} className="flex items-center gap-3" data-testid={`account-card-${acc.id}`}>
                      <div
                        className="rounded-md p-2 w-28 h-16 flex flex-col justify-between flex-shrink-0"
                        style={{ background: acc.color }}
                      >
                        <span className="text-white text-xs font-bold">{acc.institution}</span>
                        <span className="text-white/70 text-xs">{acc.name} {acc.lastFour}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Balance</div>
                          <div className="text-sm font-bold text-foreground">${acc.balance.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Utilized</div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-foreground">{acc.utilized?.toFixed(2)}%</span>
                            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Depository */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Depository</span>
                    <span className="text-sm text-muted-foreground">${totalAssets.toLocaleString()}</span>
                  </div>
                  <button className="text-xs text-primary">Add &rsaquo;</button>
                </div>
                <div className="space-y-3">
                  {depository.map(acc => (
                    <div key={acc.id} className="flex items-center gap-3" data-testid={`account-dep-${acc.id}`}>
                      <div
                        className="rounded-md p-2 w-28 h-16 flex flex-col justify-between flex-shrink-0"
                        style={{ background: acc.color }}
                      >
                        <span className="text-white text-xs font-bold">{acc.institution}</span>
                        <span className="text-white/70 text-xs">{acc.name} {acc.lastFour}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Available</div>
                          <div className="text-sm font-bold text-foreground">${acc.available?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Change</div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-green-400">{acc.change?.toFixed(2)}%</span>
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "investments" && (
        <div className="flex flex-col gap-4">
          {/* Portfolio Summary */}
          <Card className="bg-card border-card-border p-4" data-testid="card-investments">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="flex items-center gap-0.5 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                    <TrendingUp className="w-3 h-3" /> 1.16%
                  </span>
                </div>
                <div className="text-3xl font-bold text-foreground">${totalInvested.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-0.5">total balance</div>
              </div>
              <button className="text-muted-foreground">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
            <div className="h-28 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={INVESTMENT_HISTORY}>
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 42% 10%)", border: "1px solid hsl(220 30% 14%)", borderRadius: 6, fontSize: 12 }}
                    formatter={(val: number) => [`$${val.toFixed(0)}`, "Value"]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs text-muted-foreground mt-2">
              {INV_RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setInvRange(r)}
                  className={`px-2 py-1 rounded-md ${invRange === r ? "bg-secondary text-foreground font-semibold" : ""}`}
                  data-testid={`inv-range-${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Card>

          {/* Top Movers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Your top movers today</span>
              <span className="text-xs text-muted-foreground">Last price</span>
            </div>
            {invLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(investments ?? []).slice(0, 4).map((inv, idx) => {
                  const isPos = inv.changePercent >= 0;
                  const miniData = Array.from({ length: 10 }, (_, i) => ({
                    i,
                    v: inv.value + (Math.sin(i * 0.8 + idx) * inv.value * 0.015) + (isPos ? i * inv.value * 0.003 : -i * inv.value * 0.001),
                  }));
                  return (
                    <Card
                      key={inv.id}
                      className="bg-card border-card-border p-3"
                      data-testid={`investment-card-${inv.id}`}
                    >
                      <div className="text-sm font-bold text-foreground">{inv.ticker}</div>
                      <div className="text-xs text-muted-foreground truncate mb-2">{inv.name}</div>
                      <div className="h-10 mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={miniData}>
                            <Line type="monotone" dataKey="v" stroke={isPos ? "#22c55e" : "#ef4444"} strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <span className={`flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-semibold w-fit ${
                        isPos ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? "+" : ""}{inv.changePercent.toFixed(2)}%
                      </span>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Investments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Accounts</span>
              <span className="text-xs text-muted-foreground">1M Balance Change</span>
            </div>
            <Card className="bg-card border-card-border divide-y divide-border">
              {(investments ?? []).map(inv => {
                const isPos = inv.changePercent >= 0;
                return (
                  <div key={inv.id} className="px-4 py-3 flex items-center justify-between" data-testid={`inv-row-${inv.id}`}>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{inv.ticker}</div>
                      <div className="text-xs text-muted-foreground">{inv.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">${inv.value.toLocaleString()}</div>
                      <span className={`text-xs font-semibold ${isPos ? "text-green-400" : "text-red-400"}`}>
                        {isPos ? "+" : ""}{inv.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
