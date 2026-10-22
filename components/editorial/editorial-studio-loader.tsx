"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EditorialStudio } from "@/components/editorial/editorial-studio";
import { useSavedDrafts } from "@/components/editorial/editorial-store";
import type { EditorialArticle } from "@/lib/types";

type EditorialStudioLoaderProps = {
  slug: string;
  serverArticle?: EditorialArticle;
};

export function EditorialStudioLoader({
  slug,
  serverArticle,
}: EditorialStudioLoaderProps) {
  const saved = useSavedDrafts();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const article = mounted
    ? (saved.find((draft) => draft.slug === slug) ?? serverArticle)
    : serverArticle;

  if (!article) {
    if (!mounted) {
      return (
        <p className="text-sm text-muted-foreground" role="status">
          Loading article...
        </p>
      );
    }
    return (
      <p className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        This article is not in the library. It may have been a session draft
        that was cleared on refresh.{" "}
        <Link
          href="/editorial"
          className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to Editorial
        </Link>
      </p>
    );
  }

  return <EditorialStudio key={article.slug} initialArticle={article} />;
}
