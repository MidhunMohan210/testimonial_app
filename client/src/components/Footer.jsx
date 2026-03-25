import { Link } from "react-router-dom";

export default function Footer({ className = "" }) {
  return (
    <footer className={`border-t border-white/60 bg-white/70 backdrop-blur-xl ${className}`.trim()}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-6 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-slate-700">
          &copy; 2026 Midhun Mohan. All rights reserved.
        </p>
        <p className="text-sm text-slate-500">
          Woice is owned and operated by Midhun Mohan.
        </p>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/contact" className="transition hover:text-slate-950">
            Contact
          </Link>
          <Link to="/privacy" className="transition hover:text-slate-950">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
