import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { isAnakOfOrangTua } from "@/lib/queries/orangtua";
import { getSiswaNilai } from "@/lib/queries/siswa";

export async function GET(_request: Request, { params }: { params: Promise<{ siswaId: string }> }) {
  try {
    const session = await requireRole("orang_tua");
    const { siswaId } = await params;

    const owns = await isAnakOfOrangTua(siswaId, session.user.email ?? "");
    if (!owns) return fail("Anda tidak memiliki akses ke data siswa ini", 403);

    const nilai = await getSiswaNilai(siswaId);
    return ok(nilai);
  } catch (e) {
    return handleApiError(e);
  }
}
