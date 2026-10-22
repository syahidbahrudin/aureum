import assert from "node:assert";
import { renderArticleMarkdown } from "./render-markdown";

// Run with: npx tsx lib/render-markdown.check.ts

{
  const html = renderArticleMarkdown("**bold** and [source](https://example.com/a)");
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /href="https:\/\/example\.com\/a"/);
  assert.match(html, /rel="noreferrer noopener"/);
}

{
  const html = renderArticleMarkdown(
    '<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n![p](javascript:alert(1))',
  );
  assert.doesNotMatch(html, /script|javascript:/i);
}

console.log("render-markdown ok");
