import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch {
    return Response.json({ status: "error", timestamp: new Date().toISOString() }, { status: 503 });
  }
}
