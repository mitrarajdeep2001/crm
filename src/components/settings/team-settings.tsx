"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export function TeamSettings() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members] = useState(mockUsers);

  const seatCapacity = { used: 8, total: 12 };
  const usedPct = Math.round((seatCapacity.used / seatCapacity.total) * 100);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Members Table */}
      <div className="col-span-2">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between p-5 pb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Active Members</h3>
              <p className="text-sm text-gray-500 mt-0.5">Manage permissions and team access levels</p>
            </div>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success("Invitation sent!");
                    setInviteOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <Input name="email" type="email" placeholder="colleague@company.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                    <Select name="role" defaultValue="member">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="read_only">Read Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button type="submit">Send Invite</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-y border-gray-100 bg-gray-50/50">
                {["Member", "Role", "Status", "Last Activity"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                          member.status === "active" ? "bg-emerald-500" : "bg-gray-300"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={member.role === "admin" ? "qualified" : "to_do"}
                      className="capitalize text-xs"
                    >
                      {member.role === "admin" ? "Admin" : "Member"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        member.status === "active" ? "bg-emerald-500" : "bg-gray-300"
                      }`} />
                      <span className="text-sm text-gray-700 capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{member.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        {/* Seat Capacity */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Seat Capacity</h3>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold text-gray-900">
              {String(seatCapacity.used).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-500">/ {seatCapacity.total}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold text-indigo-600">{usedPct}% Used</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mb-3">
            You have {seatCapacity.total - seatCapacity.used} seats remaining in your Enterprise plan. Need more?
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Upgrade Plan
          </Button>
        </Card>

        {/* Role Distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Role Distribution</h3>
          <div className="space-y-2">
            {[
              { label: "Administrators", count: 2, color: "bg-indigo-500" },
              { label: "Standard Members", count: 5, color: "bg-blue-400" },
              { label: "Read Only", count: 1, color: "bg-gray-300" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Culture Card */}
        <div className="relative overflow-hidden rounded-2xl h-36">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent)]" />
          <div className="relative p-5 h-full flex flex-col justify-end">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Team Culture</p>
            <p className="text-sm font-semibold text-white">Empower your team with collaborative workspace tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
