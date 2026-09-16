import { db } from "@/lib/db";
import { requireAdmin, ok, handleApiError } from "@/lib/api-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const registrasi = await db.registrasi.findMany({
      orderBy: { createdAt: "desc" },
      // Exclude token_verifikasi — the admin UI never needs the raw verification
      // secret, so don't hand it to the browser.
      select: {
        id: true,
        nama: true,
        email: true,
        no_telepon: true,
        alamat: true,
        asal_sekolah: true,
        nilai_rata_rata: true,
        tahun_lulus: true,
        jurusan_diminati: true,
        catatan: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return ok(registrasi);
  } catch (e) {
    return handleApiError(e);
  }
}
