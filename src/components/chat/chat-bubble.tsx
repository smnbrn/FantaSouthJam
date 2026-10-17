"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, MessageCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { getRecentMessages, type ChatMessageWithAuthor } from "@/services/chat-service";
import { ChatRoom } from "@/components/chat/chat-room";

// Pallino della chat per mobile: si trascina dove si vuole (la posizione resta
// salvata sul telefono) e un tocco apre la chat in un popup. Compare solo a chi
// può usare la chat (ha una squadra o è admin) e non sulla pagina /chat.

const SIZE = 56;
const MARGIN = 12;
const DRAG_THRESHOLD = 6;
const STORAGE_KEY = "fanta-chat-bubble-pos";

type Pos = { x: number; y: number };

function clamp(pos: Pos): Pos {
  const maxX = window.innerWidth - SIZE - MARGIN;
  const maxY = window.innerHeight - SIZE - MARGIN;
  return {
    x: Math.min(Math.max(pos.x, MARGIN), maxX),
    // in alto lascia libera la navbar (64px)
    y: Math.min(Math.max(pos.y, 64 + MARGIN), maxY),
  };
}

function defaultPos(): Pos {
  return clamp({ x: window.innerWidth, y: window.innerHeight - 96 });
}

function readStoredPos(): Pos | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Pos;
    return typeof parsed.x === "number" && typeof parsed.y === "number" ? parsed : null;
  } catch {
    return null;
  }
}

function storePos(pos: Pos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // localStorage non disponibile: la posizione vale solo per questa visita
  }
}

export function ChatBubble() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const supabase = React.useMemo(() => createClient(), []);

  const [canChat, setCanChat] = React.useState(false);
  const [pos, setPos] = React.useState<Pos | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessageWithAuthor[] | null>(null);

  const drag = React.useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(
    null
  );

  // Chi può usare la chat (stessa regola delle policy del database).
  React.useEffect(() => {
    if (!user) {
      setCanChat(false);
      return;
    }
    let cancelled = false;
    supabase.rpc("can_use_chat").then(({ data }) => {
      if (!cancelled) setCanChat(Boolean(data));
    });
    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Posizione iniziale (salvata o in basso a destra) e riallineamento su rotazione/resize.
  React.useEffect(() => {
    setPos(clamp(readStoredPos() ?? defaultPos()));
    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Messaggi caricati all'apertura del popup.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMessages(null);
    getRecentMessages(supabase, 100).then((data) => {
      if (!cancelled) setMessages(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, supabase]);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
    }
    setPos(clamp({ x: d.originX + dx, y: d.originY + dy }));
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (d.moved) {
      setPos((p) => {
        if (p) storePos(p);
        return p;
      });
    } else {
      setOpen(true);
    }
  }

  if (!user || !canChat || !pos || pathname === "/chat") return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Apri la chat"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE, touchAction: "none" }}
        className={cn(
          "fixed z-40 flex select-none items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 md:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          dragging ? "scale-110 cursor-grabbing opacity-90" : "transition-transform active:scale-95",
          open && "invisible"
        )}
      >
        <MessageCircle className="size-6" strokeWidth={2.25} />
      </button>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8"
        >
          <DialogPrimitive.Title className="sr-only">Chat del torneo</DialogPrimitive.Title>
          {messages && user ? (
            <ChatRoom
              initialMessages={messages}
              currentUserId={user.id}
              isAdmin={profile?.role === "admin"}
              className="shadow-2xl"
              headerAction={
                <DialogPrimitive.Close
                  aria-label="Chiudi la chat"
                  className="-mr-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </DialogPrimitive.Close>
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-border bg-surface">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
