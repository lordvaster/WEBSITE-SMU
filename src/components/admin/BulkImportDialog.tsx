"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ImportRowResult = { row: number; success: boolean; error?: string; [key: string]: unknown };

export function BulkImportDialog({
  open,
  onOpenChange,
  title,
  columns,
  importUrl,
  normalizeRow,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  columns: string[];
  importUrl: string;
  normalizeRow: (raw: Record<string, unknown>) => Record<string, unknown>;
  onImported: () => void;
}) {
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    success: number;
    failed: number;
    results: ImportRowResult[];
  } | null>(null);

  const reset = () => {
    setPreview([]);
    setFileName("");
    setResult(null);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const normalized = rows.map(normalizeRow);
      setPreview(normalized);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch(importUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Impor gagal");
        return;
      }
      setResult(json.data);
      if (json.data.success > 0) {
        onImported();
      }
      toast.success(json.message);
    } catch {
      toast.error("Terjadi kesalahan saat mengimpor data");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      Object.fromEntries(columns.map((c) => [c, ""])),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template-import.xlsx");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent title={title} description="Unggah file Excel (.xlsx) untuk impor data secara massal." className="max-w-2xl">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">
              Kolom yang diharapkan: <span className="font-medium text-slate-700">{columns.join(", ")}</span>
            </span>
            <button onClick={downloadTemplate} className="font-medium text-blue-500 hover:underline">
              Unduh template
            </button>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center hover:border-blue-400">
            <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            <span className="text-sm text-slate-500">
              {fileName || "Klik untuk memilih file .xlsx"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {preview.length > 0 && !result && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Pratinjau ({preview.length} baris)
              </p>
              <div className="max-h-56 overflow-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="whitespace-nowrap px-3 py-2 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="whitespace-nowrap px-3 py-2">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div>
              <div className="flex gap-4 rounded-lg bg-slate-50 p-3 text-sm">
                <span className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> {result.success} berhasil
                </span>
                <span className="flex items-center gap-1.5 text-red-600">
                  <XCircle className="h-4 w-4" /> {result.failed} gagal
                </span>
              </div>
              {result.failed > 0 && (
                <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-slate-200 text-xs">
                  {result.results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <div key={r.row} className="border-b border-slate-100 px-3 py-1.5 last:border-0">
                        Baris {r.row}: <span className="text-red-600">{r.error}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Tutup
            </button>
            {!result && (
              <button
                type="button"
                disabled={preview.length === 0 || importing}
                onClick={handleImport}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
              >
                {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                Impor {preview.length > 0 && `(${preview.length})`}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
