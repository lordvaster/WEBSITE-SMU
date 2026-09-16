"use client";

import { Plus, Trash2 } from "lucide-react";
import { HARI_LIST } from "@/lib/validations/jadwal";
import { colorForSubject } from "@/lib/subject-colors";

export type JadwalRow = {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mapel: string;
  ruangan: string;
  kelasId: string;
  guruId: string;
  kelas: { nama: string };
  guru: { nama: string };
};

export function JadwalCalendar({
  data,
  onAdd,
  onEdit,
  onDelete,
}: {
  data: JadwalRow[];
  onAdd: (hari: string) => void;
  onEdit: (row: JadwalRow) => void;
  onDelete: (row: JadwalRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {HARI_LIST.map((hari) => {
        const entries = data
          .filter((j) => j.hari === hari)
          .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

        return (
          <div key={hari} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">{hari}</h3>
              <button
                onClick={() => onAdd(hari)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                title={`Tambah jadwal ${hari}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {entries.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">Tidak ada jadwal</p>
              )}
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onEdit(entry)}
                  className={`group relative cursor-pointer rounded-lg border px-2.5 py-2 text-xs transition hover:shadow-sm ${colorForSubject(entry.mapel)}`}
                >
                  <p className="font-semibold">
                    {entry.jam_mulai}–{entry.jam_selesai}
                  </p>
                  <p className="mt-0.5 font-medium">{entry.mapel}</p>
                  <p className="opacity-80">{entry.kelas.nama}</p>
                  <p className="opacity-80">{entry.guru.nama}</p>
                  <p className="opacity-70">Ruang {entry.ruangan}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry);
                    }}
                    className="absolute right-1.5 top-1.5 hidden rounded-md bg-white/80 p-1 text-red-500 hover:bg-red-50 group-hover:block"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
