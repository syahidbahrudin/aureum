import Link from "next/link";
import { PortraitOverlayCard } from "@/components/cards/portrait-overlay-card";
import { EditorialStateBadge } from "@/components/status-badges";
import { formatDateTime } from "@/lib/format";
import { findTopic } from "@/lib/mock/topics";
import type { EditorialArticle } from "@/lib/types";

type EditorialArticleCardProps = {
  article: EditorialArticle;
};

export function EditorialArticleCard({ article }: EditorialArticleCardProps) {
  const topic = article.topicSlug ? findTopic(article.topicSlug) : undefined;
  const eyebrow = (topic?.name ?? "Editorial").toUpperCase();
  const scheduled = article.scheduledAt
    ? formatDateTime(article.scheduledAt)
    : "Not scheduled";
  const updated = formatDateTime(article.updatedAt);

  return (
    <Link
      href={`/editorial/${article.slug}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="sr-only">
        {article.sourceCount} sources. Updated {updated}.
        {article.scheduledAt ? ` Scheduled ${scheduled}.` : ""}
        {article.standfirst ? ` ${article.standfirst}` : ""}
      </span>
      <PortraitOverlayCard
        imageUrl={article.coverImageUrl}
        imageAlt=""
        eyebrow={eyebrow}
        title={article.title}
        description={article.author}
        topRight={<EditorialStateBadge state={article.state} />}
        centerOverlay={
          <div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col gap-2 bg-black p-4 text-left text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-within:opacity-100"
            aria-hidden
          >
            <p className="text-[0.6rem] font-medium tracking-[0.18em] text-white/75 uppercase">
              {eyebrow}
            </p>
            <h3 className="line-clamp-2 font-[family-name:var(--font-card-serif)] text-base leading-snug font-normal">
              {article.title}
            </h3>
            {article.standfirst && (
              <p className="line-clamp-3 text-xs leading-relaxed text-white/90">
                {article.standfirst}
              </p>
            )}
            <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1.5 text-[0.65rem] leading-tight">
              <div>
                <dt className="text-white/75">Author</dt>
                <dd className="text-white">{article.author}</dd>
              </div>
              <div>
                <dt className="text-white/75">Sources</dt>
                <dd className="text-white tabular-nums">{article.sourceCount}</dd>
              </div>
              <div>
                <dt className="text-white/75">Updated</dt>
                <dd className="text-white">{updated}</dd>
              </div>
              <div>
                <dt className="text-white/75">Scheduled</dt>
                <dd className="text-white">{scheduled}</dd>
              </div>
            </dl>
          </div>
        }
      />
    </Link>
  );
}
