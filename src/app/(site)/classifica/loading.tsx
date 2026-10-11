import { Skeleton } from "@/components/ui/skeleton";

export default function ClassificaLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-80" />
      <Skeleton className="mt-8 h-96 rounded-2xl" />
    </div>
  );
}
