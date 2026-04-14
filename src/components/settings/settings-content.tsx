"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSettings } from "./team-settings";
import { ProfileSettings } from "./profile-settings";
import { SecuritySettings } from "./security-settings";
import type { SessionUser } from "@/lib/auth/session";

interface SettingsContentProps {
  user: SessionUser;
}

export function SettingsContent({ user }: SettingsContentProps) {
  return (
    <Tabs defaultValue="team" className="space-y-6">
      <TabsList className="bg-transparent border-b border-gray-100 rounded-none h-auto p-0 gap-6">
        {["Profile", "Team", "Security", "Notifications"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab.toLowerCase()}
            className="rounded-none pb-3 px-0 text-sm font-medium text-gray-500 data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:shadow-none bg-transparent hover:text-gray-700 transition-colors"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="profile">
        <ProfileSettings user={user} />
      </TabsContent>
      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="notifications">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-500 text-sm">
          Notification preferences coming soon.
        </div>
      </TabsContent>
    </Tabs>
  );
}
