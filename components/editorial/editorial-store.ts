"use client";

import { useSyncExternalStore } from "react";
import { mergeEditorialArticles } from "@/lib/editorial-draft";
import type { EditorialArticle } from "@/lib/types";

export { mergeEditorialArticles };

// ponytail: module-level session store; swap for the editorial API when it exists.
const savedDrafts: EditorialArticle[] = [];
const listeners = new Set<() => void>();

export function saveEditorialDraft(article: EditorialArticle) {
  const index = savedDrafts.findIndex((item) => item.slug === article.slug);
  if (index === -1) {
    savedDrafts.unshift(article);
  } else {
    savedDrafts[index] = article;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSavedDrafts(): EditorialArticle[] {
  return useSyncExternalStore(
    subscribe,
    () => savedDrafts,
    () => savedDrafts,
  );
}
