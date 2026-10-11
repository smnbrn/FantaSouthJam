"use client";

import * as React from "react";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function computeCountdown(target: Date): CountdownValue {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

/** Countdown live verso una data target, aggiornato ogni secondo. Sicuro per SSR. */
export function useCountdown(targetDate: string | Date) {
  const target = React.useMemo(
    () => (typeof targetDate === "string" ? new Date(targetDate) : targetDate),
    [targetDate]
  );

  // Durante il render server-side non esiste "adesso" del client: partiamo da
  // un valore neutro e calcoliamo il vero countdown dopo il mount.
  const [value, setValue] = React.useState<CountdownValue>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setValue(computeCountdown(target));
    const interval = setInterval(() => setValue(computeCountdown(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  return { ...value, mounted };
}
