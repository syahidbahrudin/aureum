"use client";

import Link from "next/link";
import { ClaimReviewStateBadge, ClaimTypeBadge } from "@/components/status-badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  claimReviewStateHint,
  claimTypeHint,
} from "@/lib/labels";
import { claimStateOrder } from "@/lib/mock/claims";
import { cn } from "@/lib/utils";
import type { Claim, ClaimEvidence } from "@/lib/types";

type FilterValue = "all" | "attention" | "supported" | "editor_verified";

const filters: { value: FilterValue; label: string; empty: string }[] = [
  { value: "all", label: "All", empty: "This draft has no claims." },
  {
    value: "attention",
    label: "Still open",
    empty: "Nothing in this draft is still open.",
  },
  {
    value: "supported",
    label: "Supported",
    empty: "No claim is marked Supported.",
  },
  {
    value: "editor_verified",
    label: "Editor-verified",
    empty: "No claim in this draft has been accepted by an editor.",
  },
];

function matches(claim: Claim, filter: FilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "attention") {
    return (
      claim.state === "unsupported" ||
      claim.state === "conflicting" ||
      claim.state === "unchecked"
    );
  }
  return claim.state === filter;
}

function byState(claims: Claim[]): Claim[] {
  return [...claims].sort(
    (a, b) => claimStateOrder.indexOf(a.state) - claimStateOrder.indexOf(b.state),
  );
}

function EvidenceRow({ evidence }: { evidence: ClaimEvidence }) {
  const conflicts = evidence.stance === "conflicts";
  return (
    <li
      className={cn(
        "border-l-2 pl-3",
        conflicts ? "border-destructive" : "border-border",
      )}
    >
      <p className="text-sm">
        <span className={cn("font-medium", conflicts && "text-destructive")}>
          {conflicts ? "Disagrees with the claim" : "Agrees with the claim"}
        </span>
        <span className="text-muted-foreground"> · {evidence.publisher}</span>
      </p>
      <blockquote className="mt-1 text-sm leading-relaxed text-muted-foreground">
        “{evidence.excerpt}”
      </blockquote>
      <Link
        href={`/archive/${evidence.sourceSlug}`}
        className="mt-1 inline-block text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
      >
        Read “{evidence.sourceTitle}” in the archive
      </Link>
    </li>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  const attention =
    claim.state === "unsupported" || claim.state === "conflicting";
  return (
    <article
      className={cn(
        "rounded-xl border p-5",
        attention && "border-destructive/40",
      )}
    >
      <p className="font-[family-name:var(--font-card-serif)] text-lg leading-snug font-normal">
        {claim.text}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ClaimReviewStateBadge state={claim.state} />
        <ClaimTypeBadge type={claim.type} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {claimReviewStateHint(claim.state)} {claimTypeHint(claim.type)}
      </p>
      {claim.note && (
        <p
          className={cn(
            "mt-3 rounded-lg border px-3 py-2 text-sm",
            attention
              ? "border-destructive/40 text-destructive"
              : "text-muted-foreground",
          )}
        >
          {claim.note}
        </p>
      )}
      <div className="mt-4">
        <h3 className="text-sm font-medium">Linked sources</h3>
        {claim.evidence.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No source is linked. The archive has nothing recorded for this sentence.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-3">
            {claim.evidence.map((evidence, index) => (
              <EvidenceRow key={`${evidence.sourceSlug}-${index}`} evidence={evidence} />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ClaimsDetailList({
  claims,
  defaultFilter = "attention",
}: {
  claims: Claim[];
  defaultFilter?: FilterValue;
}) {
  return (
    <Tabs defaultValue={defaultFilter} className="gap-4">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {filters.map((filter) => {
          const count = claims.filter((claim) => matches(claim, filter.value)).length;
          return (
            <TabsTrigger key={filter.value} value={filter.value} className="flex-none">
              {filter.label}
              <span className="text-muted-foreground tabular-nums">({count})</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {filters.map((filter) => {
        const filtered = byState(
          claims.filter((claim) => matches(claim, filter.value)),
        );
        return (
          <TabsContent key={filter.value} value={filter.value}>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {filter.empty}
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {filtered.map((claim) => (
                  <li key={claim.id}>
                    <ClaimCard claim={claim} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
