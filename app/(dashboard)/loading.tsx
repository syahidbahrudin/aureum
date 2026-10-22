import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div
      className="flex flex-1 items-center justify-center p-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
