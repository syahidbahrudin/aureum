import Link from "next/link";
import { PortraitOverlayCard } from "@/components/cards/portrait-overlay-card";
import { Badge } from "@/components/ui/badge";
import type { Entity } from "@/lib/types";
import { entityCategoryLabel } from "@/lib/entity-categories";
import { formatNumber } from "@/lib/format";

type EntityCardProps = {
  entity: Entity;
};

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

export function EntityCard({ entity }: EntityCardProps) {
  const meta = `${formatNumber(entity.mentionCount)} mentions · ${formatNumber(entity.articleCount)} articles`;

  return (
    <Link
      href={`/entities/${entity.slug}`}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
    >
      <PortraitOverlayCard
        imageUrl={entity.imageUrl}
        imageAlt=""
        eyebrow={entityCategoryLabel(entity.category).toUpperCase()}
        title={entity.name}
        description={entity.description}
        meta={meta}
        topRight={
          <Badge
            variant={reviewBadgeVariant(entity.reviewStatus)}
            className="border-0 bg-black/50 capitalize text-white backdrop-blur-sm"
          >
            {entity.reviewStatus}
          </Badge>
        }
      />
    </Link>
  );
}
