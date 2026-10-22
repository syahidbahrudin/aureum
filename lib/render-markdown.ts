import { marked } from "marked";
import sanitize from "sanitize-html";

const schemes = ["http", "https", "mailto"];

export function renderArticleMarkdown(markdown: string): string {
  const html = marked.parse(markdown, { async: false, gfm: true });
  return sanitize(html, {
    allowedTags: [
      "a",
      "b",
      "blockquote",
      "br",
      "code",
      "del",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"],
      img: ["alt", "src"],
      td: ["align"],
      th: ["align"],
    },
    allowedSchemes: schemes,
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...(attribs.href ? { href: attribs.href } : {}),
          rel: "noreferrer noopener",
          target: "_blank",
        },
      }),
    },
  });
}
