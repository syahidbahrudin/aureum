import { mockThumbnail } from "@/lib/mock-images";
import type { Topic } from "@/lib/types";

export function findTopic(slug: string): Topic | undefined {
  return mockTopics.find((topic) => topic.slug === slug);
}

export const mockTopics: Topic[] = [
  {
    id: "top-1",
    name: "Monetary policy 2026",
    slug: "monetary-policy-2026",
    description:
      "Rate decisions, inflation outlook, and central bank communications.",
    status: "active",
    updatedAt: "2026-10-08T12:16:00Z",
    thumbnailUrl: mockThumbnail("top-1"),
    background: {
      text: "The central bank has held its benchmark rate at 4.25% since March. Inflation eased over the summer, and the committee is split on whether that is enough for a cut.",
      articleSlugs: ["september-inflation-eases"],
    },
    latest: {
      text: "On 8 October the bank held again. Two members voted for a quarter-point cut. The next decision is 12 November.",
      articleSlugs: ["central-bank-holds-rates-steady", "two-members-vote-to-cut"],
    },
    events: [
      {
        id: "evt-1",
        title: "Benchmark rate held at 4.25%",
        summary:
          "The committee held. Two members voted for a cut. Markets had priced no change.",
        eventDate: "2026-10-08T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: ["central-bank-holds-rates-steady", "two-members-vote-to-cut"],
      },
      {
        id: "evt-2",
        title: "Market open on decision day",
        summary:
          "Equities opened higher on bank earnings, before the statement. Yields slipped after the hold was published.",
        eventDate: "2026-10-08T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: ["markets-open-higher-earnings-optimism", "yields-slip-after-the-hold"],
      },
      {
        id: "evt-3",
        title: "September inflation print",
        summary:
          "Headline inflation was reported at 2.8%. The archive copy has no release hour, so the event day is approximate.",
        eventDate: "2026-09-30T00:00:00Z",
        datePrecision: "approximate",
        articleSlugs: ["september-inflation-eases"],
      },
    ],
  },
  {
    id: "top-2",
    name: "Climate tech investment",
    slug: "climate-tech-investment",
    description: "Funding rounds, policy shifts, and market adoption trends.",
    status: "active",
    updatedAt: "2026-10-08T13:12:00Z",
    thumbnailUrl: mockThumbnail("top-2"),
    background: {
      text: "Northwind Analytics sells emissions estimates for shipping and warehouses. A filing mentions an earlier growth round, but it does not say when.",
      articleSlugs: ["northwind-raise-date-unclear"],
    },
    latest: {
      text: "Northwind closed a $48 million Series B on 8 October, led by Harbor Capital. It did not disclose a valuation. Harbor’s Elise Marlow joins the board.",
      articleSlugs: [
        "startup-raises-series-b-climate-analytics",
        "harbor-confirms-northwind-stake",
      ],
    },
    events: [
      {
        id: "evt-4",
        title: "Northwind Series B closes",
        summary:
          "The round is $48 million. Harbor takes a board seat. No valuation was published.",
        eventDate: "2026-10-08T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: [
          "startup-raises-series-b-climate-analytics",
          "harbor-confirms-northwind-stake",
        ],
      },
      {
        id: "evt-5",
        title: "Earlier Northwind raise",
        summary:
          "A filing refers to a previous round with the same two investors. It gives no amount and no day.",
        eventDate: null,
        datePrecision: "unknown",
        articleSlugs: ["northwind-raise-date-unclear"],
      },
    ],
  },
  {
    id: "top-3",
    name: "Regional elections",
    slug: "regional-elections",
    description: "Campaigns, results, and coalition negotiations.",
    status: "active",
    updatedAt: "2026-10-07T21:24:00Z",
    thumbnailUrl: mockThumbnail("top-3"),
    background: {
      text: "No list reached 40% in the final count on 5 October. The centre-right bloc finished first. Talks were not opened that night.",
      articleSlugs: ["regional-count-ends"],
    },
    latest: {
      text: "Negotiators met again on 7 October after a two-day pause. The open dispute is the rail budget. Whips expect another session on Friday. No deadline is public.",
      articleSlugs: [
        "coalition-talks-resume-regional-elections",
        "whips-expect-friday-session",
      ],
    },
    events: [
      {
        id: "evt-6",
        title: "Coalition talks resume",
        summary:
          "Three parties returned to the table. Transport spending is still unresolved.",
        eventDate: "2026-10-07T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: [
          "coalition-talks-resume-regional-elections",
          "whips-expect-friday-session",
        ],
      },
      {
        id: "evt-7",
        title: "Final count",
        summary: "The count closed with no majority. Coalition talks waited until after the weekend.",
        eventDate: "2026-10-05T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: ["regional-count-ends"],
      },
    ],
  },
  {
    id: "top-4",
    name: "Public transit expansion",
    slug: "public-transit-expansion",
    description: "Plans, budgets, and community impact across metro areas.",
    status: "active",
    updatedAt: "2026-10-08T15:08:00Z",
    thumbnailUrl: mockThumbnail("top-4"),
    background: {
      text: "A state grant covers most of a 3.4 kilometre tram extension. The award notice is from September and does not name a single day.",
      articleSlugs: ["state-grant-tram-extension"],
    },
    latest: {
      text: "On 8 October the council voted 7–2 to spend the grant, add two bus routes, and start tram construction in March. The capital budget is $210 million over six years.",
      articleSlugs: [
        "city-council-approves-transit-expansion",
        "tram-extension-what-the-vote-funds",
      ],
    },
    events: [
      {
        id: "evt-8",
        title: "Council approves the transit plan",
        summary:
          "The vote funds two bus routes and the tram extension. Two councillors wanted the buses first and the tram delayed.",
        eventDate: "2026-10-08T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: [
          "city-council-approves-transit-expansion",
          "tram-extension-what-the-vote-funds",
        ],
      },
      {
        id: "evt-9",
        title: "State grant for the tram",
        summary:
          "The grant was awarded in September. The notice does not fix the day, so the event date is approximate.",
        eventDate: "2026-09-18T00:00:00Z",
        datePrecision: "approximate",
        articleSlugs: ["state-grant-tram-extension"],
      },
    ],
  },
  {
    id: "top-5",
    name: "Seasonal health advisories",
    slug: "seasonal-health-advisories",
    description: "Public health guidance and hospital capacity updates.",
    status: "archived",
    updatedAt: "2026-10-08T16:40:00Z",
    thumbnailUrl: mockThumbnail("top-5"),
    background: {
      text: "The ministry has told people over 65 and pregnant patients to book a seasonal vaccine. The note does not say when the booking window opened.",
      articleSlugs: ["vaccine-reminder-no-date"],
    },
    latest: {
      text: "Clinic visits for flu in the first week of October were 18% higher than a year earlier. Admissions barely moved. A city clinic group reported the same pattern.",
      articleSlugs: ["health-officials-track-seasonal-flu", "clinics-echo-flu-bulletin"],
    },
    events: [
      {
        id: "evt-10",
        title: "October flu bulletin",
        summary:
          "Visits are up, mostly among school-age children. Hospital occupancy is little changed.",
        eventDate: "2026-10-08T00:00:00Z",
        datePrecision: "exact",
        articleSlugs: ["health-officials-track-seasonal-flu", "clinics-echo-flu-bulletin"],
      },
      {
        id: "evt-11",
        title: "Vaccine booking reminder",
        summary: "The ministry repeated its vaccine advice. No start date is in the note.",
        eventDate: null,
        datePrecision: "unknown",
        articleSlugs: ["vaccine-reminder-no-date"],
      },
    ],
  },
];
