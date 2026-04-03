import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Ellipsis,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Power,
  Settings,
  X,
} from "lucide-react";
import logo from "../assets/logo2.svg";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import Footer from "./Footer";
import userIcon from "../assets/user.png";

const navigation = [
  {
    to: "/dashboard",
    label: "Dashboard",
    description: "Overview and insights",
    icon: LayoutDashboard,
  },
  {
    to: "/testimonials",
    label: "Testimonials",
    description: "Review and moderate",
    icon: MessagesSquare,
  },
];

const pageMeta = {
  "/dashboard": {
    eyebrow: "Workspace overview",
    title: "Dashboard",
    description:
      "Track testimonial health, key trends, and the latest activity from one overview page.",
  },
  "/testimonials": {
    eyebrow: "Content management",
    title: "Testimonials",
    description:
      "Review, approve, hide, and organize customer feedback in a dedicated moderation view.",
  },
  "/send-request": {
    eyebrow: "Collection tools",
    title: "Requests",
    description:
      "Launch new collection requests and add feedback manually from one focused page.",
  },
};

function SidebarContent({ onNavigate }) {
  const { business, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Logo Header */}
      <div className="border-b border-white/10 px-5 py-4 bg-[#415a77]/80 flex items-center justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-[1.35rem] px-1 py-1"
            onClick={onNavigate}
          >
            <img
              src={logo}
              alt="Woice"
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-xs px-5 font-semibold uppercase tracking-[0.28em] text-slate-400">
            Woice
          </p>
        </div>
        <Ellipsis className="text-white/50" />
      </div>

      <div className="flex items-center justify-center">
        <hr className="border-white/20 w-[100px] py-4" />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 px-3 py-3 transition",
                    isActive
                      ? "border-2 border-y-0 border-l-0 !border-r-yellow-500 text-white bg-slate-900"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
                        isActive
                          ? "border-slate-200 bg-slate-100 text-slate-950"
                          : "border-white/10 bg-white/5 text-slate-200",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "truncate text-xs",
                          isActive ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition",
                        isActive
                          ? "text-slate-400"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Business Card */}
      <div className="px-3 pt-5 py-2">
        <div className="rounded border border-white/10 bg-white/5 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Business
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Settings size={20} className="mt-0.5" />
            <p className="text-base font-bold text-slate-200 tracking-wide truncate max-w-[200px]">
              {business?.businessName || "Your Business"}
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-white/10 px-5 py-5">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-lg"
          onClick={logout}
        >
          <Power className="h-4 w-4" color="red" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// ── Mobile bottom tab bar ──────────────────────────────────────────────────────
function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-stretch border-t border-white/10 bg-slate-950 lg:hidden">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-yellow-400"
                  : "text-slate-400 hover:text-slate-200",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110",
                  )}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────────
export default function AppShell() {
  const location = useLocation();
  const { business, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = useMemo(
    () =>
      pageMeta[location.pathname] || {
        eyebrow: "Workspace",
        title: "Woice",
        description: "Manage your testimonials and collection workflow.",
      },
    [location.pathname],
  );
  const profileName = user?.name || "Workspace owner";
  const profileInitials =
    profileName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "W";

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="hidden h-screen w-[308px] shrink-0 border-r border-white/10 bg-slate-950 lg:sticky lg:top-0 lg:block lg:overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Content area — pb-16 reserves space for the mobile tab bar */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-16 lg:pb-0">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b shadow-lg py-5 border-black/[0.06] bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              {/* Left — hamburger + page title */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-[1.1rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-xl">
                    {meta.title}
                  </h1>
                  <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:block">
                    {meta.eyebrow}
                  </p>
                </div>
              </div>

              {/* Right — profile pill */}
              <div className="hidden items-center gap-2.5 sm:flex">
                {/* Avatar with status dot */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-500 text-xs font-bold tracking-wide text-white ring-2 ring-white ring-offset-1 ring-offset-transparent">
                  {/* {profileInitials} */}
                  <img src={userIcon} alt="" className="h-9 w-9" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                {/* Name + workspace */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                    {profileName}
                  </p>
                  <p className="truncate text-[11px] leading-tight text-slate-400">
                    {business?.businessName || "Woice workspace"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <Footer className="mt-auto" />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />

      {/* Mobile drawer (hamburger-triggered full sidebar) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer panel — slides in from left */}
          <div className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[320px] flex-col border-r border-white/10 bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-end px-4 py-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
