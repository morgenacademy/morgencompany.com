import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, LogOut, MessageSquare, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import PortalTrainingCard from "./PortalTrainingCard";
import PortalFeedbackDialog from "./PortalFeedbackDialog";
import PortalWereldPoort from "./PortalWereldPoort";
import { ACADEMY_URL } from "@/lib/links";

interface Training {
  id: string;
  title: string;
  description: string | null;
  training_date: string | null;
  training_dates: string[] | null;
  slide_storage_path: string | null;
  slide_filename: string | null;
  resources: Resource[] | null;
}

interface Resource {
  label: string;
  value: string;
  type?: "file";
  storagePath?: string;
  filename?: string;
  contentType?: string;
  size?: number;
}

interface PortalSession {
  company_id: string;
  company_name: string;
  logo_url: string | null;
  authenticated_at: number;
  password: string;
}

interface PortalDashboardProps {
  session: PortalSession;
  slug: string;
  onLogout: () => void;
}

const PortalDashboard = ({ session, slug, onLogout }: PortalDashboardProps) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchTrainings = async () => {
      const { data } = await supabase.rpc("portal_get_trainings", {
        _company_id: session.company_id,
      });
      setTrainings((data as Training[]) ?? []);
      setLoading(false);
    };
    fetchTrainings();
  }, [session.company_id]);

  const feedbackTraining = trainings[0] ?? null;

  // Per-portal override: deze klant kreeg een keynote in plaats van een training.
  const isKeynote = slug === "or-gemeente-tilburg";
  const eventNoun = isKeynote ? "keynote" : "training";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <a href={ACADEMY_URL} className="font-display text-xl font-semibold text-foreground tracking-tight hover:opacity-80 transition-opacity">
            Morgen <span className="text-primary">Academy</span>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Uitloggen
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {session.company_name}
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {isKeynote ? "Keynotemateriaal" : "Trainingsmaterialen"}
          </h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
            Wat leuk dat je erbij was. Hieronder vind je de materialen van je {eventNoun}. We stellen het zeer op prijs als je even een minuutje neemt om feedback te geven, dat helpt ons de {eventNoun} steeds beter te maken.
          </p>
        </motion.div>

        {!loading && trainings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-12 rounded-xl bg-card/40 p-4"
          >
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFeedbackOpen(true)}
                disabled={!feedbackTraining || feedbackSubmitted}
                className="flex-1 gap-2"
              >
                {feedbackSubmitted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                {feedbackSubmitted ? "Feedback verstuurd" : "Geef hier feedback"}
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 gap-2">
                <a
                  href="https://g.page/r/Cdz-0WCIxls3EBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="h-4 w-4" />
                  Laat een review achter
                </a>
              </Button>
            </div>
          </motion.section>
        )}

        {/* Trainings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : trainings.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
            Er zijn nog geen trainingen toegevoegd.
          </div>
        ) : (
          <div className="space-y-4">
            {trainings.map((training, index) => (
              <PortalTrainingCard
                key={training.id}
                training={training}
                slug={slug}
                password={session.password}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && (
          <PortalWereldPoort vertraging={trainings.length * 0.1 + 0.1} />
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 space-y-4 text-center"
        >
          <p className="text-xs text-muted-foreground/50">
            Vragen? Mail naar{" "}
            <a href="mailto:totmorgen@morgenacademy.nl" className="hover:text-muted-foreground transition-colors">
              totmorgen@morgenacademy.nl
            </a>
          </p>

          <p className="text-xs text-muted-foreground/40">
            Morgen Academy is het trainingsplatform van{" "}
            <a
              href="https://www.morgencompany.com"
              className="text-primary/40 hover:text-primary/70 transition-colors"
            >
              Morgen Company
            </a>
          </p>
        </motion.div>

        {feedbackTraining && (
          <PortalFeedbackDialog
            open={feedbackOpen}
            onOpenChange={setFeedbackOpen}
            trainingId={feedbackTraining.id}
            trainingTitle={session.company_name}
            companyId={session.company_id}
            onSubmitted={() => setFeedbackSubmitted(true)}
          />
        )}
      </main>
    </div>
  );
};

export default PortalDashboard;
