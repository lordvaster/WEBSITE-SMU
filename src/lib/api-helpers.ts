import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    throw new ApiError("Forbidden", 403);
  }

  // The JWT's role claim is only set at sign-in and lives for the token's lifetime, so a
  // deactivated or demoted admin would otherwise keep API access until the token expires.
  // Re-check the live record so revocation takes effect immediately.
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });
  if (!currentUser || !currentUser.isActive || currentUser.role !== "admin") {
    throw new ApiError("Forbidden", 403);
  }

  return session;
}

export function ok(data: unknown, message?: string, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(message: string, status = 400, error?: unknown) {
  return NextResponse.json(
    { success: false, message, error: error ?? message },
    { status }
  );
}

export function handleApiError(e: unknown) {
  if (e instanceof ApiError) {
    return fail(e.message, e.status);
  }
  console.error(e);
  return fail("Terjadi kesalahan pada server", 500);
}
