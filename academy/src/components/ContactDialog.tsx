import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in").max(100, "Naam is te lang"),
  email: z.string().trim().email("Vul een geldig e-mailadres in").max(255, "E-mailadres is te lang"),
  message: z.string().trim().min(1, "Vertel kort waar je vraag over gaat").max(1000, "Bericht is te lang"),
  newsletter: z.boolean(),
});

const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setName("");
    setEmail("");
    setMessage("");
    setNewsletter(false);
    setSuccess(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTimeout(resetState, 300);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = contactSchema.safeParse({
      name,
      email,
      message,
      newsletter,
    });

    if (!parsed.success) {
      toast({
        title: "Controleer je invoer",
        description: parsed.error.issues[0]?.message ?? "Vul alle velden correct in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("contact_requests").insert({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        message: parsed.data.message,
        newsletter: parsed.data.newsletter,
      });

      if (error) throw error;
      setSuccess(true);
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="font-display text-2xl text-foreground">Bericht ontvangen</DialogTitle>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Dank je {name}! We nemen zo snel mogelijk contact met je op.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Sluiten
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">Neem contact op</DialogTitle>
              <DialogDescription className="pt-1 leading-relaxed text-muted-foreground">
                Stel je vraag of laat weten waar je hulp bij zoekt. We reageren zo snel mogelijk.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <Input
                placeholder="Naam"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
              <Textarea
                placeholder="Waar kunnen we je mee helpen?"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={1000}
                rows={4}
                required
              />
              <label className="flex cursor-pointer items-start gap-2.5">
                <Checkbox
                  checked={newsletter}
                  onCheckedChange={(checked) => setNewsletter(checked === true)}
                  className="mt-0.5"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Stuur me ook de nieuwsbrief met praktische AI-tips en slimme toepassingen.
                </span>
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bericht versturen"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
