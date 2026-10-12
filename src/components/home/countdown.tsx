"use client";

import { useCountdown } from "@/hooks/use-countdown";

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="scoreboard flex min-w-[4.5rem] flex-col items-center rounded-xl px-3 py-3 sm:min-w-[5.5rem] sm:px-4 sm:py-4">
      <span className="scoreboard-digit animate-scoreboard-in text-3xl sm:text-4xl" key={value}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-accent sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function Countdown({
  targetDate,
  pastMessage = "🏀 Il torneo è iniziato!",
}: {
  targetDate: string | Date | null;
  pastMessage?: string;
}) {
  if (!targetDate) {
    return (
      <div className="scoreboard inline-flex items-center rounded-xl px-6 py-4">
        <p className="scoreboard-digit text-sm sm:text-base">Data del torneo in via di definizione</p>
      </div>
    );
  }

  return <CountdownDigits targetDate={targetDate} pastMessage={pastMessage} />;
}

function CountdownDigits({ targetDate, pastMessage }: { targetDate: string | Date; pastMessage: string }) {
  const { days, hours, minutes, seconds, isPast, mounted } = useCountdown(targetDate);

  if (isPast && mounted) {
    return (
      <div className="scoreboard inline-flex items-center rounded-xl px-6 py-4">
        <p className="scoreboard-digit text-base sm:text-lg">{pastMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3" suppressHydrationWarning>
      <Digit value={mounted ? days : 0} label="Giorni" />
      <span className="scoreboard-digit pb-5 text-2xl text-accent">:</span>
      <Digit value={mounted ? hours : 0} label="Ore" />
      <span className="scoreboard-digit pb-5 text-2xl text-accent">:</span>
      <Digit value={mounted ? minutes : 0} label="Min" />
      <span className="scoreboard-digit pb-5 text-2xl text-accent">:</span>
      <Digit value={mounted ? seconds : 0} label="Sec" />
    </div>
  );
}
