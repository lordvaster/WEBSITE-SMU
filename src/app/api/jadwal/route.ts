import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";
import { JADWAL_CACHE_KEY as CACHE_KEY } from "@/lib/cache-keys";

const CACHE_TTL_SECONDS = 3600;
const PAGE_SIZE = 50;

const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type JadwalItem = {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mapel: string;
  ruangan: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
};

async function getAllJadwal(): Promise<JadwalItem[]> {
  const cached = await cacheGet<JadwalItem[]>(CACHE_KEY);
  if (cached) return cached;

  const rows = await db.jadwal.findMany({
    select: {
      id: true,
      hari: true,
      jam_mulai: true,
      jam_selesai: true,
      mapel: true,
      ruangan: true,
      kelasId: true,
      kelas: { select: { nama: true } },
      guruId: true,
      guru: { select: { nama: true } },
    },
  });

  const result: JadwalItem[] = rows.map((r) => ({
    id: r.id,
    hari: r.hari,
    jam_mulai: r.jam_mulai,
    jam_selesai: r.jam_selesai,
    mapel: r.mapel,
    ruangan: r.ruangan,
    kelasId: r.kelasId,
    kelasNama: r.kelas.nama,
    guruId: r.guruId,
    guruNama: r.guru.nama,
  }));

  await cacheSet(CACHE_KEY, result, CACHE_TTL_SECONDS);
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId") ?? "";
  const guruId = searchParams.get("guruId") ?? "";
  const hari = searchParams.get("hari") ?? "";
  const search = (searchParams.get("search") ?? "").toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  let items = await getAllJadwal();

  if (kelasId) items = items.filter((j) => j.kelasId === kelasId);
  if (guruId) items = items.filter((j) => j.guruId === guruId);
  if (hari) items = items.filter((j) => j.hari === hari);
  if (search) items = items.filter((j) => j.mapel.toLowerCase().includes(search));

  items = items.sort((a, b) => {
    const hariDiff = HARI_ORDER.indexOf(a.hari) - HARI_ORDER.indexOf(b.hari);
    if (hariDiff !== 0) return hariDiff;
    return a.jam_mulai.localeCompare(b.jam_mulai);
  });

  const total = items.length;
  const start = (page - 1) * PAGE_SIZE;
  const paginated = items.slice(start, start + PAGE_SIZE);

  return NextResponse.json({
    items: paginated,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
