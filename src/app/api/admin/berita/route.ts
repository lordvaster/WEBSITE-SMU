import DOMPurify from "isomorphic-dompurify";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { beritaSchema } from "@/lib/validations/berita";

export async function GET() {
  try {
    await requireAdmin();
    const berita = await db.berita.findMany({ orderBy: { createdAt: "desc" } });
    return ok(berita);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = beritaSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existingSlug = await db.berita.findUnique({ where: { slug: data.slug } });
    if (existingSlug) return fail("Slug sudah digunakan, gunakan slug lain", 409);

    const berita = await db.berita.create({
      data: {
        judul: data.judul,
        slug: data.slug,
        konten: DOMPurify.sanitize(data.konten),
        gambar: data.gambar || "/images/placeholder-berita.jpg",
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    return ok(berita, "Berita berhasil dibuat", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
