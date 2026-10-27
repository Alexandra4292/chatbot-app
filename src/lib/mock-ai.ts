import type { ChatSettings } from "./types";

const MODEL_LABELS: Record<string, string> = {
  "gpt-4": "GPT-4",
  claude: "Claude",
  "local-llama": "Local Llama",
};

const TOPICS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["cv", "elulookirjeldus", "resume"],
    answer:
      "Hea CV on lühike (1–2 lehekülge), toob esile sinu saavutused numbritega ning on kohandatud konkreetse ametikoha jaoks.",
  },
  {
    keywords: ["intervjuu", "vestlus", "vestlusel", "intervjuul"],
    answer:
      "Töövestluseks valmistudes tutvu ettevõtte ja rolliga, mõtle läbi 2–3 konkreetset näidet oma kogemusest ning valmista ette ka omapoolsed küsimused.",
  },
  {
    keywords: ["palk", "töötasu", "palga"],
    answer:
      "Palgaootuse puhul tasub lähtuda turu keskmisest ja oma kogemusest. Tripodi konsultant aitab sul ootused tööandjaga läbi rääkida.",
  },
  {
    keywords: ["protsess", "etapp", "kaua", "ajakava", "tagasiside"],
    answer:
      "Tavaliselt kestab värbamisprotsess 3–6 nädalat: esmane vestlus konsultandiga, intervjuud tööandjaga, vajadusel hindamised ja lõpuks pakkumine. Tagasisidet anname igas etapis.",
  },
  {
    keywords: ["kandideeri", "avaldus", "kandideerida"],
    answer:
      "Kandideerida saad Tripodi kodulehe kaudu konkreetse töökuulutuse juures. Lisa CV ja soovi korral lühike motivatsioonikiri.",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Simulates an LLM call: waits 1.5 s and returns a canned answer based on the input. */
export async function sendMessage(
  text: string,
  model: string,
  settings: ChatSettings,
  persona?: string,
): Promise<string> {
  await delay(1500);

  const lower = text.toLowerCase();
  const topic = TOPICS.find((t) => t.keywords.some((k) => lower.includes(k)));
  const modelLabel = MODEL_LABELS[model] ?? model;
  const quoted = text.length > 80 ? `${text.slice(0, 80)}…` : text;

  const body = topic
    ? topic.answer
    : `Küsisid: „${quoted}". Uurin seda sinu jaoks — kui soovid, täpsusta palun, millise ametikoha või värbamisetapi kohta küsimus käib.`;

  const intro = persona ? `(${persona}) ` : "";
  const meta = `\n\n— ${modelLabel} · temperatuur ${settings.temperature.toFixed(1)} · top-p ${settings.topP.toFixed(1)} (näidisvastus)`;

  return `${intro}${body}${meta}`;
}
