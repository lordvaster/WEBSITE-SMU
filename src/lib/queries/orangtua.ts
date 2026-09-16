import { db } from "@/lib/db";

// Case-insensitive: a parent's login email is always normalized to lowercase, but
// `orang_tua_email` on Siswa is whatever an admin typed on the create/edit form and
// isn't normalized there — matching case-sensitively would silently break the link
// for any casing mismatch (e.g. "OrangTua1@Smu.co.id" vs "orangtua1@smu.co.id").
export async function getAnakByOrangTuaEmail(email: string) {
  return db.siswa.findMany({
    where: { orang_tua_email: { equals: email, mode: "insensitive" } },
    include: { kelas: true },
    orderBy: { nama: "asc" },
  });
}

/** Ownership check used before returning any per-child jadwal/nilai to an orang tua. */
export async function isAnakOfOrangTua(siswaId: string, orangTuaEmail: string): Promise<boolean> {
  const siswa = await db.siswa.findUnique({ where: { id: siswaId }, select: { orang_tua_email: true } });
  return !!siswa && siswa.orang_tua_email.toLowerCase() === orangTuaEmail.toLowerCase();
}
