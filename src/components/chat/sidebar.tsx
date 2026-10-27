"use client";

import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatChatDate } from "@/lib/client";
import type { ChatSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type SidebarProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
};

export function Sidebar({
  chats,
  activeChatId,
  loading,
  open,
  onClose,
  onSelect,
  onDelete,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col border-r bg-sidebar transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full",
        )}
        aria-label="Vestluste ajalugu"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              T
            </span>
            <h2 className="text-base font-semibold">Vestlused</h2>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose} aria-label="Sulge menüü">
            <X />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {loading && (
            <div className="space-y-2 p-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}
          {!loading && chats.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Vestlusi veel pole. Alusta uut vestlust!
            </p>
          )}
          <ul className="space-y-1">
            {chats.map((chat) => (
              <li key={chat.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(chat.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 pr-10 text-left transition-colors",
                    chat.id === activeChatId
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/80 hover:bg-accent",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      chat.id === activeChatId ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{chat.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatChatDate(chat.updatedAt)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(chat.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  aria-label={`Kustuta vestlus „${chat.title}"`}
                  title="Kustuta vestlus"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sticky bottom-0 border-t bg-sidebar p-3">
          <Button className="w-full" onClick={onNewChat}>
            <Plus />
            Uus vestlus
          </Button>
        </div>
      </aside>
    </>
  );
}
