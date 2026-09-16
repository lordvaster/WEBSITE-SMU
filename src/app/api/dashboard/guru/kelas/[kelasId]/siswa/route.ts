import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, guruTeachesKelas, getSiswaInKelas } from "@/lib/queries/guru";

export async function GET(_request: Request, { params }: { params: Promise<{ kelasId: string }> }) {
  try {
    const session = await requireRole("guru");
    const { kelasId } = await params;

    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const owns = await guruTeachesKelas(guru.id, kelasId);
    if (!owns) return fail("Anda tidak mengajar di kelas ini", 403);

    const siswa = await getSiswaInKelas(kelasId);
    return ok(siswa);
  } catch (e) {
    return handleApiError(e);
  }
}
