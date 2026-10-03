import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Sparkles, Zap, Target } from "lucide-react";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
}

const WaitlistDialog = ({ open, onOpenChange, courseId, courseTitle }: WaitlistDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        course_id: courseId,
        first_name: firstName.trim(),
        email: email.trim().toLowerCase(),
        newsletter,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Al aangemeld!",
            description: "Je staat al op de wachtlijst voor deze training.",
          });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
      }
    } catch {
      toast({
        title: "Er ging iets mis",
        description: "Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setSuccess(false);
        setFirstName("");
        setEmail("");
        setNewsletter(true);
      }, 300);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {success ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">
              Je staat op de lijst!
            </DialogTitle>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Bedankt {firstName}! We sturen je een e-mail zodra <strong className="text-foreground">{courseTitle}</strong> beschikbaar is.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">
                {courseTitle}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-relaxed pt-1">
                Deze training is nog in ontwikkeling. Zet jezelf op de wachtlijst en wees er als eerste bij!
              </DialogDescription>
            </DialogHeader>

            {/* Promises */}
            <div className="space-y-3 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Van handmatig naar automatisch</p>
                  <p className="text-xs text-muted-foreground">Leer repetitieve taken automatiseren zonder technische kennis.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Praktijkgericht</p>
                  <p className="text-xs text-muted-foreground">Direct toepasbare workflows die je uren per week besparen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Early access voordeel</p>
                  <p className="text-xs text-muted-foreground">Wachtlijst-leden krijgen als eerste toegang én een speciale korting.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <Input
                placeholder="Voornaam"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                maxLength={50}
              />
              <Input
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
              <label className="flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={newsletter}
                  onCheckedChange={(checked) => setNewsletter(checked === true)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Keep me in the loop! Ik ontvang graag AI- en automatiseringstips van Morgen 🚀
                </span>
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Zet me op de wachtlijst"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDialog;
