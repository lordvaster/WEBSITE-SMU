"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, Pencil, Upload } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { calculateNilaiAkhir } from "@/lib/validations/nilai";

type KelasOption = { id: string; nama: string };

type Row = {
  siswa: { id: string; nisn: string; nama: string };
  nilai: {
    id: string;
    nilai_harian: number;
    nilai_uts: number | null;
    nilai_uas: number | null;
    nilai_akhir: number | null;
  } | null;
};

const IMPORT_COLUMNS = ["nisn", "mapel", "semester", "nilai_harian", "nilai_uts", "nilai_uas"];

export function GuruNilaiEditor({
  kelasOptions,
  mapelOptions,
}: {
  kelasOptions: KelasOption[];
  mapelOptions: string[];
}) {
  const [kelasId, setKelasId] = useState(kelasOptions[0]?.id ?? "");
  const [mapel, setMapel] = useState(mapelOptions[0] ?? "");
  const [semester, setSemester] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    if (!kelasId || !mapel) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ kelasId, mapel, semester: String(semester) });
      const res = await fetch(`/api/dashboard/guru/nilai?${params.toString()}`);
      const json = await res.json();
      if (json.success) setRows(json.data);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  }, [kelasId, mapel, semester]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    window.open(`/api/dashboard/guru/nilai/export?kelasId=${kelasId}`, "_blank");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {kelasOptions.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
        <select value={mapel} onChange={(e) => setMapel(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {mapelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value={1}>Semester 1</option>
          <option value={2}>Semester 2</option>
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Import Excel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">NISN</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Harian</th>
              <th className="px-4 py-3 font-medium">UTS</th>
              <th className="px-4 py-3 font-medium">UAS</th>
              <th className="px-4 py-3 font-medium">Nilai Akhir</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Memuat data...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Tidak ada siswa di kelas ini.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.siswa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.siswa.nisn}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.siswa.nama}</td>
                  <td className="px-4 py-3">{row.nilai?.nilai_harian ?? "-"}</td>
                  <td className="px-4 py-3">{row.nilai?.nilai_uts ?? "-"}</td>
                  <td className="px-4 py-3">{row.nilai?.nilai_uas ?? "-"}</td>
                  <td className="px-4 py-3 font-semibold">{row.nilai?.nilai_akhir ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing(row)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditNilaiDialog
          row={editing}
          mapel={mapel}
          semester={semester}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Nilai dari Excel"
        columns={IMPORT_COLUMNS}
        importUrl="/api/dashboard/guru/nilai/bulk-upload"
        onImported={load}
        normalizeRow={(raw) => {
          const get = (keys: string[]) => {
            for (const k of keys) {
              const found = Object.keys(raw).find((key) => key.toLowerCase() === k);
              if (found && raw[found] !== "") return String(raw[found]);
            }
            return "";
          };
          return {
            nisn: get(["nisn"]),
            mapel: get(["mapel", "mata_pelajaran", "mata pelajaran"]),
            semester: get(["semester"]),
            nilai_harian: get(["nilai_harian", "nilai harian"]),
            nilai_uts: get(["nilai_uts", "nilai uts"]),
            nilai_uas: get(["nilai_uas", "nilai uas"]),
          };
        }}
      />
    </div>
  );
}

function EditNilaiDialog({
  row,
  mapel,
  semester,
  onClose,
  onSaved,
}: {
  row: Row;
  mapel: string;
  semester: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [harian, setHarian] = useState(row.nilai?.nilai_harian ?? 0);
  const [uts, setUts] = useState(row.nilai?.nilai_uts ?? 0);
  const [uas, setUas] = useState(row.nilai?.nilai_uas ?? 0);
  const [saving, setSaving] = useState(false);

  const preview = calculateNilaiAkhir(harian, uts, uas);
  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/guru/nilai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswaId: row.siswa.id,
          mapel,
          semester,
          nilai_harian: harian,
          nilai_uts: uts,
          nilai_uas: uas,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan nilai");
        return;
      }
      toast.success(json.message || "Nilai berhasil disimpan");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent title={`Edit Nilai - ${row.siswa.nama}`} description={`${mapel} · Semester ${semester}`} className="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nilai Harian</label>
            <input
              type="number"
              min={0}
              max={100}
              value={harian}
              onChange={(e) => setHarian(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nilai UTS</label>
            <input
              type="number"
              min={0}
              max={100}
              value={uts}
              onChange={(e) => setUts(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nilai UAS</label>
            <input
              type="number"
              min={0}
              max={100}
              value={uas}
              onChange={(e) => setUas(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nilai Akhir (otomatis)</label>
            <div className="flex h-[38px] items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-700">
              {preview}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
