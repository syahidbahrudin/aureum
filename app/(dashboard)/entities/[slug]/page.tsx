import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getEntityDetail } from "@/lib/db/functions/entity/entity.get";
import { entityCategoryLabel } from "@/lib/entity-categories";
import { formatDateTime, formatEventDate, formatNumber } from "@/lib/format";
import type { Entity, TopicEvent } from "@/lib/types";

export const instant = false;

function entityId(slug: string): number | null {
  const id = Number(slug);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function reviewBadgeVariant(
  status: Entity["reviewStatus"],
): "default" | "secondary" | "outline" {
  switch (status) {
    case "verified":
      return "default";
    case "suggested":
      return "secondary";
    case "pending":
      return "outline";
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/entities/[slug]">) {
  const id = entityId((await params).slug);
  if (!id) return { title: "Entity" };
  const detail = await getEntityDetail(id);
  return { title: detail ? `${detail.entity.name} · Aureum House` : "Entity" };
}

function eventWhen(event: TopicEvent): string {
  if (event.datePrecision === "unknown" || !event.eventDate) return "Date unknown";
  const day = formatEventDate(event.eventDate);
  return event.datePrecision === "approximate" ? `Approximate · ${day}` : day;
}

function EntityFallback() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6" aria-busy="true">
      <div className="h-5 w-24 rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="aspect-[3/4] w-full max-w-56 rounded-xl bg-muted" />
          <div className="flex flex-col gap-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-8 w-64 max-w-full rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        </div>
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

async function EntityContent({
  params,
}: PageProps<"/entities/[slug]">) {
  const id = entityId((await params).slug);
  if (!id) notFound();
  const detail = await getEntityDetail(id);
  if (!detail) notFound();
  const { entity, articles, topics, events } = detail;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Link
        href="/entities"
        className="w-fit text-sm text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
      >
        All entities
      </Link>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative aspect-[3/4] w-full max-w-56 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
              {entity.imageUrl ? (
                <Image
                  src={entity.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {entityCategoryLabel(entity.category)}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{entity.name}</h1>
              <Badge
                variant={reviewBadgeVariant(entity.reviewStatus)}
                className="capitalize"
              >
                {entity.reviewStatus}
              </Badge>
              <p className="max-w-prose text-sm leading-relaxed">{entity.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(entity.mentionCount)} mentions ·{" "}
                {formatNumber(entity.articleCount)} articles
              </p>
            </div>
          </div>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Related articles</h2>
            {articles.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                No archive articles are linked to this entity yet.
              </p>
            ) : (
              <ul className="divide-y rounded-xl border">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/archive/${article.slug}`}
                      className="flex flex-col gap-1 px-4 py-3 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      <span className="font-medium">{article.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {article.publisher}
                        <span aria-hidden> · </span>
                        {article.publishedAt
                          ? formatDateTime(article.publishedAt)
                          : "Publication date unknown"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="flex flex-col gap-6 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          {entity.aliases.length > 0 && (
            <section>
              <h2 className="text-sm font-medium">Aliases</h2>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                {entity.aliases.map((alias) => (
                  <li key={alias}>{alias}</li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-sm font-medium">Topics</h2>
            {topics.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No topic shares an article with this entity yet.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-3">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {topic.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-sm font-medium">Events</h2>
            {events.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No timeline event shares an article with this entity yet.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-3">
                {events.map(({ topicSlug, topicName, event }) => (
                  <li key={event.id}>
                    <Link
                      href={`/topics/${topicSlug}`}
                      className="font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {eventWhen(event)}
                      <span aria-hidden> · </span>
                      {topicName}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function EntityPage(props: PageProps<"/entities/[slug]">) {
  return (
    <Suspense fallback={<EntityFallback />}>
      <EntityContent {...props} />
    </Suspense>
  );
}
