
export type SourceType = "rss" | "website" | "api";

export type SourceStatus = "active" | "paused" | "error";

export type ProcessingStatus = "pending" | "processing" | "ready" | "failed";

export type IngestRunStatus = "success" | "partial" | "failed" | "running";

export type EditorialState =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "unpublished";

export type Source = {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  publisher: string;
  language: string;
  status: SourceStatus;
  intervalMinutes: number;
  lastRunAt: string;
  nextRunAt: string;
  articlesTotal: number;
};

export type IngestRun = {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  finishedAt: string | null;
  status: IngestRunStatus;
  newCount: number;
  revisedCount: number;
  duplicateCount: number;
  failedCount: number;
  errorMessage?: string;
};

export type ArchiveArticle = {
  id: string;
  slug: string;
  title: string;
  publisher: string;
  sourceName: string;
  originalUrl: string;
  author: string;
  body: string[];
  markdown?: string;
  publishedAt: string;
  fetchedAt: string;
  language: string;
  tags: string[];
  status: ProcessingStatus;
  thumbnailUrl: string;
  statusDetail?: string;
};

export type EditorialArticle = {
  id: string;
  title: string;
  slug: string;
  state: EditorialState;
  author: string;
  updatedAt: string;
  scheduledAt: string | null;
  sourceCount: number;
  standfirst: string;
  topicSlug: string | null;
  coverImageUrl: string;
  body: string;
};

export type Entity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  mentionCount: number;
  articleCount: number;
  reviewStatus: "verified" | "suggested" | "pending";
  imageUrl: string;
  description: string;
  aliases: string[];
  articleSlugs: string[];
};

export type DatePrecision = "exact" | "approximate" | "unknown";

export type TopicSummary = {
  text: string;
  articleSlugs: string[];
};

export type TopicEvent = {
  id: string;
  title: string;
  summary: string;
  eventDate: string | null;
  datePrecision: DatePrecision;
  articleSlugs: string[];
};

export type Topic = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "archived";
  updatedAt: string;
  thumbnailUrl: string;
  background: TopicSummary;
  latest: TopicSummary;
  events: TopicEvent[];
  articleCount?: number;
  eventCount?: number;
};

export type KpiMetric = {
  id: string;
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  deltaIsPercent?: boolean;
};

export type DailyIngestionPoint = {
  date: string;
  new: number;
  revised: number;
  duplicate: number;
  failed: number;
};

export type PipelineCount = {
  state: EditorialState;
  count: number;
};

export type StatusBreakdown = {
  status: ProcessingStatus;
  count: number;
};

export type PublisherVolume = {
  publisher: string;
  count: number;
};

export type GeneratedPublishedPoint = {
  date: string;
  generated: number;
  published: number;
};

export type AudienceMetricPoint = {
  date: string;
  views: number;
  engagedSessions: number;
};

export type MediaAssetKind = "uploaded" | "external" | "ai";

export type MediaAsset = {
  id: string;
  filename: string;
  kind: MediaAssetKind;
  mimeType: string;
  width: number;
  height: number;
  url: string;
  credit: string;
  source: string;
  altText: string;
  usedBy: string[];
  prompt?: string;
  model?: string;
};

export type CalendarItemKind = "lead" | "assignment" | "draft" | "scheduled";

export type CalendarItem = {
  id: string;
  title: string;
  kind: CalendarItemKind;
  owner: string;
  date: string;
  status: string;
  overdue: boolean;
  link: string;
};

export type Role = "admin" | "editor" | "reviewer";

export type AiProviderKind = "hosted" | "local";

export type AiProvider = {
  id: string;
  name: string;
  kind: AiProviderKind;
  maskedKey: string;
};

export type AiModelConfig = {
  embeddings: string;
  extraction: string;
  writing: string;
  images: string;
};

export type EditorialDefaults = {
  defaultLanguage: string;
  editorialTimezone: string;
  writingStyle: string;
  aiUseLabel: string;
};

export type CmsUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type PermissionLevel = "yes" | "no" | "read";

export type PermissionRow = {
  id: string;
  capability: string;
  admin: PermissionLevel;
  editor: PermissionLevel;
  reviewer: PermissionLevel;
};

export type DistributionChannel =
  | "social"
  | "carousel"
  | "newsletter"
  | "short_video";

export type DistributionState = "draft" | "ready" | "exported" | "needs_review";

export type DistributionVersion = {
  channel: DistributionChannel;
  state: DistributionState;
  body: string;
};

export type DistributionItem = {
  articleSlug: string;
  title: string;
  updatedAt: string;
  versions: DistributionVersion[];
};

export type CorrectionKind = "factual" | "development";

export type CorrectionRecord = {
  id: string;
  articleSlug: string;
  articleTitle: string;
  kind: CorrectionKind;
  reason: string;
  before: string;
  after: string;
  sourceSlug: string;
  sourceTitle: string;
  editor: string;
  createdAt: string;
  publicNote: string;
  updatedDate: string;
  relatedClaim?: string;
  affectedChannels: DistributionChannel[];
};

export type CorrectionFlag = {
  id: string;
  articleSlug: string;
  articleTitle: string;
  state: EditorialState;
  sourceSlug: string;
  sourceTitle: string;
  detectedAt: string;
};

export type StoryLeadState = "new" | "accepted" | "dismissed" | "converted";

export type StoryLeadSignal =
  | "new_development"
  | "increased_coverage"
  | "related_archive";

export type StorySentiment = "negative" | "mixed" | "positive";

export type StoryTone = "explanatory" | "cautious" | "urgent" | "accountable";

export type StoryLead = {
  id: string;
  slug: string;
  title: string;
  angle: string;
  reason: string;
  state: StoryLeadState;
  signal: StoryLeadSignal;
  sensitivity: number;
  sentiment: StorySentiment;
  tone: StoryTone;
  keywords: string[];
  owner: string | null;
  createdAt: string;
  thumbnailUrl: string;
  sourceSlugs: string[];
  topicSlugs: string[];
  entitySlugs: string[];
  similarPublished: { slug: string; title: string } | null;
  convertedDraftSlug?: string;
};

export type ClaimReviewState =
  | "unchecked"
  | "supported"
  | "conflicting"
  | "unsupported"
  | "editor_verified";

export type ClaimType = "reported" | "quote" | "inference";

export type ClaimEvidence = {
  sourceSlug: string;
  sourceTitle: string;
  publisher: string;
  excerpt: string;
  stance: "supports" | "conflicts";
};

export type Claim = {
  id: string;
  text: string;
  type: ClaimType;
  state: ClaimReviewState;
  evidence: ClaimEvidence[];
  note?: string;
};

export type ClaimReview = {
  articleSlug: string;
  title: string;
  author: string;
  state: EditorialState;
  updatedAt: string;
  thumbnailUrl: string;
  claims: Claim[];
};
