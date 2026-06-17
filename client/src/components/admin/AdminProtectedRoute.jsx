import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Skeleton } from "../ui/skeleton";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (token && !user) {
    return (
      <main className="min-h-screen bg-slate-100 p-5 sm:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
