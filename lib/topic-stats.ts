export function topicStats(topic: {
  events: { articleSlugs: string[] }[];
  articleCount?: number;
  eventCount?: number;
}): { articleCount: number; eventCount: number } {
  if (topic.articleCount != null && topic.eventCount != null) {
    return { articleCount: topic.articleCount, eventCount: topic.eventCount };
  }
  const slugs = new Set(topic.events.flatMap((event) => event.articleSlugs));
  return { articleCount: slugs.size, eventCount: topic.events.length };
}
