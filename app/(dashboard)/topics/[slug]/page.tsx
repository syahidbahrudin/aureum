import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  getTopicDetail,
  type LinkedArticle,
  type TopicEntityRef,
} from "@/lib/db/functions/topic/topic.get";
import { entityCategoryLabel } from "@/lib/entity-categories";
import { formatDateTime, formatEventDate, formatNumber } from "@/lib/format";
import { topicStats } from "@/lib/topic-stats";
import type { Topic, TopicEvent, TopicSummary } from "@/lib/types";

export const instant = false;

function topicId(slug: string): number | null {
  const id = Number(slug);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function articlesFor(articles: LinkedArticle[], slugs: string[]): LinkedArticle[] {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  return slugs.flatMap((slug) => {
    const article = bySlug.get(slug);
    return article ? [article] : [];
  });
}

function eventSpan(events: TopicEvent[]): string {
  const dated = events.filter((event) => event.eventDate && event.datePrecision !== "unknown");
  const unknown = events.some((event) => event.datePrecision === "unknown");
  if (dated.length === 0) return "Date unknown";
  const times = dated.map((event) => new Date(event.eventDate!).getTime());
  const start = formatEventDate(new Date(Math.min(...times)).toISOString());
  const end = formatEventDate(new Date(Math.max(...times)).toISOString());
  const range = start === end ? start : `${start} – ${end}`;
  const approximate = dated.some((event) => event.datePrecision === "approximate");
  const notes = [approximate ? "includes an approximate date" : "", unknown ? "includes an unknown date" : ""]
    .filter(Boolean)
    .join(" · ");
  return notes ? `${range} · ${notes}` : range;
}

function eventWhen(event: TopicEvent): string {
  if (event.datePrecision === "unknown" || !event.eventDate) return "Date unknown";
  const day = formatEventDate(event.eventDate);
  return event.datePrecision === "approximate" ? `Approximate · ${day}` : day;
}

function ArticleThread({ articles }: { articles: LinkedArticle[] }) {
  return (
    <ul className="divide-y divide-border">
      {articles.map((article) => (
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
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
            ) : (
              "Publication date unknown"
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SummaryBlock({
  heading,
  summary,
  articles,
}: {
  heading: string;
  summary: TopicSummary;
  articles: LinkedArticle[];
}) {
  const linked = articlesFor(articles, summary.articleSlugs);
  return (
    <div>
      <h3 className="text-sm font-medium">{heading}</h3>
      <p className="mt-1 max-w-prose text-sm leading-relaxed">
        {summary.text || "No summary recorded."}
      </p>
      {linked.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {linked.map((article) => (
            <li key={article.id}>
              <Link
                href={`/archive/${article.slug}`}
                className="text-sm text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
              >
                {article.publisher}: {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-8 p-6" aria-busy="true">
          <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="aspect-[3/4] w-full max-w-56 rounded-xl bg-muted" />
            <div className="flex flex-col gap-3">
              <div className="h-8 w-64 max-w-full rounded bg-muted" />
              <div className="h-5 w-full max-w-xl rounded bg-muted" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="h-16 rounded bg-muted" />
                <div className="h-16 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <TopicBody params={params} />
    </Suspense>
  );
}

function TopicAside({
  topic,
  articles,
  entities,
}: {
  topic: Topic;
  articles: LinkedArticle[];
  entities: TopicEntityRef[];
}) {
  const publishers = [...articles.reduce((counts, article) => {
    counts.set(article.publisher, (counts.get(article.publisher) ?? 0) + 1);
    return counts;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <div
      className={
        entities.length > 0
          ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          : "grid gap-6 sm:grid-cols-2"
      }
    >
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
                    {entity.imageUrl ? (
                      <Image
                        src={entity.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
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
      <section>
        <h2 className="text-sm font-medium">Publishers</h2>
        {publishers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No articles linked yet.</p>
        ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {publishers.map(([name, count]) => (
            <li key={name} className="flex items-baseline justify-between gap-3 text-sm">
              <span>{name}</span>
              <span className="text-muted-foreground">
                {formatNumber(count)} {count === 1 ? "article" : "articles"}
              </span>
            </li>
          ))}
        </ul>
        )}
      </section>
      <section>
        <h2 className="text-sm font-medium">Event dates</h2>
        <p className="mt-3 text-sm text-muted-foreground">{eventSpan(topic.events)}</p>
      </section>
    </div>
  );
}

async function TopicBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const id = topicId((await params).slug);
  if (!id) notFound();
  const detail = await getTopicDetail(id);
  if (!detail) notFound();
  const { topic, articles, entities } = detail;
  const stats = topicStats(topic);

  return (
    <div className="flex flex-1 flex-col gap-10 p-6">
      <header className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
        <div className="relative aspect-[3/4] w-full max-w-56 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
          {topic.thumbnailUrl ? (
            <Image
              src={topic.thumbnailUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="224px"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{topic.name}</h1>
              <Badge
                variant={topic.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {topic.status}
              </Badge>
            </div>
            <p className="max-w-2xl text-muted-foreground">{topic.description}</p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(stats.articleCount)} articles · {formatNumber(stats.eventCount)}{" "}
              events · Updated {formatDateTime(topic.updatedAt)}
            </p>
          </div>
          <TopicAside topic={topic} articles={articles} entities={entities} />
        </div>
      </header>

      <section className="border-t pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Summary</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Suggested from source articles. Not an editorial draft.
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <SummaryBlock heading="Background" summary={topic.background} articles={articles} />
          <SummaryBlock heading="Latest" summary={topic.latest} articles={articles} />
        </div>
      </section>

      <section className="border-t pt-8">
        <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each event groups the articles that reported it. Publication times sit on the articles.
        </p>
        {topic.events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No timeline events yet.</p>
        ) : (
        <ol className="mt-2 divide-y">
          {topic.events.map((event) => (
            <li
              key={event.id}
              className="grid gap-4 py-6 lg:grid-cols-[9rem_minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:gap-8"
            >
              <p className="text-sm text-muted-foreground">
                {event.eventDate ? (
                  <time dateTime={event.eventDate}>{eventWhen(event)}</time>
                ) : (
                  eventWhen(event)
                )}
              </p>
              <div>
                <h3 className="font-[family-name:var(--font-card-serif)] text-xl leading-snug font-normal tracking-tight">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{event.summary}</p>
              </div>
              <ArticleThread articles={articlesFor(articles, event.articleSlugs)} />
            </li>
          ))}
        </ol>
        )}
      </section>
    </div>
  );
}
