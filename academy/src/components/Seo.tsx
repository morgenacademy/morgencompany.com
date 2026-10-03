import { Helmet } from "react-helmet-async";

const SITE_URL = "https://academy.morgencompany.com";
const DEFAULT_TITLE =
  "Morgen Academy | Online trainingen over AI en automatisering";
const DEFAULT_DESCRIPTION =
  "Praktische videotrainingen waarmee je direct aan de slag kunt met AI en automatisering. Leer op je eigen tempo, waar en wanneer je wilt.";
// Vaste share-afbeelding in /public (niet-gehashte, stabiele URL). Losse
// pagina's kunnen 'm overschrijven via de `image`-prop.
const DEFAULT_IMAGE = "/og-image.jpg";

type SeoProps = {
  /** Volledige <title>. */
  title?: string;
  /** Meta description. */
  description?: string;
  /** Pad t.o.v. de site-root, bijv. "/ai-accelerator". Bepaalt de canonical. */
  path?: string;
  /** Share-afbeelding (og:image / twitter:image). Pad vanaf root of absolute URL. */
  image?: string;
};

/**
 * Zet per pagina een unieke title, description en canonical, plus de
 * bijbehorende Open Graph- en Twitter-tags. Voorkomt duplicate-content omdat
 * elke route anders een identieke shell-title en -canonical zou delen.
 *
 * De canonical krijgt altijd een trailing slash. Netlify serveert de
 * geprerenderde marketing-routes als map (`/ai-accelerator/`) en 301't de
 * variant zonder slash daarheen; de canonical moet dus naar de mét-slash-URL
 * wijzen, anders verwijst hij naar een redirect.
 */
const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
}: SeoProps) => {
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  const canonical = `${SITE_URL}${normalizedPath}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default Seo;
