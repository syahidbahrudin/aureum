import { mockThumbnail } from "@/lib/mock-images";
import type { Claim, ClaimReview, ClaimReviewState } from "@/lib/types";

export const mockClaimReviews: ClaimReview[] = [
  {
    articleSlug: "rate-decision-borrowers-explainer",
    title: "What the rate decision means for borrowers",
    author: "Maya Chen",
    state: "published",
    updatedAt: "2026-10-07T16:00:00Z",
    thumbnailUrl: mockThumbnail("claim-rate", 800, 450),
    claims: [
      {
        id: "cl-1-1",
        text: "The central bank left its benchmark rate at 4.25% on 8 October.",
        type: "reported",
        state: "editor_verified",
        evidence: [
          {
            sourceSlug: "central-bank-holds-rates-steady",
            sourceTitle: "Central bank holds rates steady amid inflation debate",
            publisher: "National Daily",
            excerpt:
              "The central bank left its benchmark rate at 4.25% after a two-day meeting, the fourth consecutive hold this year.",
            stance: "supports",
          },
          {
            sourceSlug: "two-members-vote-to-cut",
            sourceTitle: "Two rate-setters vote for a cut as the hold stands",
            publisher: "Global Finance",
            excerpt: "The majority left the benchmark at 4.25%.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-1-2",
        text: "September headline inflation was 2.8%, down from 3.1% in August.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "september-inflation-eases",
            sourceTitle: "September inflation eases to 2.8%",
            publisher: "National Daily",
            excerpt:
              "Headline inflation was 2.8% in September, down from 3.1% in August, the statistics office said.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-1-3",
        text: "Two committee members voted for a quarter-point cut.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "two-members-vote-to-cut",
            sourceTitle: "Two rate-setters vote for a cut as the hold stands",
            publisher: "Global Finance",
            excerpt:
              "Two members of the rate-setting committee voted for a quarter-point cut.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-1-4",
        text: "Borrowers should expect a rate cut at the 12 November meeting.",
        type: "inference",
        state: "unsupported",
        note: "No supporting source. This is a forward-looking inference drawn by the draft, not reported by any source.",
        evidence: [],
      },
    ],
  },
  {
    articleSlug: "climate-tech-funding-wave",
    title: "Inside the climate tech funding wave",
    author: "James Okonkwo",
    state: "in_review",
    updatedAt: "2026-10-08T11:30:00Z",
    thumbnailUrl: mockThumbnail("claim-climate", 800, 450),
    claims: [
      {
        id: "cl-2-1",
        text: "Northwind Analytics raised $48 million in a Series B led by Harbor Capital.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "startup-raises-series-b-climate-analytics",
            sourceTitle: "Startup raises series B for climate analytics platform",
            publisher: "Tech Wire",
            excerpt:
              "Northwind Analytics raised $48 million in a Series B led by Harbor Capital, with two existing investors joining the round.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-2-2",
        text: "Harbor Capital partner Elise Marlow will join the Northwind board.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "harbor-confirms-northwind-stake",
            sourceTitle: "Harbor Capital confirms Northwind board seat",
            publisher: "City Gazette",
            excerpt:
              "Harbor Capital said partner Elise Marlow will join the Northwind Analytics board after the $48 million Series B.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-2-3",
        text: "Northwind had completed an earlier growth round on a known date.",
        type: "reported",
        state: "conflicting",
        note: "A date is asserted in the draft but the only source says the date is unknown. Resolve before approval.",
        evidence: [
          {
            sourceSlug: "northwind-raise-date-unclear",
            sourceTitle: "Northwind mentions an earlier raise, without a date",
            publisher: "Tech Wire",
            excerpt: "The filing does not give the amount or the day. The event date is unknown.",
            stance: "conflicts",
          },
        ],
      },
      {
        id: "cl-2-4",
        text: "Northwind disclosed a valuation with the round.",
        type: "reported",
        state: "unsupported",
        note: "No source supports a disclosed valuation; both sources state the opposite.",
        evidence: [
          {
            sourceSlug: "startup-raises-series-b-climate-analytics",
            sourceTitle: "Startup raises series B for climate analytics platform",
            publisher: "Tech Wire",
            excerpt: "Northwind did not disclose its valuation.",
            stance: "conflicts",
          },
        ],
      },
      {
        id: "cl-2-5",
        text: "\"The new money will fund a sales team in Singapore.\"",
        type: "quote",
        state: "unchecked",
        evidence: [],
      },
    ],
  },
  {
    articleSlug: "transit-plan-funding-timeline",
    title: "Transit plan: who pays and when",
    author: "Maya Chen",
    state: "approved",
    updatedAt: "2026-10-08T13:00:00Z",
    thumbnailUrl: mockThumbnail("claim-transit", 800, 450),
    claims: [
      {
        id: "cl-3-1",
        text: "The council approved the transit plan 7-2.",
        type: "reported",
        state: "editor_verified",
        evidence: [
          {
            sourceSlug: "city-council-approves-transit-expansion",
            sourceTitle: "City council approves transit expansion plan",
            publisher: "City Gazette",
            excerpt:
              "The city council voted 7-2 to approve a transit plan that adds two bus routes and extends the existing tram line by 3.4 kilometres.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-3-2",
        text: "The capital budget is $210 million over six years.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "tram-extension-what-the-vote-funds",
            sourceTitle: "What the transit vote actually funds",
            publisher: "Regional Herald",
            excerpt:
              "The attached capital budget is $210 million over six years.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-3-3",
        text: "Most of the tram money comes from a state grant awarded in September.",
        type: "reported",
        state: "supported",
        evidence: [
          {
            sourceSlug: "state-grant-tram-extension",
            sourceTitle: "State grant covers most of the tram extension",
            publisher: "City Gazette",
            excerpt: "The state awarded the tram grant in September.",
            stance: "supports",
          },
        ],
      },
      {
        id: "cl-3-4",
        text: "Construction on the tram extension starts in March.",
        type: "reported",
        state: "unchecked",
        evidence: [],
      },
    ],
  },
];

export function findClaimReview(slug: string): ClaimReview | undefined {
  return mockClaimReviews.find((review) => review.articleSlug === slug);
}

export const claimStateOrder: ClaimReviewState[] = [
  "unsupported",
  "conflicting",
  "unchecked",
  "supported",
  "editor_verified",
];

export const openClaimStates: ClaimReviewState[] = [
  "unsupported",
  "conflicting",
  "unchecked",
];

export function claimStateCounts(
  claims: Claim[],
): Record<ClaimReviewState, number> {
  const counts: Record<ClaimReviewState, number> = {
    unchecked: 0,
    supported: 0,
    conflicting: 0,
    unsupported: 0,
    editor_verified: 0,
  };
  for (const claim of claims) counts[claim.state] += 1;
  return counts;
}

export function claimsNeedingAttention(claims: Claim[]): number {
  return claims.filter(
    (claim) =>
      claim.state === "unsupported" ||
      claim.state === "conflicting" ||
      claim.state === "unchecked",
  ).length;
}
