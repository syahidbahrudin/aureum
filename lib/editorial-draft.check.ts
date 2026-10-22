import assert from "node:assert";
import {
  insertAtCursor,
  mergeDraftSuggestion,
  mergeEditorialArticles,
} from "./editorial-draft";
import type { EditorialArticle } from "./types";

// Run with: bun lib/editorial-draft.check.ts

// insert at a collapsed caret
{
  const { text, caret } = insertAtCursor("ab", 1, 1, "X");
  assert.equal(text, "aXb");
  assert.equal(caret, 2);
}

// insert replacing a selection
{
  const { text, caret } = insertAtCursor("hello", 1, 4, "EY");
  assert.equal(text, "hEYo");
  assert.equal(caret, 3);
}

// empty fields take the suggestion
{
  const merged = mergeDraftSuggestion(
    { title: "", standfirst: "", body: "" },
    { title: "T", standfirst: "S", body: "B" },
  );
  assert.deepEqual(merged, { title: "T", standfirst: "S", body: "B" });
}

// typed text is never overwritten; body is appended
{
  const merged = mergeDraftSuggestion(
    { title: "Mine", standfirst: "  ", body: "para" },
    { title: "AI", standfirst: "AI lede", body: "AI para" },
  );
  assert.equal(merged.title, "Mine");
  assert.equal(merged.standfirst, "AI lede");
  assert.equal(merged.body, "para\n\nAI para");
}

// saved draft wins by slug and is listed first
{
  const mock: EditorialArticle = {
    id: "ed-1",
    title: "Old",
    slug: "same",
    state: "published",
    author: "A",
    updatedAt: "2026-10-07T16:00:00Z",
    scheduledAt: null,
    sourceCount: 1,
    standfirst: "",
    topicSlug: null,
    coverImageUrl: "",
    body: "",
  };
  const saved: EditorialArticle = { ...mock, title: "New", state: "draft" };
  const extra: EditorialArticle = { ...mock, id: "ed-2", slug: "other" };
  const merged = mergeEditorialArticles([mock, extra], [saved]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0]?.title, "New");
  assert.equal(merged[1]?.slug, "other");
}

console.log("editorial-draft checks passed");
