import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { guruCreateSchema } from "@/lib/validations/guru";

export async function GET() {
  try {
    await requireAdmin();
    const guru = await db.guru.findMany({
      include: { user: { select: { email: true, isActive: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(guru);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = guruCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const [existingNip, existingEmail] = await Promise.all([
      db.guru.findUnique({ where: { nip: data.nip } }),
      db.user.findUnique({ where: { email: data.email.toLowerCase() } }),
    ]);
    if (existingNip) return fail("NIP sudah terdaftar", 409);
    if (existingEmail) return fail("Email sudah terdaftar", 409);

    const hashedPassword = await hashPassword(data.password);

    const guru = await db.guru.create({
      data: {
        nama: data.nama,
        nip: data.nip,
        gelar_depan: data.gelar_depan || null,
        gelar_belakang: data.gelar_belakang || null,
        mata_pelajaran: data.mata_pelajaran,
        alamat: data.alamat,
        no_telepon: data.no_telepon,
        user: {
          create: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            role: "guru",
          },
        },
      },
      include: { user: { select: { email: true, isActive: true } } },
    });

    return ok(guru, "Guru berhasil ditambahkan", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
