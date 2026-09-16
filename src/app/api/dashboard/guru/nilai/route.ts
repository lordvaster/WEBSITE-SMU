import { db } from "@/lib/db";
import { requireRole, ok, fail, handleApiError } from "@/lib/api-helpers";
import { getGuruByUserId, guruTeachesKelas, getSiswaInKelas } from "@/lib/queries/guru";
import { nilaiSchema, calculateNilaiAkhir } from "@/lib/validations/nilai";
import { sendNilaiUpdate } from "@/lib/email";

async function assertOwnership(guru: { id: string; mata_pelajaran: string[] }, kelasId: string, mapel: string) {
  const owns = await guruTeachesKelas(guru.id, kelasId);
  if (!owns) throw new Error("FORBIDDEN_KELAS");
  if (!guru.mata_pelajaran.includes(mapel)) throw new Error("FORBIDDEN_MAPEL");
}

export async function GET(request: Request) {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get("kelasId");
    const mapel = searchParams.get("mapel");
    const semester = Number(searchParams.get("semester") ?? "1");

    if (!kelasId || !mapel) return fail("kelasId dan mapel wajib diisi", 400);

    try {
      await assertOwnership(guru, kelasId, mapel);
    } catch {
      return fail("Anda tidak memiliki akses untuk kelas/mapel ini", 403);
    }

    const siswaList = await getSiswaInKelas(kelasId);
    const nilaiList = await db.nilai.findMany({
      where: { siswaId: { in: siswaList.map((s) => s.id) }, mapel, semester },
    });
    const nilaiBySiswa = new Map(nilaiList.map((n) => [n.siswaId, n]));

    const rows = siswaList.map((s) => ({
      siswa: { id: s.id, nisn: s.nisn, nama: s.nama },
      nilai: nilaiBySiswa.get(s.id) ?? null,
    }));

    return ok(rows);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireRole("guru");
    const guru = await getGuruByUserId(session.user.id);
    if (!guru) return fail("Data guru tidak ditemukan", 404);

    const body = await request.json();
    const parsed = nilaiSchema.safeParse(body);
    if (!parsed.success) return fail("Data tidak valid", 400, parsed.error.flatten());
    const data = parsed.data;

    const siswa = await db.siswa.findUnique({ where: { id: data.siswaId } });
    if (!siswa) return fail("Siswa tidak ditemukan", 404);

    try {
      await assertOwnership(guru, siswa.kelasId, data.mapel);
    } catch {
      return fail("Anda tidak memiliki akses untuk siswa/mapel ini", 403);
    }

    const nilai_akhir = calculateNilaiAkhir(data.nilai_harian, data.nilai_uts, data.nilai_uas);

    const nilai = await db.nilai.upsert({
      where: {
        siswaId_mapel_semester: { siswaId: data.siswaId, mapel: data.mapel, semester: data.semester },
      },
      update: {
        nilai_harian: data.nilai_harian,
        nilai_uts: data.nilai_uts,
        nilai_uas: data.nilai_uas,
        nilai_akhir,
        keterangan: data.keterangan || null,
      },
      create: {
        siswaId: data.siswaId,
        mapel: data.mapel,
        semester: data.semester,
        nilai_harian: data.nilai_harian,
        nilai_uts: data.nilai_uts,
        nilai_uas: data.nilai_uas,
        nilai_akhir,
        keterangan: data.keterangan || null,
        guruId: guru.id,
      },
    });

    const siswaWithUser = await db.siswa.findUnique({
      where: { id: data.siswaId },
      include: { user: { select: { email: true } } },
    });
    if (siswaWithUser) {
      sendNilaiUpdate({
        siswaEmail: siswaWithUser.user.email,
        orangTuaEmail: siswaWithUser.orang_tua_email,
        namaSiswa: siswaWithUser.nama,
        mapel: data.mapel,
        semester: data.semester,
        nilaiAkhir: nilai_akhir,
      }).catch((err) => console.error("[email] nilai update failed:", err));
    }

    return ok(nilai, "Nilai berhasil disimpan");
  } catch (e) {
    return handleApiError(e);
  }
}
