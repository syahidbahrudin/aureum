import type {
  DailyIngestionPoint,
  GeneratedPublishedPoint,
  IngestRun,
  KpiMetric,
  PipelineCount,
  PublisherVolume,
  StatusBreakdown,
} from "@/lib/types";

export const mockKpis: KpiMetric[] = [
  {
    id: "active-sources",
    label: "Active sources",
    value: 12,
    delta: 2,
    deltaLabel: "vs last month",
  },
  {
    id: "ingested",
    label: "Articles ingested (30d)",
    value: 3842,
    delta: 12.4,
    deltaLabel: "vs prior 30d",
    deltaIsPercent: true,
  },
  {
    id: "generated",
    label: "Drafts generated (30d)",
    value: 186,
    delta: 8,
    deltaLabel: "vs prior 30d",
  },
  {
    id: "published",
    label: "Published (30d)",
    value: 94,
    delta: -3,
    deltaLabel: "vs prior 30d",
  },
  {
    id: "pending-processing",
    label: "Pending processing",
    value: 47,
    delta: 5,
    deltaLabel: "in queue",
  },
  {
    id: "failed-processing",
    label: "Failed processing",
    value: 23,
    delta: -4,
    deltaLabel: "vs last week",
  },
];

export const mockDailyIngestion: DailyIngestionPoint[] = [
  { date: "Sep 25", new: 98, revised: 22, duplicate: 41, failed: 3 },
  { date: "Sep 26", new: 112, revised: 18, duplicate: 38, failed: 5 },
  { date: "Sep 27", new: 87, revised: 31, duplicate: 45, failed: 2 },
  { date: "Sep 28", new: 76, revised: 14, duplicate: 52, failed: 4 },
  { date: "Sep 29", new: 134, revised: 28, duplicate: 36, failed: 6 },
  { date: "Sep 30", new: 121, revised: 19, duplicate: 44, failed: 3 },
  { date: "Oct 1", new: 105, revised: 25, duplicate: 39, failed: 2 },
  { date: "Oct 2", new: 118, revised: 21, duplicate: 42, failed: 5 },
  { date: "Oct 3", new: 92, revised: 17, duplicate: 48, failed: 4 },
  { date: "Oct 4", new: 64, revised: 12, duplicate: 35, failed: 1 },
  { date: "Oct 5", new: 71, revised: 15, duplicate: 33, failed: 2 },
  { date: "Oct 6", new: 128, revised: 26, duplicate: 40, failed: 7 },
  { date: "Oct 7", new: 115, revised: 23, duplicate: 37, failed: 4 },
  { date: "Oct 8", new: 102, revised: 20, duplicate: 43, failed: 3 },
];

export const mockPipelineCounts: PipelineCount[] = [
  { state: "draft", count: 24 },
  { state: "in_review", count: 11 },
  { state: "approved", count: 8 },
  { state: "scheduled", count: 6 },
  { state: "published", count: 94 },
  { state: "unpublished", count: 3 },
];

export const mockStatusBreakdown: StatusBreakdown[] = [
  { status: "ready", count: 9124 },
  { status: "processing", count: 38 },
  { status: "pending", count: 47 },
  { status: "failed", count: 23 },
];

export const mockPublisherVolumes: PublisherVolume[] = [
  { publisher: "National Daily", count: 4821 },
  { publisher: "Tech Wire", count: 2104 },
  { publisher: "Global Finance", count: 1567 },
  { publisher: "Regional Herald", count: 892 },
  { publisher: "City Gazette", count: 643 },
];

export const mockGeneratedPublished: GeneratedPublishedPoint[] = [
  { date: "Sep 25", generated: 5, published: 3 },
  { date: "Sep 26", generated: 7, published: 4 },
  { date: "Sep 27", generated: 4, published: 2 },
  { date: "Sep 28", generated: 3, published: 1 },
  { date: "Sep 29", generated: 8, published: 5 },
  { date: "Sep 30", generated: 6, published: 4 },
  { date: "Oct 1", generated: 9, published: 6 },
  { date: "Oct 2", generated: 7, published: 3 },
  { date: "Oct 3", generated: 5, published: 4 },
  { date: "Oct 4", generated: 4, published: 2 },
  { date: "Oct 5", generated: 3, published: 2 },
  { date: "Oct 6", generated: 10, published: 7 },
  { date: "Oct 7", generated: 8, published: 5 },
  { date: "Oct 8", generated: 6, published: 4 },
];

export const mockRecentRuns: IngestRun[] = [
  {
    id: "run-1",
    sourceId: "src-2",
    sourceName: "Tech Wire API",
    startedAt: "2026-10-08T14:15:00Z",
    finishedAt: "2026-10-08T14:16:42Z",
    status: "success",
    newCount: 12,
    revisedCount: 3,
    duplicateCount: 8,
    failedCount: 0,
  },
  {
    id: "run-2",
    sourceId: "src-1",
    sourceName: "National Daily RSS",
    startedAt: "2026-10-08T14:00:00Z",
    finishedAt: "2026-10-08T14:02:18Z",
    status: "partial",
    newCount: 18,
    revisedCount: 5,
    duplicateCount: 22,
    failedCount: 2,
    errorMessage: "2 articles failed embedding step",
  },
  {
    id: "run-3",
    sourceId: "src-4",
    sourceName: "Global Finance Feed",
    startedAt: "2026-10-08T13:45:00Z",
    finishedAt: "2026-10-08T13:46:55Z",
    status: "success",
    newCount: 9,
    revisedCount: 2,
    duplicateCount: 14,
    failedCount: 0,
  },
  {
    id: "run-4",
    sourceId: "src-5",
    sourceName: "City Gazette",
    startedAt: "2026-10-08T11:00:00Z",
    finishedAt: "2026-10-08T11:00:45Z",
    status: "failed",
    newCount: 0,
    revisedCount: 0,
    duplicateCount: 0,
    failedCount: 1,
    errorMessage: "API returned 503 Service Unavailable",
  },
  {
    id: "run-5",
    sourceId: "src-1",
    sourceName: "National Daily RSS",
    startedAt: "2026-10-08T13:30:00Z",
    finishedAt: "2026-10-08T13:32:10Z",
    status: "success",
    newCount: 15,
    revisedCount: 4,
    duplicateCount: 19,
    failedCount: 0,
  },
];

export const mockAiSuggestionStats = {
  entitySuggestionsPending: 34,
  topicSuggestionsPending: 28,
  editorVerifiedLinks: 1247,
  aiSuggestedLinks: 412,
};
