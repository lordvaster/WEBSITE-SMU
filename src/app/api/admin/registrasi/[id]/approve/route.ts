import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await db.registrasi.findUnique({ where: { id } });
    if (!existing) return fail("Data registrasi tidak ditemukan", 404);
    if (!existing.isVerified) {
      return fail("Email pendaftar belum diverifikasi", 400);
    }

    const registrasi = await db.registrasi.update({
      where: { id },
      data: { status: "approved" },
    });

    // Approving only flips status — creating the actual Siswa/User account still
    // needs data this form never collects (NISN, NIK, tanggal lahir, kelas), so an
    // admin completes that via "Tambah Siswa" using this record as a starting point.
    return ok(registrasi, "Pendaftaran disetujui. Lanjutkan dengan membuat akun siswa.");
  } catch (e) {
    return handleApiError(e);
  }
}
