import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, getGuruKelas, getSiswaCountByKelas } from "@/lib/queries/guru";

export async function GET() {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const kelas = await getGuruKelas(guru.id);
    const counts = await getSiswaCountByKelas(kelas.map((k) => k.id));
    const withCount = kelas.map((k) => ({ ...k, jumlahSiswa: counts.get(k.id) ?? 0 }));

    return ok(withCount);
  } catch (e) {
    return handleApiError(e);
  }
}
