"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LeadsHeaderProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLeadCreated: () => void;
}

export function LeadsHeader({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onLeadCreated,
}: LeadsHeaderProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLeadStatus, setNewLeadStatus] = useState("new_lead");
  const [newLeadSource, setNewLeadSource] = useState("other");

  async function handleAddLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    formData.set("status", newLeadStatus);
    formData.set("source", newLeadSource);
    
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to add lead");
        return;
      }

      onLeadCreated();
      window.dispatchEvent(new Event("leads:changed"));
      setOpen(false);
      toast.success("Lead added successfully");
      e.currentTarget.reset();
      setNewLeadStatus("new_lead");
      setNewLeadSource("other");
    } catch {
      toast.error("Failed to add lead");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nurture and manage your sales pipeline relationships.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads..."
            className="h-9 pl-9"
          />
        </div>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new_lead">New Lead</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
                  <Input name="firstName" placeholder="First name" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                  <Input name="lastName" placeholder="Last name" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                <Input name="email" type="email" placeholder="email@company.com" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</label>
                <Input name="company" placeholder="Company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                  <Select value={newLeadStatus} onValueChange={setNewLeadStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_lead">New Lead</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</label>
                  <Select value={newLeadSource} onValueChange={setNewLeadSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
                      <SelectItem value="direct_referral">Direct Referral</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="organic_search">Organic Search</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Adding..." : "Add Lead"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
