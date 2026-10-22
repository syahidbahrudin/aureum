import { ClaimDraftCard } from "@/components/claims/claim-draft-card";
import { claimReviewStateHint, claimReviewStateLabel } from "@/lib/labels";
import {
  claimStateOrder,
  claimsNeedingAttention,
  mockClaimReviews,
  openClaimStates,
} from "@/lib/mock/claims";

const reviews = [...mockClaimReviews].sort((a, b) => {
  const open = claimsNeedingAttention(b.claims) - claimsNeedingAttention(a.claims);
  return open !== 0 ? open : a.title.localeCompare(b.title);
});

const openClaims = reviews.reduce(
  (total, review) => total + claimsNeedingAttention(review.claims),
  0,
);
const draftsWithOpenClaims = reviews.filter(
  (review) => claimsNeedingAttention(review.claims) > 0,
).length;

export default function ClaimsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
        <p className="text-muted-foreground">
          A claim is one factual sentence taken from a draft. Open a draft to
          see whether the archive backs it, contradicts it, or has not been
          checked. You still decide what is fit to publish.
        </p>
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="claims-open-heading">
        <div>
          <p
            id="claims-open-heading"
            className="text-3xl font-semibold tabular-nums tracking-tight"
          >
            {openClaims}
          </p>
          <p className="text-sm text-muted-foreground">
            {openClaims === 1 ? "claim still open" : "claims still open"}
            {draftsWithOpenClaims > 0
              ? `, in ${draftsWithOpenClaims} of ${reviews.length} drafts`
              : ""}
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          {claimStateOrder.map((state) => (
            <div key={state} className="min-w-0 text-sm">
              <dt className="font-medium">{claimReviewStateLabel(state)}</dt>
              <dd className="text-muted-foreground">{claimReviewStateHint(state)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          Open means {openClaimStates.map(claimReviewStateLabel).join(", ")}.
          Several articles copying one source do not count as separate confirmation.
        </p>
      </section>

      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
          No drafts have claims yet. Claims appear here after a draft is written
          in Editorial.
        </p>
      ) : (
        <ul className="grid items-stretch gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.articleSlug} className="flex min-w-0">
              <ClaimDraftCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
