import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, FileText, Link2 } from "lucide-react";
import { StoryLeadStateBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDay } from "@/lib/format";
import { storyLeadSignalLabel } from "@/lib/labels";
import { mockEntities } from "@/lib/mock/entities";
import { mockTopics } from "@/lib/mock/topics";
import type { StoryLead } from "@/lib/types";

function chipLabels(lead: StoryLead): string[] {
  const topics = lead.topicSlugs.map(
    (slug) => mockTopics.find((topic) => topic.slug === slug)?.name ?? slug,
  );
  const entities = lead.entitySlugs.map(
    (slug) => mockEntities.find((entity) => entity.slug === slug)?.name ?? slug,
  );
  return [...topics, ...entities];
}

export function LeadCard({ lead }: { lead: StoryLead }) {
  const chips = chipLabels(lead);

  return (
    <Link
      href={`/newsroom/${lead.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card ring-border/50 transition-shadow outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring"
    >
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={lead.thumbnailUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 z-10">
          <StoryLeadStateBadge state={lead.state} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Link2 className="size-3" aria-hidden />
          {storyLeadSignalLabel(lead.signal)}
        </p>
        <h3 className="font-[family-name:var(--font-card-serif)] text-xl leading-snug font-normal tracking-tight">
          {lead.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {lead.angle}
        </p>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Badge key={chip} variant="secondary" className="font-normal">
                {chip}
              </Badge>
            ))}
          </div>
        )}
        {lead.similarPublished && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            Similar story already published
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" aria-hidden />
            {lead.sourceSlugs.length} sources
          </span>
          <span aria-hidden>·</span>
          <span>{lead.owner ?? "Unassigned"}</span>
          <span className="ml-auto">{formatRelativeDay(lead.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
