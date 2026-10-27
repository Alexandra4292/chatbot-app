"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import type { ChatSettings } from "@/lib/types";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  onCommit: (settings: ChatSettings) => void;
  hasChat: boolean;
};

export function SettingsDialog({ open, onOpenChange, settings, onChange, onCommit, hasChat }: SettingsDialogProps) {
  const fields = [
    {
      key: "temperature" as const,
      label: "Temperature",
      hint: "Madalam väärtus annab täpsemaid, kõrgem loovamaid vastuseid.",
    },
    {
      key: "topP" as const,
      label: "Top-P",
      hint: "Piirab, kui laia sõnavalikuga mudel vastab.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Täpsemad seaded</DialogTitle>
          <DialogDescription>
            {hasChat
              ? "Seaded salvestatakse selle vestluse juurde."
              : "Seaded rakenduvad järgmisele uuele vestlusele."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" id={`${f.key}-label`}>
                  {f.label}
                </label>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-sm tabular-nums">
                  {settings[f.key].toFixed(1)}
                </span>
              </div>
              <Slider
                aria-labelledby={`${f.key}-label`}
                min={0}
                max={1}
                step={0.1}
                value={[settings[f.key]]}
                onValueChange={([v]) => onChange({ ...settings, [f.key]: v })}
                onValueCommit={([v]) => onCommit({ ...settings, [f.key]: v })}
              />
              <p className="text-xs text-muted-foreground">{f.hint}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
