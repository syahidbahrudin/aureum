import { AlertCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { PortraitOverlayCard } from "@/components/cards/portrait-overlay-card";
import { ProcessingStatusBadge } from "@/components/status-badges";
import type { ArchiveArticle } from "@/lib/types";
import { processingStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

type ArchiveArticleCardProps = {
  article: ArchiveArticle;
};

export function ArchiveArticleCard({ article }: ArchiveArticleCardProps) {
  const isProcessing = article.status === "processing";
  const isPending = article.status === "pending";
  const isFailed = article.status === "failed";
  const showLoadingOverlay = isProcessing || isPending;

  const eyebrow =
    article.tags[0]?.toUpperCase() ?? article.publisher.toUpperCase();

  const description = isFailed
    ? (article.statusDetail ?? "Processing failed")
    : isPending || isProcessing
      ? (article.statusDetail ?? processingStatusLabel(article.status))
      : `${article.author} · ${article.publisher}`;

  return (
    <Link
      href={`/archive/${article.slug}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <PortraitOverlayCard
        imageUrl={article.thumbnailUrl}
        imageAlt=""
        eyebrow={isProcessing ? "PROCESSING" : isPending ? "PENDING" : isFailed ? "FAILED" : eyebrow}
        title={article.title}
        description={description}
        imageClassName={cn(
          showLoadingOverlay && "opacity-50",
          isFailed && "opacity-40 grayscale",
        )}
        topRight={<ProcessingStatusBadge status={article.status} />}
        centerOverlay={
          <>
            {isProcessing && (
              <div
                className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 bg-black/40"
                role="status"
                aria-live="polite"
                aria-label={`${processingStatusLabel(article.status)}: ${article.title}`}
              >
                <Loader2 className="size-8 animate-spin text-white" aria-hidden />
              </div>
            )}
            {isPending && (
              <div
                className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 bg-black/30"
                role="status"
                aria-live="polite"
              >
                <Clock className="size-7 text-white/90" aria-hidden />
              </div>
            )}
            {isFailed && (
              <div
                className="absolute inset-x-0 top-1/3 z-[5] flex justify-center"
                role="alert"
              >
                <AlertCircle className="size-8 text-red-300" aria-hidden />
              </div>
            )}
          </>
        }
        className={isFailed ? "ring-destructive/40" : undefined}
      />
    </Link>
  );
}
