import Link from "next/link";
import { BasketballMark } from "@/components/shared/basketball-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="court-arc-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-primary" aria-label="Torna alla home">
        <BasketballMark />
        <span className="font-display text-lg tracking-wide text-foreground">
          FANTA<span className="text-primary">3V3</span> AMANTEA
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
