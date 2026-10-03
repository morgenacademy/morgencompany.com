import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Headphones, Lock, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecommendationItem } from "@/data/recommendations";

interface RecommendationRowProps {
  title?: string;
  subtitle?: string;
  items: RecommendationItem[];
  className?: string;
}

const RecommendationCard = ({ item, index }: { item: RecommendationItem; index: number }) => {
  const isExternal = item.href.startsWith("http");
  const isPodcast = item.kind === "podcast";
  const isLocked = item.locked || item.comingSoon;
  const hasEmbed = isPodcast && item.embedUrl;
  const content = (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`group h-full shrink-0 overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-[0_18px_40px_-28px_hsl(var(--primary)/0.4)] ${
        hasEmbed ? "w-[320px]" : "w-[176px] sm:w-[196px]"
      }`}
    >
      {hasEmbed ? (
        <div className="h-[152px] bg-secondary/40">
          <iframe
            src={item.embedUrl}
            title={item.title}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="block border-0"
          />
        </div>
      ) : (
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isLocked ? "grayscale" : "group-hover:scale-105"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
            {isPodcast ? <Headphones className="h-2.5 w-2.5 text-primary" /> : <PlayCircle className="h-2.5 w-2.5 text-primary" />}
            {isPodcast ? "Podcast" : "Training"}
          </div>
          {isLocked && (
            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="line-clamp-2 font-display text-sm font-semibold leading-tight text-white">
              {item.title}
            </h3>
          </div>
        </div>
      )}

      <div className="flex min-h-[78px] flex-col justify-between gap-2 p-3">
        <p className={`${hasEmbed ? "line-clamp-1" : "line-clamp-2"} text-xs leading-relaxed text-muted-foreground`}>
          {item.subtitle}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
          {isLocked && <Lock className="h-3 w-3" />}
          {isPodcast
            ? "Spotify"
            : item.comingSoon
            ? "Binnenkort"
            : item.locked
            ? item.price
              ? `€ ${parseFloat(item.price).toFixed(2).replace(".", ",")}`
              : "Nog niet in je account"
            : "In je account"}
        </p>
      </div>
    </motion.article>
  );

  if (item.comingSoon) {
    return <div className="snap-start">{content}</div>;
  }

  if (isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="block h-full snap-start">
        {content}
      </a>
    );
  }

  return (
    <Link to={item.href} className="block h-full snap-start">
      {content}
    </Link>
  );
};

const RecommendationRow = ({
  title = "Dit is mogelijk ook iets voor jou",
  subtitle = "Scroll door alle online trainingen en podcasts.",
  items,
  className = "",
}: RecommendationRowProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  const scrollByCards = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -640 : 640,
      behavior: "smooth",
    });
  };

  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-primary">
            Aanbevolen
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Scroll aanbevelingen naar links"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Scroll aanbevelingen naar rechts"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]"
      >
        {items.map((item, index) => (
          <RecommendationCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};

export default RecommendationRow;
