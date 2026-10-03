import { Link } from "react-router-dom";
import { COMPANY_URL, CONTACT_EMAIL, SOCIAL, type NavLink } from "@/lib/links";

// Footer in de Morgen-huisstijl. Academy-kolom = de eigen pagina's van de
// leeromgeving; de andere kolommen overbruggen naar morgencompany.com.
const columns: { title: string; links: NavLink[] }[] = [
  {
    title: "Academy",
    links: [
      { label: "Online trainingen", href: "/", kind: "route" },
      { label: "AI Accelerator", href: "/ai-accelerator/", kind: "route" },
      { label: "Incompany trainingen", href: `${COMPANY_URL}/academy/`, kind: "external" },
      { label: "Inloggen", href: "/login", kind: "route" },
    ],
  },
  {
    title: "Build & Implement",
    links: [
      { label: "Digitale oplossingen", href: `${COMPANY_URL}/technology/`, kind: "external" },
      { label: "Procesautomatisering", href: `${COMPANY_URL}/technology/`, kind: "external" },
      { label: "Digitale strategie", href: `${COMPANY_URL}/consultancy/`, kind: "external" },
      { label: "Projecten", href: `${COMPANY_URL}/projecten/`, kind: "external" },
    ],
  },
  {
    title: "Company & Info",
    links: [
      { label: "Over Morgen.", href: `${COMPANY_URL}/about/`, kind: "external" },
      { label: "Keynote boeken", href: `${COMPANY_URL}/inspiratie/#cp-keynote`, kind: "external" },
      { label: "Podcast, artikelen en boek", href: `${COMPANY_URL}/inspiratie/#cp-verdieping`, kind: "external" },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, kind: "external" },
    ],
  },
];

const linkClass = "text-[0.86rem] text-[#7A6B8E] transition-colors hover:text-neon";

const renderLink = (link: NavLink) => {
  if (link.kind === "route") {
    return (
      <Link key={link.label} to={link.href} className={linkClass}>
        {link.label}
      </Link>
    );
  }
  if (link.kind === "anchor") {
    return (
      <a key={link.label} href={link.href} className={linkClass}>
        {link.label}
      </a>
    );
  }
  // Externe links zijn company cross-links (zelfde merk) → zelfde tab,
  // zodat de twee sites als één voelen. mailto blijft ongewijzigd.
  return (
    <a
      key={link.label}
      href={link.href}
      className={linkClass}
    >
      {link.label}
    </a>
  );
};

const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/30 px-6 pt-20 pb-8 backdrop-blur-[40px] lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Merk + social */}
          <div>
            <Link
              to="/"
              className="font-display text-[1.5rem] font-black uppercase tracking-[0.1em] text-white"
            >
              MORGEN<span className="text-neon not-italic">.</span>
            </Link>
            <p className="mt-5 max-w-[28ch] text-[0.86rem] leading-7 text-[#7A6B8E]">
              Technologiepartner voor bedrijven: van AI-inzicht naar training,
              implementatie en werkende oplossingen.
            </p>
            <div className="mt-7 flex gap-3">
              {[
                { label: "LI", href: SOCIAL.linkedin, title: "LinkedIn Morgen Company" },
                { label: "IG", href: SOCIAL.instagram, title: "Instagram Morgen Academy" },
                { label: "YT", href: SOCIAL.youtube, title: "YouTube Morgen Academy" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.title}
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/[0.18] bg-white/[0.08] text-[0.72rem] font-bold text-[#D8CCEC] transition-colors hover:border-neon hover:text-neon"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link-kolommen */}
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 text-[1rem] font-extrabold uppercase tracking-[0.06em] text-white">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-[#7A6B8E]">
            © {year} Morgen. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link to="/privacy/" className="text-[0.78rem] text-[#7A6B8E] transition-colors hover:text-white">
              Privacybeleid
            </Link>
            <a
              href={`${COMPANY_URL}/`}
              className="text-[0.78rem] text-[#7A6B8E] transition-colors hover:text-white"
            >
              Morgen Company
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
