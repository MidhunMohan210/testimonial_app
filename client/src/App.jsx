import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import SendRequestPage from "./pages/SendRequestPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import PrivateFeedbackPage from "./pages/PrivateFeedbackPage";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ReviewFormPage from "./pages/ReviewFormPage";
import PublicTestimonialsPage from "./pages/PublicTestimonialsPage";
import SliderWidgetPage from "./pages/SliderWidgetPage";
import WidgetPage from "./pages/WidgetPage";
import EmbedDocsPage from "./pages/EmbedDocsPage";
import { useAuth } from "./hooks/useAuth";
import AppShell from "./components/AppShell";
import PublicLayout from "./components/PublicLayout";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function NotFoundRoute() {
  const [searchParams] = useSearchParams();
  const embedMode = searchParams.get("embed") === "true";

  if (embedMode) {
    return <main className="min-h-screen bg-transparent" aria-hidden="true" />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/embed-docs" element={<EmbedDocsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/r/:slug" element={<ReviewFormPage />} />
      </Route>
      <Route path="/p/:slug" element={<PublicTestimonialsPage />} />
      <Route path="/widget/:businessSlug" element={<WidgetPage />} />
      <Route path="/widget/slider/:slug" element={<SliderWidgetPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/private-feedback" element={<PrivateFeedbackPage />} />
        <Route path="/send-request" element={<SendRequestPage />} />
        <Route path="/docs" element={<EmbedDocsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
