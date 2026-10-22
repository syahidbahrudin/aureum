import { mockArchiveArticles } from "@/lib/mock/articles";
import { mockTopics } from "@/lib/mock/topics";
import { mockThumbnail } from "@/lib/mock-images";
import type { ArchiveArticle, Entity, Topic, TopicEvent } from "@/lib/types";

export const mockEntities: Entity[] = [
  {
    id: "ent-1",
    name: "Central Reserve Bank",
    slug: "central-reserve-bank",
    category: "organization",
    mentionCount: 124,
    articleCount: 89,
    reviewStatus: "verified",
    imageUrl: mockThumbnail("ent-1"),
    description:
      "National monetary authority. In the 8 October coverage it left the benchmark rate at 4.25% after a two-day meeting, the fourth hold this year. Staff put September inflation at 2.8%, down from 3.1% in August, and the next decision is set for 12 November.",
    aliases: ["the central bank"],
    articleSlugs: [
      "central-bank-holds-rates-steady",
      "markets-open-higher-earnings-optimism",
    ],
  },
  {
    id: "ent-2",
    name: "Elena Vasquez",
    slug: "elena-vasquez",
    category: "person",
    mentionCount: 42,
    articleCount: 28,
    reviewStatus: "verified",
    imageUrl: mockThumbnail("ent-2"),
    description:
      "Finance minister. Verified on the rate-decision story, where the bank held at 4.25% and two committee members voted for a quarter-point cut. The article does not quote her.",
    aliases: ["Finance minister"],
    articleSlugs: ["central-bank-holds-rates-steady"],
  },
  {
    id: "ent-3",
    name: "GreenPath Analytics",
    slug: "greenpath-analytics",
    category: "organization",
    mentionCount: 18,
    articleCount: 12,
    reviewStatus: "suggested",
    imageUrl: mockThumbnail("ent-3"),
    description:
      "Climate data startup, still a suggested match. The closest archive piece is the Series B round: Northwind Analytics raised $48 million to sell emissions estimates from shipping and warehouse data. That article names Northwind, not GreenPath.",
    aliases: [],
    articleSlugs: ["startup-raises-series-b-climate-analytics"],
  },
  {
    id: "ent-4",
    name: "Northern Coalition",
    slug: "northern-coalition",
    category: "political_party",
    mentionCount: 67,
    articleCount: 45,
    reviewStatus: "verified",
    imageUrl: mockThumbnail("ent-4"),
    description:
      "Political party in the regional coalition talks. Negotiators returned on Thursday after a two-day pause. The Greens want the rail allocation raised before they sign. The centre-right bloc has offered a review in the first budget, not a fixed increase.",
    aliases: [],
    articleSlugs: ["coalition-talks-resume-regional-elections"],
  },
  {
    id: "ent-5",
    name: "Metro City",
    slug: "metro-city",
    category: "place",
    mentionCount: 203,
    articleCount: 156,
    reviewStatus: "verified",
    imageUrl: mockThumbnail("ent-5"),
    description:
      "The city in the local desk. Its council voted 7–2 to add two bus routes and extend the tram line by 3.4 kilometres, with a $210 million capital budget over six years.",
    aliases: [],
    articleSlugs: ["city-council-approves-transit-expansion"],
  },
  {
    id: "ent-6",
    name: "Budget vote 2026",
    slug: "budget-vote-2026",
    category: "event",
    mentionCount: 31,
    articleCount: 24,
    reviewStatus: "verified",
    imageUrl: mockThumbnail("ent-6"),
    description:
      "Legislative budget approval for the year. The linked archive item is the transit plan, which tied $210 million over six years to the council vote. This is separate from the central bank rate decision.",
    aliases: [],
    articleSlugs: ["city-council-approves-transit-expansion"],
  },
  {
    id: "ent-7",
    name: "The Long Transition",
    slug: "the-long-transition",
    category: "book",
    mentionCount: 9,
    articleCount: 6,
    reviewStatus: "pending",
    imageUrl: mockThumbnail("ent-7"),
    description:
      "Policy history. The record is still pending review, and no archive article is linked to it yet.",
    aliases: [],
    articleSlugs: [],
  },
  {
    id: "ent-8",
    name: "James Okonkwo",
    slug: "james-okonkwo",
    category: "person",
    mentionCount: 15,
    articleCount: 11,
    reviewStatus: "suggested",
    imageUrl: mockThumbnail("ent-8"),
    description:
      "Tech correspondent. The match is still a suggestion, and no archive article is linked to this name yet.",
    aliases: [],
    articleSlugs: [],
  },
];

export function articlesForEntity(entity: Entity): ArchiveArticle[] {
  return entity.articleSlugs.flatMap((slug) => {
    const article = mockArchiveArticles.find((item) => item.slug === slug);
    return article ? [article] : [];
  });
}

export type EntityEvent = {
  topicSlug: string;
  topicName: string;
  event: TopicEvent;
};

function topicHasArticle(topic: Topic, slug: string): boolean {
  return (
    topic.background.articleSlugs.includes(slug) ||
    topic.latest.articleSlugs.includes(slug) ||
    topic.events.some((event) => event.articleSlugs.includes(slug))
  );
}

export function entitiesForArticle(slug: string): Entity[] {
  return mockEntities.filter((entity) => entity.articleSlugs.includes(slug));
}

export function topicsForArticle(slug: string): Topic[] {
  return mockTopics.filter((topic) => topicHasArticle(topic, slug));
}

export function topicsForEntity(entity: Entity): Topic[] {
  if (entity.articleSlugs.length === 0) return [];
  return mockTopics.filter((topic) =>
    entity.articleSlugs.some((slug) => topicHasArticle(topic, slug)),
  );
}

export function eventsForEntity(entity: Entity): EntityEvent[] {
  const slugs = new Set(entity.articleSlugs);
  if (slugs.size === 0) return [];
  return mockTopics.flatMap((topic) =>
    topic.events
      .filter((event) => event.articleSlugs.some((slug) => slugs.has(slug)))
      .map((event) => ({
        topicSlug: topic.slug,
        topicName: topic.name,
        event,
      })),
  );
}
