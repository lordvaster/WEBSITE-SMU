import { db } from "@/lib/db";
import { ok, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const galeri = await db.galeri.findMany({ orderBy: { createdAt: "desc" } });
    return ok(galeri);
  } catch (e) {
    return handleApiError(e);
  }
}
