import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import PortalLogin from "@/components/portal/PortalLogin";
import PortalDashboard from "@/components/portal/PortalDashboard";

interface PortalSession {
  company_id: string;
  company_name: string;
  logo_url: string | null;
  authenticated_at: number;
  // Stored so downloads can re-verify; cleared when browser closes (sessionStorage)
  password: string;
}

const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const CompanyPortal = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!companySlug) return;
    try {
      const stored = sessionStorage.getItem(`portal_session_${companySlug}`);
      if (stored) {
        const parsed: PortalSession = JSON.parse(stored);
        if (Date.now() - parsed.authenticated_at < SESSION_TTL_MS) {
          setSession(parsed);
        } else {
          sessionStorage.removeItem(`portal_session_${companySlug}`);
        }
      }
    } catch {
      // ignore corrupt session
    }
    setChecked(true);
  }, [companySlug]);

  if (!companySlug) return <Navigate to="/" replace />;
  if (!checked) return null;

  const handleLoginSuccess = (newSession: PortalSession) => {
    sessionStorage.setItem(`portal_session_${companySlug}`, JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`portal_session_${companySlug}`);
    setSession(null);
  };

  if (!session) {
    return <PortalLogin slug={companySlug} onSuccess={handleLoginSuccess} />;
  }

  return (
    <PortalDashboard
      session={session}
      slug={companySlug}
      onLogout={handleLogout}
    />
  );
};

export default CompanyPortal;
