import { Skeleton } from "@/components/ui/skeleton";

export default function SquadraLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-6 h-20 rounded-2xl" />
      <Skeleton className="mt-6 h-96 rounded-2xl" />
    </div>
  );
}
