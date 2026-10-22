import type { DistributionItem } from "@/lib/types";

export const mockDistributionItems: DistributionItem[] = [
  {
    articleSlug: "rate-decision-borrowers-explainer",
    title: "What the rate decision means for borrowers",
    updatedAt: "2026-10-07T16:00:00Z",
    versions: [
      {
        channel: "social",
        state: "needs_review",
        body: "The central bank held its benchmark rate at 4.25% for a fourth straight meeting. What a hold means for your mortgage and loan costs — our explainer. [article link]",
      },
      {
        channel: "carousel",
        state: "exported",
        body: [
          "1. Rate held at 4.25% — fourth hold this year.",
          "2. Inflation eased to 2.8% in September.",
          "3. Two committee members wanted a cut.",
          "4. Next decision: 12 November.",
          "5. Read the full explainer.",
        ].join("\n"),
      },
      {
        channel: "newsletter",
        state: "ready",
        body: "Rates stayed put again. In today's explainer we break down what a fourth consecutive hold means for variable-rate borrowers, and what to watch before the 12 November decision.",
      },
      {
        channel: "short_video",
        state: "draft",
        body: "Hook: Your loan rate didn't move today — here's why that still matters.\n[draft — needs a closing line and on-screen figures]",
      },
    ],
  },
  {
    articleSlug: "transit-plan-funding-timeline",
    title: "Transit plan: who pays and when",
    updatedAt: "2026-10-08T13:00:00Z",
    versions: [
      { channel: "social", state: "draft", body: "" },
      { channel: "carousel", state: "draft", body: "" },
      { channel: "newsletter", state: "draft", body: "" },
      { channel: "short_video", state: "draft", body: "" },
    ],
  },
];

export function findDistributionItem(
  slug: string,
): DistributionItem | undefined {
  return mockDistributionItems.find((item) => item.articleSlug === slug);
}
