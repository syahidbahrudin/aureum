import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChannelEditor } from "@/components/distribution/channel-editor";
import { findDistributionItem, mockDistributionItems } from "@/lib/mock/distribution";

export function generateStaticParams() {
  return mockDistributionItems.map((item) => ({ slug: item.articleSlug }));
}

type DistributionSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: DistributionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = findDistributionItem(slug);
  return { title: item ? `${item.title} · Distribution` : "Distribution" };
}

export default async function DistributionDetailPage({
  params,
}: DistributionSlugPageProps) {
  const { slug } = await params;
  const item = findDistributionItem(slug);
  if (!item) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-muted-foreground">
          Channel versions for{" "}
          <Link
            href={`/editorial#${item.articleSlug}`}
            className="text-foreground hover:underline"
          >
            this article
          </Link>
          . Edit and copy each one. Direct publishing is not connected, so there
          is no schedule or post action. Edits are preview only.
        </p>
      </div>
      <ChannelEditor item={item} />
    </div>
  );
}
