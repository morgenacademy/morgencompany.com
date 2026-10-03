import React, { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ACADEMY_URL } from "@/lib/links";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  Loader2,
  Star,
  Quote,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { courses } from "@/data/courses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const defaultProductCopy = {
  eyebrow: "Online training",
  headline: "Stap op de AI trein",
  introStrong: "Claim je voorsprong. 100% online en onbeperkt toegang.",
  intro:
    "De wereld verandert snel. Terwijl anderen nog handmatig werken, zet jij de turbo aan. In deze praktische online training leer je hoe je AI voor je laat werken. Geen vage theorie, maar directe tijdwinst.",
  benefitsTitle: "Transformeer je werkroutine met slimme automatisering",
  benefits: [
    "Bespaar tijd op terugkerende taken en werk met meer focus",
    "Eenvoudig te volgen, ook zonder technische kennis",
    "Leer prompts, tools en workflows die je direct kunt toepassen",
    "Maak betere keuzes doordat je AI-output leert beoordelen",
    "Volledig online, leer in je eigen tempo en op je eigen plek",
    "Onbeperkt toegang en blijvende updates",
  ],
  description:
    "Leer efficiënt en zonder technisch gedoe AI te gebruiken om taken te automatiseren, slimmer te werken en betere resultaten te halen uit je dagelijkse werk. Je bouwt systematisch aan praktische vaardigheden en krijgt toegang tot alle materialen.",
};

const productCopyByCourseId: Record<string, typeof defaultProductCopy> = {
  "basistraining-ai": {
    eyebrow: "Basistraining AI",
    headline: "Begin sterk met AI in je dagelijkse werk",
    introStrong:
      "Alles wat je nodig hebt om AI met vertrouwen te gebruiken, zonder technische drempel.",
    intro:
      "Je leert wat AI wel en niet kan, hoe je betere prompts schrijft en hoe je AI inzet voor taken die nu onnodig veel tijd kosten. Ideaal als je serieus wilt starten en meteen praktisch resultaat wilt zien.",
    benefitsTitle: "Na deze training werk je slimmer met AI",
    benefits: [
      "Begrijp de basis van AI zonder ingewikkelde theorie",
      "Schrijf prompts die duidelijkere en bruikbare output opleveren",
      "Gebruik AI veilig en bewust in je dagelijkse werk",
      "Ontdek waar AI jou de meeste tijd kan besparen",
      "Bouw de basis voor je eigen AI-assistent",
      "Leer online in je eigen tempo met onbeperkte toegang",
    ],
    description:
      "Deze training geeft je een stevig fundament. Je krijgt overzicht, praktische voorbeelden en opdrachten waarmee je AI meteen toepast op je eigen werk.",
  },
  "agentic-ai": {
    eyebrow: "Automatiseren met AI",
    headline: "Laat AI-agents werk voor je uitvoeren",
    introStrong:
      "Voor iedereen die verder wil dan losse prompts en echte workflows wil automatiseren.",
    intro:
      "In deze training leer je hoe je AI-agents inzet als digitale collega’s die stappen plannen, informatie verwerken en taken afmaken. Je ontdekt hoe je workflows ontwerpt die betrouwbaar, controleerbaar en nuttig zijn in de praktijk.",
    benefitsTitle: "Bouw workflows die doorwerken als jij iets anders doet",
    benefits: [
      "Begrijp wat AI-agents zijn en wanneer je ze inzet",
      "Vertaal terugkerend werk naar slimme agent-workflows",
      "Leer taken opdelen in duidelijke stappen en checks",
      "Voorkom fouten met betere instructies en controlepunten",
      "Maak automatisering concreet voor je eigen rol of team",
      "Krijg onbeperkt toegang tot de online training",
    ],
    description:
      "Deze training helpt je van experimenteren naar organiseren. Je leert hoe agentic workflows waarde toevoegen zonder dat je grip verliest op kwaliteit, veiligheid en resultaat.",
  },
  vibecoden: {
    eyebrow: "Bouwen met AI (vibecoding)",
    headline: "Van idee naar werkend product met AI",
    introStrong:
      "Leer bouwen met AI, ook als je jezelf geen programmeur noemt.",
    intro:
      "In deze training zet je ideeën om in prototypes, tools en werkende concepten. Je leert hoe je AI gebruikt als bouwpartner: van het scherp maken van je idee tot testen, aanpassen en verbeteren.",
    benefitsTitle: "Maak sneller iets dat echt werkt",
    benefits: [
      "Zet een vaag idee om in een helder bouwplan",
      "Gebruik AI om code, schermen en functies te maken",
      "Leer betere instructies geven aan coding tools",
      "Test en verbeter zonder vast te lopen in technische taal",
      "Bouw prototypes die je kunt laten zien of gebruiken",
      "Volledig online met onbeperkte toegang",
    ],
    description:
      "Bouwen met AI is voor makers, ondernemers en professionals die sneller willen bouwen. Je leert denken in stappen, slim samenwerken met AI en je idee zichtbaar maken zonder maanden ontwikkelwerk.",
  },
  "claude-openai-training": {
    eyebrow: "Claude Code / Codex: de basis",
    headline: "Stop met chatten, laat AI in je eigen map werken",
    introStrong:
      "Geef AI toegang tot je bestanden en projecten — van chatvenster naar echte uitvoering.",
    intro:
      "Je kent Claude of ChatGPT uit het chatvenster. In deze training geef je AI toegang tot je eigen map: het leest je bestanden, denkt mee en voert werk uit. Je ziet de agentic loop in actie, in zowel Claude Code als Codex.",
    benefitsTitle: "Van losse prompts naar een AI die in je werk meedraait",
    benefits: [
      "Werk agentic in je eigen map met Claude Code én Codex",
      "Leg projectafspraken vast in een CLAUDE.md zodat AI je project kent",
      "Gebruik plan mode: eerst verkennen en plannen, dan pas uitvoeren",
      "Benut het contextvenster slim en zet workflows op voor terugkerend werk",
      "Maak kennis met skills, MCP-connectors, hooks en subagents",
      "Volledig online met onbeperkte toegang",
    ],
    description:
      "Deze training maakt van AI een collega die jouw project kent en oppakt waar je gebleven was. Je leert dezelfde werkwijze in Claude Code en Codex, met een eerste opstap naar Git en teamwerk.",
  },
  "haal-meer-uit-claude-code": {
    eyebrow: "Haal meer uit Claude Code + Samenwerken met AI",
    headline: "Samen professioneel bouwen met Claude Code",
    introStrong:
      "Voor teams die al met Claude Code werken en het tempo omhoog willen brengen zonder grip te verliezen.",
    intro:
      "Iedereen bouwt — en precies daar begint het echte vraagstuk: grotere changes, vollere reviews, meer conflicten. In deze training verdiep je de agentic loop en leer je hoe je als team professioneel blijft samenwerken terwijl AI meer werk overneemt.",
    benefitsTitle: "Van sneller bouwen naar samen borgen",
    benefits: [
      "Verdiep de agentic loop: contextvenster, plan mode, subagents, workflows",
      "Los de merge-realiteit op: klein en vaak integreren, review als eerste pass",
      "Laat AI conflicten oplossen onder toezicht",
      "Maak werkafspraken en leg ze vast in gedeelde skills en kaders",
      "Borg kwaliteit met een review-gate en kaderscan",
      "Volledig online met onbeperkte toegang",
    ],
    description:
      "Deze training maakt van snel bouwen een teamsport: concrete werkafspraken, gedeelde skills en een review-poort zodat kwaliteit geborgd blijft als iedereen bouwt.",
  },
  "ai-voor-projectmanagers": {
    eyebrow: "Projectmanagement met AI",
    headline: "Stuur projecten slimmer met AI",
    introStrong:
      "Gebruik AI als projectassistent voor planning, communicatie, risico’s en besluitvorming.",
    intro:
      "Als projectmanager ben je continu bezig met overzicht houden, mensen meenemen en keuzes voorbereiden. In deze training leer je hoe AI je helpt om sneller structuur aan te brengen, betere updates te maken en risico’s eerder te zien.",
    benefitsTitle: "Meer overzicht, minder handwerk in je project",
    benefits: [
      "Maak sneller projectplannen, actielijsten en voortgangsupdates",
      "Gebruik AI voor stakeholdercommunicatie die helder en passend is",
      "Analyseer risico’s, afhankelijkheden en besluiten scherper",
      "Bereid overleggen, stuurgroepen en retrospectives beter voor",
      "Vertaal rommelige input naar duidelijke projectdocumentatie",
      "Volledig online met onbeperkte toegang",
    ],
    description:
      "Deze training is gemaakt voor projectmanagers die hun werk slimmer willen organiseren zonder de menselijke kant kwijt te raken. Je leert AI inzetten als praktische co-pilot voor overzicht, communicatie en voortgang.",
  },
};

const testimonials = [
  {
    quote:
      "Een heldere to the point training. Nu een week na de training al ontzettend veel tijdwinst geboekt. Een hele goede investering in jezelf en je bedrijf!",
    name: "Maaike Bemelmans",
  },
  {
    quote:
      "Hands on training die gelijk resultaat oplevert. Heel praktisch en duidelijk uitgelegd.",
    name: "Alies van der Linden",
  },
  {
    quote:
      "Vandaag volgde ik een workshop van Karin. Haar aanpak is grondig en duidelijk. Ze neemt de tijd om in te gaan op verdiepende vragen, ook als die even buiten het onderwerp vallen. Daarna brengt ze het gesprek weer scherp terug naar de kern. Dat werkt prettig en houdt focus.\n\nWat ik extra waardeer, is haar oog voor de verschillende niveaus in de groep. Iedereen kan aansluiten en wordt uitgedaagd om een stap verder te zetten.\n\nEen sterke en inspirerende workshop. Complimenten!",
    name: "Thomas B.",
  },
];

const Checkout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const course = courses.find((c) => c.id === courseId);

  if (!course || course.comingSoon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">
            Cursus niet gevonden
          </h1>
          <Link to="/">
            <Button variant="outline">Terug naar home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = course.price || "49.00";
  const priceNum = parseFloat(price);
  const btw = priceNum - priceNum / 1.21;
  const productCopy = productCopyByCourseId[course.id] ?? {
    ...defaultProductCopy,
    eyebrow: course.title,
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim() || !firstName.trim()) {
      // Scroll to form on mobile if fields missing
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast({
        title: "Vul je gegevens in",
        description: "Voornaam en e-mailadres zijn verplicht.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const redirectUrl = `${window.location.origin}/betaling?course=${course.id}`;

      // Save newsletter signup if opted in
      if (newsletter) {
        await supabase.from("newsletter_signups").upsert(
          { email: trimmedEmail, first_name: firstName.trim() || null },
          { onConflict: "email" }
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "create-mollie-payment",
        {
          body: {
            courseId: course.id,
            courseTitle: course.title,
            amount: price,
            email: trimmedEmail,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            redirectUrl,
          },
        }
      );

      if (error || !data?.checkoutUrl) {
        throw new Error("Payment creation failed");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      toast({
        title: "Er ging iets mis",
        description: "Probeer het opnieuw of neem contact op.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 text-center">
            <a href={ACADEMY_URL}>
              <span className="font-display text-xl font-semibold text-foreground tracking-tight">
                Morgen <span className="text-primary">Academy</span>
              </span>
            </a>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* LEFT: Sales copy + social proof */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Hero copy */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
                {productCopy.eyebrow}
              </p>
              <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
                {productCopy.headline}
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  {productCopy.introStrong}
                </strong>{" "}
                {productCopy.intro}
              </p>
            </div>

            {/* Course image */}
            <div className="rounded-xl overflow-hidden border border-border">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* Benefits */}
            <div>
              <h2 className="font-display text-xl text-foreground mb-4">
                {productCopy.benefitsTitle}
              </h2>
              <div className="space-y-3">
                {productCopy.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Long description */}
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {productCopy.description}
              </p>
            </div>

            {/* Testimonials */}
            <div className="space-y-4 pt-2">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 relative"
                >
                  <Quote className="h-4 w-4 text-primary/30 absolute top-4 right-4" />
                  <p className="text-sm text-foreground leading-relaxed italic pr-6">
                    {t.quote}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 font-ui font-medium">
                    {t.name}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Checkout form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="sticky top-8 space-y-6">
              <form
                ref={formRef}
                onSubmit={handleCheckout}
                className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6"
              >
                {/* Your details */}
                <div>
                  <h2 className="font-display text-xl text-foreground mb-4">
                    Jouw gegevens
                  </h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Voornaam"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        maxLength={50}
                      />
                      <Input
                        placeholder="Achternaam"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="E-mailadres"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                    />
                  </div>
                </div>

                {/* Order summary */}
                <div>
                  <h2 className="font-display text-xl text-foreground mb-4">
                    Besteloverzicht
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Eenmalig inclusief 21% btw
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        € {priceNum.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground">
                          Totaal
                        </span>
                        <span className="text-lg font-display font-semibold text-foreground">
                          € {priceNum.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Totaalbedrag is inclusief € {btw.toFixed(2).replace(".", ",")} btw
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment methods - clickable */}
                <div>
                  <h2 className="font-display text-xl text-foreground mb-3">
                    Betaal direct met
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "iDEAL", icon: "https://www.mollie.com/external/icons/payment-methods/ideal.svg" },
                      { name: "Creditcard", icon: "https://www.mollie.com/external/icons/payment-methods/creditcard.svg" },
                    ].map((method) => (
                      <button
                        key={method.name}
                        type="button"
                        onClick={() => {
                          setSelectedMethod(method.name);
                          handleCheckout();
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                          selectedMethod === method.name
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background/50"
                        }`}
                      >
                        <img
                          src={method.icon}
                          alt={method.name}
                          className="h-6 w-auto"
                        />
                        <span className="text-[10px] text-muted-foreground font-ui">
                          {method.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className={`flex items-start gap-2.5 cursor-pointer rounded-lg p-2 transition-colors ${!agree ? "bg-primary/5 border border-primary/20" : ""}`}>
                    <Checkbox
                      checked={agree}
                      onCheckedChange={(checked) => setAgree(checked === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Ik bevestig mijn aankoop en ga akkoord met de voorwaarden.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={newsletter}
                      onCheckedChange={(checked) =>
                        setNewsletter(checked === true)
                      }
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Keep me in the loop! Ik ontvang graag AI- en
                      automatiseringstips van Morgen 🚀
                    </span>
                  </label>
                </div>

                {/* CTA */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm uppercase tracking-wider"
                  disabled={loading || !agree}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Afrekenen"
                  )}
                </Button>

                {/* Guarantee */}
                <div className="rounded-lg border border-success/20 bg-success/5 p-4 flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      14 dagen niet goed? Geld terug.
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      Niet tevreden? Neem binnen 14 dagen contact op en je krijgt je volledige aankoopbedrag terug. Geen vragen, geen gedoe.
                    </p>
                  </div>
                </div>

                {/* Trust badge */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      100% veilig betalen
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      We gebruiken dezelfde beveiliging als je bank
                    </p>
                  </div>
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="text-center pt-1">
                  <Link
                    to="/privacy/"
                    className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors"
                  >
                    Privacybeleid
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Totaal</p>
            <p className="text-lg font-display font-semibold text-foreground">
              € {priceNum.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <Button
            size="lg"
            className="text-sm uppercase tracking-wider px-8"
            disabled={loading}
            onClick={() => handleCheckout()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Afrekenen"
            )}
          </Button>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default Checkout;
