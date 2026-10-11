"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = "name_asc" | "cost_asc" | "cost_desc" | "points_desc";

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: "Nome (A-Z)",
  cost_asc: "Costo (crescente)",
  cost_desc: "Costo (decrescente)",
  points_desc: "Punti (più alti prima)",
};

export function MarketFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca giocatore o squadra reale..."
          className="pl-10"
          aria-label="Cerca giocatore"
        />
      </div>
      <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <SelectItem key={key} value={key}>
              {SORT_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="shrink-0 text-xs text-muted-foreground sm:text-right">
        {resultCount} giocator{resultCount === 1 ? "e" : "i"}
      </p>
    </div>
  );
}
