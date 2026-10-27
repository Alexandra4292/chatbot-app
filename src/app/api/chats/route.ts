import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clamp01, handleDbError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chats = await prisma.chatSession.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(chats);
  } catch (error) {
    return handleDbError(error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    const chat = await prisma.chatSession.create({
      data: {
        title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined,
        model: typeof body.model === "string" ? body.model : undefined,
        temperature: body.temperature !== undefined ? clamp01(body.temperature, 0.7) : undefined,
        topP: body.topP !== undefined ? clamp01(body.topP, 1) : undefined,
      },
    });
    return NextResponse.json({ ...chat, messages: [] }, { status: 201 });
  } catch (error) {
    return handleDbError(error);
  }
}
