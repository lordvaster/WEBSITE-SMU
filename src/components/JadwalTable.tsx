"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, CalendarX } from "lucide-react";
import { colorForSubject } from "@/lib/subject-colors";

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

type KelasOption = { id: string; nama: string };
type GuruOption = { id: string; nama: string };

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function JadwalTable({
  kelasOptions,
  guruOptions,
}: {
  kelasOptions: KelasOption[];
  guruOptions: GuruOption[];
}) {
  const [kelasId, setKelasId] = useState("");
  const [guruId, setGuruId] = useState("");
  const [hari, setHari] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<JadwalItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [kelasId, guruId, hari, search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (kelasId) params.set("kelasId", kelasId);
    if (guruId) params.set("guruId", guruId);
    if (hari) params.set("hari", hari);
    if (search) params.set("search", search);
    params.set("page", String(page));

    fetch(`/api/jadwal?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [kelasId, guruId, hari, search, page]);

  const hasFilters = useMemo(
    () => kelasId || guruId || hari || search,
    [kelasId, guruId, hari, search]
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua Kelas</option>
          {kelasOptions.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>

        <select
          value={guruId}
          onChange={(e) => setGuruId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua Guru</option>
          {guruOptions.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nama}
            </option>
          ))}
        </select>

        <select
          value={hari}
          onChange={(e) => setHari(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua Hari</option>
          {HARI_LIST.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mata pelajaran..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{total} jadwal ditemukan</span>
        {hasFilters && (
          <button
            onClick={() => {
              setKelasId("");
              setGuruId("");
              setHari("");
              setSearch("");
            }}
            className="font-medium text-primary-600 hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Hari</th>
              <th className="px-4 py-3 font-medium">Jam</th>
              <th className="px-4 py-3 font-medium">Mata Pelajaran</th>
              <th className="px-4 py-3 font-medium">Kelas</th>
              <th className="px-4 py-3 font-medium">Guru</th>
              <th className="px-4 py-3 font-medium">Ruangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Memuat jadwal...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-14">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <CalendarX className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">Belum ada jadwal</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {hasFilters
                        ? "Tidak ada jadwal yang cocok dengan filter ini."
                        : "Jadwal akan muncul di sini setelah ditambahkan oleh admin."}
                    </p>
                    {hasFilters && (
                      <button
                        onClick={() => {
                          setKelasId("");
                          setGuruId("");
                          setHari("");
                          setSearch("");
                        }}
                        className="mt-3 text-sm font-medium text-primary-600 hover:underline"
                      >
                        Lihat semua jadwal
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((j, i) => (
                <tr
                  key={j.id}
                  className={`transition hover:bg-primary-50/60 ${i % 2 === 1 ? "bg-slate-50/60" : ""}`}
                >
                  <td className="px-4 py-3">{j.hari}</td>
                  <td className="px-4 py-3">
                    {j.jam_mulai}–{j.jam_selesai}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colorForSubject(j.mapel)}`}
                    >
                      {j.mapel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{j.kelasNama}</td>
                  <td className="px-4 py-3">{j.guruNama}</td>
                  <td className="px-4 py-3">{j.ruangan}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-slate-500">
            Halaman {page} dari {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
