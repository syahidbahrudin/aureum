import type { ReactElement, SVGProps } from "react";

/**
 * Monochrome brand marks drawn with currentColor so they read in light and
 * dark. Simplified geometric approximations, not official brand artwork; the
 * CMS name is always shown alongside for recognition.
 */
type MarkProps = SVGProps<SVGSVGElement> & { slug: string };

const marks: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  wordpress: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7 8.5l2.1 7 1.9-5 1.9 5 2.1-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  drupal: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c0 0-5.5 6.2-5.5 11a5.5 5.5 0 1011 0C17.5 8.2 12 2 12 2zm0 15.6a3.4 3.4 0 01-3.4-3.4c0-1.1.5-2 .5-2 .4 1 1.3 1.7 2.4 1.7 1.5 0 2.1-1 2.1-1 .9.9 1.8 1.6 1.8 3.3A3.4 3.4 0 0112 17.6z" />
    </svg>
  ),
  strapi: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3h11v7h7v11h-7v-7h-4V7H3z" fillOpacity={0.9} />
      <path d="M14 10h7l-7 7z" fillOpacity={0.5} />
    </svg>
  ),
  payload: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="M12 2.5l8.5 5v9L12 21.5l-2.5-1.5v-8L17 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function CmsMark({ slug, ...props }: MarkProps) {
  const Mark = marks[slug];
  if (!Mark) return null;
  return <Mark aria-hidden {...props} />;
}

export function hasCmsMark(slug: string) {
  return slug in marks;
}
