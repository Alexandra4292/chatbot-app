export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  createdAt: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  model: string;
  temperature: number;
  topP: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatWithMessages = ChatSummary & { messages: ChatMessage[] };

export type SystemPrompt = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

export type ChatSettings = { temperature: number; topP: number };

export const MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "claude", label: "Claude" },
  { value: "local-llama", label: "Local Llama" },
] as const;
