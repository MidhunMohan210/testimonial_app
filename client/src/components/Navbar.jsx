import { MessageSquareQuote, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { business, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              TestiFlow
            </p>
            <h1 className="text-lg font-bold">{business?.businessName || "Your Business"}</h1>
          </div>
        </div>

        <Button variant="outline" className="gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
