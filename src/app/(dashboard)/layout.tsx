import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { CommandPalette } from "@/components/shared/command-palette";
import { getSessionUser } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-[200px]">
        <Navbar user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
