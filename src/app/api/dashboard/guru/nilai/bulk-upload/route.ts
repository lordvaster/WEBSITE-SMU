import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, guruTeachesKelas } from "@/lib/queries/guru";
import { calculateNilaiAkhir } from "@/lib/validations/nilai";

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
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return fail("Tidak ada data untuk diimpor", 400);

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
        if (!guru.mata_pelajaran.includes(data.mapel)) {
          throw new Error(`Anda tidak mengajar mata pelajaran "${data.mapel}"`);
        }

        const siswa = await db.siswa.findUnique({ where: { nisn: data.nisn } });
        if (!siswa) throw new Error(`Siswa dengan NISN ${data.nisn} tidak ditemukan`);

        const owns = await guruTeachesKelas(guru.id, siswa.kelasId);
        if (!owns) throw new Error(`Anda tidak mengajar kelas siswa dengan NISN ${data.nisn}`);

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
