"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export type NilaiRow = {
  id: string;
  mapel: string;
  semester: number;
  nilai_harian: number;
  nilai_uts: number | null;
  nilai_uas: number | null;
  nilai_akhir: number | null;
  siswaId: string;
  siswa: { nama: string; nisn: string; kelas: { nama: string } };
};

export function NilaiTable({
  data,
  loading,
  onEdit,
  onDelete,
  toolbarActions,
}: {
  data: NilaiRow[];
  loading: boolean;
  onEdit: (row: NilaiRow) => void;
  onDelete: (row: NilaiRow) => void;
  toolbarActions: React.ReactNode;
}) {
  const columns = useMemo<ColumnDef<NilaiRow, unknown>[]>(
    () => [
      {
        id: "nisn",
        header: "NISN",
        accessorFn: (row) => row.siswa.nisn,
      },
      {
        id: "nama",
        header: "Nama Siswa",
        accessorFn: (row) => row.siswa.nama,
      },
      {
        id: "kelas",
        header: "Kelas",
        accessorFn: (row) => row.siswa.kelas.nama,
      },
      { accessorKey: "mapel", header: "Mata Pelajaran" },
      { accessorKey: "nilai_harian", header: "Harian" },
      { accessorKey: "nilai_uts", header: "UTS" },
      { accessorKey: "nilai_uas", header: "UAS" },
      {
        accessorKey: "nilai_akhir",
        header: "Nilai Akhir",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">{row.original.nilai_akhir}</span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(row.original)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      searchPlaceholder="Cari nama siswa, NISN..."
      emptyMessage="Belum ada data nilai."
      toolbarActions={toolbarActions}
    />
  );
}
