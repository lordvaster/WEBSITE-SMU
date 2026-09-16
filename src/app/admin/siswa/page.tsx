"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { SiswaTable, type SiswaRow } from "@/components/admin/siswa/SiswaTable";
import { SiswaForm } from "@/components/admin/siswa/SiswaForm";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type KelasOption = { id: string; nama: string };

const IMPORT_COLUMNS = [
  "nisn",
  "nama",
  "email",
  "kelas",
  "nik",
  "tempat_lahir",
  "tanggal_lahir",
  "jenis_kelamin",
  "alamat",
  "no_telepon",
  "orang_tua_nama",
  "orang_tua_email",
  "orang_tua_telepon",
];

export default function AdminSiswaPage() {
  const [data, setData] = useState<SiswaRow[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SiswaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiswaRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [siswaRes, kelasRes] = await Promise.all([
        fetch("/api/admin/siswa"),
        fetch("/api/admin/kelas"),
      ]);
      const siswaJson = await siswaRes.json();
      const kelasJson = await kelasRes.json();
      if (siswaJson.success) setData(siswaJson.data);
      if (kelasJson.success) setKelasOptions(kelasJson.data);
    } catch {
      toast.error("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/siswa/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus siswa");
      return;
    }
    toast.success(json.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kelola Siswa</h1>
          <p className="mt-1 text-sm text-slate-500">{data.length} siswa terdaftar</p>
        </div>
      </div>

      <div className="mt-6">
        <SiswaTable
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
                Tambah Siswa
              </button>
            </>
          }
        />
      </div>

      <SiswaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        siswa={editing}
        kelasOptions={kelasOptions}
        onSaved={load}
      />

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Siswa dari Excel"
        columns={IMPORT_COLUMNS}
        importUrl="/api/admin/siswa/bulk-import"
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
            nama: get(["nama"]),
            email: get(["email"]),
            kelas: get(["kelas"]),
            nik: get(["nik"]),
            tempat_lahir: get(["tempat_lahir", "tempat lahir"]),
            tanggal_lahir: get(["tanggal_lahir", "tanggal lahir"]),
            jenis_kelamin: get(["jenis_kelamin", "jenis kelamin"]),
            alamat: get(["alamat"]),
            no_telepon: get(["no_telepon", "no telepon", "telepon"]),
            orang_tua_nama: get(["orang_tua_nama", "orang tua nama"]),
            orang_tua_email: get(["orang_tua_email", "orang tua email"]),
            orang_tua_telepon: get(["orang_tua_telepon", "orang tua telepon"]),
          };
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus siswa "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
