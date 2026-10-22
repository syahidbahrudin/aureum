import assert from "node:assert/strict";
import test from "node:test";
import { pixelCrop } from "./image-crop";

test("pixelCrop", () => {
  assert.deepEqual(pixelCrop({ x: 0.1, y: 0.2, width: 0.5, height: 0.4 }, 1000, 500), {
    left: 100,
    top: 100,
    width: 500,
    height: 200,
  });
  assert.deepEqual(pixelCrop({ x: 100, y: 200, width: 500, height: 400 }, 1000, 500), {
    left: 100,
    top: 100,
    width: 500,
    height: 200,
  });
  assert.equal(pixelCrop({ x: 0, y: 0, width: 1000, height: 1000 }, 800, 600), null);
  assert.equal(pixelCrop({ x: 0, y: 0, width: 2, height: 2 }, 1000, 1000), null);
});
