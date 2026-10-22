import type { Entity } from "@/lib/types";

export function entityReviewStatus(
  accepted: number,
  suggested: number,
): Entity["reviewStatus"] {
  if (accepted > 0 && suggested === 0) return "verified";
  if (suggested > 0) return "suggested";
  return "pending";
}
