import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.berita.findUnique({ where: { id } });
    if (!existing) return fail("Berita tidak ditemukan", 404);

    const berita = await db.berita.update({
      where: { id },
      data: {
        isPublished: !existing.isPublished,
        publishedAt: !existing.isPublished ? new Date() : existing.publishedAt,
      },
    });

    return ok(berita, berita.isPublished ? "Berita dipublikasikan" : "Berita diubah ke draft");
  } catch (e) {
    return handleApiError(e);
  }
}
