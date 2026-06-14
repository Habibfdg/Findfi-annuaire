import type { MetadataRoute } from "next";
import { getOutils } from "@/lib/notion";

// Adresse publique du site (à définir dans Netlify). Valeur de repli en local.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const outils = await getOutils();

  const pagesOutils = outils.map((o) => ({
    url: `${SITE_URL}/outils/${o.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/outils`, lastModified: new Date() },
    ...pagesOutils,
  ];
}
