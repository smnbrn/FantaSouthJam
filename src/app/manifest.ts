import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Serve /manifest.webmanifest: nome, colori e icone usati quando il sito viene
// aggiunto alla schermata Home del telefono. Le icone si rigenerano con scripts/icone.py.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "SouthJam",
    description: SITE_DESCRIPTION,
    lang: "it",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    icons: [
      { src: "/icone/icona-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone/icona-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone/icona-ritagliabile-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
