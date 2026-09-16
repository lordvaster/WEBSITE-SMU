"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { GuruTable, type GuruRow } from "@/components/admin/guru/GuruTable";
import { GuruForm } from "@/components/admin/guru/GuruForm";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const IMPORT_COLUMNS = ["nip", "nama", "email", "mata_pelajaran", "no_telepon", "alamat"];

export default function AdminGuruPage() {
  const [data, setData] = useState<GuruRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GuruRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GuruRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guru");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      toast.error("Gagal memuat data guru");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/guru/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus guru");
      return;
    }
    toast.success(json.message);
    load();
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kelola Guru</h1>
        <p className="mt-1 text-sm text-slate-500">{data.length} guru terdaftar</p>
      </div>

      <div className="mt-6">
        <GuruTable
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
                Tambah Guru
              </button>
            </>
          }
        />
      </div>

      <GuruForm open={formOpen} onOpenChange={setFormOpen} guru={editing} onSaved={load} />

      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Guru dari Excel"
        columns={IMPORT_COLUMNS}
        importUrl="/api/admin/guru/bulk-import"
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
            nip: get(["nip"]),
            nama: get(["nama"]),
            email: get(["email"]),
            mata_pelajaran: get(["mata_pelajaran", "mata pelajaran"]),
            no_telepon: get(["no_telepon", "no telepon", "telepon"]),
            alamat: get(["alamat"]),
          };
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus guru "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
