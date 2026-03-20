import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

function NavLink({ children, to = "#" }) {
  return (
    <Link
      to={to}
      className="text-base font-sans font-bold text-slate-600 transition hover:text-slate-950"
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
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div
        className={[
          "mx-auto flex max-w-[650px] items-center justify-between gap-6 rounded-full px-5 py-2 sm:px-3 sm:pl-5",
          "transition-all duration-300 ease-out",
          isScrolled
            ? "translate-y-0 border border-[#f2f2f2] bg-[#f2f2f2]/70 shadow-[0_22px_55px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl"
            : "border border-[#f2f2f2] bg-[#f2f2f2]/70 shadow-lg backdrop-blur",
        ].join(" ")}
      >
        <Link to="/" className="flex items-center gap-3 text-slate-950">
          <img
            src={logo}
            alt="Testimonial"
            className={[
              "transition-all duration-300 ease-out",
              isScrolled ? "w-[92px]" : "w-[100px]",
            ].join(" ")}
          />
        </Link>

        <div className="flex items-center justify-center gap-6">
          <nav className="hidden items-center gap-10 lg:flex">
            <NavLink
              className="font-bold tracking-wide"
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
              "inline-flex items-center justify-center rounded-full bg-black px-6 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900 sm:px-10",
              isScrolled ? "h-11" : "h-12",
            ].join(" ")}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}
