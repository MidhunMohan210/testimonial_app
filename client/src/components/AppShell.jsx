import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCirclePlus,
  MessagesSquare,
  X,
} from "lucide-react";
import logo from "../assets/logo.svg";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import Footer from "./Footer";

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
  // {
  //   to: "/send-request",
  //   label: "Requests",
  //   description: "Capture more testimonials",
  //   icon: MessageCirclePlus,
  // },
];

const pageMeta = {
  "/dashboard": {
    eyebrow: "Workspace overview",
    title: "Dashboard",
    description: "Track testimonial health, key trends, and the latest activity from one overview page.",
  },
  "/testimonials": {
    eyebrow: "Content management",
    title: "Testimonials",
    description: "Review, approve, hide, and organize customer feedback in a dedicated moderation view.",
  },
  "/send-request": {
    eyebrow: "Collection tools",
    title: "Requests",
    description: "Launch new collection requests and add feedback manually from one focused page.",
  },
};

function SidebarContent({ onNavigate }) {
  const { business, user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-[1.35rem] bg-white px-3 py-2 shadow-[0_18px_40px_-24px_rgba(255,255,255,0.65)]"
          onClick={onNavigate}
        >
          <img src={logo} alt="Woice" className="h-8 w-auto" />
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Woice
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {business?.businessName || "Your workspace"}
          </p>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Business
          </p>
          <p className="mt-2 text-base font-semibold">
            {business?.businessName || "Your Business"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {user?.name || "Workspace owner"}
          </p>
        </div>
      </div>

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
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-[0_20px_44px_-28px_rgba(255,255,255,0.55)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
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
                          : "border-white/10 bg-white/5 text-slate-200"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.label}</p>
                      <p
                        className={cn(
                          "truncate text-xs",
                          isActive ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition",
                        isActive ? "text-slate-400" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-5 py-5">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = useMemo(() => {
    return (
      pageMeta[location.pathname] || {
        eyebrow: "Workspace",
        title: "Woice",
        description: "Manage your testimonials and collection workflow.",
      }
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden h-screen w-[308px] shrink-0 border-r border-white/10 bg-slate-950 lg:sticky lg:top-0 lg:block lg:overflow-y-auto">
          <SidebarContent />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/60 bg-white/72 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/80 bg-white/80 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {meta.eyebrow}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    {meta.title}
                  </h1>
                </div>
              </div>
              <div className="hidden rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-right shadow-[0_18px_40px_-32px_rgba(15,23,42,0.4)] sm:block">
                <p className="text-sm font-semibold text-slate-900">Woice workspace</p>
                <p className="text-xs text-slate-500">Built for clean review and steady collection</p>
              </div>
            </div>
            <div className="px-4 pb-4 text-sm text-slate-500 sm:px-6 lg:px-8">
              {meta.description}
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Outlet />
          </main>
          <Footer className="mt-auto" />
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="absolute inset-y-0 left-0 w-[88vw] max-w-[320px] border-r border-white/10 bg-slate-950 shadow-2xl">
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
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
