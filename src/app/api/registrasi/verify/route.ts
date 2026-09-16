import { db } from "@/lib/db";
import { ok, fail, handleApiError } from "@/lib/api-helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) return fail("Token tidak valid", 400);

    const registrasi = await db.registrasi.findUnique({ where: { token_verifikasi: token } });
    if (!registrasi) return fail("Token tidak ditemukan atau sudah digunakan", 404);

    if (registrasi.isVerified) {
      return ok({ status: registrasi.status }, "Email sudah terverifikasi sebelumnya");
    }

    if (registrasi.tokenExpiresAt < new Date()) {
      return fail("Token sudah kedaluwarsa. Silakan daftar ulang.", 410);
    }

    await db.registrasi.update({
      where: { id: registrasi.id },
      data: { isVerified: true },
    });

    return ok({ status: registrasi.status }, "Email berhasil diverifikasi. Menunggu persetujuan dari admin.");
  } catch (e) {
    return handleApiError(e);
  }
}
