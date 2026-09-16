"use client";

import { Printer } from "lucide-react";
import { colorForSubject } from "@/lib/subject-colors";

export type JadwalEntry = {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mapel: string;
  ruangan: string;
  kelas?: { nama: string };
  guru?: { nama: string };
};

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function currentHariName(): string {
  const idx = new Date().getDay(); // 0 = Minggu
  return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][idx];
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function JadwalWeekView({
  data,
  emptyMessage = "Belum ada jadwal.",
  secondaryLabel,
}: {
  data: JadwalEntry[];
  emptyMessage?: string;
  /** Whether to show kelas or guru name as the secondary line on each card. */
  secondaryLabel: "kelas" | "guru";
}) {
  const today = currentHariName();
  const nowMin = nowMinutes();

  const nextClass = data
    .filter((j) => j.hari === today && timeToMinutes(j.jam_mulai) >= nowMin)
    .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))[0];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between print:hidden">
        {nextClass ? (
          <p className="text-sm text-slate-600">
            Kelas berikutnya hari ini:{" "}
            <span className="font-semibold text-blue-600">
              {nextClass.mapel} ({nextClass.jam_mulai})
            </span>
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Cetak / Unduh PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {HARI_LIST.map((hari) => {
          const entries = data
            .filter((j) => j.hari === hari)
            .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
          const isToday = hari === today;

          return (
            <div
              key={hari}
              className={`rounded-xl border bg-white p-3 ${isToday ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"}`}
            >
              <h3 className={`mb-3 text-sm font-semibold ${isToday ? "text-blue-600" : "text-slate-800"}`}>
                {hari} {isToday && <span className="text-xs font-normal">(Hari ini)</span>}
              </h3>
              <div className="space-y-2">
                {entries.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">{emptyMessage}</p>
                )}
                {entries.map((entry) => {
                  const isNext = nextClass?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={`rounded-lg border px-2.5 py-2 text-xs ${colorForSubject(entry.mapel)} ${isNext ? "ring-2 ring-blue-400" : ""}`}
                    >
                      <p className="font-semibold">
                        {entry.jam_mulai}–{entry.jam_selesai}
                      </p>
                      <p className="mt-0.5 font-medium">{entry.mapel}</p>
                      <p className="opacity-80">
                        {secondaryLabel === "kelas" ? entry.kelas?.nama : entry.guru?.nama}
                      </p>
                      <p className="opacity-70">Ruang {entry.ruangan}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
