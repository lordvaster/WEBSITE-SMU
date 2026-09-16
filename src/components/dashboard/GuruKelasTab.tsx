"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type KelasRow = { id: string; nama: string; jumlahSiswa: number };
type SiswaRow = { id: string; nisn: string; nama: string };

export function GuruKelasTab({ kelas }: { kelas: KelasRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [siswaByKelas, setSiswaByKelas] = useState<Record<string, SiswaRow[]>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (kelasId: string) => {
    if (expanded === kelasId) {
      setExpanded(null);
      return;
    }
    setExpanded(kelasId);
    if (!siswaByKelas[kelasId]) {
      setLoading(kelasId);
      const res = await fetch(`/api/dashboard/guru/kelas/${kelasId}/siswa`);
      const json = await res.json();
      if (json.success) {
        setSiswaByKelas((prev) => ({ ...prev, [kelasId]: json.data }));
      }
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {kelas.length === 0 && (
        <p className="text-sm text-slate-400">Anda belum memiliki kelas yang diajar.</p>
      )}
      {kelas.map((k) => (
        <div key={k.id} className="rounded-xl border border-slate-200 bg-white">
          <button
            onClick={() => toggle(k.id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <p className="font-medium text-slate-800">{k.nama}</p>
              <p className="text-sm text-slate-500">{k.jumlahSiswa} siswa</p>
            </div>
            {expanded === k.id ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {expanded === k.id && (
            <div className="border-t border-slate-100 px-5 py-3">
              {loading === k.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <div className="space-y-1.5">
                  {(siswaByKelas[k.id] ?? []).map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-slate-700">{s.nama}</span>
                      <span className="text-slate-400">{s.nisn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
