"use client";

import * as React from "react";
import { ArrowDown, Radio, SendHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ChatMessage } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  deleteMessage,
  getChatAuthors,
  sendMessage,
  UNKNOWN_AUTHOR,
  type ChatAuthor,
  type ChatMessageWithAuthor,
} from "@/services/chat-service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const MAX_LENGTH = 500;

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Oggi";
  if (date.toDateString() === yesterday.toDateString()) return "Ieri";
  return new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export function ChatRoom({
  initialMessages,
  currentUserId,
  isAdmin,
}: {
  initialMessages: ChatMessageWithAuthor[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const supabase = React.useMemo(() => createClient(), []);
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [live, setLive] = React.useState(false);
  const [showJump, setShowJump] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const stickToBottom = React.useRef(true);
  const authorsRef = React.useRef<Record<string, ChatAuthor>>(
    Object.fromEntries(initialMessages.map((m) => [m.user_id, m.author]))
  );

  const addMessage = React.useCallback(
    async (row: ChatMessage) => {
      if (!authorsRef.current[row.user_id]) {
        const fetched = await getChatAuthors(supabase, [row.user_id]);
        authorsRef.current = { ...authorsRef.current, ...fetched };
      }
      const author = authorsRef.current[row.user_id] ?? UNKNOWN_AUTHOR;
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, author }]));
    },
    [supabase]
  );

  // Messaggi in tempo reale: nuovi messaggi e cancellazioni arrivano a tutti.
  React.useEffect(() => {
    const channel = supabase
      .channel("chat-globale")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        void addMessage(payload.new as ChatMessage);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        const id = (payload.old as { id?: string }).id;
        if (id) setMessages((prev) => prev.filter((m) => m.id !== id));
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, addMessage]);

  // Scorre in fondo ai nuovi messaggi solo se l'utente era già in fondo
  // (non lo strappa via mentre sta rileggendo messaggi vecchi).
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    } else {
      setShowJump(true);
    }
  }, [messages]);

  // Il campo di testo cresce con il messaggio (fino a un massimo), poi scorre.
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickToBottom.current = nearBottom;
    if (nearBottom) setShowJump(false);
  }

  function jumpToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowJump(false);
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    const { message, error } = await sendMessage(supabase, currentUserId, content);
    setSending(false);
    if (error || !message) {
      toast.error(error ?? "Messaggio non inviato");
      return;
    }
    setDraft("");
    stickToBottom.current = true;
    void addMessage(message);
  }

  async function handleDelete(id: string) {
    const { error } = await deleteMessage(supabase, id);
    if (error) {
      toast.error("Impossibile eliminare il messaggio");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="font-display text-lg tracking-wide">Chat del torneo</p>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Radio className={cn("size-3.5", live && "text-success")} />
          {live ? "Live" : "Connessione..."}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto px-3 py-4 sm:px-5">
          {messages.length === 0 ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">
              Nessun messaggio ancora. Rompi il ghiaccio! 🏀
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const own = m.user_id === currentUserId;
                const newDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
                const grouped =
                  !newDay &&
                  prev?.user_id === m.user_id &&
                  new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
                const canDelete = own || isAdmin;

                return (
                  <React.Fragment key={m.id}>
                    {newDay && (
                      <li className="my-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {dayLabel(m.created_at)}
                      </li>
                    )}
                    <li className={cn("group flex items-end gap-2", own ? "flex-row-reverse" : "flex-row", !grouped && "mt-2")}>
                      {!own && (
                        <Avatar className={cn("size-8 shrink-0", grouped && "invisible")}>
                          <AvatarFallback className="text-[11px]">{getInitials(m.author.username)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("flex max-w-[80%] flex-col", own ? "items-end" : "items-start")}>
                        {!own && !grouped && (
                          <p className="mb-0.5 px-1 text-xs">
                            <span className="font-semibold">{m.author.username}</span>
                            {m.author.isAdmin && (
                              <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary">
                                ADMIN
                              </span>
                            )}
                            {m.author.teamName && <span className="text-muted-foreground"> · {m.author.teamName}</span>}
                          </p>
                        )}
                        <div className={cn("flex items-center gap-1", own ? "flex-row-reverse" : "flex-row")}>
                          <div
                            className={cn(
                              "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                              own ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground"
                            )}
                          >
                            {m.content}
                            <span className={cn("ml-2 align-bottom text-[10px]", own ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {formatTime(m.created_at)}
                            </span>
                          </div>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(m.id)}
                              aria-label="Elimina messaggio"
                              className="shrink-0 rounded-full p-1 text-muted-foreground opacity-60 transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>

        {showJump && (
          <button
            type="button"
            onClick={jumpToBottom}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
          >
            <ArrowDown className="size-3.5" /> Nuovi messaggi
          </button>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            rows={1}
            placeholder="Scrivi un messaggio..."
            aria-label="Messaggio"
            className="max-h-32 min-h-11 w-full resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {draft.length > MAX_LENGTH - 50 && (
            <span className="absolute -top-5 right-2 text-[11px] text-muted-foreground">
              {draft.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <Button type="submit" size="icon" loading={sending} disabled={!draft.trim()} aria-label="Invia">
          {!sending && <SendHorizontal className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
