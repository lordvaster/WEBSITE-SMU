import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getSiswaByUserId } from "@/lib/queries/siswa";

export async function GET() {
  try {
    const session = await requireRole("siswa");
    const siswa = await getSiswaByUserId(session.user.id);
    if (!siswa) return fail("Data siswa tidak ditemukan", 404);
    return ok(siswa);
  } catch (e) {
    return handleApiError(e);
  }
}
