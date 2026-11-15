import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · Fanta SouthJam" },
  description: SITE_DESCRIPTION,
  keywords: ["fanta southjam", "fanta3v3", "amantea", "basket 3vs3", "fantabasket", "torneo south jam", "streetball calabria"],
  applicationName: "Fanta SouthJam",
  authors: [{ name: "Fanta SouthJam" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "Fanta SouthJam",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Applica subito il tema salvato (o quello di sistema) PRIMA dell'idratazione
// React, per evitare qualsiasi flash bianco/nero al caricamento.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('fanta3v3-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- regola pensata per Pages Router;
            in App Router il <head> del root layout è il posto corretto per i font, vedi README */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <GoogleAnalytics />
        <CookieBanner />
      </body>
    </html>
  );
}
