import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SmartScoring() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-lg shadow-indigo-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Smart Scoring</h3>
        </div>
      </div>
      <p className="text-sm text-indigo-100 leading-relaxed mb-5">
        AI is analyzing 12 high-priority leads that need immediate follow-up.
      </p>
      <Button
        variant="outline"
        className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
      >
        View Suggestions
      </Button>
    </div>
  );
}
