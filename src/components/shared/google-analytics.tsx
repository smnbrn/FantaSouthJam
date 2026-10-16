"use client";

import Script from "next/script";
import { useConsent } from "@/lib/cookie-consent";

// Google Analytics 4. Parte solo se NEXT_PUBLIC_GA_ID è impostata (es. G-XXXXXXXXXX)
// E se l'utente ha accettato i cookie di statistica dal banner.
export function GoogleAnalytics() {
  const consent = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId || consent !== "granted") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
