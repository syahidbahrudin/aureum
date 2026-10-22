import { pgEnum } from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["admin", "editor", "reviewer"]);

export const sourceType = pgEnum("source_type", ["rss", "website", "api"]);

export const sourceStatus = pgEnum("source_status", ["active", "paused", "inactive"]);

export const runStatus = pgEnum("run_status", ["running", "succeeded", "failed"]);

export const processingStatus = pgEnum("processing_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const linkStatus = pgEnum("link_status", ["suggested", "accepted", "removed"]);

export const dateCertainty = pgEnum("date_certainty", ["known", "approximate", "unknown"]);

export const leadStatus = pgEnum("lead_status", ["new", "accepted", "dismissed", "converted"]);

export const editorialStatus = pgEnum("editorial_status", [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "unpublished",
]);

export const claimKind = pgEnum("claim_kind", ["reported", "quote", "inference"]);

export const claimStatus = pgEnum("claim_status", [
  "unchecked",
  "supported",
  "conflicting",
  "unsupported",
  "editor_verified",
]);

export const mediaOrigin = pgEnum("media_origin", ["external", "upload", "ai"]);

export const distributionStatus = pgEnum("distribution_status", [
  "draft",
  "scheduled",
  "published",
  "failed",
]);

export const correctionKind = pgEnum("correction_kind", ["factual", "development"]);

export const assignmentRole = pgEnum("assignment_role", ["writer", "editor", "reviewer"]);
