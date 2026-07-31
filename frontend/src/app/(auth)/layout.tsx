import { ReactNode } from "react";
import { GlassHover } from "@/components/shared/animations";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md">
        <GlassHover>
          <div className="flex flex-col gap-6 rounded-2xl bg-surface/50 p-6 sm:p-10 shadow-elevation-high backdrop-blur-xl border border-white/[0.08] dark:border-white/[0.05]">
            {children}
          </div>
        </GlassHover>
      </div>
    </div>
  );
}
