"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Plus, Upload } from "lucide-react";
import { NilaiTable, type NilaiRow } from "@/components/admin/nilai/NilaiTable";
import { NilaiForm } from "@/components/admin/nilai/NilaiForm";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type KelasOption = { id: string; nama: string };
type SiswaOption = { id: string; nama: string; nisn: string; kelasId: string };

const MAPEL_OPTIONS = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS"];
const IMPORT_COLUMNS = ["nisn", "mapel", "semester", "nilai_harian", "nilai_uts", "nilai_uas"];

export default function AdminNilaiPage() {
  const [data, setData] = useState<NilaiRow[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterKelas, setFilterKelas] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterMapel, setFilterMapel] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NilaiRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NilaiRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterKelas) params.set("kelasId", filterKelas);
      if (filterSemester) params.set("semester", filterSemester);
      if (filterMapel) params.set("mapel", filterMapel);

      const [nilaiRes, kelasRes, siswaRes] = await Promise.all([
        fetch(`/api/admin/nilai?${params.toString()}`),
        fetch("/api/admin/kelas"),
        fetch("/api/admin/siswa"),
      ]);
      const nilaiJson = await nilaiRes.json();
      const kelasJson = await kelasRes.json();
      const siswaJson = await siswaRes.json();
      if (nilaiJson.success) setData(nilaiJson.data);
      if (kelasJson.success) setKelasOptions(kelasJson.data);
      if (siswaJson.success) setSiswaOptions(siswaJson.data);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  }, [filterKelas, filterSemester, filterMapel]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const values = data.map((n) => n.nilai_akhir ?? 0).filter((v) => v > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { avg: Math.round(avg * 100) / 100, max: Math.max(...values), min: Math.min(...values) };
  }, [data]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/nilai/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus nilai");
      return;
    }
    toast.success(json.message);
    load();
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterKelas) params.set("kelasId", filterKelas);
    if (filterSemester) params.set("semester", filterSemester);
    if (filterMapel) params.set("mapel", filterMapel);
    window.open(`/api/admin/nilai/export?${params.toString()}`, "_blank");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kelola Nilai</h1>
          <p className="mt-1 text-sm text-slate-500">{data.length} data nilai</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Rata-rata</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{stats.avg}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Tertinggi</p>
            <p className="mt-1 text-xl font-semibold text-green-600">{stats.max}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Terendah</p>
            <p className="mt-1 text-xl font-semibold text-red-500">{stats.min}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={filterKelas}
          onChange={(e) => setFilterKelas(e.target.value)}
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
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <select
          value={filterMapel}
          onChange={(e) => setFilterMapel(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Semua Mapel</option>
          {MAPEL_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <NilaiTable
          data={data}
          loading={loading}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
          toolbarActions={
            <>
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                Tambah Nilai
              </button>
            </>
          }
        />
      </div>

      <NilaiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        nilai={editing}
        siswaOptions={siswaOptions}
        mapelOptions={MAPEL_OPTIONS}
        onSaved={load}
      />

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Nilai dari Excel"
        columns={IMPORT_COLUMNS}
        importUrl="/api/admin/nilai/bulk-import"
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus nilai ${deleteTarget?.mapel} milik "${deleteTarget?.siswa.nama}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
