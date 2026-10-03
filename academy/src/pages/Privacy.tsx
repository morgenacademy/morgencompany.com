import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { ACADEMY_URL } from "@/lib/links";
import Seo from "@/components/Seo";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        path="/privacy"
        title="Privacy | Morgen Academy"
        description="Hoe Morgen Academy omgaat met jouw gegevens. Geen kleine lettertjes: helder uitgelegd wat we bewaren, waarom en hoe je data veilig blijft."
      />
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-ui"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Link>
          <div className="flex-1 text-center">
            <a href={ACADEMY_URL}>
              <span className="font-display text-xl font-semibold text-foreground tracking-tight">
                Morgen <span className="text-primary">Academy</span>
              </span>
            </a>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Jouw data is veilig bij ons
          </h1>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed font-body">
          <p>
            We begrijpen dat je ons iets waardevols toevertrouwt als je je
            aanmeldt: jouw gegevens. Dat nemen we serieus. Geen kleine lettertjes,
            geen vage beloftes. Gewoon eerlijk vertellen wat we doen en waarom.
          </p>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Wat we van je opslaan
            </h2>
            <p>
              We vragen alleen wat we echt nodig hebben. Als je een account aanmaakt,
              bewaren we je voornaam en e-mailadres. Schrijf je je in voor de
              nieuwsbrief, dan bewaren we ook je voornaam en e-mailadres zodat we je
              de nieuwsbrief kunnen sturen. Gebruik je het contactformulier of vraag
              je een incompany training aan, dan bewaren we daarnaast ook je bericht
              of opmerkingen om je aanvraag goed te kunnen opvolgen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Nieuwsbrief en contact
            </h2>
            <p>
              Onze nieuwsbrief zit boordevol praktische tips waarmee je je AI-gebruik
              echt een boost geeft. Geen spam, geen reclame. Wel waarde. Je schrijft
              je alleen in als je dat zelf doet, en je kunt je altijd weer afmelden.
              Neem je contact met ons op, dan gebruiken we je gegevens alleen om je
              vraag te beantwoorden of je aanvraag op te volgen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Hoe we jouw gegevens beschermen
            </h2>
            <p>
              Achter de schermen doen we er alles aan om jouw gegevens veilig te
              houden. Je wachtwoord wordt versleuteld opgeslagen, zelfs wij kunnen
              het niet zien. Onze verbinding is altijd beveiligd via HTTPS (het
              slotje in je browser). Jouw gegevens zijn alleen toegankelijk voor
              jou. Andere gebruikers kunnen ze niet zien, ook niet per ongeluk. We
              werken met betrouwbare, professionele partijen voor opslag en
              betalingen die dezelfde hoge normen hanteren als wij.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Betalingen
            </h2>
            <p>
              Betalingen verlopen via Mollie, een gerenommeerde Nederlandse
              betaalprovider. Wij zien en bewaren je betaalgegevens nooit. Dat gaat
              volledig via hun beveiligde systemen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Jouw rechten
            </h2>
            <p>
              Jouw gegevens zijn van jou. Je kunt op elk moment opvragen welke
              gegevens we van je hebben, je gegevens laten aanpassen als er iets
              niet klopt, en vragen om je account en alle bijbehorende gegevens te
              verwijderen. We regelen dat zonder gedoe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Cookies en tracking
            </h2>
            <p>
              We gebruiken geen tracking-cookies voor advertenties. We meten alleen
              wat nodig is om het platform goed te laten werken, zoals of je
              ingelogd bent. Geen profielen, geen gedragsdata die we doorverkopen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">
              Vragen of zorgen?
            </h2>
            <p>
              Kom je er niet uit, of wil je gewoon weten wat er precies van je is
              opgeslagen? Stuur ons een berichtje via{" "}
              <a
                href="mailto:totmorgen@morgenacademy.nl"
                className="text-primary hover:underline"
              >
                totmorgen@morgenacademy.nl
              </a>
              . We reageren binnen 2 werkdagen.
            </p>
            <p className="mt-4">
              We zijn een klein team dat groot belang hecht aan vertrouwen. Als er
              ooit iets misgaat, hoe klein ook, laten we je dat direct weten. Dat
              vinden we gewoon de juiste manier om met mensen om te gaan.
            </p>
          </section>

          <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border">
            Laatst bijgewerkt: februari 2026
          </p>
        </div>
      </article>
    </div>
  );
};

export default Privacy;
