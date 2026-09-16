import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { ok, fail, handleApiError } from "@/lib/api-helpers";
import { registrasiSchema } from "@/lib/validations/registrasi";
import { sendRegistrationConfirmation } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    // Cap public form submissions per IP to keep the registration form from being spammed.
    if (!checkRateLimit(`registrasi:ip:${ip}`, 5, 24 * 60 * 60 * 1000)) {
      return fail("Batas pengajuan tercapai. Silakan coba lagi besok.", 429);
    }

    const body = await request.json();
    const parsed = registrasiSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.registrasi.findFirst({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return fail("Email ini sudah pernah digunakan untuk mendaftar", 409);
    }

    const token = randomUUID();

    const registrasi = await db.registrasi.create({
      data: {
        nama: data.nama,
        email: data.email.toLowerCase(),
        no_telepon: data.no_telepon,
        alamat: data.alamat,
        asal_sekolah: data.asal_sekolah,
        nilai_rata_rata: data.nilai_rata_rata,
        tahun_lulus: data.tahun_lulus,
        jurusan_diminati: data.jurusan_diminati,
        catatan: data.catatan || null,
        status: "pending",
        token_verifikasi: token,
        tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    sendRegistrationConfirmation(registrasi.email, registrasi.nama, token).catch((err) =>
      console.error("[email] registration confirmation failed:", err)
    );

    return ok(
      { id: registrasi.id },
      "Terima kasih! Silakan cek email Anda untuk konfirmasi.",
      201
    );
  } catch (e) {
    return handleApiError(e);
  }
}
