import { Skeleton } from "@/components/ui/skeleton";

export default function MercatoLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-5 w-72" />

      <Skeleton className="mt-8 h-14 rounded-2xl" />
      <Skeleton className="mt-4 h-11 rounded-xl" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
