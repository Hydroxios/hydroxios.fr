import type { Metadata } from "next";
import PcbBackground from "../components/PcbBackground";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-[calc(100vh-76px)] bg-black text-white selection:bg-cyan-200 selection:text-black [--accent:#9b7cff]">
    <PcbBackground />
    <div className="pointer-events-none fixed inset-0 z-[1] bg-black/62" />
    <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_70%_30%,rgba(155,124,255,0.08),transparent_42%)]" />
    <main className="relative z-10">{children}</main>
  </div>;
}
