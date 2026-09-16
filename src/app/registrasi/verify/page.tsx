import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { db } from "@/lib/db";

async function verifyToken(token: string | undefined) {
  if (!token) return { success: false, message: "Token tidak valid." };

  const registrasi = await db.registrasi.findUnique({ where: { token_verifikasi: token } });
  if (!registrasi) {
    return { success: false, message: "Token tidak ditemukan atau sudah digunakan." };
  }
  if (registrasi.isVerified) {
    return { success: true, message: "Email sudah terverifikasi sebelumnya. Menunggu persetujuan dari admin." };
  }
  if (registrasi.tokenExpiresAt < new Date()) {
    return { success: false, message: "Token sudah kedaluwarsa. Silakan daftar ulang." };
  }

  await db.registrasi.update({ where: { id: registrasi.id }, data: { isVerified: true } });
  return { success: true, message: "Email berhasil diverifikasi. Menunggu persetujuan dari admin." };
}

export default async function VerifyRegistrasiPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyToken(token);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        {result.success ? (
          <CheckCircle2 className="mb-4 h-14 w-14 text-green-500" />
        ) : (
          <XCircle className="mb-4 h-14 w-14 text-red-500" />
        )}
        <h1 className="text-xl font-semibold text-slate-900">
          {result.success ? "Verifikasi Berhasil" : "Verifikasi Gagal"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{result.message}</p>
        <Link href="/" className="mt-6 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
