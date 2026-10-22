import Link from "next/link";
import { PortraitOverlayCard } from "@/components/cards/portrait-overlay-card";
import { Badge } from "@/components/ui/badge";
import type { Topic } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { topicStats } from "@/lib/topic-stats";

type TopicCardProps = {
  topic: Topic;
};

export function TopicCard({ topic }: TopicCardProps) {
  const stats = topicStats(topic);
  const meta = `${formatNumber(stats.articleCount)} articles · ${formatNumber(stats.eventCount)} events`;

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <PortraitOverlayCard
        imageUrl={topic.thumbnailUrl}
        imageAlt=""
        eyebrow={topic.status === "active" ? "TOPIC" : "ARCHIVED"}
        title={topic.name}
        description={topic.description}
        meta={meta}
        topRight={
          <Badge
            variant={topic.status === "active" ? "default" : "secondary"}
            className="border-0 bg-black/50 capitalize text-white backdrop-blur-sm"
          >
            {topic.status}
          </Badge>
        }
      />
    </Link>
  );
}
