export function normalizeEntityCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64)
    .replace(/_+$/g, "");
}

export function entityCategoryLabel(category: string): string {
  const words = category.replace(/_/g, " ").trim();
  if (!words) return category;
  return words.charAt(0).toUpperCase() + words.slice(1);
}
