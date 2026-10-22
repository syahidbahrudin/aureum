import type {
  CalendarItemKind,
  ClaimReviewState,
  ClaimType,
  CorrectionKind,
  DistributionChannel,
  DistributionState,
  EditorialState,
  IngestRunStatus,
  MediaAssetKind,
  PermissionLevel,
  Role,
  ProcessingStatus,
  SourceStatus,
  StoryLeadSignal,
  StoryLeadState,
  StorySentiment,
  StoryTone,
} from "@/lib/types";

const editorialLabels: Record<EditorialState, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  unpublished: "Unpublished",
};

export function editorialStateLabel(state: EditorialState): string {
  return editorialLabels[state];
}

export function processingStatusLabel(status: ProcessingStatus): string {
  const labels: Record<ProcessingStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    ready: "Ready",
    failed: "Failed",
  };
  return labels[status];
}

export function sourceStatusLabel(status: SourceStatus): string {
  const labels: Record<SourceStatus, string> = {
    active: "Active",
    paused: "Paused",
    error: "Error",
  };
  return labels[status];
}

export function ingestRunStatusLabel(status: IngestRunStatus): string {
  const labels: Record<IngestRunStatus, string> = {
    success: "Success",
    partial: "Partial",
    failed: "Failed",
    running: "Running",
  };
  return labels[status];
}

const mediaAssetKindLabels: Record<MediaAssetKind, string> = {
  uploaded: "Uploaded",
  external: "External",
  ai: "AI",
};

export function mediaAssetKindLabel(kind: MediaAssetKind): string {
  return mediaAssetKindLabels[kind];
}

const calendarItemKindLabels: Record<CalendarItemKind, string> = {
  lead: "Lead",
  assignment: "Assignment",
  draft: "Draft",
  scheduled: "Scheduled",
};

export function calendarItemKindLabel(kind: CalendarItemKind): string {
  return calendarItemKindLabels[kind];
}

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  reviewer: "Reviewer",
};

export function roleLabel(role: Role): string {
  return roleLabels[role];
}

export function permissionLevelLabel(level: PermissionLevel): string {
  if (level === "yes") return "Yes";
  if (level === "read") return "Read";
  return "No";
}

const distributionChannelLabels: Record<DistributionChannel, string> = {
  social: "Social caption",
  carousel: "Carousel copy",
  newsletter: "Newsletter copy",
  short_video: "Short-video script",
};

export function distributionChannelLabel(channel: DistributionChannel): string {
  return distributionChannelLabels[channel];
}

const distributionStateLabels: Record<DistributionState, string> = {
  draft: "Draft",
  ready: "Ready",
  exported: "Exported",
  needs_review: "Needs review",
};

export function distributionStateLabel(state: DistributionState): string {
  return distributionStateLabels[state];
}

const correctionKindLabels: Record<CorrectionKind, string> = {
  factual: "Factual correction",
  development: "New development",
};

export function correctionKindLabel(kind: CorrectionKind): string {
  return correctionKindLabels[kind];
}

const storyLeadStateLabels: Record<StoryLeadState, string> = {
  new: "New",
  accepted: "Accepted",
  dismissed: "Dismissed",
  converted: "Converted to draft",
};

export function storyLeadStateLabel(state: StoryLeadState): string {
  return storyLeadStateLabels[state];
}

const storyLeadSignalLabels: Record<StoryLeadSignal, string> = {
  new_development: "New development",
  increased_coverage: "Increased coverage",
  related_archive: "Related archive",
};

export function storyLeadSignalLabel(signal: StoryLeadSignal): string {
  return storyLeadSignalLabels[signal];
}

const storySentimentLabels: Record<StorySentiment, string> = {
  negative: "Negative",
  mixed: "Mixed",
  positive: "Positive",
};

export function storySentimentLabel(sentiment: StorySentiment): string {
  return storySentimentLabels[sentiment];
}

const storyToneLabels: Record<StoryTone, string> = {
  explanatory: "Explanatory",
  cautious: "Cautious",
  urgent: "Urgent",
  accountable: "Accountable",
};

export function storyToneLabel(tone: StoryTone): string {
  return storyToneLabels[tone];
}

const claimReviewStateLabels: Record<ClaimReviewState, string> = {
  unchecked: "Unchecked",
  supported: "Supported",
  conflicting: "Conflicting",
  unsupported: "Unsupported",
  editor_verified: "Editor-verified",
};

const claimReviewStateHints: Record<ClaimReviewState, string> = {
  unchecked: "Not looked at yet.",
  supported: "A source says the same thing. That is not proof.",
  conflicting: "A source disagrees, or a number or date does not match.",
  unsupported: "No source backs this sentence.",
  editor_verified: "An editor accepted this claim.",
};

export function claimReviewStateLabel(state: ClaimReviewState): string {
  return claimReviewStateLabels[state];
}

export function claimReviewStateHint(state: ClaimReviewState): string {
  return claimReviewStateHints[state];
}

const claimTypeLabels: Record<ClaimType, string> = {
  reported: "Reported",
  quote: "Quote",
  inference: "Inference",
};

const claimTypeHints: Record<ClaimType, string> = {
  reported: "Written as fact from a source.",
  quote: "Someone else's words.",
  inference: "The draft's own conclusion, not stated by a source.",
};

export function claimTypeLabel(type: ClaimType): string {
  return claimTypeLabels[type];
}

export function claimTypeHint(type: ClaimType): string {
  return claimTypeHints[type];
}
