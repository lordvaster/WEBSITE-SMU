import { db } from "@/lib/db";
import { requireAdmin, ok, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const kelas = await db.kelas.findMany({
      include: { guru_wali: true },
      orderBy: { nama: "asc" },
    });
    return ok(kelas);
  } catch (e) {
    return handleApiError(e);
  }
}
