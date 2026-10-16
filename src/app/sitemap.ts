import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fanta3v3amantea.it";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/mercato", "/classifica", "/giornate", "/hall-of-fame", "/regolamento", "/faq", "/crediti", "/login", "/registrati"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
