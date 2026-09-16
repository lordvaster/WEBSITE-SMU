import Link from "next/link";
import { GraduationCap } from "lucide-react";

const sizeMap = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-base" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", text: "text-lg" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7", text: "text-2xl" },
};

export function Logo({
  size = "md",
  href = "/",
  showText = true,
}: {
  size?: keyof typeof sizeMap;
  href?: string | null;
  showText?: boolean;
}) {
  const s = sizeMap[size];
  const content = (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex ${s.box} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-sm`}
      >
        <GraduationCap className={s.icon} strokeWidth={2.25} />
      </span>
      {showText && (
        <span className={`${s.text} font-bold tracking-tight text-slate-900`}>
          SMU
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
