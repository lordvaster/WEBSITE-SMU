import { unlink } from "fs/promises";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { galeriSchema } from "@/lib/validations/galeri";
import { resolveUploadPath } from "@/lib/upload";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = galeriSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.galeri.findUnique({ where: { id } });
    if (!existing) return fail("Item galeri tidak ditemukan", 404);

    const galeri = await db.galeri.update({
      where: { id },
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar,
        tipe: existing.tipe,
        link_video: existing.tipe === "video" ? data.link_video || null : null,
      },
    });

    return ok(galeri, "Item galeri berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.galeri.findUnique({ where: { id } });
    if (!existing) return fail("Item galeri tidak ditemukan", 404);

    await db.galeri.delete({ where: { id } });

    const filePath = resolveUploadPath(existing.gambar);
    if (filePath) {
      await unlink(filePath).catch(() => {});
    }

    return ok(null, "Item galeri berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
