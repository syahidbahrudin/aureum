import type { AudienceMetricPoint } from "@/lib/types";

export const mockAudienceSeries: AudienceMetricPoint[] = [
  { date: "Sep 25", views: 12400, engagedSessions: 3200 },
  { date: "Sep 26", views: 13800, engagedSessions: 3600 },
  { date: "Sep 27", views: 11200, engagedSessions: 2900 },
  { date: "Sep 28", views: 9800, engagedSessions: 2400 },
  { date: "Sep 29", views: 15200, engagedSessions: 4100 },
  { date: "Sep 30", views: 14100, engagedSessions: 3800 },
  { date: "Oct 1", views: 13600, engagedSessions: 3500 },
  { date: "Oct 2", views: 12900, engagedSessions: 3300 },
  { date: "Oct 3", views: 11800, engagedSessions: 3000 },
  { date: "Oct 4", views: 10200, engagedSessions: 2600 },
  { date: "Oct 5", views: 10800, engagedSessions: 2700 },
  { date: "Oct 6", views: 14500, engagedSessions: 3900 },
  { date: "Oct 7", views: 13200, engagedSessions: 3400 },
  { date: "Oct 8", views: 12700, engagedSessions: 3200 },
];

export const mockTrafficSources = [
  { source: "Organic search", share: 42, measured: true },
  { source: "Direct", share: 28, measured: true },
  { source: "Social", share: 18, measured: true },
  { source: "Newsletter", share: 9, measured: false },
  { source: "Other", share: 3, measured: true },
];

export const mockTopArticlesByViews = [
  { title: "What the rate decision means for borrowers", views: 18420, measured: true },
  { title: "Regional elections: five things to watch", views: 12350, measured: true },
  { title: "Morning markets briefing", views: 8920, measured: true },
  { title: "Inside the climate tech funding wave", views: null, measured: false },
];
