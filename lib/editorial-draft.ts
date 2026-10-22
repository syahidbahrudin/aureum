import type { EditorialArticle } from "@/lib/types";

export type DraftSuggestion = {
  title: string;
  standfirst: string;
  body: string;
};

/** Mock articles plus session drafts; a saved draft wins by slug. */
export function mergeEditorialArticles(
  base: EditorialArticle[],
  saved: EditorialArticle[],
): EditorialArticle[] {
  const savedSlugs = new Set(saved.map((draft) => draft.slug));
  return [...saved, ...base.filter((article) => !savedSlugs.has(article.slug))];
}

/** Insert `snippet` into `value` replacing the [start,end] selection. */
export function insertAtCursor(
  value: string,
  start: number,
  end: number,
  snippet: string,
): { text: string; caret: number } {
  const text = value.slice(0, start) + snippet + value.slice(end);
  return { text, caret: start + snippet.length };
}

/**
 * Merge an AI suggestion into the editor's current fields without discarding
 * anything the editor has already typed. Empty fields take the suggestion;
 * a non-empty body gets the suggestion appended after a blank line.
 */
export function mergeDraftSuggestion(
  current: DraftSuggestion,
  suggestion: DraftSuggestion,
): DraftSuggestion {
  const keepOrFill = (own: string, offered: string) =>
    own.trim() === "" ? offered : own;
  const body =
    current.body.trim() === ""
      ? suggestion.body
      : `${current.body}\n\n${suggestion.body}`;
  return {
    title: keepOrFill(current.title, suggestion.title),
    standfirst: keepOrFill(current.standfirst, suggestion.standfirst),
    body,
  };
}
