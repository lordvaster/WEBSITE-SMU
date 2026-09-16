"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const REMEMBERED_EMAIL_KEY = "smu:rememberedEmail";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    try {
      const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (remembered) {
        setValue("email", remembered);
        setValue("remember", true);
      }
    } catch {
      // localStorage unavailable, ignore
    }
  }, [setValue]);

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setServerError("Email atau password salah");
        reset({ email: data.email, password: "", remember: data.remember });
        return;
      }

      try {
        if (data.remember) {
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
        } else {
          window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // localStorage unavailable, ignore
      }

      router.push("/redirect-after-login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className={cn(
            "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/30",
            errors.email
              ? "border-red-500 focus:border-red-500"
              : "border-slate-300 focus:border-primary-500"
          )}
          placeholder="nama@smu.co.id"
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className={cn(
            "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary-500/30",
            errors.password
              ? "border-red-500 focus:border-red-500"
              : "border-slate-300 focus:border-primary-500"
          )}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-slate-300" />
          Ingat saya
        </label>
        <a href="/lupa-password" className="font-medium text-primary-600 hover:underline">
          Lupa password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Calon siswa baru?{" "}
        <a href="/registrasi" className="font-medium text-primary-600 hover:underline">
          Daftar di sini
        </a>
      </p>
    </form>
  );
}
