"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { BeritaTable, type BeritaRow } from "@/components/admin/berita/BeritaTable";
import { BeritaForm } from "@/components/admin/berita/BeritaForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AdminBeritaPage() {
  const [data, setData] = useState<BeritaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BeritaRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeritaRow | null>(null);
  const [previewTarget, setPreviewTarget] = useState<BeritaRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/berita");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      toast.error("Gagal memuat data berita");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/berita/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus berita");
      return;
    }
    toast.success(json.message);
    load();
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kelola Berita</h1>
        <p className="mt-1 text-sm text-slate-500">{data.length} berita</p>
      </div>

      <div className="mt-6">
        <BeritaTable
          data={data}
          loading={loading}
          onEdit={(row) => {
            setEditing(row);
            setFormOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
          onPreview={(row) => setPreviewTarget(row)}
          toolbarActions={
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Tambah Berita
            </button>
          }
        />
      </div>

      <BeritaForm open={formOpen} onOpenChange={setFormOpen} berita={editing} onSaved={load} />

      <Dialog open={!!previewTarget} onOpenChange={(v) => !v && setPreviewTarget(null)}>
        <DialogContent title={previewTarget?.judul ?? ""} className="max-w-2xl">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: previewTarget?.konten ?? "" }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        description={`Yakin ingin menghapus berita "${deleteTarget?.judul}"?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
