import type { ReactNode } from "react";
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24">
      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">{children}</main>
    </div>
  );
}
