import { ImageResponse } from "next/og";

// Immagine di anteprima mostrata quando il link del sito viene condiviso
// (WhatsApp, Instagram, Telegram...). Generata dal codice, nessun file da mantenere.
export const alt = "Fanta SouthJam — Il fantabasket del torneo 3vs3 di Amantea";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c0a09",
          backgroundImage: "radial-gradient(circle at 50% 115%, rgba(255, 90, 31, 0.55), rgba(12, 10, 9, 0) 62%)",
          color: "#f7f1e6",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" fill="#ff5a1f" />
          <g stroke="#121012" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
            <path d="M20 2v36" />
            <path d="M2 20h36" />
            <path d="M6.5 8.5c4.5 4 7 8.5 7 11.5s-2.5 7.5-7 11.5" />
            <path d="M33.5 8.5c-4.5 4-7 8.5-7 11.5s2.5 7.5 7 11.5" />
          </g>
        </svg>
        <div style={{ display: "flex", marginTop: 36, fontSize: 104, fontWeight: 900, letterSpacing: 2 }}>
          <span>FANTA</span>
          <span style={{ color: "#ff5a1f", marginLeft: 28 }}>SOUTHJAM</span>
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 38, color: "#b3a596" }}>
          Il fantabasket del torneo 3vs3 di Amantea
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            padding: "14px 34px",
            borderRadius: 999,
            backgroundColor: "#ff5a1f",
            color: "#1a0a02",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          Crea la tua squadra
        </div>
      </div>
    ),
    size
  );
}
