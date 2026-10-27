"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";
import type { ChatMessage, ChatSettings, ChatSummary, SystemPrompt } from "@/lib/types";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { PromptsDialog } from "./prompts-dialog";
import { SettingsDialog } from "./settings-dialog";
import { Sidebar } from "./sidebar";

const DEFAULT_MODEL = "gpt-4";
const DEFAULT_SETTINGS: ChatSettings = { temperature: 0.7, topP: 1 };

export function ChatApp() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [promptId, setPromptId] = useState<string | null>(null);
  // Model and settings for the active chat, or for the next chat when none is active.
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);

  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  // Lets async handlers ignore responses for a chat the user has already left.
  const activeChatRef = useRef<string | null>(null);
  activeChatRef.current = activeChatId;

  const upsertChat = (chat: ChatSummary) =>
    setChats((prev) =>
      [chat, ...prev.filter((c) => c.id !== chat.id)].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    );

  const openChat = useCallback(async (id: string) => {
    activeChatRef.current = id;
    setActiveChatId(id);
    setSidebarOpen(false);
    setLoadingChat(true);
    setMessages([]);
    try {
      const chat = await api.getChat(id);
      if (activeChatRef.current !== id) return;
      setMessages(chat.messages);
      setModel(chat.model);
      setSettings({ temperature: chat.temperature, topP: chat.topP });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const [chatList, promptList] = await Promise.all([api.listChats(), api.listPrompts()]);
      setChats(chatList);
      setPrompts(promptList);
      setPromptId((current) => current ?? promptList[0]?.id ?? null);
      if (chatList.length > 0) void openChat(chatList[0].id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, [openChat]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const startNewChat = async () => {
    setSidebarOpen(false);
    try {
      const chat = await api.createChat({ model, ...settings });
      upsertChat(chat);
      setActiveChatId(chat.id);
      setMessages([]);
      setInput("");
      setFileName(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteChat = async (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (!window.confirm(`Kas kustutada vestlus „${chat?.title ?? ""}"?`)) return;
    try {
      await api.deleteChat(id);
      const remaining = chats.filter((c) => c.id !== id);
      setChats(remaining);
      if (id === activeChatId) {
        if (remaining.length > 0) void openChat(remaining[0].id);
        else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const send = async (text = input) => {
    const content = fileName ? `${text.trim()}\n\n📎 Manus: ${fileName}` : text.trim();
    if (!content || pendingChatId) return;

    setError(null);
    let chatId = activeChatId;
    try {
      if (!chatId) {
        const chat = await api.createChat({ model, ...settings });
        upsertChat(chat);
        activeChatRef.current = chat.id;
        setActiveChatId(chat.id);
        chatId = chat.id;
      }
    } catch (e) {
      setError((e as Error).message);
      return;
    }

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: chatId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setFileName(null);
    setPendingChatId(chatId);

    try {
      const result = await api.sendMessage(chatId, content, promptId ?? undefined);
      if (activeChatRef.current === chatId) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimistic.id),
          result.userMessage,
          result.assistantMessage,
        ]);
      }
      upsertChat(result.chat);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      if (activeChatRef.current === chatId) setInput(text);
      setError((e as Error).message);
    } finally {
      setPendingChatId(null);
    }
  };

  const clearChat = async () => {
    if (!activeChatId || !window.confirm("Kas tühjendada selle vestluse sõnumid?")) return;
    try {
      await api.clearMessages(activeChatId);
      setMessages([]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const changeModel = async (value: string) => {
    setModel(value);
    if (!activeChatId) return;
    try {
      upsertChat(await api.updateChat(activeChatId, { model: value }));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const commitSettings = async (value: ChatSettings) => {
    setSettings(value);
    if (!activeChatId) return;
    try {
      upsertChat(await api.updateChat(activeChatId, value));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const savePrompt = async (draft: { id: string | null; name: string; content: string }) => {
    if (draft.id) {
      const updated = await api.updatePrompt({ id: draft.id, name: draft.name, content: draft.content });
      setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await api.createPrompt({ name: draft.name, content: draft.content });
      setPrompts((prev) => [...prev, created]);
      setPromptId((current) => current ?? created.id);
    }
  };

  const deletePrompt = async (id: string) => {
    await api.deletePrompt(id);
    const remaining = prompts.filter((p) => p.id !== id);
    setPrompts(remaining);
    if (promptId === id) setPromptId(remaining[0]?.id ?? null);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        loading={loadingList}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={openChat}
        onDelete={deleteChat}
        onNewChat={startNewChat}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          model={model}
          prompts={prompts}
          promptId={promptId}
          onMenu={() => setSidebarOpen(true)}
          onModelChange={changeModel}
          onPromptChange={setPromptId}
          onManagePrompts={() => setPromptsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {error && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900" role="alert">
            <div className="mx-auto flex max-w-3xl items-start gap-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="flex-1">{error}</p>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-amber-900 hover:bg-amber-100" onClick={loadAll}>
                <RefreshCw />
                Proovi uuesti
              </Button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded p-1 hover:bg-amber-100"
                aria-label="Sulge teade"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          typing={pendingChatId !== null && pendingChatId === activeChatId}
          loading={loadingChat}
          onSuggestion={(text) => void send(text)}
        />

        <ChatInput
          value={input}
          fileName={fileName}
          disabled={pendingChatId !== null}
          canClear={!!activeChat && messages.length > 0 && pendingChatId === null}
          onChange={setInput}
          onFileChange={setFileName}
          onSend={() => void send()}
          onClear={clearChat}
        />
      </main>

      <PromptsDialog
        open={promptsOpen}
        onOpenChange={setPromptsOpen}
        prompts={prompts}
        onSave={savePrompt}
        onDelete={deletePrompt}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onChange={setSettings}
        onCommit={commitSettings}
        hasChat={!!activeChatId}
      />
    </div>
  );
}
