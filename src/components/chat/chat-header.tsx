"use client";

import { BookUser, Menu, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MODELS, type SystemPrompt } from "@/lib/types";

type ChatHeaderProps = {
  model: string;
  prompts: SystemPrompt[];
  promptId: string | null;
  onMenu: () => void;
  onModelChange: (model: string) => void;
  onPromptChange: (id: string) => void;
  onManagePrompts: () => void;
  onOpenSettings: () => void;
};

export function ChatHeader({
  model,
  prompts,
  promptId,
  onMenu,
  onModelChange,
  onPromptChange,
  onManagePrompts,
  onOpenSettings,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-background/95 px-3 py-2.5 backdrop-blur sm:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu} aria-label="Ava menüü">
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 basis-36 flex-col gap-0.5 sm:max-w-44">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            LLM Model
          </span>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger aria-label="LLM mudel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex min-w-0 flex-1 basis-44 flex-col gap-0.5 sm:max-w-60">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            System Prompt
          </span>
          <Select value={promptId ?? undefined} onValueChange={onPromptChange} disabled={prompts.length === 0}>
            <SelectTrigger aria-label="Süsteemi prompt">
              <SelectValue placeholder={prompts.length ? "Vali persona" : "Prompte pole"} />
            </SelectTrigger>
            <SelectContent>
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex items-center gap-1.5 self-end">
        <Button variant="outline" size="sm" className="h-9" onClick={onManagePrompts}>
          <BookUser />
          <span className="hidden lg:inline">Manage Prompts</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Täpsemad seaded"
          title="Täpsemad seaded"
        >
          <SlidersHorizontal />
        </Button>
      </div>
    </header>
  );
}
