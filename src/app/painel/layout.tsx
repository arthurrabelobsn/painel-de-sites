import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const name = user.name;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar name={name} />
      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
