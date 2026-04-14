import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ProfileSettings } from "@/components/settings/profile-settings";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account details and personal preferences.
        </p>
      </div>
      <ProfileSettings user={user} />
    </div>
  );
}
