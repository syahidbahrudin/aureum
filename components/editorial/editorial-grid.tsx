"use client";

import Link from "next/link";
import { EditorialArticleCard } from "@/components/editorial/editorial-article-card";
import {
  mergeEditorialArticles,
  useSavedDrafts,
} from "@/components/editorial/editorial-store";
import { portraitCardGridClass } from "@/lib/card-layout";
import type { EditorialArticle } from "@/lib/types";

type EditorialGridProps = {
  articles: EditorialArticle[];
};

export function EditorialGrid({ articles }: EditorialGridProps) {
  const saved = useSavedDrafts();
  const merged = mergeEditorialArticles(articles, saved);

  if (merged.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No articles yet.{" "}
        <Link
          href="/editorial/new"
          className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Start a draft
        </Link>
      </p>
    );
  }

  return (
    <ul className={portraitCardGridClass}>
      {merged.map((article) => (
        <li key={article.id}>
          <EditorialArticleCard article={article} />
        </li>
      ))}
    </ul>
  );
}
