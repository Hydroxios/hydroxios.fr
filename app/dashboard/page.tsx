import { redirect } from "next/navigation";
import { adminSession } from "@/app/lib/admin-auth";
import CatalogEditor from "./CatalogEditor";

export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const session = await adminSession();
  if (!session) redirect("/dashboard/login");
  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
    <CatalogEditor userName={session.user?.name ?? "Hydroxios"} />
  </div>;
}
