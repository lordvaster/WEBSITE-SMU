import { db } from "@/lib/db";
import { requireAdmin, ok, fail, handleApiError } from "@/lib/api-helpers";
import { nilaiSchema, calculateNilaiAkhir } from "@/lib/validations/nilai";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get("kelasId");
    const semester = searchParams.get("semester");
    const mapel = searchParams.get("mapel");
    const search = searchParams.get("search");

    const nilai = await db.nilai.findMany({
      where: {
        ...(semester ? { semester: Number(semester) } : {}),
        ...(mapel ? { mapel } : {}),
        siswa: {
          ...(kelasId ? { kelasId } : {}),
          ...(search
            ? {
                OR: [
                  { nama: { contains: search, mode: "insensitive" } },
                  { nisn: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      },
      include: { siswa: { include: { kelas: true } } },
      orderBy: { createdAt: "desc" },
    });

    return ok(nilai);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = nilaiSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Data tidak valid", 400, parsed.error.flatten());
    }
    const data = parsed.data;

    const existing = await db.nilai.findUnique({
      where: {
        siswaId_mapel_semester: { siswaId: data.siswaId, mapel: data.mapel, semester: data.semester },
      },
    });
    if (existing) {
      return fail("Nilai untuk siswa, mata pelajaran, dan semester ini sudah ada", 409);
    }

    // Every grade record needs an owning guru; prefer the teacher of that subject.
    const guru =
      (await db.guru.findFirst({ where: { mata_pelajaran: { has: data.mapel } } })) ??
      (await db.guru.findFirst());
    if (!guru) return fail("Belum ada data guru untuk mencatat nilai", 400);

    const nilai_akhir = calculateNilaiAkhir(data.nilai_harian, data.nilai_uts, data.nilai_uas);

    const nilai = await db.nilai.create({
      data: {
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
      include: { siswa: { include: { kelas: true } } },
    });

    return ok(nilai, "Nilai berhasil ditambahkan", 201);
  } catch (e) {
    return handleApiError(e);
  }
}
