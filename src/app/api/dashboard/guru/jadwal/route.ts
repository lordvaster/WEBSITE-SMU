import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, getGuruJadwal } from "@/lib/queries/guru";

export async function GET() {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const jadwal = await getGuruJadwal(guru.id);
    return ok(jadwal);
  } catch (e) {
    return handleApiError(e);
  }
}
