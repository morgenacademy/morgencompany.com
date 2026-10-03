import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface IncompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncompanyDialog = ({ open, onOpenChange }: IncompanyDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any).from("incompany_requests").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        remarks: remarks.trim() || null,
        newsletter,
      });

      if (error) throw error;
      setSuccess(true);
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
        setName("");
        setEmail("");
        setRemarks("");
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
              Aanvraag ontvangen!
            </DialogTitle>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Bedankt {name}! We nemen binnen 1 werkdag contact met je op om de training te plannen.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">
                Incompany training aanvragen
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-relaxed pt-1">
                Vul je gegevens in en we nemen zo snel mogelijk contact met je op.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <Input
                placeholder="Naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
              <Textarea
                placeholder="Opmerkingen (optioneel)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                maxLength={1000}
                rows={3}
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
                  "Aanvraag versturen"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncompanyDialog;
