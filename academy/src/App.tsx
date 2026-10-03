import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentStatus from "./pages/PaymentStatus";
import AdminUpload from "./pages/AdminUpload";
import AdminPortal from "./pages/AdminPortal";
import CompanyPortal from "./pages/CompanyPortal";
import Checkout from "./pages/Checkout";
import Privacy from "./pages/Privacy";
import AIAccelerator from "./pages/AIAccelerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Captured synchronously at module load, before supabase-js asynchronously
// consumes and strips the auth token from the URL hash.
const initialHash =
  typeof window !== "undefined" ? window.location.hash : "";
const hasAuthTokenHash = /type=(invite|recovery)/.test(initialHash);

// Invite/recovery links can land on any route (e.g. the Site URL default).
// Whenever we detect such a token, route to the password-set page so the
// user always gets a place to set their password.
const AuthHashRedirect = () => {
  const location = useLocation();
  if (hasAuthTokenHash && location.pathname !== "/reset-password") {
    return <Navigate to={`/reset-password${initialHash}`} replace />;
  }
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthHashRedirect />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registreren" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/betaling" element={<PaymentStatus />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/ai-accelerator" element={<AIAccelerator />} />
          <Route
            path="/admin/upload"
            element={
              <ProtectedRoute>
                <AdminUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cursus/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/portal/:companySlug" element={<CompanyPortal />} />
          <Route path="/admin" element={<Navigate to="/admin/portal" replace />} />
          <Route
            path="/admin/portal"
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
