import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo2.svg";

function NavLink({ children, to = "#" }) {
  return (
    <Link
      to={to}
      className="text-base font-sans font-bold text-slate-500 transition tracking-wider hover:text-slate-950"
    >
      {children}
    </Link>
  );
}

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6">
      <div
        className={[
          "mx-auto flex max-w-[650px] items-center justify-between gap-2 rounded-full px-3 py-1.5 sm:gap-6 sm:px-3 sm:py-2 sm:pl-5",
          "transition-all duration-300 ease-out",
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
              isScrolled ? "w-[62px] sm:w-[92px]" : "w-[66px] sm:w-[95px]",
            ].join(" ")}
          />
        </Link>

        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <nav className="hidden items-center gap-10 lg:flex text-slate-600">
            <NavLink
              className="font-bold tracking-wide "
              style={{ fontFamily: "'saans', 'saans Fallback', sans-serif" }}
            >
              Pricing
            </NavLink>
            <NavLink
              className="font-bold"
              style={{ fontFamily: "'saans', 'saans Fallback', sans-serif" }}
            >
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
            to="/register"
            className={[
              "inline-flex items-center justify-center rounded-full bg-red-500 px-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 sm:px-10 sm:text-base",
              isScrolled ? "h-8 sm:h-11" : "h-9 sm:h-12",
            ].join(" ")}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}
