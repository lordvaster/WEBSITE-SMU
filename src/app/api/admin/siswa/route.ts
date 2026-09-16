import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { siswaCreateSchema } from "@/lib/validations/siswa";
import { sendWelcomeSiswa } from "@/lib/email";

export async function GET() {
  try {
    await requireAdmin();

    const siswa = await db.siswa.findMany({
      include: { kelas: true, user: { select: { email: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
    });

    return ok(siswa);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = siswaCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const [existingNisn, existingEmail] = await Promise.all([
      db.siswa.findUnique({ where: { nisn: data.nisn } }),
      db.user.findUnique({ where: { email: data.email.toLowerCase() } }),
    ]);
    if (existingNisn) return fail("NISN sudah terdaftar", 409);
    if (existingEmail) return fail("Email sudah terdaftar", 409);

    const hashedPassword = await hashPassword(data.password);

    const siswa = await db.siswa.create({
      data: {
        nama: data.nama,
        nisn: data.nisn,
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
        user: {
          create: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            role: "siswa",
          },
        },
      },
      include: { kelas: true, user: { select: { email: true, isActive: true } } },
    });

    // Fire-and-forget: email delivery shouldn't block or fail the account creation.
    sendWelcomeSiswa({
      email: siswa.user.email,
      nama: siswa.nama,
      tempPassword: data.password,
      orangTuaEmail: siswa.orang_tua_email,
    }).catch((err) => console.error("[email] welcome siswa failed:", err));

    return ok(siswa, "Siswa berhasil ditambahkan", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
