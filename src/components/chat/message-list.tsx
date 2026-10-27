"use client";

import { useEffect, useRef } from "react";
import { Bot, Sparkles } from "lucide-react";
import { formatTime } from "@/lib/client";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Kuidas Tripodi värbamisprotsess käib?",
  "Kuidas valmistuda töövestluseks?",
  "Millal ma tagasisidet saan?",
];

type MessageListProps = {
  messages: ChatMessage[];
  typing: boolean;
  loading: boolean;
  onSuggestion: (text: string) => void;
};

export function MessageList({ messages, typing, loading, onSuggestion }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Laen vestlust…
      </div>
    );
  }

  if (messages.length === 0 && !typing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Tere! Mina olen Tria.</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Tripodi värbamisassistent. Küsi minult kandideerimise, töövestluste või värbamisprotsessi
            kohta.
          </p>
        </div>
        <div className="flex max-w-xl flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="rounded-full border bg-background px-3.5 py-1.5 text-sm text-foreground/80 shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3 py-6 sm:px-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <Avatar />
            <div
              className="flex items-center gap-2 rounded-lg rounded-bl-sm bg-zinc-100 px-4 py-3 text-sm text-zinc-600"
              role="status"
              aria-live="polite"
            >
              <span>Typing</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-zinc-500"
                    style={{ animation: `typing-dot 1.2s ${i * 0.15}s infinite ease-in-out` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Bot className="size-4" />
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <Avatar />}
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-lg px-4 py-2.5 text-sm leading-relaxed shadow-xs",
            isUser
              ? "rounded-br-sm bg-bubble-user text-bubble-user-foreground"
              : "rounded-bl-sm bg-zinc-100 text-zinc-900",
          )}
        >
          {message.content}
        </div>
        <time className="mt-1 px-1 text-[11px] text-muted-foreground" dateTime={message.createdAt}>
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
