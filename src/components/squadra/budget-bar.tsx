import { Progress } from "@/components/ui/progress";

export function BudgetBar({ remaining, total }: { remaining: number; total: number }) {
  const spent = total - remaining;
  const percentSpent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">
          <span className="font-display text-lg text-primary">{remaining}</span>{" "}
          <span className="text-muted-foreground">crediti rimasti su {total}</span>
        </p>
        <p className="text-xs text-muted-foreground">{percentSpent}% speso</p>
      </div>
      <Progress value={percentSpent} className="mt-2" />
    </div>
  );
}
