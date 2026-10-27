import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clamp01, handleDbError, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const chat = await prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat) return jsonError("Vestlust ei leitud.", 404);
    return NextResponse.json(chat);
  } catch (error) {
    return handleDbError(error);
  }
}

// Updates per-session settings (model, temperature, top-p) or the title.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const chat = await prisma.chatSession.update({
      where: { id },
      data: {
        title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined,
        model: typeof body.model === "string" ? body.model : undefined,
        temperature: body.temperature !== undefined ? clamp01(body.temperature, 0.7) : undefined,
        topP: body.topP !== undefined ? clamp01(body.topP, 1) : undefined,
      },
    });
    return NextResponse.json(chat);
  } catch (error) {
    return handleDbError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.chatSession.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleDbError(error);
  }
}
