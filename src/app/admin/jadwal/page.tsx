"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { JadwalCalendar, type JadwalRow } from "@/components/admin/jadwal/JadwalCalendar";
import { JadwalForm } from "@/components/admin/jadwal/JadwalForm";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type KelasOption = { id: string; nama: string };
type GuruOption = { id: string; nama: string; mata_pelajaran: string[] };

const IMPORT_COLUMNS = ["hari", "jam_mulai", "jam_selesai", "mapel", "kelas", "guru", "ruangan"];

export default function AdminJadwalPage() {
  const [data, setData] = useState<JadwalRow[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JadwalRow | null>(null);
  const [defaultHari, setDefaultHari] = useState("Senin");
  const [deleteTarget, setDeleteTarget] = useState<JadwalRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jadwalRes, kelasRes, guruRes] = await Promise.all([
        fetch("/api/admin/jadwal"),
        fetch("/api/admin/kelas"),
        fetch("/api/admin/guru"),
      ]);
      const jadwalJson = await jadwalRes.json();
      const kelasJson = await kelasRes.json();
      const guruJson = await guruRes.json();
      if (jadwalJson.success) setData(jadwalJson.data);
      if (kelasJson.success) setKelasOptions(kelasJson.data);
      if (guruJson.success) setGuruOptions(guruJson.data);
    } catch {
      toast.error("Gagal memuat data jadwal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/jadwal/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus jadwal");
      return;
    }
    toast.success(json.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kelola Jadwal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Klik ikon + di setiap hari untuk menambah jadwal, klik entri untuk mengubah.
          </p>
        </div>
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat jadwal...
          </div>
        ) : (
          <JadwalCalendar
            data={data}
            onAdd={(hari) => {
              setEditing(null);
              setDefaultHari(hari);
              setFormOpen(true);
            }}
            onEdit={(row) => {
              setEditing(row);
              setFormOpen(true);
            }}
            onDelete={(row) => setDeleteTarget(row)}
          />
        )}
      </div>

      <JadwalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        jadwal={editing}
        defaultHari={defaultHari}
        kelasOptions={kelasOptions}
        guruOptions={guruOptions}
        onSaved={load}
      />

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Jadwal dari Excel"
        columns={IMPORT_COLUMNS}
        importUrl="/api/admin/jadwal/bulk-import"
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
            hari: get(["hari"]),
            jam_mulai: get(["jam_mulai", "jam mulai"]),
            jam_selesai: get(["jam_selesai", "jam selesai"]),
            mapel: get(["mapel", "mata_pelajaran", "mata pelajaran"]),
            kelas: get(["kelas"]),
            guru: get(["guru"]),
            ruangan: get(["ruangan"]),
          };
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus jadwal "${deleteTarget?.mapel}" pada ${deleteTarget?.hari}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
