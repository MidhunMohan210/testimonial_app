import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import logo from "../../assets/two.svg";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const navigation = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/businesses",
    label: "Businesses",
    icon: Building2,
  },
];

const pageMeta = {
  "/admin": {
    title: "Admin overview",
    eyebrow: "Woice internal",
  },
  "/admin/businesses": {
    title: "Businesses",
    eyebrow: "Account management",
  },
};

function AdminNav({ onNavigate }) {
  return (
    <nav className="mt-8 space-y-1 px-3">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/8 hover:text-white",
              )
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-inherit group-[.active]:bg-white">
              <Icon className="h-4 w-4" />
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function Sidebar({ onNavigate }) {
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-[84px] items-center justify-between border-b border-white/10 px-5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2"
          onClick={onNavigate}
        >
          <img src={logo} alt="Woice" className="h-5 w-auto brightness-125" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-100">
            Woice
          </span>
        </Link>
        <ShieldCheck className="h-5 w-5 text-emerald-300" />
      </div>

      <AdminNav onNavigate={onNavigate} />

      <div className="mt-auto border-t border-white/10 p-5">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 text-red-400" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = useMemo(() => {
    if (location.pathname.startsWith("/admin/businesses/")) {
      return {
        title: "Business details",
        eyebrow: "Account inspection",
      };
    }

    return (
      pageMeta[location.pathname] || {
        title: "Admin",
        eyebrow: "Woice internal",
      }
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-950">
      <div className="mx-auto flex min-h-screen">
        <aside className="hidden h-screen w-[280px] shrink-0 overflow-y-auto lg:sticky lg:top-0 lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-600 hover:bg-slate-100 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open admin navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:block">
                    {meta.eyebrow}
                  </p>
                  <h1 className="truncate text-base font-bold text-slate-950 sm:text-xl">
                    {meta.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  Internal admin
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-right text-sm font-semibold text-slate-900">
                    {user?.name || "Woice admin"}
                  </p>
                  <p className="truncate text-right text-xs text-slate-400">
                    {user?.email || "Admin"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  onClick={logout}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden">
          <div className="h-full w-full max-w-[320px] shadow-2xl">
            <div className="relative h-full">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 rounded-full text-white hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin navigation"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
