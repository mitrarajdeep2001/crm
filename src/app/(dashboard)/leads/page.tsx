import { Suspense } from "react";
import { LeadsContent } from "@/components/leads/leads-content";
import { LeadVelocity } from "@/components/leads/lead-velocity";
import { SmartScoring } from "@/components/leads/smart-scoring";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <LeadsContent />
      </Suspense>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <LeadVelocity />
        </div>
        <div>
          <SmartScoring />
        </div>
      </div>
    </div>
  );
}
