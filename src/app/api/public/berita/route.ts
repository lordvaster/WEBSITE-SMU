import { db } from "@/lib/db";
import { ok, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const berita = await db.berita.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, judul: true, slug: true, gambar: true, publishedAt: true },
    });
    return ok(berita);
  } catch (e) {
    return handleApiError(e);
  }
}
