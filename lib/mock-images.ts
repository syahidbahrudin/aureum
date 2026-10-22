/** Deterministic placeholder image URLs for mock UI (picsum.photos). */
export function mockThumbnail(seed: string, width = 400, height = 533): string {
  return `https://picsum.photos/seed/aureum-${seed}/${width}/${height}`;
}
