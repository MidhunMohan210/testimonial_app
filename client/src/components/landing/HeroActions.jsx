import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";


export default function HeroActions() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        to="/register"
        className="inline-flex h-16 min-w-[13rem] items-center justify-center rounded-full bg-black px-8 text-xl font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        Try It on WhatsApp
        <FaWhatsapp className="ml-2 h-6 w-6" />
      </Link>
      <Link
        to="/login"
        className="inline-flex h-16 min-w-[13rem] items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-8 text-xl font-semibold text-slate-700 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
      >
        See how it works
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
