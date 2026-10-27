"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SystemPrompt } from "@/lib/types";

type Draft = { id: string | null; name: string; content: string };

type PromptsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: SystemPrompt[];
  onSave: (draft: Draft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/20";

export function PromptsDialog({ open, onOpenChange, prompts, onSave, onDelete }: PromptsDialogProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = (next: boolean) => {
    if (!next) {
      setDraft(null);
      setError(null);
    }
    onOpenChange(next);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.content.trim()) {
      setError("Nimi ja sisu on kohustuslikud.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      setDraft(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (prompt: SystemPrompt) => {
    if (!window.confirm(`Kas kustutada prompt „${prompt.name}"?`)) return;
    setError(null);
    try {
      await onDelete(prompt.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Halda prompte</DialogTitle>
          <DialogDescription>Lisa, muuda või kustuta süsteemi prompte (personasid).</DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {draft ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="prompt-name" className="text-sm font-medium">
                Nimi
              </label>
              <input
                id="prompt-name"
                className={inputClass}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="nt Kandidaadi KKK"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prompt-content" className="text-sm font-medium">
                Sisu
              </label>
              <textarea
                id="prompt-content"
                className={`${inputClass} min-h-32 resize-y`}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                placeholder="Kirjelda, kuidas assistent peaks käituma…"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDraft(null)} disabled={saving}>
                Tühista
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Salvestan…" : "Salvesta"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {prompts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Prompte veel pole.</p>
            ) : (
              <Accordion type="single" collapsible className="rounded-lg border px-4">
                {prompts.map((p) => (
                  <AccordionItem key={p.id} value={p.id}>
                    <AccordionTrigger>{p.name}</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="whitespace-pre-wrap text-muted-foreground">{p.content}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDraft({ id: p.id, name: p.name, content: p.content })}
                        >
                          <Pencil />
                          Muuda
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remove(p)}
                        >
                          <Trash2 />
                          Kustuta
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <DialogFooter>
              <Button onClick={() => setDraft({ id: null, name: "", content: "" })}>
                <Plus />
                Lisa prompt
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
