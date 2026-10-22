import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProcessingStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import {
  getArchive,
  type ArchiveEntityName,
  type ArchiveTopicName,
} from "@/lib/db/functions/archive/archive.get";
import { entityCategoryLabel } from "@/lib/entity-categories";
import { formatDateTime } from "@/lib/format";
import { processingStatusLabel } from "@/lib/labels";
import { renderArticleMarkdown } from "@/lib/render-markdown";
import type { ProcessingStatus } from "@/lib/types";

export const instant = false;

type ArchiveSlugPageProps = {
  params: Promise<{ slug: string }>;
};

function archiveId(slug: string): number | null {
  const id = Number(slug);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: ArchiveSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = archiveId(slug);
  if (!id) return { title: "Archive" };
  const row = await getArchive(id);
  return { title: row ? `${row.article.title} · Archive` : "Archive" };
}

function emptyRelationCopy(
  kind: "entities" | "topics",
  status: ProcessingStatus,
): string {
  if (status === "pending" || status === "processing") {
    return kind === "entities"
      ? "Entities appear after extraction finishes."
      : "Topics appear after suggestions finish.";
  }
  if (status === "failed") {
    return kind === "entities"
      ? "Entity extraction did not finish."
      : "Topic suggestions did not finish.";
  }
  return kind === "entities"
    ? "No entities are linked to this article."
    : "No topics include this article.";
}

function EntityNames({ entities }: { entities: ArchiveEntityName[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-3">
      {entities.map((entity) => (
        <li key={entity.id}>
          <p className="font-medium">{entity.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {entityCategoryLabel(entity.category)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function TopicNames({ topics }: { topics: ArchiveTopicName[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-3">
      {topics.map((topic) => (
        <li key={topic.id}>
          <p className="font-medium">{topic.name}</p>
          {topic.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {topic.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default async function ArchiveArticlePage({
  params,
}: ArchiveSlugPageProps) {
  const { slug } = await params;
  const id = archiveId(slug);
  const row = id ? await getArchive(id) : null;
  if (!row) notFound();
  const { article, entities, topics } = row;
  const statusCopy = processingStatusLabel(article.status);

  return (
    <article className="flex max-w-3xl mx-auto flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ProcessingStatusBadge status={article.status} />
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="font-[family-name:var(--font-card-serif)] text-4xl leading-tight font-normal tracking-tight">
          {article.title}
        </h1>
        <p className="text-muted-foreground">
          {article.author ? (
            <>
              <span className="text-foreground">{article.author}</span>
              <span aria-hidden> · </span>
            </>
          ) : null}
          {article.publisher}
          {article.publishedAt ? (
            <>
              <span aria-hidden> · </span>
              {formatDateTime(article.publishedAt)}
            </>
          ) : null}
        </p>
        <a
          href={article.originalUrl}
          className="w-fit max-w-full break-all text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          rel="noreferrer"
          target="_blank"
        >
          {article.originalUrl}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </header>
      {article.status !== "ready" && (
        <p
          className={
            article.status === "failed"
              ? "max-w-3xl rounded-lg border border-destructive/40 px-4 py-3 text-sm"
              : "max-w-3xl rounded-lg border px-4 py-3 text-sm text-muted-foreground"
          }
          role={article.status === "failed" ? "alert" : "status"}
        >
          {statusCopy}
        </p>
      )}
      {article.thumbnailUrl ? (
        <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-xl bg-muted">
          <Image
            src={article.thumbnailUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
          />
        </div>
      ) : null}
      {article.markdown ? (
        <div
          className="max-w-3xl text-base leading-7 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h1]:mt-8 [&_h1]:font-[family-name:var(--font-card-serif)] [&_h1]:text-3xl [&_h1]:leading-tight [&_h2]:mt-6 [&_h2]:text-2xl [&_h3]:mt-5 [&_h3]:text-xl [&_img]:mt-4 [&_img]:h-auto [&_img]:max-w-full [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-4 [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_table]:mt-4 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&>:first-child]:mt-0"
          dangerouslySetInnerHTML={{
            __html: renderArticleMarkdown(article.markdown),
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No article text yet.</p>
      )}
      <dl className="grid max-w-3xl gap-4 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Author</dt>
          <dd>{article.author || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Source</dt>
          <dd>{article.sourceName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Fetched</dt>
          <dd>{formatDateTime(article.fetchedAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Language</dt>
          <dd className="uppercase">{article.language || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Original</dt>
          <dd>
            <a
              href={article.originalUrl}
              className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              rel="noreferrer"
              target="_blank"
            >
              <span className="break-all">{article.originalUrl}</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
      </dl>
      <section className="grid max-w-3xl gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium">Entities</h2>
          {entities.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {emptyRelationCopy("entities", article.status)}
            </p>
          ) : (
            <EntityNames entities={entities} />
          )}
        </div>
        <div>
          <h2 className="text-sm font-medium">Topics</h2>
          {topics.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {emptyRelationCopy("topics", article.status)}
            </p>
          ) : (
            <TopicNames topics={topics} />
          )}
        </div>
      </section>
    </article>
  );
}
