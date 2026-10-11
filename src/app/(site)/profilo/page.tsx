import { UserCog } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Profilo" };

export default function ProfiloPage() {
  return (
    <ComingSoon
      icon={UserCog}
      title="Gestione profilo"
      description="Modifica username, nome e avatar del tuo account."
      phase="In arrivo nella Fase 2"
    />
  );
}
