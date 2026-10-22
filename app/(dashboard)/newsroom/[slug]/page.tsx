import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { SentimentMeter } from "@/components/newsroom/sentiment-meter";
import { StoryLeadStateBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { entityCategoryLabel } from "@/lib/entity-categories";
import { formatDateTime, formatRelativeDay } from "@/lib/format";
import {
  storyLeadSignalLabel,
  storySentimentLabel,
  storyToneLabel,
} from "@/lib/labels";
import { findArchiveArticle } from "@/lib/mock/articles";
import { mockEntities } from "@/lib/mock/entities";
import { findStoryLead, mockStoryLeads } from "@/lib/mock/newsroom";
import { mockTopics } from "@/lib/mock/topics";
import type { ArchiveArticle, Entity, StoryLead, Topic } from "@/lib/types";

export function generateStaticParams() {
  return mockStoryLeads.map((lead) => ({ slug: lead.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lead = findStoryLead(slug);
  return { title: lead ? `${lead.title} · Newsroom` : "Newsroom" };
}

function sourcesFor(lead: StoryLead): ArchiveArticle[] {
  return lead.sourceSlugs.flatMap((slug) => {
    const article = findArchiveArticle(slug);
    return article ? [article] : [];
  });
}

function entitiesFor(lead: StoryLead): Entity[] {
  return lead.entitySlugs.flatMap((slug) => {
    const entity = mockEntities.find((item) => item.slug === slug);
    return entity ? [entity] : [];
  });
}

function topicsFor(lead: StoryLead): Topic[] {
  return lead.topicSlugs.flatMap((slug) => {
    const topic = mockTopics.find((item) => item.slug === slug);
    return topic ? [topic] : [];
  });
}

export default function NewsroomLeadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-8 p-6" aria-busy="true">
          <div className="aspect-video w-full max-w-3xl rounded-xl bg-muted" />
          <div className="h-8 w-80 max-w-full rounded bg-muted" />
          <div className="h-5 w-full max-w-xl rounded bg-muted" />
        </div>
      }
    >
      <LeadBody params={params} />
    </Suspense>
  );
}

function LeadAside({ lead }: { lead: StoryLead }) {
  const entities = entitiesFor(lead);
  const topics = topicsFor(lead);
  if (entities.length === 0 && topics.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {entities.length > 0 && (
        <section>
          <h2 className="text-sm font-medium">Entities</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {entities.map((entity) => (
              <li key={entity.id}>
                <Link
                  href={`/entities/${entity.slug}`}
                  className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring"
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={entity.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{entity.name}</span>
                    <span className="block text-xs text-muted-foreground capitalize">
                      {entityCategoryLabel(entity.category)} · {entity.reviewStatus}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {topics.length > 0 && (
        <section>
          <h2 className="text-sm font-medium">Topics</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {topic.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {topic.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function WhyPost({
  lead,
  sources,
  topics,
}: {
  lead: StoryLead;
  sources: ArchiveArticle[];
  topics: Topic[];
}) {
  const publisherCount = new Set(sources.map((article) => article.publisher))
    .size;

  return (
    <aside className="flex flex-col gap-5 border-t pt-6 lg:sticky lg:top-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
      <div>
        <h2 className="text-sm font-medium">Why post this</h2>
        <Badge variant="outline" className="mt-2">
          {storyLeadSignalLabel(lead.signal)}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {lead.reason}
      </p>

      {sources.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground tabular-nums">{sources.length}</span>{" "}
          supporting {sources.length === 1 ? "source" : "sources"} across{" "}
          <span className="text-foreground tabular-nums">{publisherCount}</span>{" "}
          {publisherCount === 1 ? "publisher" : "publishers"}.
        </p>
      )}

      {lead.similarPublished ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-sm">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
            aria-hidden
          />
          <p>
            A similar story is already published:{" "}
            <Link
              href="/editorial"
              className="font-medium underline-offset-4 hover:underline"
            >
              {lead.similarPublished.title}
            </Link>
            . Confirm this lead adds a new angle before producing it.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No similar story is already published.
        </p>
      )}

      <section>
        <h2 className="text-sm font-medium">Sensitivity</h2>
        <SentimentMeter
          score={lead.sensitivity}
          sentiment={storySentimentLabel(lead.sentiment)}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Suggested reading of the sources. Not a measured audience score.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium">Tone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {storyToneLabel(lead.tone)}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium">Keywords</h2>
        {lead.keywords.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No keywords are marked on this lead yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {lead.keywords.map((keyword) => (
              <li key={keyword}>
                <Badge variant="outline">{keyword}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium">Related topics</h2>
        {topics.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No topic is linked to this lead yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {topic.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

async function LeadBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lead = findStoryLead(slug);
  if (!lead) notFound();
  const sources = sourcesFor(lead);
  const topics = topicsFor(lead);
  const hasRelated =
    lead.entitySlugs.length > 0 || lead.topicSlugs.length > 0;

  return (
    <div className="grid flex-1 items-start gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-6">
          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
            <Image
              src={lead.thumbnailUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 48rem"
            />
          </div>
          <div className="flex flex-col gap-3">
            <StoryLeadStateBadge state={lead.state} />
            <h1 className="max-w-3xl font-[family-name:var(--font-card-serif)] text-3xl leading-tight font-normal tracking-tight sm:text-4xl">
              {lead.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lead.owner ? (
                <>
                  Assigned to <span className="text-foreground">{lead.owner}</span>
                </>
              ) : (
                "Unassigned"
              )}
              <span aria-hidden> · </span>
              Suggested {formatRelativeDay(lead.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Convert to draft</Button>
            <p className="text-xs text-muted-foreground">
              {lead.state === "converted"
                ? "This lead was converted to an editorial draft."
                : "Conversion to an editorial draft is a Phase 2 action."}
            </p>
          </div>
        </header>

        <section className="max-w-3xl border-t pt-8">
          <h2 className="text-lg font-semibold tracking-tight">Suggested angle</h2>
          <p className="mt-3 leading-relaxed">{lead.angle}</p>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-lg font-semibold tracking-tight">Supporting sources</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference material behind this lead. Attribution stays with each publisher.
          </p>
          {sources.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No supporting sources are linked yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {sources.map((article) => (
                <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/archive/${article.slug}`}
                    className="underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {article.publisher}
                    <span aria-hidden> · </span>
                    <time dateTime={article.publishedAt}>
                      {formatDateTime(article.publishedAt)}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {hasRelated && (
          <section className="border-t pt-8">
            <h2 className="text-lg font-semibold tracking-tight">Related</h2>
            <div className="mt-4">
              <LeadAside lead={lead} />
            </div>
          </section>
        )}
      </div>

      <WhyPost lead={lead} sources={sources} topics={topics} />
    </div>
  );
}
