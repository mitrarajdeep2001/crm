"use client";

import { useState } from "react";
import { LeadsHeader } from "@/components/leads/leads-header";
import { LeadsTable } from "@/components/leads/leads-table";

export function LeadsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshLeads() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <>
      <LeadsHeader
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onLeadCreated={refreshLeads}
      />
      <LeadsTable search={search} status={status} refreshKey={refreshKey} />
    </>
  );
}
