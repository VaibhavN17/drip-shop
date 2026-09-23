import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Tags, Landmark, FileText, Receipt,
  Wallet, BarChart3, UserCog, Settings as SettingsIcon, LogOut, Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app",                 icon: LayoutDashboard, label: "dashboard"      as const, end: true },
  { to: "/app/customers",       icon: Users,           label: "customers"      as const },
  { to: "/app/products",        icon: Package,         label: "products"       as const },
  { to: "/app/categories",      icon: Tags,            label: "categories"     as const },
  { to: "/app/government-rates",icon: Landmark,        label: "governmentRates"as const },
  { to: "/app/quotations",      icon: FileText,        label: "quotations"     as const },
  { to: "/app/invoices",        icon: Receipt,         label: "invoices"       as const },
  { to: "/app/payments",        icon: Wallet,          label: "payments"       as const },
  { to: "/app/reports",         icon: BarChart3,       label: "reports"        as const },
  { to: "/app/users",           icon: UserCog,         label: "users"          as const },
  { to: "/app/settings",        icon: SettingsIcon,    label: "settings"       as const },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 border-r border-border bg-card transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4 font-bold text-primary">
          {t("appName")}
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )
              }
            >
              <item.icon size={16} />
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen((v) => !v)}>
            <Menu size={18} />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-border text-xs">
              <button
                className={cn("px-2 py-1", lang === "en" ? "bg-primary text-primary-foreground" : "bg-background")}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                className={cn("px-2 py-1", lang === "mr" ? "bg-primary text-primary-foreground" : "bg-background")}
                onClick={() => setLang("mr")}
              >
                मराठी
              </button>
            </div>
            <span className="text-sm text-muted-foreground">{user?.fullName} ({user?.role})</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> {t("logout")}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
