import assert from "node:assert";
import { randomBytes } from "node:crypto";
import { isBlockedAddress, parseIngestForm, urlShapeError } from "./ingest";
import { openSecret, orderPublicAddresses, sealSecret } from "./ingest-net";

// Run with: bun lib/ingest.check.ts

{
  assert.equal(urlShapeError("notaurl"), "Enter a valid http or https URL.");
  assert.equal(urlShapeError("file:///etc/passwd"), "Enter a valid http or https URL.");
  assert.equal(urlShapeError("http://user:pass@example.com/feed"), "Put API credentials in the auth secret, not the URL.");
  assert.equal(urlShapeError("http://127.0.0.1/feed"), "That address is not allowed for ingest.");
  assert.equal(urlShapeError("http://localhost/feed"), "That address is not allowed for ingest.");
  assert.equal(urlShapeError("http://169.254.169.254/latest"), "That address is not allowed for ingest.");
  assert.equal(urlShapeError("http://[::1]/feed"), "That address is not allowed for ingest.");
  assert.equal(urlShapeError("https://example.com/feed.xml"), null);
}

{
  assert.deepEqual(
    orderPublicAddresses([
      { address: "2606:4700:10::1", family: 6 },
      { address: "104.20.44.236", family: 4 },
    ]),
    [
      { address: "104.20.44.236", family: 4 },
      { address: "2606:4700:10::1", family: 6 },
    ],
  );
  assert.equal(
    orderPublicAddresses([{ address: "127.0.0.1", family: 4 }]),
    "blocked",
  );
  assert.equal(orderPublicAddresses([]), "blocked");
}

{
  assert.equal(isBlockedAddress("10.1.2.3"), true);
  assert.equal(isBlockedAddress("8.8.8.8"), false);
  assert.equal(isBlockedAddress("fd00::1"), true);
  assert.equal(isBlockedAddress("192.168.1.1"), true);
  assert.equal(isBlockedAddress("192.0.2.1"), true);
  assert.equal(isBlockedAddress("192.0.77.2"), false);
}

{
  const form = new FormData();
  form.set("name", "  Wire  ");
  form.set("publisher", "Daily");
  form.set("url", "https://example.com/rss");
  form.set("type", "rss");
  form.set("language", "en");
  form.set("status", "paused");
  form.set("intervalMinutes", "15");
  form.set("headers", '{"Accept":"application/rss+xml"}');
  const parsed = parseIngestForm(form);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.value.name, "Wire");
    assert.equal(parsed.value.intervalSeconds, 900);
    assert.equal(parsed.value.status, "paused");
    assert.deepEqual(parsed.value.headers, { Accept: "application/rss+xml" });
    assert.equal(parsed.value.id, null);
  }
}

{
  const form = new FormData();
  form.set("name", "Wire");
  form.set("publisher", "Daily");
  form.set("url", "https://example.com/rss");
  form.set("type", "rss");
  form.set("status", "active");
  form.set("intervalMinutes", "0");
  const parsed = parseIngestForm(form);
  assert.equal(parsed.ok, false);
}

{
  const form = new FormData();
  form.set("name", "Wire");
  form.set("publisher", "Daily");
  form.set("url", "https://example.com/rss");
  form.set("type", "rss");
  form.set("status", "active");
  form.set("intervalMinutes", "30");
  form.set("fieldMapping", '["nope"]');
  const parsed = parseIngestForm(form);
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.match(parsed.error, /Field mapping/);
}

{
  const key = randomBytes(32);
  const sealed = sealSecret("token", key);
  assert.notEqual(sealed, "token");
  assert.equal(openSecret(sealed, key), "token");
}

console.log("ingest checks ok");
