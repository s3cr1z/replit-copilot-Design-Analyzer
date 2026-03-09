import { Switch, Route, useLocation, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Settings, Bell } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Reports from "@/pages/Reports";
import Categories from "@/pages/Categories";
import Recurring from "@/pages/Recurring";
import NotFound from "@/pages/not-found";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Reports", path: "/reports" },
  { label: "Categories", path: "/categories" },
  { label: "Recurring", path: "/recurring" },
];

function TopNav() {
  const [location] = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector("[data-active=true]") as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [location]);

  return (
    <div
      ref={navRef}
      className="flex items-center gap-1 overflow-x-auto no-scrollbar px-4 py-2"
      style={{ scrollbarWidth: "none" }}
    >
      {NAV_ITEMS.map(item => {
        const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            data-active={isActive}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function Header() {
  const [notifCount] = useState(2);
  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      <button
        className="w-9 h-9 flex items-center justify-center text-muted-foreground rounded-lg hover-elevate"
        data-testid="button-settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      <h1 className="text-xl font-bold text-foreground tracking-tight">Copilot</h1>
      <div className="relative">
        <button
          className="w-9 h-9 flex items-center justify-center text-muted-foreground rounded-lg hover-elevate"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        {notifCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-xs rounded flex items-center justify-center font-bold leading-none" data-testid="badge-notifications">
            {notifCount}
          </span>
        )}
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/reports" component={Reports} />
      <Route path="/categories" component={Categories} />
      <Route path="/recurring" component={Recurring} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen">
        <Header />
        <TopNav />
        <main className="flex-1 overflow-y-auto px-4 pt-3">
          <Router />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppShell />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
