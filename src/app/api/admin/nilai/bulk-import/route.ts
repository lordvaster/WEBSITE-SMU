import { z } from "zod";
import { db } from "@/lib/db";
import { calculateNilaiAkhir } from "@/lib/validations/nilai";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

const rowSchema = z.object({
  nisn: z.string().min(1),
  mapel: z.string().min(1),
  semester: z.coerce.number().int().min(1).max(2),
  nilai_harian: z.coerce.number().min(0).max(100),
  nilai_uts: z.coerce.number().min(0).max(100),
  nilai_uas: z.coerce.number().min(0).max(100),
});

type RowResult = { row: number; nisn?: string; success: boolean; error?: string };

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return fail("Tidak ada data untuk diimpor", 400);

    const guruList = await db.guru.findMany();
    const guruByMapel = (mapel: string) =>
      guruList.find((g) => g.mata_pelajaran.some((m) => m.toLowerCase() === mapel.toLowerCase())) ?? guruList[0];

    const results: RowResult[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({
          row: rowNumber,
          nisn: rows[i]?.nisn,
          success: false,
          error: parsed.error.issues.map((iss) => iss.message).join(", "),
        });
        continue;
      }
      const data = parsed.data;

      try {
        const siswa = await db.siswa.findUnique({ where: { nisn: data.nisn } });
        if (!siswa) throw new Error(`Siswa dengan NISN ${data.nisn} tidak ditemukan`);

        const guru = guruByMapel(data.mapel);
        if (!guru) throw new Error("Belum ada data guru untuk mencatat nilai");

        const nilai_akhir = calculateNilaiAkhir(data.nilai_harian, data.nilai_uts, data.nilai_uas);

        await db.nilai.upsert({
          where: {
            siswaId_mapel_semester: { siswaId: siswa.id, mapel: data.mapel, semester: data.semester },
          },
          update: {
            nilai_harian: data.nilai_harian,
            nilai_uts: data.nilai_uts,
            nilai_uas: data.nilai_uas,
            nilai_akhir,
          },
          create: {
            siswaId: siswa.id,
            mapel: data.mapel,
            semester: data.semester,
            nilai_harian: data.nilai_harian,
            nilai_uts: data.nilai_uts,
            nilai_uas: data.nilai_uas,
            nilai_akhir,
            guruId: guru.id,
          },
        });

        successCount++;
        results.push({ row: rowNumber, nisn: data.nisn, success: true });
      } catch (err) {
        results.push({
          row: rowNumber,
          nisn: data.nisn,
          success: false,
          error: err instanceof Error ? err.message : "Gagal menyimpan data",
        });
      }
    }

    return ok(
      { total: rows.length, success: successCount, failed: rows.length - successCount, results },
      `${successCount} dari ${rows.length} nilai berhasil diimpor`
    );
  } catch (e) {
    return handleApiError(e);
  }
}
