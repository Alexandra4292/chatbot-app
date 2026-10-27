import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleDbError, jsonError } from "@/lib/api";
import { sendMessage } from "@/lib/mock-ai";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const MAX_TITLE_LENGTH = 40;

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return jsonError("Sõnum ei tohi olla tühi.", 400);

  try {
    const chat = await prisma.chatSession.findUnique({
      where: { id },
      include: { _count: { select: { messages: true } } },
    });
    if (!chat) return jsonError("Vestlust ei leitud.", 404);

    const userMessage = await prisma.message.create({
      data: { sessionId: id, role: "user", content },
    });

    const persona =
      typeof body.systemPromptId === "string"
        ? await prisma.systemPrompt.findUnique({ where: { id: body.systemPromptId } })
        : null;

    const answer = await sendMessage(
      content,
      chat.model,
      { temperature: chat.temperature, topP: chat.topP },
      persona?.name,
    );

    const assistantMessage = await prisma.message.create({
      data: { sessionId: id, role: "assistant", content: answer },
    });

    // The first message names the chat; every message bumps updatedAt for sidebar ordering.
    const firstLine = content.split("\n")[0];
    const updated = await prisma.chatSession.update({
      where: { id },
      data:
        chat._count.messages === 0
          ? {
              title:
                firstLine.length > MAX_TITLE_LENGTH
                  ? `${firstLine.slice(0, MAX_TITLE_LENGTH)}…`
                  : firstLine,
            }
          : { updatedAt: new Date() },
    });

    return NextResponse.json({ userMessage, assistantMessage, chat: updated }, { status: 201 });
  } catch (error) {
    return handleDbError(error);
  }
}

// Clears all messages of the chat but keeps the session and its settings.
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.message.deleteMany({ where: { sessionId: id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleDbError(error);
  }
}
