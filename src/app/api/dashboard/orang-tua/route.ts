import { requireRole, ok, handleApiError } from "@/lib/api-helpers";
import { getAnakByOrangTuaEmail } from "@/lib/queries/orangtua";

export async function GET() {
  try {
    const session = await requireRole("orang_tua");
    const anak = await getAnakByOrangTuaEmail(session.user.email ?? "");
    return ok(anak);
  } catch (e) {
    return handleApiError(e);
  }
}
