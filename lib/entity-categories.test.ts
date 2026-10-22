import assert from "node:assert/strict";
import test from "node:test";
import {
  entityCategoryLabel,
  normalizeEntityCategory,
} from "./entity-categories";

test("normalizeEntityCategory", () => {
  assert.equal(normalizeEntityCategory("Person"), "person");
  assert.equal(normalizeEntityCategory("political party"), "political_party");
  assert.equal(normalizeEntityCategory("  Book-Title  "), "book_title");
  assert.equal(normalizeEntityCategory("!!!"), "");
  assert.equal(normalizeEntityCategory("a".repeat(80)).length, 64);
});

test("entityCategoryLabel", () => {
  assert.equal(entityCategoryLabel("political_party"), "Political party");
  assert.equal(entityCategoryLabel("person"), "Person");
});
