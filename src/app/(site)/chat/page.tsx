import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getRecentMessages } from "@/services/chat-service";
import { ChatRoom } from "@/components/chat/chat-room";
import { Button } from "@/components/ui/button";

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
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessagesSquare className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl tracking-wide">La chat è per chi gioca</h1>
        <p className="mt-2 text-muted-foreground">Crea la tua squadra per entrare nella chat con gli altri partecipanti.</p>
        <Button className="mt-6" asChild>
          <Link href="/squadra">Crea la tua squadra</Link>
        </Button>
      </div>
    );
  }

  const messages = await getRecentMessages(supabase, 100);

  return (
    <div className="mx-auto h-[calc(100dvh-4rem)] max-w-3xl px-2 py-3 sm:px-6 sm:py-6">
      <ChatRoom initialMessages={messages} currentUserId={user.id} isAdmin={profile?.role === "admin"} />
    </div>
  );
}
