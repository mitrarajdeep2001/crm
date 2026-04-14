"use client";

import { useState } from "react";
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import Link from "next/link";

export function DealsHeader() {
  const [open, setOpen] = useState(false);

  async function handleAddDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Deal created successfully!");
    setOpen(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <Link href="/dashboard" className="hover:text-gray-700 transition-colors">Workspace</Link>
        <span className="text-gray-300">&gt;</span>
        <span className="font-medium text-gray-700">Sales Pipeline</span>
      </div>
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
        <div className="flex items-center gap-3">
          {/* Team Avatars */}
          <div className="flex -space-x-2">
            {["AR", "DC", "SC"].map((init, i) => (
              <Avatar key={init} className="h-8 w-8 ring-2 ring-white">
                <AvatarFallback className={`text-xs font-bold text-white ${["bg-indigo-600", "bg-emerald-500", "bg-rose-500"][i]}`}>
                  {init}
                </AvatarFallback>
              </Avatar>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-xs font-bold text-gray-500">
              +4
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDeal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal Title</label>
                  <Input name="title" placeholder="e.g. Enterprise CRM Rollout" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</label>
                  <Input name="company" placeholder="Company name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Value ($)</label>
                    <Input name="value" type="number" placeholder="50000" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</label>
                    <Select name="stage" defaultValue="lead">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Deal</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
