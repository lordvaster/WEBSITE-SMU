import DOMPurify from "isomorphic-dompurify";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { beritaSchema } from "@/lib/validations/berita";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = beritaSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.berita.findUnique({ where: { id } });
    if (!existing) return fail("Berita tidak ditemukan", 404);

    if (data.slug !== existing.slug) {
      const slugTaken = await db.berita.findUnique({ where: { slug: data.slug } });
      if (slugTaken) return fail("Slug sudah digunakan, gunakan slug lain", 409);
    }

    const nowPublishing = data.isPublished && !existing.isPublished;

    const berita = await db.berita.update({
      where: { id },
      data: {
        judul: data.judul,
        slug: data.slug,
        konten: DOMPurify.sanitize(data.konten),
        gambar: data.gambar || existing.gambar,
        isPublished: data.isPublished ?? existing.isPublished,
        publishedAt: nowPublishing ? new Date() : existing.publishedAt,
      },
    });

    return ok(berita, "Berita berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.berita.findUnique({ where: { id } });
    if (!existing) return fail("Berita tidak ditemukan", 404);

    await db.berita.delete({ where: { id } });
    return ok(null, "Berita berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
