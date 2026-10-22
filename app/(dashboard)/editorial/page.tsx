import Link from "next/link";
import { PenLine } from "lucide-react";
import { EditorialGrid } from "@/components/editorial/editorial-grid";
import { Button } from "@/components/ui/button";
import { mockEditorialArticles } from "@/lib/mock/editorial";

export const instant = false;

export default function EditorialPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editorial</h1>
          <p className="text-muted-foreground">
            Media-owned drafts and published articles. Hover or focus a card for
            author, sources and schedule.
          </p>
        </div>
        <Button render={<Link href="/editorial/new" />}>
          <PenLine data-icon="inline-start" />
          New article
        </Button>
      </div>
      <EditorialGrid articles={mockEditorialArticles} />
    </div>
  );
}
