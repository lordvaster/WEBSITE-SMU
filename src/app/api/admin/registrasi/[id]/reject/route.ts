import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await db.registrasi.findUnique({ where: { id } });
    if (!existing) return fail("Data registrasi tidak ditemukan", 404);

    const registrasi = await db.registrasi.update({
      where: { id },
      data: { status: "rejected" },
    });

    return ok(registrasi, "Pendaftaran ditolak");
  } catch (e) {
    return handleApiError(e);
  }
}
