import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";
import StarRating from "./StarRating";

interface PortalFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: string;
  trainingTitle: string;
  companyId: string;
  onSubmitted: () => void;
}

const TAKEAWAY_OPTIONS = [
  "Begrijp ik beter wat automatiseren met AI is",
  "Denk ik meer in workflows (input \u2192 verwerking \u2192 output)",
  "Zie ik concrete kansen in mijn eigen werk",
  "Voel ik me in staat om zelf iets te bouwen",
  "Geen van bovenstaande",
];

const TEMPO_OPTIONS = [
  { value: "slow", label: "Te langzaam / te makkelijk" },
  { value: "balanced", label: "Goed in balans" },
  { value: "fast", label: "Te snel / te complex" },
];

const APPLICABILITY_OPTIONS = [
  { value: 1, label: "Niet toepasbaar" },
  { value: 2, label: "Beperkt toepasbaar" },
  { value: 3, label: "Redelijk toepasbaar" },
  { value: 4, label: "Goed toepasbaar" },
  { value: 5, label: "Direct toepasbaar" },
];

const RELEVANCE_OPTIONS = [
  { value: 1, label: "Helemaal niet" },
  { value: 2, label: "Enigszins" },
  { value: 3, label: "Neutraal" },
  { value: 4, label: "Relevant" },
  { value: 5, label: "Zeer relevant" },
];

const PortalFeedbackDialog = ({
  open,
  onOpenChange,
  trainingId,
  trainingTitle,
  companyId,
  onSubmitted,
}: PortalFeedbackDialogProps) => {
  const [name, setName] = useState("");
  const [func, setFunc] = useState("");
  const [ratingOverall, setRatingOverall] = useState(0);
  const [relevance, setRelevance] = useState(0);
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [applicability, setApplicability] = useState(0);
  const [tempo, setTempo] = useState("");
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [other, setOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setName(""); setFunc(""); setRatingOverall(0); setRelevance(0);
    setTakeaways([]); setApplicability(0); setTempo("");
    setLiked(""); setImprove(""); setOther(""); setSuccess(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setTimeout(resetState, 300);
    onOpenChange(nextOpen);
  };

  const toggleTakeaway = (option: string) => {
    setTakeaways((prev) =>
      prev.includes(option) ? prev.filter((t) => t !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratingOverall === 0) {
      toast({ title: "Vul de algemene beoordeling in", variant: "destructive" });
      return;
    }
    if (relevance === 0) {
      toast({ title: "Geef aan hoe relevant de inhoud was", variant: "destructive" });
      return;
    }
    if (applicability === 0) {
      toast({ title: "Geef aan hoe toepasbaar de training was", variant: "destructive" });
      return;
    }
    if (!tempo) {
      toast({ title: "Geef aan hoe je het tempo vond", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("portal_submit_feedback", {
        _training_id: trainingId,
        _company_id: companyId,
        _rating_overall: ratingOverall,
        _respondent_name: name.trim() || null,
        _respondent_function: func.trim() || null,
        _rating_relevance: relevance,
        _takeaways: takeaways.length > 0 ? takeaways : null,
        _rating_applicability: applicability,
        _rating_tempo: tempo,
        _feedback_liked: liked.trim() || null,
        _feedback_improve: improve.trim() || null,
        _feedback_other: other.trim() || null,
      });

      if (error) throw error;
      if (!data?.success) throw new Error("Submission failed");

      setSuccess(true);
      onSubmitted();
    } catch {
      toast({
        title: "Versturen lukt nu niet",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">
              Bedankt voor je feedback!
            </DialogTitle>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Je reactie helpt ons de training steeds beter te maken. We waarderen het enorm.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-foreground">
                Hoe was de training?
              </DialogTitle>
              <DialogDescription className="leading-relaxed text-muted-foreground">
                {trainingTitle}, duurt minder dan 2 minuten en helpt ons enorm.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Name & Function */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Naam <span className="text-muted-foreground font-normal">(optioneel)</span>
                  </label>
                  <Input
                    placeholder="Hoe mogen we je noemen?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Functie <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Bijv. Developer, Product Owner..."
                    value={func}
                    onChange={(e) => setFunc(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              {/* 1. Overall rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  1. Hoe waardeer je de sessie in het algemeen? <span className="text-destructive">*</span>
                </label>
                <StarRating value={ratingOverall} onChange={setRatingOverall} />
              </div>

              {/* 2. Relevance */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  2. In hoeverre is de inhoud relevant voor jouw werk? <span className="text-destructive">*</span>
                </label>
                <div className="space-y-1.5">
                  {RELEVANCE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        relevance === opt.value
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="relevance"
                        className="accent-primary"
                        checked={relevance === opt.value}
                        onChange={() => setRelevance(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Takeaways (multi-select) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  3. Na deze sessie...
                </label>
                <p className="text-xs text-muted-foreground">Meerdere antwoorden mogelijk</p>
                <div className="space-y-1.5">
                  {TAKEAWAY_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        takeaways.includes(opt)
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary rounded"
                        checked={takeaways.includes(opt)}
                        onChange={() => toggleTakeaway(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Applicability */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  4. Hoe toepasbaar is wat je hebt geleerd? <span className="text-destructive">*</span>
                </label>
                <div className="space-y-1.5">
                  {APPLICABILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        applicability === opt.value
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="applicability"
                        className="accent-primary"
                        checked={applicability === opt.value}
                        onChange={() => setApplicability(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Tempo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  5. Hoe vond je het tempo en niveau van de sessie? <span className="text-destructive">*</span>
                </label>
                <div className="space-y-1.5">
                  {TEMPO_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        tempo === opt.value
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tempo"
                        className="accent-primary"
                        checked={tempo === opt.value}
                        onChange={() => setTempo(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Most valuable */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  6. Wat was voor jou het meest waardevol?
                </label>
                <Textarea
                  placeholder="Bijv. de concrete voorbeelden, de interactieve oefeningen..."
                  value={liked}
                  onChange={(e) => setLiked(e.target.value)}
                  rows={2}
                  maxLength={1000}
                />
              </div>

              {/* 7. Improve */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  7. Wat zouden we moeten verbeteren?
                </label>
                <Textarea
                  placeholder="Alle feedback is welkom, hoe klein ook."
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  rows={2}
                  maxLength={1000}
                />
              </div>

              {/* 8. Stay informed */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  8. Wil je op de hoogte blijven van AI-trainingen en ontwikkelingen?
                </label>
                <p className="text-xs text-muted-foreground">
                  Laat je e-mailadres achter en we houden je op de hoogte. Geen spam, beloofd.
                </p>
                <Input
                  type="email"
                  placeholder="je@email.nl"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  maxLength={200}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Feedback versturen"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PortalFeedbackDialog;
