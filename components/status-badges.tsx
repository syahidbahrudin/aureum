import type {
  CalendarItemKind,
  ClaimReviewState,
  ClaimType,
  CorrectionKind,
  DistributionState,
  EditorialState,
  IngestRunStatus,
  MediaAssetKind,
  ProcessingStatus,
  SourceStatus,
  StoryLeadState,
} from "@/lib/types";
import {
  calendarItemKindLabel,
  claimReviewStateLabel,
  claimTypeLabel,
  correctionKindLabel,
  distributionStateLabel,
  editorialStateLabel,
  ingestRunStatusLabel,
  mediaAssetKindLabel,
  processingStatusLabel,
  sourceStatusLabel,
  storyLeadStateLabel,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export function SourceStatusBadge({ status }: { status: SourceStatus }) {
  const variant =
    status === "active"
      ? "default"
      : status === "paused"
        ? "secondary"
        : "destructive";
  return <Badge variant={variant}>{sourceStatusLabel(status)}</Badge>;
}

export function ProcessingStatusBadge({ status }: { status: ProcessingStatus }) {
  const variant =
    status === "ready"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{processingStatusLabel(status)}</Badge>;
}

export function EditorialStateBadge({ state }: { state: EditorialState }) {
  const variant =
    state === "published"
      ? "default"
      : state === "draft"
        ? "outline"
        : "secondary";
  return <Badge variant={variant}>{editorialStateLabel(state)}</Badge>;
}

export function IngestRunStatusBadge({ status }: { status: IngestRunStatus }) {
  const variant =
    status === "success"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{ingestRunStatusLabel(status)}</Badge>;
}

export function MediaAssetKindBadge({ kind }: { kind: MediaAssetKind }) {
  const variant =
    kind === "uploaded"
      ? "default"
      : kind === "ai"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{mediaAssetKindLabel(kind)}</Badge>;
}

export function CalendarItemKindBadge({ kind }: { kind: CalendarItemKind }) {
  const variant =
    kind === "scheduled"
      ? "default"
      : kind === "lead"
        ? "outline"
        : "secondary";
  return <Badge variant={variant}>{calendarItemKindLabel(kind)}</Badge>;
}

export function DistributionStateBadge({ state }: { state: DistributionState }) {
  const variant =
    state === "needs_review"
      ? "destructive"
      : state === "exported"
        ? "default"
        : state === "ready"
          ? "secondary"
          : "outline";
  return <Badge variant={variant}>{distributionStateLabel(state)}</Badge>;
}

export function CorrectionKindBadge({ kind }: { kind: CorrectionKind }) {
  const variant = kind === "factual" ? "destructive" : "secondary";
  return <Badge variant={variant}>{correctionKindLabel(kind)}</Badge>;
}

export function StoryLeadStateBadge({ state }: { state: StoryLeadState }) {
  const variant =
    state === "converted"
      ? "default"
      : state === "dismissed"
        ? "outline"
        : "secondary";
  return <Badge variant={variant}>{storyLeadStateLabel(state)}</Badge>;
}

export function ClaimReviewStateBadge({ state }: { state: ClaimReviewState }) {
  const variant =
    state === "unsupported" || state === "conflicting"
      ? "destructive"
      : state === "editor_verified"
        ? "default"
        : state === "supported"
          ? "secondary"
          : "outline";
  return <Badge variant={variant}>{claimReviewStateLabel(state)}</Badge>;
}

export function ClaimTypeBadge({ type }: { type: ClaimType }) {
  return <Badge variant="outline">{claimTypeLabel(type)}</Badge>;
}
