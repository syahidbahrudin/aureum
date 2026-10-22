import { mockThumbnail } from "@/lib/mock-images";
import type { StoryLead } from "@/lib/types";

export const mockStoryLeads: StoryLead[] = [
  {
    id: "lead-1",
    slug: "rate-hold-what-the-dissent-signals",
    title: "The two dissenters: what a split hold signals for November",
    angle:
      "Read the 8 October hold through its two dissenting votes. Explain why the split matters more than the headline rate for the 12 November decision.",
    reason:
      "Three sources now report the hold, and two separately highlight the dissent. The widening coverage of the split is the new angle, not the hold itself.",
    state: "new",
    signal: "increased_coverage",
    sensitivity: 58,
    sentiment: "mixed",
    tone: "cautious",
    keywords: ["rate hold", "dissent", "November decision", "split vote"],
    owner: null,
    createdAt: "2026-10-08T13:30:00Z",
    thumbnailUrl: mockThumbnail("lead-1", 800, 450),
    sourceSlugs: [
      "central-bank-holds-rates-steady",
      "two-members-vote-to-cut",
      "yields-slip-after-the-hold",
    ],
    topicSlugs: ["monetary-policy-2026"],
    entitySlugs: ["central-reserve-bank", "elena-vasquez"],
    similarPublished: null,
  },
  {
    id: "lead-2",
    slug: "climate-analytics-funding-wave",
    title: "Who is funding emissions data, and why now",
    angle:
      "Use the Northwind Series B as the entry point into a wider look at investor appetite for emissions-estimation software.",
    reason:
      "A fresh $48M round plus a board-seat confirmation two hours later suggests momentum worth a produced explainer.",
    state: "new",
    signal: "new_development",
    sensitivity: 28,
    sentiment: "positive",
    tone: "explanatory",
    keywords: ["Series B", "emissions data", "Northwind", "board seat"],
    owner: "James Okonkwo",
    createdAt: "2026-10-08T13:20:00Z",
    thumbnailUrl: mockThumbnail("lead-2", 800, 450),
    sourceSlugs: [
      "startup-raises-series-b-climate-analytics",
      "harbor-confirms-northwind-stake",
    ],
    topicSlugs: [],
    entitySlugs: ["greenpath-analytics"],
    similarPublished: {
      slug: "climate-tech-funding-wave",
      title: "Inside the climate tech funding wave",
    },
  },
  {
    id: "lead-3",
    slug: "transit-plan-who-pays",
    title: "The transit vote: who pays, and when the money arrives",
    angle:
      "Trace the $210M capital budget behind the 7-2 council vote back to the state grant awarded in September.",
    reason:
      "The council vote and a separate grant explainer cover the same money from two desks, which supports a single accountable breakdown.",
    state: "accepted",
    signal: "related_archive",
    sensitivity: 74,
    sentiment: "mixed",
    tone: "accountable",
    keywords: ["$210M", "council vote", "state grant", "tram extension"],
    owner: "Sofia Martinez",
    createdAt: "2026-10-08T11:00:00Z",
    thumbnailUrl: mockThumbnail("lead-3", 800, 450),
    sourceSlugs: [
      "city-council-approves-transit-expansion",
      "tram-extension-what-the-vote-funds",
      "state-grant-tram-extension",
    ],
    topicSlugs: [],
    entitySlugs: ["metro-city", "budget-vote-2026"],
    similarPublished: null,
  },
  {
    id: "lead-4",
    slug: "coalition-transport-budget-standoff",
    title: "The transport budget is holding up the coalition",
    angle:
      "Explain why the rail allocation, not the election result, is the real blocker in the coalition talks.",
    reason:
      "Coverage across two sources keeps returning to the same sticking point as talks resume, which signals a durable story thread.",
    state: "accepted",
    signal: "increased_coverage",
    sensitivity: 86,
    sentiment: "negative",
    tone: "urgent",
    keywords: ["rail allocation", "coalition talks", "transport budget"],
    owner: "Sofia Martinez",
    createdAt: "2026-10-08T09:45:00Z",
    thumbnailUrl: mockThumbnail("lead-4", 800, 450),
    sourceSlugs: [
      "coalition-talks-resume-regional-elections",
      "whips-expect-friday-session",
      "regional-count-ends",
    ],
    topicSlugs: [],
    entitySlugs: ["northern-coalition"],
    similarPublished: null,
  },
  {
    id: "lead-5",
    slug: "regional-elections-five-things",
    title: "Regional elections: five things to watch next",
    angle:
      "A forward-looking recap of the count and the coalition arithmetic for readers catching up.",
    reason:
      "Accepted after the final count and converted into a working draft with its supporting sources attached.",
    state: "converted",
    signal: "related_archive",
    sensitivity: 44,
    sentiment: "mixed",
    tone: "explanatory",
    keywords: ["final count", "coalition arithmetic", "regional elections"],
    owner: "Sofia Martinez",
    createdAt: "2026-10-07T19:00:00Z",
    thumbnailUrl: mockThumbnail("lead-5", 800, 450),
    sourceSlugs: ["regional-count-ends", "coalition-talks-resume-regional-elections"],
    topicSlugs: [],
    entitySlugs: ["northern-coalition"],
    similarPublished: null,
    convertedDraftSlug: "regional-elections-five-things",
  },
  {
    id: "lead-6",
    slug: "seasonal-flu-early-uptick",
    title: "An early flu season: what the clinics are seeing",
    angle:
      "Pair the ministry bulletin with the clinic network's own logs to show the uptick without overstating hospital strain.",
    reason:
      "A single bulletin echoed by one clinic group is not independent confirmation; dismissed until a second independent source appears.",
    state: "dismissed",
    signal: "related_archive",
    sensitivity: 63,
    sentiment: "negative",
    tone: "cautious",
    keywords: ["flu bulletin", "clinic logs", "vaccine advice"],
    owner: null,
    createdAt: "2026-10-08T16:50:00Z",
    thumbnailUrl: mockThumbnail("lead-6", 800, 450),
    sourceSlugs: [
      "health-officials-track-seasonal-flu",
      "clinics-echo-flu-bulletin",
      "vaccine-reminder-no-date",
    ],
    topicSlugs: [],
    entitySlugs: [],
    similarPublished: null,
  },
];

export function findStoryLead(slug: string): StoryLead | undefined {
  return mockStoryLeads.find((lead) => lead.slug === slug);
}
