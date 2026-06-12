import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Ellipsis,
  LayoutDashboard,
  Menu,
  MessageSquareWarning,
  MessagesSquare,
  Power,
  Settings,
  X,
} from "lucide-react";
import logo from "../assets/two.svg";
import { useAuth } from "../hooks/useAuth";
import { getUnreadPrivateFeedbackCount } from "../api/businessApi";
import { getUnreadTestimonialCount } from "../api/testimonialApi";
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
  {
    to: "/private-feedback",
    label: "Private Feedback",
    description: "Low-rated feedback",
    icon: MessageSquareWarning,
  },
  {
    to: "/docs",
    label: "Docs",
    description: "Embed and integration",
    icon: BookOpen,
  },
  {
    to: "/settings",
    label: "Settings",
    description: "Business preferences",
    icon: Settings,
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
  "/private-feedback": {
    eyebrow: "Customer support",
    title: "Private Feedback",
    description:
      "Track low-rated private feedback in one focused queue and follow up quickly.",
  },
  "/send-request": {
    eyebrow: "Collection tools",
    title: "Requests",
    description:
      "Launch new collection requests and add feedback manually from one focused page.",
  },
  "/docs": {
    eyebrow: "Developer documentation",
    title: "Docs",
    description:
      "Copy production-ready embed snippets and implementation guides for every platform.",
  },
  "/settings": {
    eyebrow: "Business configuration",
    title: "Settings",
    description:
      "Manage your business profile, public page controls, and notification preferences.",
  },
};

const formatUnreadCount = (count) => (count > 9 ? "9+" : String(count));

function SidebarContent({
  onNavigate,
  unreadCounts = { testimonials: 0, privateFeedback: 0 },
}) {
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Logo Header */}
      <div className="border-b border-white/10 px-5 h-[84px] bg-[#415a77]/80 flex items-center justify-between">
        <div>

          <div className="flex items-center gap-1">

       
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-[1.35rem] px-1 py-1"
            onClick={onNavigate}
          >
            
            <img
              src={logo}
              alt="Woice"
              className="h-5 w-auto brightness-125"
            />
          </Link>
          <p className="text-xs  font-semibold uppercase tracking-[0.28em] text-slate-100">
            Woice
          </p>
        </div>
           </div>
        <Ellipsis className="text-white/50" />
      </div>

      {/* <div className="flex items-center justify-center">
        <hr className="border-white/20 w-[100px] py-4" />
      </div> */}

      {/* Nav Links */}
      <nav className="flex-1 px-3 pb-4 mt-10">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const unreadCount =
              item.to === "/testimonials"
                ? unreadCounts.testimonials
                : item.to === "/private-feedback"
                  ? unreadCounts.privateFeedback
                  : 0;
            const hasUnread = unreadCount > 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-2.5 px-3 py-2.5 transition",
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
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition sm:h-11 sm:w-11",
                        isActive
                          ? "border-slate-200 bg-slate-100 text-slate-950"
                          : "border-white/10 bg-white/5 text-slate-200",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold sm:text-sm">
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
                    <div className="flex shrink-0 items-center gap-2">
                      {hasUnread && (
                        <span
                          className={cn(
                            "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.to === "/private-feedback"
                              ? "border border-amber-200 bg-amber-100 text-amber-800"
                              : "border border-slate-500/40 bg-slate-700/70 text-slate-100",
                          )}
                        >
                          {formatUnreadCount(unreadCount)}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 transition sm:h-4 sm:w-4",
                          isActive
                            ? "text-slate-400"
                            : "text-slate-500 group-hover:text-slate-300",
                        )}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

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

function MobileMenuContent({
  onClose,
  unreadCounts = { testimonials: 0, privateFeedback: 0 },
}) {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 animate-[mobile-menu-panel-in_340ms_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="flex items-center justify-between px-5 pb-4 pt-5 [animation:mobile-menu-item-in_420ms_cubic-bezier(0.16,1,0.3,1)_80ms_both]">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full text-slate-950"
          onClick={onClose}
        >
          <img src={logo} alt="Woice" className="h-5 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Woice
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-950"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const unreadCount =
              item.to === "/testimonials"
                ? unreadCounts.testimonials
                : item.to === "/private-feedback"
                  ? unreadCounts.privateFeedback
                  : 0;
            const hasUnread = unreadCount > 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 text-[1.1rem] font-medium tracking-tight transition",
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-900 hover:bg-slate-50",
                  )
                }
                style={{
                  animation: `mobile-menu-item-in 420ms cubic-bezier(0.16, 1, 0.3, 1) ${120 + index * 36}ms both`,
                }}
              >
                <span>{item.label}</span>
                {hasUnread ? (
                  <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    {formatUnreadCount(unreadCount)}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-6 py-5">
        <Button
          variant="outline"
          className="w-full justify-center gap-2 rounded-2xl border-slate-200 bg-white text-slate-900 hover:bg-slate-50 [animation:mobile-menu-item-in_420ms_cubic-bezier(0.16,1,0.3,1)_360ms_both]"
          onClick={() => {
            onClose();
            logout();
          }}
        >
          <Power className="h-4 w-4 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// ── Main shell ─────────────────────────────────────────────────────────────────
export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { business, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const testimonialsUnreadQuery = useQuery({
    queryKey: ["unread-count", "testimonials"],
    queryFn: getUnreadTestimonialCount,
  });
  const privateFeedbackUnreadQuery = useQuery({
    queryKey: ["unread-count", "private-feedback"],
    queryFn: getUnreadPrivateFeedbackCount,
  });

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
  const unreadCounts = {
    testimonials: testimonialsUnreadQuery.data?.unreadCount || 0,
    privateFeedback: privateFeedbackUnreadQuery.data?.unreadCount || 0,
  };
  const showBackButton = location.pathname !== "/dashboard";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-950">
      <div className="mx-auto flex min-h-screen ">
        {/* Desktop sidebar */}
        <aside className="hidden h-screen w-[308px] shrink-0 border-r border-white/10 bg-slate-950 lg:sticky lg:top-0 lg:block lg:overflow-y-auto">
          <SidebarContent unreadCounts={unreadCounts} />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/95 py-2 shadow-lg backdrop-blur sm:py-3">
            <div className="flex items-center justify-between gap-3 px-3 py-1.5 sm:px-6 sm:py-2 lg:px-8">
              {/* Left — hamburger + page title */}
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {showBackButton ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    onClick={handleGoBack}
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : null}
                <div className="min-w-0">
                  <h1 className="truncate text-[15px] font-bold leading-tight tracking-wide text-slate-950 sm:text-xl">
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
                  <p
                    className="max-w-[180px] truncate text-[11px] leading-tight text-slate-400 md:max-w-[220px] lg:max-w-[260px]"
                    title={business?.businessName || "Woice workspace"}
                  >
                    {business?.businessName || "Woice workspace"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 py-2 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </main>

          <Footer className="mt-auto" />
        </div>
      </div>
      {/* Mobile drawer (hamburger-triggered full sidebar) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-[sidebar-overlay-in_220ms_ease-out]">
            <MobileMenuContent
              onClose={() => setSidebarOpen(false)}
              unreadCounts={unreadCounts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
