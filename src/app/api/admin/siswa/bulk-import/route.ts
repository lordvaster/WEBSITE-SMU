import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generatePassword } from "@/lib/text";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

const rowSchema = z.object({
  nisn: z.string().min(1),
  nama: z.string().min(1),
  email: z.string().email(),
  nik: z.string().optional().default(""),
  kelas: z.string().min(1),
  tempat_lahir: z.string().optional().default("-"),
  tanggal_lahir: z.string().optional().default(""),
  jenis_kelamin: z.string().optional().default("L"),
  alamat: z.string().optional().default("-"),
  no_telepon: z.string().optional().default("-"),
  orang_tua_nama: z.string().min(1),
  orang_tua_email: z.string().email(),
  orang_tua_telepon: z.string().optional().default("-"),
});

type RowResult = { row: number; nisn?: string; success: boolean; error?: string };

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return fail("Tidak ada data untuk diimpor", 400);

    const kelasList = await db.kelas.findMany();
    const kelasByName = new Map(kelasList.map((k) => [k.nama.toLowerCase().trim(), k]));

    const results: RowResult[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // account for header row
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({
          row: rowNumber,
          nisn: rows[i]?.nisn,
          success: false,
          error: parsed.error.issues.map((iss) => iss.message).join(", "),
        });
        continue;
      }
      const data = parsed.data;

      try {
        const kelas = kelasByName.get(data.kelas.toLowerCase().trim());
        if (!kelas) {
          throw new Error(`Kelas "${data.kelas}" tidak ditemukan`);
        }

        const [existingNisn, existingEmail] = await Promise.all([
          db.siswa.findUnique({ where: { nisn: data.nisn } }),
          db.user.findUnique({ where: { email: data.email.toLowerCase() } }),
        ]);
        if (existingNisn) throw new Error("NISN sudah terdaftar");
        if (existingEmail) throw new Error("Email sudah terdaftar");

        const password = await hashPassword(generatePassword());
        const tanggalLahir = data.tanggal_lahir ? new Date(data.tanggal_lahir) : new Date("2008-01-01");

        await db.siswa.create({
          data: {
            nama: data.nama,
            nisn: data.nisn,
            nik: data.nik || "0".repeat(16),
            tempat_lahir: data.tempat_lahir,
            tanggal_lahir: tanggalLahir,
            jenis_kelamin: data.jenis_kelamin === "P" ? "P" : "L",
            alamat: data.alamat,
            no_telepon: data.no_telepon,
            orang_tua_nama: data.orang_tua_nama,
            orang_tua_email: data.orang_tua_email.toLowerCase(),
            orang_tua_telepon: data.orang_tua_telepon,
            kelas: { connect: { id: kelas.id } },
            user: {
              create: {
                email: data.email.toLowerCase(),
                password,
                role: "siswa",
              },
            },
          },
        });

        successCount++;
        results.push({ row: rowNumber, nisn: data.nisn, success: true });
      } catch (err) {
        results.push({
          row: rowNumber,
          nisn: data.nisn,
          success: false,
          error: err instanceof Error ? err.message : "Gagal menyimpan data",
        });
      }
    }

    return ok(
      { total: rows.length, success: successCount, failed: rows.length - successCount, results },
      `${successCount} dari ${rows.length} siswa berhasil diimpor`
    );
  } catch (e) {
    return handleApiError(e);
  }
}
