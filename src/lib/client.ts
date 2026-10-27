import type { ChatMessage, ChatSummary, ChatWithMessages, SystemPrompt } from "./types";

const NETWORK_ERROR = "Serveriga ei õnnestunud ühendust luua. Kontrolli internetiühendust.";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Midagi läks valesti. Palun proovi uuesti.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  listChats: () => request<ChatSummary[]>("/api/chats"),
  createChat: (data: Partial<Pick<ChatSummary, "model" | "temperature" | "topP">>) =>
    request<ChatWithMessages>("/api/chats", { method: "POST", body: json(data) }),
  getChat: (id: string) => request<ChatWithMessages>(`/api/chats/${id}`),
  updateChat: (id: string, data: Partial<Pick<ChatSummary, "title" | "model" | "temperature" | "topP">>) =>
    request<ChatSummary>(`/api/chats/${id}`, { method: "PATCH", body: json(data) }),
  deleteChat: (id: string) => request<void>(`/api/chats/${id}`, { method: "DELETE" }),
  sendMessage: (id: string, content: string, systemPromptId?: string) =>
    request<{ userMessage: ChatMessage; assistantMessage: ChatMessage; chat: ChatSummary }>(
      `/api/chats/${id}/messages`,
      { method: "POST", body: json({ content, systemPromptId }) },
    ),
  clearMessages: (id: string) => request<void>(`/api/chats/${id}/messages`, { method: "DELETE" }),
  listPrompts: () => request<SystemPrompt[]>("/api/prompts"),
  createPrompt: (data: { name: string; content: string }) =>
    request<SystemPrompt>("/api/prompts", { method: "POST", body: json(data) }),
  updatePrompt: (data: { id: string; name: string; content: string }) =>
    request<SystemPrompt>("/api/prompts", { method: "PUT", body: json(data) }),
  deletePrompt: (id: string) => request<void>("/api/prompts", { method: "DELETE", body: json({ id }) }),
};

const timeFormat = new Intl.DateTimeFormat("et-EE", { hour: "2-digit", minute: "2-digit" });
const dateFormat = new Intl.DateTimeFormat("et-EE", { day: "numeric", month: "short" });

export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

export function formatChatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? timeFormat.format(date)
    : dateFormat.format(date);
}
