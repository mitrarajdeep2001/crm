"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth/session";

interface ProfileSettingsProps {
  user: SessionUser;
}

type Preferences = {
  emailNotifications: boolean;
  desktopNotifications: boolean;
  weeklyDigest: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const name = splitName(user.name);
  const [firstName, setFirstName] = useState(name.firstName);
  const [lastName, setLastName] = useState(name.lastName);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    desktopNotifications: false,
    weeklyDigest: true,
  });
  const initials = getInitials(`${firstName} ${lastName}`.trim() || user.name);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      try {
        const response = await fetch("/api/profile/preferences", { method: "GET" });
        const data = (await response.json()) as { preferences?: Preferences; error?: string };
        if (!response.ok || !data.preferences) {
          return;
        }
        if (isMounted) {
          setPreferences(data.preferences);
        }
      } catch {
        // Keep local defaults if loading fails.
      }
    }

    void loadPreferences();
    return () => {
      isMounted = false;
    };
  }, []);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch {
      toast.error("Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function onAvatarSelected(file: File) {
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string; avatar?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to upload profile image");
        return;
      }

      setAvatarUrl(data.avatar || null);
      toast.success("Profile photo updated");
      router.refresh();
    } catch {
      toast.error("Unable to upload profile image");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void onAvatarSelected(file);
    event.target.value = "";
  }

  async function savePreferences() {
    setIsSavingPreferences(true);

    try {
      const response = await fetch("/api/profile/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to save preferences");
        return;
      }

      toast.success("Preferences saved");
    } catch {
      toast.error("Unable to save preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h3>
        <form onSubmit={onSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={`${user.name} avatar`} /> : null}
              <AvatarFallback className="bg-indigo-600 text-white text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onFileChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                <Button variant="outline" size="sm" type="button" asChild disabled={isUploadingAvatar}>
                  <span>{isUploadingAvatar ? "Uploading..." : "Change Photo"}</span>
                </Button>
              </label>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} name="firstName" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} name="lastName" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} name="email" type="email" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
            <Input value={user.role.replace("_", " ")} readOnly className="bg-gray-50" />
          </div>
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="space-y-4">
          {[
            {
              key: "emailNotifications" as const,
              label: "Email notifications",
              desc: "Receive email updates about leads and deals",
            },
            {
              key: "desktopNotifications" as const,
              label: "Desktop notifications",
              desc: "Browser push notifications for real-time alerts",
            },
            {
              key: "weeklyDigest" as const,
              label: "Weekly digest",
              desc: "Weekly summary of your workspace activity",
            },
          ].map((pref) => (
            <div key={pref.label} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pref.desc}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((current) => ({
                    ...current,
                    [pref.key]: !current[pref.key],
                  }))
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  preferences[pref.key] ? "bg-indigo-600" : "bg-gray-200"
                }`}
                aria-label={pref.label}
                aria-pressed={preferences[pref.key]}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    preferences[pref.key] ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
          <Button
            type="button"
            onClick={savePreferences}
            disabled={isSavingPreferences}
            className="w-full mt-3"
          >
            {isSavingPreferences ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
