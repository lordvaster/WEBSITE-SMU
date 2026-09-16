import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { generatePassword } from "@/lib/text";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";

const rowSchema = z.object({
  nip: z.string().min(1),
  nama: z.string().min(1),
  email: z.string().email(),
  mata_pelajaran: z.string().min(1),
  no_telepon: z.string().optional().default("-"),
  alamat: z.string().optional().default("-"),
});

type RowResult = { row: number; nip?: string; success: boolean; error?: string };

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    if (rows.length === 0) return fail("Tidak ada data untuk diimpor", 400);

    const results: RowResult[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const parsed = rowSchema.safeParse(rows[i]);
      if (!parsed.success) {
        results.push({
          row: rowNumber,
          nip: rows[i]?.nip,
          success: false,
          error: parsed.error.issues.map((iss) => iss.message).join(", "),
        });
        continue;
      }
      const data = parsed.data;

      try {
        const [existingNip, existingEmail] = await Promise.all([
          db.guru.findUnique({ where: { nip: data.nip } }),
          db.user.findUnique({ where: { email: data.email.toLowerCase() } }),
        ]);
        if (existingNip) throw new Error("NIP sudah terdaftar");
        if (existingEmail) throw new Error("Email sudah terdaftar");

        const password = await hashPassword(generatePassword());
        const mapel = data.mata_pelajaran.split(/[,;]/).map((m) => m.trim()).filter(Boolean);

        await db.guru.create({
          data: {
            nama: data.nama,
            nip: data.nip,
            mata_pelajaran: mapel,
            alamat: data.alamat,
            no_telepon: data.no_telepon,
            user: {
              create: { email: data.email.toLowerCase(), password, role: "guru" },
            },
          },
        });

        successCount++;
        results.push({ row: rowNumber, nip: data.nip, success: true });
      } catch (err) {
        results.push({
          row: rowNumber,
          nip: data.nip,
          success: false,
          error: err instanceof Error ? err.message : "Gagal menyimpan data",
        });
      }
    }

    return ok(
      { total: rows.length, success: successCount, failed: rows.length - successCount, results },
      `${successCount} dari ${rows.length} guru berhasil diimpor`
    );
  } catch (e) {
    return handleApiError(e);
  }
}
