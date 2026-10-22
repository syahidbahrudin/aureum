import type { LucideIcon } from "lucide-react";
import { findArchiveArticle } from "@/lib/mock/articles";
import { findEditorialArticle } from "@/lib/mock/editorial";
import { findClaimReview } from "@/lib/mock/claims";
import { findCorrectionRecord } from "@/lib/mock/corrections";
import { findDistributionItem } from "@/lib/mock/distribution";
import { findIntegration } from "@/lib/mock/integrations";
import { findStoryLead } from "@/lib/mock/newsroom";
import { findTopic } from "@/lib/mock/topics";
import {
  Archive,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileEdit,
  Image,
  LayoutDashboard,
  Newspaper,
  Plug,
  Rss,
  Send,
  Settings,
  Tags,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    section: "Overview",
    description: "Operational overview of ingestion, editorial pipeline, and processing health.",
  },
  {
    label: "Ingest",
    href: "/ingest",
    icon: Rss,
    section: "Ingestion",
    description: "Manage RSS, website, and API sources; schedule fetches and review run history.",
  },
  {
    label: "Archive",
    href: "/archive",
    icon: Archive,
    section: "Ingestion",
    description: "Search and browse fetched source articles with metadata, entities, and topics.",
  },
  {
    label: "Entities",
    href: "/entities",
    icon: Users,
    section: "Knowledge",
    description: "Directory of people, organizations, places, and other entities found in articles.",
  },
  {
    label: "Topics",
    href: "/topics",
    icon: Tags,
    section: "Knowledge",
    description: "Stories and timeline events connecting coverage across sources.",
  },
  {
    label: "Newsroom",
    href: "/newsroom",
    icon: Newspaper,
    section: "Production",
    description: "Story leads and angles suggested from incoming material and coverage trends.",
  },
  {
    label: "Editorial",
    href: "/editorial",
    icon: FileEdit,
    section: "Production",
    description: "Draft, review, approve, and publish media-owned articles with source traceability.",
  },
  {
    label: "Claims",
    href: "/claims",
    icon: CheckCircle2,
    section: "Production",
    description: "Fact-check claims in drafts with evidence links and conflict flags.",
  },
  {
    label: "Media Library",
    href: "/media",
    icon: Image,
    section: "Production",
    description: "Upload and manage images, crops, and AI-generated assets with attribution.",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    section: "Production",
    description: "Editorial calendar, assignments, deadlines, and scheduled publication.",
  },
  {
    label: "Distribution",
    href: "/distribution",
    icon: Send,
    section: "Delivery",
    description: "Channel-specific versions for social, newsletter, and other outlets.",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    section: "Delivery",
    description: "Audience performance: views, engagement, traffic sources, and conversions.",
  },
  {
    label: "Corrections",
    href: "/corrections",
    icon: BookOpen,
    section: "Delivery",
    description: "Post-publication corrections and updates with version history.",
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
    section: "System",
    description: "Step-by-step guides for publishing articles to WordPress, Drupal, Strapi, and Payload.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    section: "System",
    description: "AI providers, users, roles, editorial timezone, and CMS configuration.",
  },
];

export const navSections = [
  "Overview",
  "Ingestion",
  "Knowledge",
  "Production",
  "Delivery",
  "System",
] as const;

export function getNavItemForPath(pathname: string): NavItem | undefined {
  if (pathname === "/") {
    return navItems.find((item) => item.href === "/");
  }
  return navItems
    .filter((item) => item.href !== "/")
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

export function getBreadcrumbLabels(pathname: string): BreadcrumbCrumb[] {
  const item = getNavItemForPath(pathname);
  if (!item) return [{ label: "Aureum House" }];
  if (item.href === "/") return [{ label: "Dashboard" }];
  const crumbs: BreadcrumbCrumb[] = [
    { label: item.section },
    { label: item.label, href: item.href },
  ];
  if (item.href === "/archive" && pathname !== "/archive") {
    const slug = decodeURIComponent(pathname.slice("/archive/".length).split("/")[0] ?? "");
    const article = findArchiveArticle(slug);
    if (article) crumbs.push({ label: article.title });
  }
  if (item.href === "/topics" && pathname !== "/topics") {
    const slug = decodeURIComponent(pathname.slice("/topics/".length).split("/")[0] ?? "");
    const topic = findTopic(slug);
    if (topic) crumbs.push({ label: topic.name });
  }
  if (item.href === "/newsroom" && pathname !== "/newsroom") {
    const slug = decodeURIComponent(pathname.slice("/newsroom/".length).split("/")[0] ?? "");
    const lead = findStoryLead(slug);
    if (lead) crumbs.push({ label: lead.title });
  }
  if (item.href === "/claims" && pathname !== "/claims") {
    const slug = decodeURIComponent(pathname.slice("/claims/".length).split("/")[0] ?? "");
    const review = findClaimReview(slug);
    if (review) crumbs.push({ label: review.title });
  }
  if (item.href === "/distribution" && pathname !== "/distribution") {
    const slug = decodeURIComponent(pathname.slice("/distribution/".length).split("/")[0] ?? "");
    const distributionItem = findDistributionItem(slug);
    if (distributionItem) crumbs.push({ label: distributionItem.title });
  }
  if (item.href === "/integrations" && pathname !== "/integrations") {
    const slug = decodeURIComponent(pathname.slice("/integrations/".length).split("/")[0] ?? "");
    const integration = findIntegration(slug);
    if (integration) crumbs.push({ label: integration.name });
  }
  if (item.href === "/editorial" && pathname !== "/editorial") {
    const segment = decodeURIComponent(
      pathname.slice("/editorial/".length).split("/")[0] ?? "",
    );
    if (segment === "new") {
      crumbs.push({ label: "New article" });
    } else {
      const article = findEditorialArticle(segment);
      if (article) crumbs.push({ label: article.title });
    }
  }
  if (item.href === "/corrections" && pathname !== "/corrections") {
    const segment = decodeURIComponent(pathname.slice("/corrections/".length).split("/")[0] ?? "");
    if (segment === "new") {
      crumbs.push({ label: "New correction" });
    } else {
      const record = findCorrectionRecord(segment);
      if (record) crumbs.push({ label: record.reason });
    }
  }
  return crumbs;
}
