import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail, UserPlus, LogIn, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ACADEMY_URL } from "@/lib/links";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");
  const [attempts, setAttempts] = useState(0);
  const courseId = searchParams.get("course");

  useEffect(() => {
    const checkPayment = async () => {
      if (!courseId) {
        setStatus("failed");
        return;
      }

      // Poll a few times to give the webhook time to process
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        setAttempts(i + 1);

        const { data } = await supabase
          .from("payments")
          .select("status")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.status === "paid") {
          setStatus("paid");
          return;
        }
        if (data?.status === "failed" || data?.status === "canceled" || data?.status === "expired") {
          setStatus("failed");
          return;
        }
      }

      // After all attempts, check one more time
      const { data } = await supabase
        .from("payments")
        .select("status")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setStatus(data?.status === "paid" ? "paid" : "failed");
    };

    checkPayment();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-4">
          <a href={ACADEMY_URL}>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Morgen <span className="text-primary">Academy</span>
            </span>
          </a>
        </div>
      </header>

      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Betaling verwerken...
              </h1>
              <p className="mt-2 text-muted-foreground">
                Even geduld, we controleren je betaling{attempts > 2 ? " (dit kan even duren)" : ""}.
              </p>
            </div>
          )}

          {status === "paid" && (
            <div className="space-y-8">
              {/* Success header */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  Bedankt voor je bestelling!
                </h1>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Je betaling is ontvangen. Leuk dat je aan de slag gaat met AI!
                  Volg onderstaande stappen om direct te beginnen.
                </p>
              </div>

              {/* Steps */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Zo ga je van start
                </h2>

                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Check je e-mail</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We hebben een bevestiging gestuurd met je inloggegevens.
                      Check ook je spam-map als je hem niet ziet.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Maak je account aan</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Gebruik <strong>hetzelfde e-mailadres</strong> waarmee je hebt betaald.
                      Zo koppelen we je betaling automatisch aan je account.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Start met leren</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Na het aanmaken van je account heb je direct toegang tot alle lessen en video's.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/registreren" className="flex-1">
                  <Button size="lg" className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Account aanmaken
                  </Button>
                </Link>
                <Link to="/login" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Ik heb al een account
                  </Button>
                </Link>
              </div>

              {/* Help text */}
              <p className="text-center text-xs text-muted-foreground">
                Vragen? Mail ons op{" "}
                <a href="mailto:totmorgen@morgenacademy.nl" className="text-primary hover:underline">
                  totmorgen@morgenacademy.nl
                </a>
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Betaling niet gelukt
              </h1>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Er ging iets mis met je betaling. Je bent niet belast.
                Probeer het opnieuw of neem contact op.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                  <Button size="lg" variant="outline">Terug naar trainingen</Button>
                </Link>
                <a href="mailto:totmorgen@morgenacademy.nl">
                  <Button size="lg" variant="ghost">Contact opnemen</Button>
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentStatus;
