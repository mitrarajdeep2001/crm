import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/settings/settings-content";
import { getSessionUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workspace Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your team preferences, security protocols, and integration controls for the Curator CRM ecosystem.
        </p>
      </div>
      <SettingsContent user={user} />
    </div>
  );
}
