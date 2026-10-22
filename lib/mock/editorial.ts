import { mockThumbnail } from "@/lib/mock-images";
import type { EditorialArticle } from "@/lib/types";

export function findEditorialArticle(
  slug: string,
): EditorialArticle | undefined {
  return mockEditorialArticles.find((article) => article.slug === slug);
}

export const mockEditorialArticles: EditorialArticle[] = [
  {
    id: "ed-1",
    title: "What the rate decision means for borrowers",
    slug: "rate-decision-borrowers-explainer",
    state: "published",
    author: "Maya Chen",
    updatedAt: "2026-10-07T16:00:00Z",
    scheduledAt: null,
    sourceCount: 4,
    standfirst:
      "The committee held at 4.25% for a fourth time. Here is what the pause changes for mortgages, savings and new loans.",
    topicSlug: "monetary-policy-2026",
    coverImageUrl: mockThumbnail("media-rate-cover", 800, 600),
    body: [
      "The central bank left its benchmark rate at 4.25% on 8 October, the fourth consecutive hold this year.",
      "",
      "For borrowers on variable-rate mortgages, a pause means monthly payments hold steady rather than falling. Fixed-rate deals signed earlier this year stay unaffected until renewal.",
      "",
      "Savers keep the higher returns banks introduced last year, though several lenders have trimmed their best instant-access offers in recent weeks.",
    ].join("\n"),
  },
  {
    id: "ed-2",
    title: "Inside the climate tech funding wave",
    slug: "climate-tech-funding-wave",
    state: "in_review",
    author: "James Okonkwo",
    updatedAt: "2026-10-08T11:30:00Z",
    scheduledAt: null,
    sourceCount: 6,
    standfirst:
      "Northwind's $48 million Series B is the latest sign that emissions-tracking startups are drawing serious capital.",
    topicSlug: "climate-tech-investment",
    coverImageUrl: mockThumbnail("media-climate-hero", 800, 600),
    body: [
      "Northwind Analytics closed a $48 million Series B on 8 October, led by Harbor Capital. The company sells emissions estimates for shipping and warehouses.",
      "",
      "The round did not disclose a valuation. Harbor's Elise Marlow joins the board.",
    ].join("\n"),
  },
  {
    id: "ed-3",
    title: "Regional elections: five things to watch",
    slug: "regional-elections-five-things",
    state: "draft",
    author: "Sofia Martinez",
    updatedAt: "2026-10-08T09:00:00Z",
    scheduledAt: null,
    sourceCount: 8,
    standfirst:
      "No list reached 40% in the final count. Coalition talks now turn on the rail budget.",
    topicSlug: "regional-elections",
    coverImageUrl: mockThumbnail("media-election-crop", 800, 600),
    body: [
      "The count closed on 5 October with no majority. The centre-right bloc finished first.",
      "",
      "Negotiators met again on 7 October after a two-day pause. The open dispute is the rail budget.",
    ].join("\n"),
  },
  {
    id: "ed-4",
    title: "Morning markets briefing",
    slug: "morning-markets-briefing-oct-9",
    state: "scheduled",
    author: "Alex Kim",
    updatedAt: "2026-10-08T12:00:00Z",
    scheduledAt: "2026-10-09T06:00:00Z",
    sourceCount: 3,
    standfirst:
      "Equities opened higher on bank earnings before the rate statement. Yields slipped after the hold.",
    topicSlug: "monetary-policy-2026",
    coverImageUrl: mockThumbnail("media-markets-bg", 800, 600),
    body: [
      "Equities opened higher on bank earnings optimism ahead of the central bank statement.",
      "",
      "Government bond yields slipped after the hold was published, reversing an early rise.",
    ].join("\n"),
  },
  {
    id: "ed-5",
    title: "Transit plan: who pays and when",
    slug: "transit-plan-funding-timeline",
    state: "approved",
    author: "Maya Chen",
    updatedAt: "2026-10-08T13:00:00Z",
    scheduledAt: "2026-10-10T08:00:00Z",
    sourceCount: 5,
    standfirst:
      "The council approved a $210 million capital budget over six years. The tram extension starts in March.",
    topicSlug: "public-transit-expansion",
    coverImageUrl: mockThumbnail("media-transit-ai", 800, 600),
    body: [
      "The council voted 7-2 on 8 October to spend a state grant, add two bus routes and start tram construction in March.",
      "",
      "The capital budget is $210 million over six years. Two councillors wanted the buses first and the tram delayed.",
    ].join("\n"),
  },
];
