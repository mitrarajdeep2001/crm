import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-96 w-full" />

      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="col-span-2 h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
