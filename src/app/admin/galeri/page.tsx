"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { GaleriGrid, type GaleriRow } from "@/components/admin/galeri/GaleriGrid";
import { GaleriForm } from "@/components/admin/galeri/GaleriForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminGaleriPage() {
  const [data, setData] = useState<GaleriRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GaleriRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GaleriRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/galeri");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      toast.error("Gagal memuat data galeri");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/galeri/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus item galeri");
      return;
    }
    toast.success(json.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kelola Galeri</h1>
          <p className="mt-1 text-sm text-slate-500">{data.length} item galeri</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Tambah Item
        </button>
      </div>

      <div className="mt-6">
        <GaleriGrid
          data={data}
          loading={loading}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      </div>

      <GaleriForm open={formOpen} onOpenChange={setFormOpen} item={editing} onSaved={load} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus item "${deleteTarget?.judul}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
