import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACADEMY_URL, COMPANY_URL } from "@/lib/links";

// Beeldmateriaal komt rechtstreeks van de company-site. Bewust niet gekopieerd
// naar deze repo: wijzigt de wereld daar, dan volgt het portaal.
const BASIS = `${COMPANY_URL}/wereld/assets/echt`;

// intro.mp4 trekt de camera in zes seconden terug van de brug naar de hele
// wereld en eindigt exact op de hub-still. Daarna lichten de punten op.
const BEELD = {
  breed: {
    video: `${BASIS}/vid/intro.mp4`,
    poster: `${BASIS}/intro-poster.jpg`,
    still: `${BASIS}/hub.webp`,
    verhouding: "1112 / 834",
  },
  smal: {
    video: `${BASIS}/vid/intro-m.mp4`,
    poster: `${BASIS}/intro-poster-m.jpg`,
    still: `${BASIS}/hub-m.webp`,
    verhouding: "468 / 832",
  },
};

const UTM = "utm_source=portal&utm_medium=referral&utm_campaign=wereld-poort";

// Query hoort voor de hash, anders slikt de browser de parameters op.
const metUtm = (pad: string) => {
  const [route, anker] = pad.split("#");
  const scheiding = route.includes("?") ? "&" : "?";
  return `${COMPANY_URL}${route}${scheiding}${UTM}${anker ? `#${anker}` : ""}`;
};

interface Hotspot {
  label: string;
  pad: string;
  beschrijving: string;
  x: number;
  y: number;
  xm: number;
  ym: number;
  accent?: boolean;
  // Plein-plekken, secundair. Heten op de wereld `is-sub`.
  sub?: boolean;
}

// Posities overgenomen uit wereld.js van de company-repo, inclusief de aparte
// mobiele coordinaten (xm/ym) die bij de staande uitsnede horen.
//
// De paden zijn de hash-routes van de wereld zelf (ROUTE_BY_GEBOUW plus
// wegwijzer). pasWereldRouteToe() opent daarmee het bijbehorende gebouw of het
// Kompas-vak, ook bij koud openen. Bewust niet /academy/, /consultancy/ en zo:
// dan verlaat de bezoeker meteen de wereld waar dit blok hem net naartoe lokte.
// Elk gebouw heeft zijn eigen CTA naar de marketingpagina.
const hotspots: Hotspot[] = [
  {
    label: "Trainingen",
    pad: "/#train",
    beschrijving: "Trainingen: AI-training voor teams",
    x: 22,
    y: 34,
    xm: 22,
    ym: 39,
  },
  {
    label: "Implementatie",
    pad: "/#implement",
    beschrijving: "Implementatie: begeleiding bij het invoeren van AI",
    x: 44,
    y: 24,
    xm: 41,
    ym: 34,
  },
  {
    label: "AI-oplossingen",
    pad: "/#build",
    beschrijving: "AI-oplossingen: maatwerk en automatisering",
    x: 69,
    y: 26,
    xm: 72,
    ym: 38,
  },
  {
    label: "Inspiratie",
    pad: "/#inspire",
    beschrijving: "Inspiratie: keynotes, podcast en boek",
    x: 77,
    y: 55,
    xm: 77,
    ym: 47,
  },
  {
    label: "Projecten",
    pad: "/#projecten",
    beschrijving: "Projecten, klantcases en praktijkvoorbeelden",
    x: 27,
    y: 51,
    xm: 27,
    ym: 52,
    sub: true,
  },
  {
    label: "Over Morgen.",
    pad: "/#over-morgen",
    beschrijving: "Over Morgen, team en aanpak",
    x: 70,
    y: 67,
    xm: 74,
    ym: 56,
    sub: true,
  },
  {
    // #wegwijzer is een echte route in de wereld: pasWereldRouteToe() toont de
    // hub en opent meteen het Kompas-vak. Beter dan het Kompas op de academy-
    // pagina, want de bezoeker blijft in de wereld waar hij net op klikte.
    label: "Wegwijzer",
    pad: "/#wegwijzer",
    beschrijving: "Wegwijzer: vind de route die bij je past",
    x: 52,
    y: 47,
    xm: 52,
    ym: 50,
    accent: true,
  },
];

const gebruikMediaQuery = (query: string) => {
  // Meteen goed bij de eerste render: anders kiest mobiel eerst de brede
  // verhouding en springt de pagina zodra het effect draait.
  const [treft, setTreft] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    setTreft(mql.matches);
    const luister = (e: MediaQueryListEvent) => setTreft(e.matches);
    mql.addEventListener?.("change", luister);
    return () => mql.removeEventListener?.("change", luister);
  }, [query]);

  return treft;
};

const PortalWereldPoort = ({ vertraging = 0 }: { vertraging?: number }) => {
  const smal = gebruikMediaQuery("(max-width: 639px)");
  const minderBeweging = gebruikMediaQuery("(prefers-reduced-motion: reduce)");
  const beeld = smal ? BEELD.smal : BEELD.breed;

  const houder = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [geladen, setGeladen] = useState(false);
  const [afgelopen, setAfgelopen] = useState(false);

  // De poort staat onder de materialen. De video pas ophalen als iemand er
  // daadwerkelijk naartoe scrollt, anders betaalt elke bezoeker voor beeld dat
  // hij nooit ziet.
  useEffect(() => {
    if (minderBeweging) return;
    const el = houder.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setGeladen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setGeladen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [minderBeweging]);

  // Autoplay kan geweigerd worden. Dan blijft de poster staan en laten we de
  // punten alsnog zien, anders is het blok onbruikbaar.
  //
  // play() hoort een Promise te geven, maar oudere Safari-versies en sommige
  // webviews geven undefined. Zonder deze guard is dat een TypeError in een
  // effect, en die sloopt zonder error boundary de hele portaalpagina.
  useEffect(() => {
    if (!geladen) return;
    const afspelen = video.current?.play();
    afspelen?.catch(() => setAfgelopen(true));
  }, [geladen]);

  const puntenZichtbaar = minderBeweging || afgelopen;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: vertraging }}
      className="mt-16 overflow-hidden rounded-xl bg-card/60"
    >
      <div
        ref={houder}
        className="relative"
        style={{ aspectRatio: beeld.verhouding }}
      >
        {minderBeweging ? (
          <img src={beeld.still} alt="" className="block h-full w-full" />
        ) : (
          <video
            ref={video}
            src={geladen ? beeld.video : undefined}
            poster={beeld.poster}
            muted
            playsInline
            preload="none"
            onEnded={() => setAfgelopen(true)}
            onError={() => setAfgelopen(true)}
            className="block h-full w-full object-cover"
          />
        )}

        <div className="pointer-events-none absolute inset-0">
          {hotspots.map((hotspot, index) => (
            <a
              key={hotspot.label}
              href={metUtm(hotspot.pad)}
              aria-label={hotspot.beschrijving}
              style={{
                left: `${smal ? hotspot.xm : hotspot.x}%`,
                top: `${smal ? hotspot.ym : hotspot.y}%`,
                transitionDelay: `${index * 120}ms`,
              }}
              className={`group pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 no-underline transition-opacity duration-500 ${
                puntenZichtbaar ? "opacity-100" : "opacity-0"
              }`}
            >
              <span
                aria-hidden="true"
                className={`rounded-full ring-4 transition-transform duration-200 group-hover:scale-125 ${
                  hotspot.sub ? "h-2 w-2" : "h-2.5 w-2.5"
                } ${
                  hotspot.accent
                    ? "bg-neon ring-neon/20"
                    : "bg-primary ring-primary/20"
                }`}
              />
              <span
                className={`whitespace-nowrap rounded-md bg-background/70 px-2 py-0.5 font-medium backdrop-blur-sm ${
                  hotspot.sub
                    ? "text-[11px] text-muted-foreground"
                    : "text-xs text-foreground"
                }`}
              >
                {hotspot.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Er ligt meer achter deze training
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Een training is vaak het begin. Daarna komt het echte werken met AI:
          implementeren in de organisatie, laten landen in het dagelijkse werk,
          en maatwerk bouwen waar dat nodig is.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button asChild size="sm" className="gap-2">
            <a href={metUtm("/")}>
              De wereld van Morgen in
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <a
            href={ACADEMY_URL}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Of leer zelf verder in de Online Academy
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default PortalWereldPoort;
