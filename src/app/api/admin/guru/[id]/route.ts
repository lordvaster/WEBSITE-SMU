import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { guruUpdateSchema } from "@/lib/validations/guru";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = guruUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.guru.findUnique({ where: { id }, include: { user: true } });
    if (!existing) return fail("Guru tidak ditemukan", 404);

    if (data.email.toLowerCase() !== existing.user.email) {
      const emailTaken = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (emailTaken) return fail("Email sudah digunakan", 409);
    }

    const userUpdate: { email: string; password?: string } = { email: data.email.toLowerCase() };
    if (data.password) {
      userUpdate.password = await hashPassword(data.password);
    }

    const guru = await db.guru.update({
      where: { id },
      data: {
        nama: data.nama,
        gelar_depan: data.gelar_depan || null,
        gelar_belakang: data.gelar_belakang || null,
        mata_pelajaran: data.mata_pelajaran,
        alamat: data.alamat,
        no_telepon: data.no_telepon,
        user: { update: userUpdate },
      },
      include: { user: { select: { email: true, isActive: true } } },
    });

    return ok(guru, "Data guru berhasil diperbarui");
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await db.guru.findUnique({ where: { id } });
    if (!existing) return fail("Guru tidak ditemukan", 404);

    try {
      await db.user.delete({ where: { id: existing.userId } });
    } catch (err) {
      if (typeof err === "object" && err && "code" in err && err.code === "P2003") {
        return fail(
          "Guru tidak dapat dihapus karena masih memiliki jadwal atau nilai terkait. Hapus atau alihkan data tersebut terlebih dahulu.",
          409
        );
      }
      throw err;
    }
    return ok(null, "Guru berhasil dihapus");
  } catch (e) {
    return handleApiError(e);
  }
}
