"use client";

import { useEffect, useRef } from "react";
import { Eraser, Paperclip, SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_HEIGHT = 200;

type ChatInputProps = {
  value: string;
  fileName: string | null;
  disabled: boolean;
  canClear: boolean;
  onChange: (value: string) => void;
  onFileChange: (name: string | null) => void;
  onSend: () => void;
  onClear: () => void;
};

export function ChatInput({
  value,
  fileName,
  disabled,
  canClear,
  onChange,
  onFileChange,
  onSend,
  onClear,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-expand the textarea to fit its content, up to MAX_HEIGHT.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSend = !disabled && value.trim().length > 0;

  return (
    <footer className="shrink-0 border-t bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
      <form
        className="mx-auto max-w-3xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSend();
        }}
      >
        <div className="rounded-lg border bg-background shadow-sm transition-shadow focus-within:border-primary/50 focus-within:ring-[3px] focus-within:ring-ring/20">
          {fileName && (
            <div className="flex px-3 pt-2.5">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-foreground/80">
                <Paperclip className="size-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    onFileChange(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="rounded p-0.5 hover:bg-background"
                  aria-label="Eemalda fail"
                >
                  <X className="size-3" />
                </button>
              </span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder="Kirjuta oma küsimus..."
            aria-label="Sõnum"
            className="block max-h-[200px] w-full resize-none bg-transparent px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0]?.name ?? null)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileRef.current?.click()}
                aria-label="Lisa fail"
              >
                <Paperclip />
                <span className="hidden sm:inline">Attach File</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onClear} disabled={!canClear}>
                <Eraser />
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
              <Button type="submit" size="sm" disabled={!canSend}>
                <SendHorizontal />
                Send
              </Button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Tria on näidisassistent ja vastused on simuleeritud. Enter saadab, Shift+Enter lisab rea.
        </p>
      </form>
    </footer>
  );
}
