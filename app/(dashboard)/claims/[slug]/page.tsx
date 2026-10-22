import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClaimStateSummary } from "@/components/claims/claim-state-summary";
import { ClaimsDetailList } from "@/components/claims/claims-detail-list";
import { EditorialStateBadge } from "@/components/status-badges";
import { formatDateTime } from "@/lib/format";
import {
  claimsNeedingAttention,
  findClaimReview,
  mockClaimReviews,
} from "@/lib/mock/claims";

export function generateStaticParams() {
  return mockClaimReviews.map((review) => ({ slug: review.articleSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = findClaimReview(slug);
  return { title: review ? `${review.title} · Claims` : "Claims" };
}

export default function ClaimReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6" aria-busy="true">
          <div className="h-8 w-80 max-w-full rounded bg-muted" />
          <div className="h-2 w-full max-w-md rounded bg-muted" />
          <div className="h-40 w-full rounded-xl bg-muted" />
        </div>
      }
    >
      <ClaimReviewBody params={params} />
    </Suspense>
  );
}

async function ClaimReviewBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = findClaimReview(slug);
  if (!review) notFound();
  const open = claimsNeedingAttention(review.claims);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="flex max-w-3xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <EditorialStateBadge state={review.state} />
          <span className="text-sm text-muted-foreground">
            {review.author}
            <span aria-hidden> · </span>
            Updated {formatDateTime(review.updatedAt)}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-card-serif)] text-3xl leading-tight font-normal tracking-tight sm:text-4xl">
          {review.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {review.claims.length}{" "}
          {review.claims.length === 1 ? "claim" : "claims"} in this draft.
          {open > 0
            ? ` ${open} still open: unsupported, conflicting, or not checked yet.`
            : " Nothing is still open."}{" "}
          <Link
            href={`/editorial/${review.articleSlug}`}
            className="underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
          >
            Open this draft in Editorial
          </Link>
        </p>
        <ClaimStateSummary claims={review.claims} />
      </header>

      <ClaimsDetailList
        claims={review.claims}
        defaultFilter={open > 0 ? "attention" : "all"}
      />
    </div>
  );
}
