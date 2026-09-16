import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" href={null} showText={false} />
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">SMU</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sistem Informasi Akademik Sekolah
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
