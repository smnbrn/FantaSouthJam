import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Accedi" };

// Dinamica invece di statica: così chi arriva direttamente su /login (link,
// refresh) riceve subito il form vero già renderizzato dal server, non lo
// skeleton. Necessaria comunque per via di useSearchParams (redirectTo) in
// LoginForm, che richiede un boundary Suspense in ogni caso.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-2xl" />}>
      <LoginForm />
    </Suspense>
  );
}
