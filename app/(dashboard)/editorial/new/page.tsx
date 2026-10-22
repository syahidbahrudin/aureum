import type { Metadata } from "next";
import { EditorialStudio } from "@/components/editorial/editorial-studio";

export const metadata: Metadata = { title: "New article · Editorial" };

export const instant = false;

export default function NewEditorialPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New article</h1>
        <p className="text-muted-foreground">
          Draft a media-owned article. Pick a related topic, write in the
          editor, and insert images from the library.
        </p>
      </div>
      <EditorialStudio />
    </div>
  );
}
