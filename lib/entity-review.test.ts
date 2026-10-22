import assert from "node:assert/strict";
import test from "node:test";
import { entityReviewStatus } from "./entity-review";

test("entityReviewStatus", () => {
  assert.equal(entityReviewStatus(2, 0), "verified");
  assert.equal(entityReviewStatus(2, 1), "suggested");
  assert.equal(entityReviewStatus(0, 3), "suggested");
  assert.equal(entityReviewStatus(0, 0), "pending");
});
