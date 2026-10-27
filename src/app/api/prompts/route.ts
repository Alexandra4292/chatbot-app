import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleDbError, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

function readPrompt(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  return { name, content };
}

export async function GET() {
  try {
    const prompts = await prisma.systemPrompt.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(prompts);
  } catch (error) {
    return handleDbError(error);
  }
}

export async function POST(request: Request) {
  const { name, content } = readPrompt(await request.json().catch(() => ({})));
  if (!name || !content) return jsonError("Nimi ja sisu on kohustuslikud.", 400);
  try {
    const prompt = await prisma.systemPrompt.create({ data: { name, content } });
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    return handleDbError(error);
  }
}

// PUT and DELETE take the prompt id in the JSON body ({ id, name, content } / { id }).
export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, content } = readPrompt(body);
  if (typeof body.id !== "string") return jsonError("Puudub prompti id.", 400);
  if (!name || !content) return jsonError("Nimi ja sisu on kohustuslikud.", 400);
  try {
    const prompt = await prisma.systemPrompt.update({
      where: { id: body.id },
      data: { name, content },
    });
    return NextResponse.json(prompt);
  } catch (error) {
    return handleDbError(error);
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return jsonError("Puudub prompti id.", 400);
  try {
    await prisma.systemPrompt.delete({ where: { id: body.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleDbError(error);
  }
}
