import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const DB_ERROR_MESSAGE =
  "Andmebaasiga ei õnnestunud ühendust luua. Palun proovi mõne aja pärast uuesti.";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Maps database failures to friendly Estonian errors instead of crashing the route.
export function handleDbError(error: unknown) {
  console.error(error);
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2025" || error.code === "P2003")
  ) {
    return jsonError("Kirjet ei leitud.", 404);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return jsonError("Sellise nimega kirje on juba olemas.", 409);
  }
  return jsonError(DB_ERROR_MESSAGE, 503);
}

export function clamp01(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(1, Math.max(0, n)) * 10) / 10;
}
