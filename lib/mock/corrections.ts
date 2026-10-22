import type { CorrectionFlag, CorrectionRecord } from "@/lib/types";

export const mockCorrectionRecords: CorrectionRecord[] = [
  {
    id: "cor-1",
    articleSlug: "rate-decision-borrowers-explainer",
    articleTitle: "What the rate decision means for borrowers",
    kind: "factual",
    reason: "Corrected the September headline inflation figure.",
    before: "Staff put headline inflation at 3.1% in September.",
    after: "Staff put headline inflation at 2.8% in September, down from 3.1% in August.",
    sourceSlug: "september-inflation-eases",
    sourceTitle: "September inflation eases to 2.8%",
    editor: "Maya Chen",
    createdAt: "2026-10-08T10:15:00Z",
    publicNote: "This article was updated to correct the September inflation figure.",
    updatedDate: "2026-10-08T10:20:00Z",
    relatedClaim: "September headline inflation was 2.8%.",
    affectedChannels: ["social"],
  },
];

export const mockCorrectionFlags: CorrectionFlag[] = [
  {
    id: "flag-1",
    articleSlug: "climate-tech-funding-wave",
    articleTitle: "Inside the climate tech funding wave",
    state: "in_review",
    sourceSlug: "harbor-confirms-northwind-stake",
    sourceTitle: "Harbor Capital confirms Northwind board seat",
    detectedAt: "2026-10-08T12:45:00Z",
  },
];

export function findCorrectionRecord(id: string): CorrectionRecord | undefined {
  return mockCorrectionRecords.find((record) => record.id === id);
}
