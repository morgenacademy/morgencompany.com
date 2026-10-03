import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [step, setStep] = useState<"request" | "sent" | "new-password">("request");
  const [isInvite, setIsInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if we arrived via a recovery or invite link
  useState(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("type=invite")) {
      setStep("new-password");
      setIsInvite(hash.includes("type=invite"));
    }
  });

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Er ging iets mis",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep("sent");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Wachtwoord te kort",
        description: "Je wachtwoord moet minimaal 6 tekens bevatten",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Er ging iets mis",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je kunt nu inloggen met je nieuwe wachtwoord",
      });
      window.location.href = "/login";
    }
    setLoading(false);
  };

  if (step === "sent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
            Controleer je e-mail
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We hebben een link gestuurd naar <span className="text-foreground font-medium">{email}</span> waarmee je je wachtwoord kunt resetten.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Terug naar inloggen
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (step === "new-password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            {isInvite ? "Welkom bij Morgen Academy" : "Nieuw wachtwoord"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isInvite
              ? "Stel een wachtwoord in om je account te activeren. Je cursus staat daarna klaar."
              : "Kies een nieuw wachtwoord voor je account"}
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Nieuw wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  required
                  minLength={6}
                  className="bg-card border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Bezig..." : "Wachtwoord opslaan"}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <Link
          to="/login"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar inloggen
        </Link>

        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
          Wachtwoord vergeten
        </h1>
        <p className="text-muted-foreground mb-8">
          Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten
        </p>

        <form onSubmit={handleRequestReset} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
              E-mailadres
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@voorbeeld.nl"
              required
              className="bg-card border-border"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Bezig..." : "Resetlink versturen"}
          </Button>
        </form>

        <p className="mt-12 text-center text-xs text-muted-foreground/60">
          Morgen Academy is het trainingsplatform van{" "}
          <a
            href="https://www.morgencompany.com"
            className="text-primary/60 hover:text-primary hover:underline"
          >
            Morgen Company
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
