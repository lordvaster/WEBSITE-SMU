import { db } from "@/lib/db";
import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, getGuruJadwal, getGuruKelas } from "@/lib/queries/guru";

export async function GET() {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const [jadwal, kelas] = await Promise.all([getGuruJadwal(guru.id), getGuruKelas(guru.id)]);
    const jumlahSiswa = await db.siswa.count({
      where: { kelasId: { in: kelas.map((k) => k.id) } },
    });

    return ok({
      guru,
      stats: {
        jumlahKelas: kelas.length,
        jumlahJadwal: jadwal.length,
        jumlahSiswa,
      },
      kelas,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
