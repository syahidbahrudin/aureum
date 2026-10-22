import sanitize from 'sanitize-html';
import { FormatOption } from "firecrawl";
import { firecrawl } from ".";

export async function scrapURL(
  url: string,
  type: "markdown" | "html" | "json" | "text" = "markdown",
) {
  const scrapeResult = await firecrawl.scrape(url, {
    formats: [type as FormatOption],
  });
  return scrapeResult;
}

export async function mapURL(url: string, limit = 50) {
  return firecrawl.map(url, { limit });
}

export async function sanitizeHtml(html: string) {
  return sanitize(html, {
    allowedTags: ['a', 'b', 'blockquote', 'br', 'cite', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'ul'],
    allowedAttributes: {
      a: ['href'],
      img: ['src'],
    },
  });
}

