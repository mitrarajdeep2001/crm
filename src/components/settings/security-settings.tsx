"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Key, Monitor } from "lucide-react";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
            <Key className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Password updated!");
          }}
          className="space-y-4 max-w-md"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Password</label>
            <Input type="password" name="currentPassword" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
            <Input type="password" name="newPassword" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
            <Input type="password" name="confirmPassword" placeholder="••••••••" />
          </div>
          <Button type="submit">Update Password</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Authenticator App</p>
            <p className="text-xs text-gray-500">Use an authenticator app to get verification codes</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("2FA setup coming soon!")}>
            Enable
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
            <Monitor className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Active Sessions</h3>
            <p className="text-sm text-gray-500">Manage devices that are currently signed in</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { device: "MacBook Pro — Chrome", location: "New York, US", current: true },
            { device: "iPhone 15 — Safari", location: "New York, US", current: false },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{session.device}</p>
                  {session.current && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{session.location}</p>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => toast.error("Session revoked")}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
