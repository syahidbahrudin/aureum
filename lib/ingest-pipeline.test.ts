import assert from "node:assert/strict";
import { test } from "node:test";
import { filterNewItems, mapApiItems } from "./ingest-pipeline";

test("skips urls already stored for the source", () => {
  const { fresh, duplicateCount } = filterNewItems(
    [
      { url: "https://a.com/1" },
      { url: "https://a.com/2" },
      { url: "https://a.com/1" },
      { url: "  " },
    ],
    ["https://a.com/2"],
  );
  assert.equal(duplicateCount, 2);
  assert.deepEqual(fresh, [{ url: "https://a.com/1" }]);
});

test("maps api rows from field mapping", () => {
  const items = mapApiItems(
    {
      data: {
        articles: [
          {
            slug: "x",
            link: "https://a.com/x",
            headline: "Hi",
            html: "<p>ok</p>",
            thumb: "https://img",
            by: "Ann",
            date: "2024-01-01",
          },
          { headline: "No url" },
        ],
      },
    },
    {
      items: "data.articles",
      id: "slug",
      url: "link",
      title: "headline",
      body: "html",
      image: "thumb",
      author: "by",
      publishedAt: "date",
    },
  );
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    url: "https://a.com/x",
    sourceKey: "x",
    title: "Hi",
    body: "<p>ok</p>",
    image: "https://img",
    author: "Ann",
    publishedAt: "2024-01-01",
  });
});
