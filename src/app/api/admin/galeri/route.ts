import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { galeriSchema } from "@/lib/validations/galeri";

export async function GET() {
  try {
    await requireAdmin();
    const galeri = await db.galeri.findMany({ orderBy: { createdAt: "desc" } });
    return ok(galeri);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = galeriSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const galeri = await db.galeri.create({
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi || null,
        gambar: data.gambar,
        tipe: data.tipe,
        link_video: data.tipe === "video" ? data.link_video || null : null,
      },
    });

    return ok(galeri, "Item galeri berhasil ditambahkan", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
