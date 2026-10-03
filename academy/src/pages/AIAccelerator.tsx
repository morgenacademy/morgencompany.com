import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import heroPhoto from "@/assets/training-tilburg-harmen.jpg";
import sessionPhoto from "@/assets/training-fcdb-karin.jpeg";
import coachingPhoto from "@/assets/training-vml-karin.jpeg";
import workshopPhoto from "@/assets/training-pinkroccade-harmen.jpeg";

const audience = [
  "slimmer willen werken met AI",
  "AI willen toepassen op hun eigen werk",
  "processen willen verbeteren zonder te blijven hangen in theorie",
  "concrete tijdwinst of kwaliteitsverbetering zoeken",
  "AI willen leren gebruiken als dagelijkse tool en vaardigheid",
];

const outcomes = [
  "een concreet verbeterd of herontworpen werkproces",
  "inzicht in waar AI waarde toevoegt in hun eigen werk",
  "praktische AI-vaardigheden die direct toepasbaar zijn",
  "een eigen set prompts, formats en werkwijzen",
  "meer grip op data, analyse en besluitvorming",
  "een Green Belt-certificering als kwaliteitsbasis onder het traject",
];

const days = [
  {
    label: "Dag 1",
    title: "Waar zit de echte opgave?",
    date: "11 september",
    image: sessionPhoto,
    intro:
      "We starten niet bij AI, maar bij het werk zelf. Deelnemers kiezen een eigen proces en maken scherp waar het knelt, welke informatie nodig is en waar AI mogelijk waarde toevoegt.",
    bullets: [
      "wat er nu gebeurt",
      "waar het knelt",
      "welke informatie nodig is",
      "wat succes betekent",
      "waar AI mogelijk waarde kan toevoegen",
    ],
    after:
      "Na dag 1 gaan deelnemers terug naar hun praktijk om data, voorbeelden en input te verzamelen.",
  },
  {
    label: "Dag 2",
    title: "Van informatie naar inzicht",
    date: "2 oktober",
    image: workshopPhoto,
    intro:
      "Tijdens de tweede dag werken deelnemers met hun eigen verzamelde input. AI helpt om patronen te herkennen, oorzaken te ordenen en oplossingsrichtingen te verkennen.",
    bullets: [
      "wat de belangrijkste oorzaken zijn",
      "waar tijd verloren gaat",
      "waar kwaliteit onder druk staat",
      "welke stappen overbodig of onduidelijk zijn",
      "waar AI concreet kan ondersteunen",
    ],
    after:
      "Na dag 2 werken deelnemers een of meerdere oplossingsrichtingen verder uit.",
  },
  {
    label: "Dag 3",
    title: "Van idee naar toepassing",
    date: "6 november",
    image: coachingPhoto,
    intro:
      "Op de laatste dag maken deelnemers de stap naar toepassing. Iedere deelnemer eindigt met een concreet verbeterplan of prototype voor het eigen proces.",
    bullets: [
      "hoe het verbeterde proces eruitziet",
      "welke AI-tools of prompts worden ingezet",
      "wat dit vraagt van medewerkers",
      "hoe de verandering wordt geïmplementeerd",
      "hoe resultaat wordt gemeten en geborgd",
    ],
    after:
      "De uitkomst is een toepasbaar plan dat direct aansluit op het eigen werkproces.",
  },
];

const includes = [
  "3 fysieke trainingsdagen",
  "persoonlijke online coaching",
  "praktische AI-toolkit",
  "prompts, formats en templates",
  "begeleiding op de eigen praktijkcase",
  "Green Belt-certificering",
];

const AIAccelerator = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        path="/ai-accelerator"
        title="AI Accelerator | Morgen Academy"
        description="Van losse AI-experimenten naar concrete verbetering in je werk. Een begeleid traject waarin je AI toepast op je eigen processen, met Green Belt-certificering."
      />
      <SiteHeader
        rightSlot={
          <a
            href="mailto:totmorgen@morgenacademy.nl?subject=Aanmelding%20AI%20Accelerator"
            className="ml-1 inline-flex items-center rounded-[20px] bg-gradient-to-br from-[#d8fe56] to-[#b8e040] px-5 py-2 text-[0.88rem] font-bold text-[#1A1A2E] shadow-[0_4px_16px_rgba(216,254,86,0.3)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(216,254,86,0.45)]"
          >
            Aanmelden
          </a>
        }
      />

      <main>
        <section className="relative flex min-h-[min(820px,92svh)] items-end overflow-hidden px-6 pb-16 pt-28 lg:px-16">
          <div aria-hidden="true" className="absolute inset-0">
            <img src={heroPhoto} alt="Deelnemers aan het werk tijdens de AI Accelerator" className="h-full w-full object-cover object-[58%_42%]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(12,10,24,0.98)_0%,rgba(12,10,24,0.9)_38%,rgba(12,10,24,0.6)_68%,rgba(12,10,24,0.28)_100%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
          >
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI Accelerator
              </p>
              <h1 className="font-display text-[clamp(3.2rem,9vw,7.4rem)] font-black leading-[0.88] tracking-[0.01em] text-white">
                AI inzetten in je eigen processen
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-[#D8CCEC]">
                Van losse AI-experimenten naar concrete verbetering in je werk.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2 text-sm uppercase tracking-wider">
                  <a href="mailto:totmorgen@morgenacademy.nl?subject=Aanmelding%20AI%20Accelerator">
                    Meld je aan
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-sm uppercase tracking-wider">
                  <a href="#programma">Bekijk programma</a>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-start gap-3 rounded-[22px] bg-white/[0.05] p-4">
                <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D8CCEC]">Data</p>
                  <p className="mt-1 font-display text-xl text-white">11 sep · 2 okt · 6 nov</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[22px] bg-white/[0.05] p-4">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D8CCEC]">Locatie</p>
                  <p className="mt-1 font-display text-xl text-white">Midden-/Zuid-Nederland</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-[22px] bg-white/[0.05] p-4">
                <Award className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#D8CCEC]">Investering</p>
                  <p className="mt-1 font-display text-xl text-white">€ 1.995,- per deelnemer</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Waarom dit traject</p>
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              AI wordt pas waardevol als je weet welk probleem je ermee oplost.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5 text-base leading-8 text-muted-foreground"
          >
            <p>
              Veel organisaties voelen de urgentie om met AI aan de slag te gaan. Tegelijkertijd is de praktijk vaak
              weerbarstig: medewerkers proberen ChatGPT, maken een prompt of automatiseren een klein stukje werk.
            </p>
            <p className="text-xl font-semibold leading-8 text-white">
              De echte vraag blijft liggen: waar levert AI in mijn werkproces nu echt tijdwinst, kwaliteitsverbetering
              of minder gedoe op?
            </p>
            <p>
              Dit traject helpt deelnemers om AI niet als losse tool te gebruiken, maar als praktische vaardigheid
              binnen hun eigen processen. Ze brengen een eigen werkproces mee, onderzoeken de knelpunten en leren hoe
              AI helpt om slimmer, sneller en consistenter te werken.
            </p>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] border border-white/10 bg-card p-7 md:p-8"
          >
            <Target className="mb-5 h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-semibold text-white">Voor wie?</h2>
            <div className="mt-6 grid gap-3">
              {audience.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(216,254,86,0.12),rgba(21,21,62,0.92)_34%,rgba(14,14,48,1)_100%)] p-7 md:p-8"
          >
            <CheckCircle2 className="mb-5 h-8 w-8 text-primary" />
            <h2 className="font-display text-3xl font-semibold text-white">Wat levert het op?</h2>
            <div className="mt-6 grid gap-3">
              {outcomes.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-[#D8CCEC]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="programma" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Opzet</p>
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
              Drie fysieke dagen met persoonlijke online begeleiding tussendoor.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Deelnemers werken steeds aan hun eigen praktijkcase. Daardoor ontstaat geen abstract trainingsresultaat,
              maar een concreet toepasbare verbetering.
            </p>
          </div>

          <div className="grid gap-6">
            {days.map((day, index) => (
              <motion.article
                key={day.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="grid overflow-hidden rounded-[28px] border border-white/10 bg-card lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-[260px]">
                  <img src={day.image} alt={`Trainingsmoment tijdens ${day.label} van de AI Accelerator`} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 rounded-[22px] border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.18em] text-primary">{day.label}</p>
                    <p className="mt-1 font-display text-2xl text-white">{day.date}</p>
                  </div>
                </div>
                <div className="p-7 md:p-8">
                  <h3 className="font-display text-3xl font-semibold text-white">{day.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{day.intro}</p>
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {day.bullets.map((bullet) => (
                      <div key={bullet} className="flex gap-2 text-sm text-[#D8CCEC]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 rounded-[20px] border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-[#D8CCEC]">
                    {day.after}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {["Na dag 1", "Na dag 2"].map((label, index) => (
              <div key={label} className="rounded-[28px] border border-white/10 bg-secondary/40 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Tussenmoment</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">1-op-1 coaching</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {index === 0
                    ? "We kijken mee naar de gekozen opgave, beschikbare data en eerste inzichten."
                    : "We toetsen de analyse en scherpen de gekozen AI-toepassing of procesverbetering aan."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(6,4,14,0.96)] lg:grid-cols-[1fr_0.9fr]">
            <div className="p-7 md:p-10">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">Investering</p>
              <h2 className="font-display text-4xl font-semibold text-white">€ 1.995,- per deelnemer</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Inclusief fysieke trainingsdagen, persoonlijke begeleiding, praktische materialen en certificering.
                Minimale groepsgrootte: 4 deelnemers.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {includes.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-[#D8CCEC]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2 text-sm uppercase tracking-wider">
                  <a href="mailto:totmorgen@morgenacademy.nl?subject=Aanmelding%20AI%20Accelerator">
                    Aanmelden
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-sm uppercase tracking-wider">
                  <a href="mailto:totmorgen@morgenacademy.nl?subject=Vraag%20over%20AI%20Accelerator">
                    Stel een vraag
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative min-h-[360px]">
              <img src={coachingPhoto} alt="Persoonlijke coaching en begeleiding tijdens de AI Accelerator" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-[rgba(6,4,14,0.9)] lg:via-transparent lg:to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[24px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
                <div className="flex flex-wrap gap-4 text-sm text-[#D8CCEC]">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    3 fysieke dagen
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Vanaf 4 deelnemers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Kern van het traject</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
            In dit traject leren deelnemers AI inzetten waar het er echt toe doet: in hun eigen werkprocessen.
          </h2>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AIAccelerator;
