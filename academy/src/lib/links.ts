// Centrale merk-brede links. Eén plek voor de domeinen zodat de chrome
// (SiteHeader/SiteFooter) en losse verwijzingen consistent blijven en de
// app makkelijk naar academy.morgencompany.com te tillen is.
export const ACADEMY_URL = "https://academy.morgencompany.com";
export const COMPANY_URL = "https://morgencompany.com";
export const CONTACT_EMAIL = "totmorgen@morgenacademy.nl";

// route = interne SPA-route (Link), anchor = plain <a> (cross-page hash),
// external = volledige URL (nieuw tabblad, behalve mailto).
export type NavLink = { label: string; href: string; kind: "route" | "anchor" | "external" };

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/company/morgencompany",
  instagram: "https://www.instagram.com/morgenacademy.nl/",
  youtube: "https://www.youtube.com/@MorgenAcademy",
} as const;
