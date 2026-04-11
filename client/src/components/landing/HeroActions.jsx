import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";


export default function HeroActions() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        to="/register"
        className="inline-flex h-12 min-w-[10.5rem] items-center justify-center rounded-full bg-[#191B1D] px-5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 sm:h-16 sm:min-w-[13rem] sm:px-8 sm:text-xl"
      >
       Get Started Free

      </Link>
      <Link
        to="/login"
        className="inline-flex h-12 min-w-[10.5rem] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:h-16 sm:min-w-[13rem] sm:gap-3 sm:px-8 sm:text-xl"
      >
        See how it works
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 sm:h-8 sm:w-8">
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
      </Link>
    </div>
  );
}
