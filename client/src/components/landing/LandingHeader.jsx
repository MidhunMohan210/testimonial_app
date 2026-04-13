  import { useEffect, useRef, useState } from "react";
  import { Link } from "react-router-dom";
  import logo from "../../assets/logo2.svg";

  function NavLink({ children, to = "#", className = "", style }) {
    return (
      <Link
        to={to}
        className={[
          "text-base font-sans font-bold text-slate-500 transition tracking-wider hover:text-slate-950",
          className,
        ].join(" ")}
        style={style}
      >
        {children}
      </Link>
    );
  }

  export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const lastScrollYRef = useRef(0);
    const collapsedRef = useRef(false);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 12);

        const scrollBottom = currentScrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;
        setIsNearBottom(scrollBottom >= pageHeight - 140);

        let nextCollapsed = collapsedRef.current;
        if (currentScrollY <= 24) {
          nextCollapsed = false;
        } else if (currentScrollY > lastScrollYRef.current + 6) {
          nextCollapsed = true;
        } else if (currentScrollY < lastScrollYRef.current - 6) {
          nextCollapsed = false;
        }

        if (nextCollapsed !== collapsedRef.current) {
          collapsedRef.current = nextCollapsed;
          setIsCollapsed(nextCollapsed);
        }

        lastScrollYRef.current = currentScrollY;
      };

      lastScrollYRef.current = window.scrollY;
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, []);

    return (
      <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6">
        <div
          className={[
            "mx-auto flex items-center justify-between gap-2 rounded-full py-1",
            isCollapsed
              ? "max-w-[420px] px-3 sm:max-w-[500px] sm:px-4"
              : "max-w-[650px] px-3 sm:px-3 sm:pl-5",
            "transition-[max-width,padding,transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isNearBottom ? "landing-navbar-bottom-reveal" : "",
            isScrolled
              ? "translate-y-0 border border-[#f2f2f2] bg-[#f2f2f2]/70 shadow-[0_22px_55px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl"
              : "border border-[#f2f2f2] bg-[#f2f2f2]/70 shadow-lg backdrop-blur",
          ].join(" ")}
        >
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3 text-slate-950">
            <img
              src={logo}
              alt="Woice"
              className={[
                "transition-all duration-300 ease-out",
                isScrolled || isCollapsed ? "w-[62px] sm:w-[92px]" : "w-[66px] sm:w-[95px]",
              ].join(" ")}
            />
          </Link>

          <div className={["flex items-center justify-center transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", isCollapsed ? "gap-2 sm:gap-3" : "gap-3 sm:gap-6"].join(" ")}>
            <nav
              className={[
                "hidden lg:flex items-center gap-10 text-slate-600 overflow-hidden whitespace-nowrap",
                "transition-[max-width,opacity,transform] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isCollapsed
                  ? "max-w-0 -translate-x-1 opacity-0 pointer-events-none"
                  : "max-w-[420px] translate-x-0 opacity-100",
              ].join(" ")}
            >
              <NavLink className="font-bold tracking-wide " style={{ fontFamily: "'saans', 'saans Fallback', sans-serif" }}>
                Pricing
              </NavLink>
              <NavLink className="font-bold" style={{ fontFamily: "'saans', 'saans Fallback', sans-serif" }}>
                Blog
              </NavLink>
              <NavLink
                to="/login"
                className="font-bold"
                style={{ fontFamily: "'saans', 'saans Fallback', sans-serif" }}
              >
                Log in
              </NavLink>
            </nav>

            <Link
              to="/login"
              className={[
                "inline-flex lg:hidden items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-slate-200 text-xs font-semibold text-slate-700 sm:text-sm",
                "transition-[max-width,opacity,padding,transform] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-slate-300",
                isCollapsed
                  ? "h-8 max-w-[108px] px-4 opacity-100 sm:h-11"
                  : "h-8 max-w-0 px-0 opacity-0 pointer-events-none sm:h-11",
              ].join(" ")}
            >
              Log in
            </Link>

            <Link
              to="/login"
              className={[
                "hidden lg:inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-slate-200 text-sm font-semibold text-slate-700",
                "transition-[max-width,opacity,padding,transform] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-slate-300",
                isCollapsed
                  ? "h-10 max-w-[124px] px-5 opacity-100"
                  : "h-10 max-w-0 px-0 opacity-0 pointer-events-none",
              ].join(" ")}
            >
              Log in
            </Link>

            <Link
              to="/register"
              className={[
                "inline-flex items-center justify-center rounded-full bg-red-500 px-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 sm:px-10 sm:text-base",
                isScrolled || isCollapsed ? "h-8 sm:h-11" : "h-9 sm:h-12",
              ].join(" ")}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>
    );
  }
