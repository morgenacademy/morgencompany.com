import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";

interface NewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const newsletterSchema = z.object({
  firstName: z.string().trim().min(1, "Vul je voornaam in").max(100, "Naam is te lang"),
  email: z.string().trim().email("Vul een geldig e-mailadres in").max(255, "E-mailadres is te lang"),
});

const NewsletterDialog = ({ open, onOpenChange }: NewsletterDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadySeen = window.sessionStorage.getItem("newsletter-popup-seen");
    if (alreadySeen || open) return;

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem("newsletter-popup-seen", "true");
      onOpenChange(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [open, onOpenChange]);

  const resetState = () => {
    setFirstName("");
    setEmail("");
    setSuccess(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("newsletter-popup-seen", "true");
    }

    if (!nextOpen) {
      setTimeout(resetState, 300);
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = newsletterSchema.safeParse({
      firstName,
      email,
    });

    if (!parsed.success) {
      toast({
        title: "Controleer je invoer",
        description: parsed.error.issues[0]?.message ?? "Vul een geldig e-mailadres in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("newsletter_signups").insert({
        first_name: parsed.data.firstName,
        email: parsed.data.email.toLowerCase(),
      });

      if (error && error.code === "23505") {
        toast({
          title: "Je staat al op de lijst",
          description: "Je ontvangt voortaan onze nieuwsbrief in je inbox.",
        });
        handleClose(false);
        return;
      }

      if (error) throw error;
      setSuccess(true);
    } catch {
      toast({
        title: "Inschrijven lukt nu niet",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">Je staat erop</DialogTitle>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Vanaf nu krijg je praktische AI-tips die je gebruik echt een boost geven — zonder spam of reclame.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Verder kijken
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Nieuwsbrief
              </div>
              <DialogTitle className="font-display text-3xl leading-tight text-foreground">
                Praktische tips die je AI-gebruik echt een boost geven
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
                Geen spam, geen reclame. Wel waarde. Ontvang heldere voorbeelden, slimme prompts en toepasbare inzichten die je meteen kunt gebruiken.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3">
              <Input
                placeholder="Voornaam"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                maxLength={100}
                required
              />
              <Input
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={255}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schrijf me in"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterDialog;
