"use client";

import { useState } from "react";
import { Tabs } from "@/components/dashboard/Tabs";
import { JadwalWeekView, type JadwalEntry } from "@/components/dashboard/JadwalWeekView";
import { NilaiSummary, type NilaiEntry } from "@/components/dashboard/NilaiSummary";

type ChildData = {
  siswa: { id: string; nama: string; nisn: string; kelas: { nama: string } };
  jadwal: JadwalEntry[];
  nilai: NilaiEntry[];
};

export function OrangTuaChildView({ data: childList }: { data: ChildData[] }) {
  const [selectedId, setSelectedId] = useState(childList[0]?.siswa.id ?? "");
  const selected = childList.find((c) => c.siswa.id === selectedId);

  if (childList.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Belum ada data anak yang terhubung dengan akun ini.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <label className="text-sm font-medium text-slate-700">Pilih Anak:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {childList.map((c) => (
            <option key={c.siswa.id} value={c.siswa.id}>
              {c.siswa.nama} ({c.siswa.kelas.nama})
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Nama: <span className="font-medium text-slate-700">{selected.siswa.nama}</span>
            </span>
            <span>
              Kelas: <span className="font-medium text-slate-700">{selected.siswa.kelas.nama}</span>
            </span>
            <span>
              NISN: <span className="font-medium text-slate-700">{selected.siswa.nisn}</span>
            </span>
          </div>

          <Tabs
            tabs={[
              {
                key: "jadwal",
                label: "Jadwal Pelajaran",
                content: <JadwalWeekView data={selected.jadwal} secondaryLabel="guru" />,
              },
              {
                key: "nilai",
                label: "Nilai",
                content: <NilaiSummary data={selected.nilai} />,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
