import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Lock,
  ArrowRight,
  Bell,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { courses } from "@/data/courses";
import WaitlistDialog from "@/components/WaitlistDialog";
import ContactDialog from "@/components/ContactDialog";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { getDaypartPeriod } from "@/lib/daypartGreeting";
import heroPhoto from "@/assets/training-tilburg-harmen.jpg";
import incompanyPhoto from "@/assets/training-tilburg-harmen-3.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement | null>(null);
  const [daypartPeriod, setDaypartPeriod] = useState(() => getDaypartPeriod());
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const learnY = useTransform(scrollYProgress, [0, 0.22, 0.42], ["0%", "100%", "200%"]);
  const [waitlistCourse, setWaitlistCourse] = useState<{ id: string; title: string } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDaypartPeriod(getDaypartPeriod());
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo path="/" />
      <SiteHeader />

      {/* Spacer for fixed nav */}
      <div className="h-[72px]" />

      {/* Hero */}
      <section ref={heroRef} className="relative mx-auto flex min-h-[min(760px,calc(84svh-72px))] max-w-6xl items-center px-6 pb-10 pt-12 md:pb-12 md:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-full w-screen -translate-x-1/2">
          <img src={heroPhoto} alt="AI-training in de praktijk bij Morgen Academy" className="h-full w-full object-cover object-[62%_42%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(12,10,24,0.96)_0%,rgba(12,10,24,0.9)_34%,rgba(12,10,24,0.55)_70%,rgba(12,10,24,0.28)_100%)]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full"
        >
          <h1 className="relative inline-block font-display text-[clamp(3.5rem,11vw,7.5rem)] font-black normal-case leading-[0.86] tracking-[0.01em] text-foreground">
            <span>Goede</span>
            <span className="relative whitespace-nowrap">
              MORGEN<span className="text-[#d8fe56]">.</span>
              {daypartPeriod && (
                <motion.span
                  key={daypartPeriod}
                  aria-hidden="true"
                  initial={{ scaleX: 0, opacity: 0, rotate: -5 }}
                  animate={{ scaleX: 1, opacity: 1, rotate: -5 }}
                  transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                  className="absolute left-[-1%] right-[-1%] top-[54%] h-[0.08em] origin-left rounded-full bg-[#d8fe56]"
                />
              )}
            </span>
            {daypartPeriod && (
              <>
                {" "}
                <span className="text-white">{daypartPeriod}</span>
              </>
            )}
          </h1>
          <div className="relative mt-6 flex items-start gap-x-[0.4em] font-display text-[clamp(2.7rem,8vw,6.25rem)] font-black uppercase leading-[0.9] tracking-[0.01em] text-white md:mt-7">
            <motion.span
              style={{ y: learnY }}
              className="z-10 inline-block shrink-0 will-change-transform"
            >
              Leer
            </motion.span>
            <div className="grid gap-0.5">
              <p>
                <span className="text-transparent [-webkit-text-stroke:1px_#f2f0ff] md:[-webkit-text-stroke:1.5px_#f2f0ff]">
                  slimmer
                </span>
                .
              </p>
              <p>
                <span className="text-transparent [-webkit-text-stroke:1px_#f2f0ff] md:[-webkit-text-stroke:1.5px_#f2f0ff]">
                  sneller
                </span>
                .
              </p>
              <p>
                <span className="text-[#d8fe56]">AI</span>{" "}
                <span className="text-transparent [-webkit-text-stroke:1px_#d8fe56] md:[-webkit-text-stroke:1.5px_#d8fe56]">
                  skills
                </span>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Courses */}
      <section id="trainingen" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20 pt-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">
            Trainingen
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-10">
            Ons aanbod
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`group overflow-hidden rounded-xl border border-border bg-card transition-colors ${
                course.comingSoon ? "opacity-70" : "cursor-pointer hover:border-primary/40"
              }`}
              onClick={
                course.comingSoon ? undefined : () => navigate(`/checkout/${course.id}`)
              }
              onKeyDown={
                course.comingSoon
                  ? undefined
                  : (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/checkout/${course.id}`);
                      }
                    }
              }
              role={course.comingSoon ? undefined : "link"}
              tabIndex={course.comingSoon ? undefined : 0}
              aria-label={course.comingSoon ? undefined : `Ga naar ${course.title}`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className={`h-full w-full object-cover transition-transform duration-500 ${
                    course.comingSoon ? "grayscale" : "group-hover:scale-105"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/10" />
                {course.comingSoon && (
                  <div className="absolute inset-0 bg-black/55" />
                )}
                <div className="absolute inset-x-0 top-0 p-6">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {course.title}
                  </h3>
                  <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-white/80 line-clamp-2">
                    {course.subtitle}
                  </p>
                </div>
                {course.comingSoon && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-secondary/90 backdrop-blur-sm px-5 py-2.5 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-medium text-foreground tracking-wide">
                        Binnenkort beschikbaar
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {course.comingSoon ? (
                  <div>
                    <Button
                      variant="outline"
                      className="gap-2 text-sm w-full"
                      onClick={() => setWaitlistCourse({ id: course.id, title: course.title })}
                    >
                      <Bell className="h-4 w-4" />
                      Op de wachtlijst zetten
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {course.totalLessons} lessen · {course.totalDuration}
                    </span>
                    <div className="flex-1" />
                    {course.price && (
                      <span className="text-sm font-semibold text-foreground mr-2">
                        €{course.price}
                      </span>
                    )}
                    <Button
                      className="gap-2 text-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/checkout/${course.id}`);
                      }}
                    >
                      Start nu
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Incompany / Live sectie */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-12"
        >
          <div className="absolute top-0 left-0 right-0 z-10 h-[3px] bg-gradient-to-r from-primary to-accent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img src={incompanyPhoto} alt="Deelnemers tijdens een incompany AI-training" className="h-full w-full object-cover object-[55%_42%]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(12,10,24,0.95)_0%,rgba(12,10,24,0.88)_45%,rgba(12,10,24,0.5)_100%)]" />
          </div>

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:gap-12">
            <div className="flex-1">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-primary">
                Live training
              </p>
              <h2 className="mb-4 font-display text-3xl font-semibold text-foreground md:text-4xl">
                Liever samen met je team?
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Boek een incompany training en leer samen met je team werken met AI.
                In twee uur krijgt je team een praktische, interactieve sessie op locatie of online.
              </p>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                Meer weten over onze bredere aanpak voor teams en organisaties?{" "}
                <a
                  href="https://www.morgencompany.com"
                  className="font-medium text-primary hover:underline"
                >
                  Bekijk Morgen Company
                </a>
                .
              </p>

              <div className="mb-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>10 personen incl.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>2 uur</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-2xl font-display font-semibold text-foreground">€ 995,-</span>
                <span className="text-xs text-muted-foreground">meer personen in overleg</span>
              </div>
            </div>

            <div className="w-full shrink-0 flex-col gap-3 md:w-auto md:pt-10 flex">
              <Button asChild size="lg" className="w-full gap-2 text-sm uppercase tracking-wider">
                <a href="https://morgencompany.com/academy/">
                  Bekijk incompany trainingen
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Voor teams, organisaties en maatwerktrajecten
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <WaitlistDialog
        open={!!waitlistCourse}
        onOpenChange={(open) => !open && setWaitlistCourse(null)}
        courseId={waitlistCourse?.id || ""}
        courseTitle={waitlistCourse?.title || ""}
      />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />

      <SiteFooter />
    </div>
  );
};

export default Landing;
