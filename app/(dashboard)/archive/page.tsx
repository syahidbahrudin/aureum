import Link from "next/link";
import { ArchiveArticleCard } from "@/components/archive/archive-article-card";
import { buttonVariants } from "@/components/ui/button";
import { listArchive } from "@/lib/db/functions/archive/archive.get";
import { portraitCardGridClass } from "@/lib/card-layout";
import { cn } from "@/lib/utils";
import type { ArchiveArticle } from "@/lib/types";

export const instant = false;

function pageHref(page: number) {
  return page <= 1 ? "/archive" : `/archive?page=${page}`;
}

type ArchivePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const raw = Number((await searchParams).page);
  const requested = Number.isInteger(raw) && raw > 0 ? raw : 1;

  let articles: ArchiveArticle[] = [];
  let total = 0;
  let page = 1;
  let pages = 1;
  let loadError: string | null = null;
  try {
    const listed = await listArchive(requested);
    articles = listed.articles;
    total = listed.total;
    page = listed.page;
    pages = listed.pages;
  } catch (error) {
    console.error(
      "archive list failed",
      error instanceof Error ? error.message : "unknown",
    );
    loadError = "Articles could not be loaded. Check the database connection.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-muted-foreground">
          Fetched source articles. Cards reflect processing status — loading
          states show while enrichment runs.
        </p>
      </div>
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles yet.</p>
      ) : (
        <>
          <ul className={portraitCardGridClass}>
            {articles.map((article) => (
              <li key={article.id}>
                <ArchiveArticleCard article={article} />
              </li>
            ))}
          </ul>
          {pages > 1 ? (
            <nav
              aria-label="Archive pages"
              className="flex flex-wrap items-center gap-3"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "min-h-11 min-w-11 px-3",
                  )}
                >
                  Previous
                </Link>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Page {page} of {pages}
                <span className="sr-only"> ({total} articles)</span>
              </p>
              {page < pages ? (
                <Link
                  href={pageHref(page + 1)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "min-h-11 min-w-11 px-3",
                  )}
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
