import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dealStageData } from "@/lib/data/mock";

export function DealsPipeline() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Deal Stages Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {dealStageData.map((stage) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{stage.stage}</span>
              <span className="text-xs font-semibold text-gray-500">{stage.deals} Deals</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
