import { db } from "@/lib/db";
import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { isAnakOfOrangTua } from "@/lib/queries/orangtua";
import { getSiswaJadwal } from "@/lib/queries/siswa";

export async function GET(_request: Request, { params }: { params: Promise<{ siswaId: string }> }) {
  try {
    const session = await requireRole("orang_tua");
    const { siswaId } = await params;

    const owns = await isAnakOfOrangTua(siswaId, session.user.email ?? "");
    if (!owns) return fail("Anda tidak memiliki akses ke data siswa ini", 403);

    const siswa = await db.siswa.findUnique({ where: { id: siswaId } });
    if (!siswa) return fail("Siswa tidak ditemukan", 404);

    const jadwal = await getSiswaJadwal(siswa.kelasId);
    return ok(jadwal);
  } catch (e) {
    return handleApiError(e);
  }
}
