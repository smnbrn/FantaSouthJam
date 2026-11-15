import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getRecentMessages } from "@/services/chat-service";
import { ChatRoom } from "@/components/chat/chat-room";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Chat" };

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/chat");

  const [{ data: canChat }, { data: profile }] = await Promise.all([
    supabase.rpc("can_use_chat"),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  if (!canChat) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-20">
        <h1 className="sr-only">Chat</h1>
        <EmptyState
          icon={MessagesSquare}
          title="La chat è per chi gioca"
          description="Crea la tua squadra per entrare nella chat con gli altri partecipanti."
          className="py-14"
        >
          <Button asChild>
            <Link href="/squadra">Crea la tua squadra</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const messages = await getRecentMessages(supabase, 100);

  return (
    <div className="mx-auto h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] max-w-3xl px-2 py-3 sm:px-6 sm:py-6 md:h-[calc(100dvh-4rem)]">
      <ChatRoom initialMessages={messages} currentUserId={user.id} isAdmin={profile?.role === "admin"} />
    </div>
  );
}
