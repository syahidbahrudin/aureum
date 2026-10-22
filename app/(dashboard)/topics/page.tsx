import { TopicCard } from "@/components/topics/topic-card";
import { listTopics } from "@/lib/db/functions/topic/topic.get";
import { portraitCardGridClass } from "@/lib/card-layout";
import type { Topic } from "@/lib/types";

export const instant = false;

export default async function TopicsPage() {
  let topics: Topic[] = [];
  let loadError: string | null = null;
  try {
    topics = await listTopics();
  } catch (error) {
    console.error(
      "topic list failed",
      error instanceof Error ? error.message : "unknown",
    );
    loadError = "Topics could not be loaded. Check the database connection.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
        <p className="text-muted-foreground">
          Stories and timelines grouping coverage across sources.
        </p>
      </div>
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics yet.</p>
      ) : (
        <ul className={portraitCardGridClass}>
          {topics.map((topic) => (
            <li key={topic.id}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
