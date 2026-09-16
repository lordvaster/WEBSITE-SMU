"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export type BeritaRow = {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  gambar: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt: string | null;
};

export function BeritaTable({
  data,
  loading,
  onEdit,
  onDelete,
  onPreview,
  toolbarActions,
}: {
  data: BeritaRow[];
  loading: boolean;
  onEdit: (row: BeritaRow) => void;
  onDelete: (row: BeritaRow) => void;
  onPreview: (row: BeritaRow) => void;
  toolbarActions: React.ReactNode;
}) {
  const columns = useMemo<ColumnDef<BeritaRow, unknown>[]>(
    () => [
      { accessorKey: "judul", header: "Judul" },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.isPublished ? "Published" : "Draft"),
        cell: ({ row }) => (
          <span
            className={
              row.original.isPublished
                ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600"
                : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600"
            }
          >
            {row.original.isPublished ? "Published" : "Draft"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Tanggal",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("id-ID"),
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button onClick={() => onPreview(row.original)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600" title="Preview">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(row.original)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600" title="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(row.original)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Hapus">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onPreview]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      searchPlaceholder="Cari judul berita..."
      emptyMessage="Belum ada berita."
      toolbarActions={toolbarActions}
    />
  );
}
