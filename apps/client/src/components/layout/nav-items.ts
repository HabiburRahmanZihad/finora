import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Landmark,
  FileText,
  BarChart3,
  RefreshCw,
  Repeat,
  HandCoins,
  Lightbulb,
  Trophy,
  Bell,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// §48 Final Product Structure — main navigation, in spec order.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Income", href: "/income", icon: TrendingUp },
  { label: "Expenses", href: "/expenses", icon: TrendingDown },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Saving Goals", href: "/goals", icon: Target },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "Loans", href: "/loans", icon: HandCoins },
  { label: "Insights", href: "/insights", icon: Lightbulb },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];
