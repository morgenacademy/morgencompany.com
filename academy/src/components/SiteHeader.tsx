import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY_URL, type NavLink } from "@/lib/links";

// Eigen academy-secties, plus de company-secties onder één "Morgen Company"-
// dropdown. Zelfde stijl als morgencompany.com → voelt als één site, en je
// bent vanuit de leeromgeving in één klik bij elke company-sectie.
const academyLinks: NavLink[] = [
  { label: "Online trainingen", href: "/", kind: "route" },
  { label: "AI Accelerator", href: "/ai-accelerator/", kind: "route" },
];

const companyLinks = [
  { label: "Morgen.", href: `${COMPANY_URL}/` },
  { label: "Train", href: `${COMPANY_URL}/academy/` },
  { label: "Implement", href: `${COMPANY_URL}/consultancy/` },
  { label: "Build", href: `${COMPANY_URL}/technology/` },
  { label: "Get inspired", href: `${COMPANY_URL}/inspiratie/` },
];

interface SiteHeaderProps {
  /** Vervangt de standaard "Inloggen"-CTA (bv. op het dashboard: uitloggen/admin). */
  rightSlot?: ReactNode;
}

const linkClass =
  "text-[0.82rem] font-bold uppercase tracking-[0.12em] text-[#D8CCEC] transition-colors hover:text-white whitespace-nowrap";
const mobileLinkClass =
  "rounded-[10px] px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-[#D8CCEC] transition-colors hover:bg-white/[0.06] hover:text-white";

const SiteHeader = ({ rightSlot }: SiteHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderLink = (item: NavLink, mobile = false) => {
    const className = mobile ? mobileLinkClass : linkClass;
    const onClick = mobile ? () => setMobileOpen(false) : undefined;
    if (item.kind === "route") {
      return (
        <Link key={item.label} to={item.href} onClick={onClick} className={className}>
          {item.label}
        </Link>
      );
    }
    return (
      <a
        key={item.label}
        href={item.href}
        onClick={onClick}
        className={className}
      >
        {item.label}
      </a>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-16 transition-all duration-300",
        scrolled
          ? "h-16 bg-white/[0.08] backdrop-blur-[40px] backdrop-saturate-200 border-b border-white/[0.18]"
          : "h-[72px]",
      )}
    >
      <Link
        to="/"
        className="font-display text-[1.5rem] font-black uppercase tracking-[0.1em] text-white shrink-0"
      >
        MORGEN<span className="text-neon not-italic">.</span>
        <span className="ml-1.5 font-semibold normal-case tracking-normal text-neon">Academy</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden lg:flex items-center gap-6">
        {academyLinks.map((item) => renderLink(item))}

        {/* Hover-dropdown (zelfde gedrag als de TRAIN-dropdown op company.com) */}
        <div className="group relative flex items-center">
          <a href={`${COMPANY_URL}/`} className={cn(linkClass, "inline-flex items-center gap-1")}>
            Morgen Company
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
          </a>
          {/* top-full raakt de trigger (geen hover-gat); pt-3 geeft alleen visueel ruimte */}
          <div className="absolute right-0 top-full z-50 hidden pt-3 group-hover:flex">
            <div className="flex min-w-52 flex-col gap-0.5 rounded-[12px] border border-white/[0.18] bg-[rgba(12,8,24,0.97)] p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-[40px] backdrop-saturate-200">
              {companyLinks.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="whitespace-nowrap rounded-[8px] px-3 py-2 text-[0.82rem] font-bold tracking-[0.02em] text-[#D8CCEC] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {rightSlot ?? (
          <Link
            to="/login"
            className="ml-1 inline-flex items-center rounded-[20px] bg-gradient-to-br from-[#d8fe56] to-[#b8e040] px-5 py-2 text-[0.88rem] font-bold text-[#1A1A2E] shadow-[0_4px_16px_rgba(216,254,86,0.3)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(216,254,86,0.45)]"
          >
            Inloggen
          </Link>
        )}
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Open menu"
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-[14px] border border-white/[0.18] bg-white/[0.08] text-white"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 flex flex-col gap-1 rounded-[16px] border border-white/[0.18] bg-[rgba(12,8,24,0.97)] backdrop-blur-[40px] backdrop-saturate-200 p-4 lg:hidden">
          {academyLinks.map((item) => renderLink(item, true))}
          <p className="mt-2 border-t border-white/[0.08] px-3 pt-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#7A6B8E]">
            Morgen Company
          </p>
          {companyLinks.map((c) => (
            <a
              key={c.label}
              href={c.href}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {c.label}
            </a>
          ))}
          {rightSlot ? (
            <div className="mt-1 flex flex-col gap-1">{rightSlot}</div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center rounded-[14px] bg-gradient-to-br from-[#d8fe56] to-[#b8e040] px-5 py-2.5 text-[0.88rem] font-bold text-[#1A1A2E]"
            >
              Inloggen
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default SiteHeader;
