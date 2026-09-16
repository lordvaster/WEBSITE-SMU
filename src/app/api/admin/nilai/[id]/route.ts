import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { nilaiSchema, calculateNilaiAkhir } from "@/lib/validations/nilai";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = nilaiSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.nilai.findUnique({ where: { id } });
    if (!existing) return fail("Nilai tidak ditemukan", 404);

    const duplicate = await db.nilai.findFirst({
      where: {
        id: { not: id },
        siswaId: data.siswaId,
        mapel: data.mapel,
        semester: data.semester,
      },
    });
    if (duplicate) {
      return fail("Nilai untuk siswa, mata pelajaran, dan semester ini sudah ada", 409);
    }

    const nilai_akhir = calculateNilaiAkhir(data.nilai_harian, data.nilai_uts, data.nilai_uas);

    const nilai = await db.nilai.update({
      where: { id },
      data: {
        siswaId: data.siswaId,
        mapel: data.mapel,
        semester: data.semester,
        nilai_harian: data.nilai_harian,
        nilai_uts: data.nilai_uts,
        nilai_uas: data.nilai_uas,
        nilai_akhir,
        keterangan: data.keterangan || null,
      },
      include: { siswa: { include: { kelas: true } } },
    });

    return ok(nilai, "Nilai berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.nilai.findUnique({ where: { id } });
    if (!existing) return fail("Nilai tidak ditemukan", 404);

    await db.nilai.delete({ where: { id } });
    return ok(null, "Nilai berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
