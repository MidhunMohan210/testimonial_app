import { ShieldX } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function AccountSuspendedPage() {
  const { logout, business } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f6] px-4 py-8">
      <Card className="w-full max-w-lg border-white/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)]">
        <CardContent className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
            <ShieldX className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Your Woice account has been suspended.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {business?.businessName ? `${business.businessName} cannot access business management tools right now. ` : ""}
            Please contact Woice support for assistance.
          </p>
          <Button
            className="mt-6 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
            onClick={logout}
          >
            Back to login
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
