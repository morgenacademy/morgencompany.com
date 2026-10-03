import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ACADEMY_URL } from "@/lib/links";

interface PortalSession {
  company_id: string;
  company_name: string;
  logo_url: string | null;
  authenticated_at: number;
  password: string;
}

interface PortalLoginProps {
  slug: string;
  onSuccess: (session: PortalSession) => void;
}

const PortalLogin = ({ slug, onSuccess }: PortalLoginProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("portal_verify_password", {
        _slug: slug,
        _password: password,
      });

      if (error) throw error;

      if (!data?.success) {
        toast({
          title: "Onjuist wachtwoord",
          description: "Controleer het wachtwoord en probeer het opnieuw.",
          variant: "destructive",
        });
        return;
      }

      onSuccess({
        company_id: data.company_id,
        company_name: data.company_name,
        logo_url: data.logo_url ?? null,
        authenticated_at: Date.now(),
        password, // stored in sessionStorage for download re-verification
      });
    } catch {
      toast({
        title: "Fout opgetreden",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <a
            href={ACADEMY_URL}
            className="font-display text-2xl font-semibold text-foreground tracking-tight transition-opacity hover:opacity-80"
          >
            Morgen <span className="text-primary">Academy</span>
          </a>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Klantportaal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>

          <h1 className="font-display text-xl font-semibold text-foreground">
            Welkom bij Morgen
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Voer het wachtwoord in dat je van de trainer hebt ontvangen om de trainingsmaterialen te bekijken.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ga verder"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Geen wachtwoord ontvangen?{" "}
          <a href="mailto:totmorgen@morgenacademy.nl" className="text-primary hover:underline">
            Neem contact op
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default PortalLogin;
