import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  Landmark,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  UserCog,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Plus,
  Droplets,
  ShoppingCart,
  UserPlus,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "dashboard" as const, end: true },
  { to: "/admin/quotations", icon: FileText, label: "quotations" as const },
  { to: "/admin/invoices", icon: Receipt, label: "invoices" as const },
  { to: "/admin/customers", icon: Users, label: "customers" as const },
  { to: "/admin/products", icon: Package, label: "products" as const },
  { to: "/admin/categories", icon: Tags, label: "categories" as const },
  { to: "/admin/government-rates", icon: Landmark, label: "governmentRates" as const },
  { to: "/admin/payments", icon: Wallet, label: "payments" as const },
  { to: "/admin/reports", icon: BarChart3, label: "reports" as const },
  { to: "/admin/users", icon: UserCog, label: "users" as const },
  { to: "/admin/settings", icon: SettingsIcon, label: "settings" as const },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const isMarathi = lang === "mr";

  return (
    <div className="flex h-screen bg-background text-foreground antialiased select-none-touch">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop permanent, Mobile slide-in drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out md:static md:w-64 md:shadow-none md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 bg-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm font-bold">
              <Droplets size={20} className="fill-white" />
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-tight">
                शेतकरी राजा
              </div>
              <div className="text-[11px] text-emerald-300 font-medium leading-tight">
                Drip & Hardware Shop
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-white/80 hover:bg-white/10 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick action button inside sidebar */}
        <div className="p-3 border-b border-border/60">
          <Button
            size="sm"
            onClick={() => {
              setSidebarOpen(false);
              setQuickActionOpen(true);
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs justify-between gap-1 shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-300" />
              {isMarathi ? "⚡ नवीन बिल / कोटेशन" : "⚡ New Bill / Quote"}
            </span>
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon size={18} />
              <span>{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Shop contact & version info footer */}
        <div className="border-t border-border p-3 bg-muted/30 text-[11px] text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground">Shetkari Raja Hardware</div>
          <div>लख खंडSafe, Vaijapur · Mob: 8010741843</div>
          <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground/80">
            <span>v1.2 · Fast & Mobile Ready</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-15 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-3 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground h-9 w-9"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <span className="flex md:hidden h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
                <Droplets size={15} />
              </span>
              <span className="text-sm md:text-base font-bold text-foreground">
                शेतकरी राजा <span className="hidden sm:inline font-normal text-xs text-muted-foreground">| Drip Manager</span>
              </span>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switch */}
            <div className="flex overflow-hidden rounded-md border border-border text-xs bg-muted/40 p-0.5">
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold transition-colors",
                  lang === "mr" ? "bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setLang("mr")}
              >
                मराठी
              </button>
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded text-xs font-semibold transition-colors",
                  lang === "en" ? "bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setLang("en")}
              >
                ENG
              </button>
            </div>

            {/* User profile badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white uppercase">
                {user?.fullName?.charAt(0) || "U"}
              </span>
              <span className="font-medium max-w-[120px] truncate">{user?.fullName}</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                {user?.role}
              </span>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-destructive hover:bg-destructive/10 px-2 sm:px-3 h-8"
              title={t("logout")}
            >
              <LogOut size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </Button>
          </div>
        </header>

        {/* Page Content with bottom padding on mobile for bottom-nav */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (Fixed for Thumb Reach) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-md px-1 shadow-lg md:hidden">
          {/* 1. Dashboard */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-700 font-bold" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <LayoutDashboard size={19} />
            <span>{isMarathi ? "डॅशबोर्ड" : "Home"}</span>
          </NavLink>

          {/* 2. Quotations */}
          <NavLink
            to="/admin/quotations"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-700 font-bold" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <FileText size={19} />
            <span>{isMarathi ? "कोटेशन" : "Quotes"}</span>
          </NavLink>

          {/* 3. Center Elevated + / Fast Action Button */}
          <button
            type="button"
            onClick={() => setQuickActionOpen(true)}
            className="flex -mt-5 h-12 w-12 flex-col items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg active:scale-95 transition-transform"
            aria-label="Create new document"
          >
            <Plus size={24} className="stroke-[2.5]" />
          </button>

          {/* 4. Invoices */}
          <NavLink
            to="/admin/invoices"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-700 font-bold" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Receipt size={19} />
            <span>{isMarathi ? "इनव्हॉइस" : "Bills"}</span>
          </NavLink>

          {/* 5. Customers */}
          <NavLink
            to="/admin/customers"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-medium transition-colors",
                isActive ? "text-emerald-700 font-bold" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Users size={19} />
            <span>{isMarathi ? "ग्राहक" : "Farmers"}</span>
          </NavLink>
        </nav>
      </div>

      {/* Quick Action Modal for Rapid Shop Work */}
      <Dialog open={quickActionOpen} onOpenChange={setQuickActionOpen}>
        <DialogContent className="max-w-md p-4 sm:p-6">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
              <Sparkles size={18} className="text-emerald-700" />
              {isMarathi ? "त्वरित काम निवडा (Quick Action)" : "Select Quick Action"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-2.5 pt-2">
            <Link
              to="/admin/invoices/new-mini-sprinkler"
              onClick={() => setQuickActionOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 transition-colors group shadow-2xs"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold group-hover:scale-105 transition-transform">
                <Droplets size={20} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  मिनी स्प्रिंकलर बिल (Tax Invoice)
                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-semibold">1-Click</span>
                </div>
                <div className="text-xs text-emerald-800/90">
                  Excel दर आणि १ एकर संच आपोआप भरलेला
                </div>
              </div>
            </Link>

            <Link
              to="/admin/quotations/new-mini-sprinkler"
              onClick={() => setQuickActionOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl border border-teal-300 bg-teal-50/80 hover:bg-teal-100 text-teal-950 transition-colors group shadow-2xs"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white font-bold group-hover:scale-105 transition-transform">
                <FileText size={20} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  मिनी स्प्रिंकलर कोटेशन (Quotation)
                  <span className="text-[10px] bg-teal-700 text-white px-1.5 py-0.2 rounded font-semibold">1-Click</span>
                </div>
                <div className="text-xs text-teal-800/90">
                  शेतकरी हिस्सा व शासकीय दरासह कोटेशन
                </div>
              </div>
            </Link>

            <Link
              to="/admin/invoices/new-regular"
              onClick={() => setQuickActionOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-950 transition-colors group shadow-2xs"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white font-bold group-hover:scale-105 transition-transform">
                <ShoppingCart size={20} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-bold">
                  रेग्युलर कॅश बिल (Regular Cash Bill)
                </div>
                <div className="text-xs text-orange-800/90">
                  काऊंटर विक्रीसाठी साधे आणि जलद बिल
                </div>
              </div>
            </Link>

            <Link
              to="/admin/customers"
              onClick={() => setQuickActionOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-slate-50 hover:bg-slate-100 text-foreground transition-colors group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold group-hover:scale-105 transition-transform">
                <UserPlus size={20} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-bold">
                  नवीन शेतकरी जोडा (Add Customer)
                </div>
                <div className="text-xs text-muted-foreground">
                  नाव, गाव, मोबाईल आणि जमिनीचा तपशील
                </div>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
