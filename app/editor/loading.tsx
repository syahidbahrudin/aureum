import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
