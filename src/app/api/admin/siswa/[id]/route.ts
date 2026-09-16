import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { siswaUpdateSchema } from "@/lib/validations/siswa";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const siswa = await db.siswa.findUnique({
      where: { id },
      include: { kelas: true, user: { select: { email: true, isActive: true } } },
    });
    if (!siswa) return fail("Siswa tidak ditemukan", 404);
    return ok(siswa);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = siswaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.siswa.findUnique({ where: { id }, include: { user: true } });
    if (!existing) return fail("Siswa tidak ditemukan", 404);

    if (data.email.toLowerCase() !== existing.user.email) {
      const emailTaken = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (emailTaken) return fail("Email sudah digunakan", 409);
    }

    const userUpdate: { email: string; password?: string } = { email: data.email.toLowerCase() };
    if (data.password) {
      userUpdate.password = await hashPassword(data.password);
    }

    const siswa = await db.siswa.update({
      where: { id },
      data: {
        nama: data.nama,
        nik: data.nik,
        tempat_lahir: data.tempat_lahir,
        tanggal_lahir: new Date(data.tanggal_lahir),
        jenis_kelamin: data.jenis_kelamin,
        alamat: data.alamat,
        no_telepon: data.no_telepon,
        orang_tua_nama: data.orang_tua_nama,
        orang_tua_email: data.orang_tua_email.toLowerCase(),
        orang_tua_telepon: data.orang_tua_telepon,
        kelas: { connect: { id: data.kelasId } },
        user: { update: userUpdate },
      },
      include: { kelas: true, user: { select: { email: true, isActive: true } } },
    });

    return ok(siswa, "Data siswa berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.siswa.findUnique({ where: { id } });
    if (!existing) return fail("Siswa tidak ditemukan", 404);

    // Deleting the linked User cascades to the Siswa record (see schema onDelete: Cascade).
    await db.user.delete({ where: { id: existing.userId } });
    return ok(null, "Siswa berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
