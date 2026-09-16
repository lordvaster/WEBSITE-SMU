"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export type NilaiEntry = {
  id: string;
  mapel: string;
  semester: number;
  nilai_harian: number;
  nilai_uts: number | null;
  nilai_uas: number | null;
  nilai_akhir: number | null;
};

export function NilaiSummary({ data }: { data: NilaiEntry[] }) {
  const [semester, setSemester] = useState<number | "all">("all");

  const filtered = useMemo(
    () => (semester === "all" ? data : data.filter((n) => n.semester === semester)),
    [data, semester]
  );

  const average = useMemo(() => {
    const values = filtered.map((n) => n.nilai_akhir ?? 0).filter((v) => v > 0);
    if (values.length === 0) return null;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
  }, [filtered]);

  const trendData = useMemo(() => {
    const mapelSet = Array.from(new Set(data.map((n) => n.mapel)));
    const semesters = Array.from(new Set(data.map((n) => n.semester))).sort();
    return semesters.map((s) => {
      const row: Record<string, number | string> = { semester: `Semester ${s}` };
      for (const mapel of mapelSet) {
        const entry = data.find((n) => n.semester === s && n.mapel === mapel);
        if (entry) row[mapel] = entry.nilai_akhir ?? 0;
      }
      return row;
    });
  }, [data]);

  const mapelList = useMemo(() => Array.from(new Set(data.map((n) => n.mapel))), [data]);
  const chartColors = ["#3B82F6", "#10B981", "#F97316", "#8B5CF6", "#EC4899", "#14B8A6"];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Semua Semester</option>
          <option value={1}>Semester 1</option>
          <option value={2}>Semester 2</option>
        </select>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Cetak / Unduh PDF
        </button>
      </div>

      {average !== null && (
        <div className="mt-4 inline-block rounded-xl border border-slate-200 bg-white px-5 py-3">
          <p className="text-xs text-slate-500">Rata-rata Nilai Akhir</p>
          <p className="text-2xl font-semibold text-slate-900">{average}</p>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Mata Pelajaran</th>
              <th className="px-4 py-3 font-medium">Semester</th>
              <th className="px-4 py-3 font-medium">Harian</th>
              <th className="px-4 py-3 font-medium">UTS</th>
              <th className="px-4 py-3 font-medium">UAS</th>
              <th className="px-4 py-3 font-medium">Nilai Akhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada nilai.
                </td>
              </tr>
            ) : (
              filtered.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{n.mapel}</td>
                  <td className="px-4 py-3">{n.semester}</td>
                  <td className="px-4 py-3">{n.nilai_harian}</td>
                  <td className="px-4 py-3">{n.nilai_uts ?? "-"}</td>
                  <td className="px-4 py-3">{n.nilai_uas ?? "-"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{n.nilai_akhir ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {trendData.length > 1 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 print:hidden">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Tren Nilai Antar Semester</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {mapelList.map((mapel, i) => (
                  <Line
                    key={mapel}
                    type="monotone"
                    dataKey={mapel}
                    stroke={chartColors[i % chartColors.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
