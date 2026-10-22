import Image from "next/image";
import type { ReactNode } from "react";
import { portraitMediaClass } from "@/lib/card-layout";
import { cn } from "@/lib/utils";

export type PortraitOverlayCardProps = {
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string;
  imageClassName?: string;
  topRight?: ReactNode;
  centerOverlay?: ReactNode;
  className?: string;
};

export function PortraitOverlayCard({
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  description,
  meta,
  imageClassName,
  topRight,
  centerOverlay,
  className,
}: PortraitOverlayCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 transition-shadow hover:shadow-md",
        portraitMediaClass,
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className={cn("object-cover transition-transform duration-500 group-hover:scale-[1.02]", imageClassName)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
        aria-hidden
      />
      {centerOverlay}
      {topRight && (
        <div className="absolute top-2 right-2 z-10">{topRight}</div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-3 pb-4 pt-16 text-center text-white">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/65">
          {eyebrow}
        </p>
        <h3
          className="mt-1.5 line-clamp-3 font-[family-name:var(--font-card-serif)] text-lg leading-snug font-normal tracking-tight sm:text-xl"
        >
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/85">
            {description}
          </p>
        )}
        {meta && (
          <p className="mt-1.5 text-[0.65rem] uppercase tracking-wider text-white/55">
            {meta}
          </p>
        )}
      </div>
    </article>
  );
}
