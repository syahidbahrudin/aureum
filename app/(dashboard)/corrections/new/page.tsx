import type { Metadata } from "next";
import { CorrectionEditor } from "@/components/corrections/correction-editor";
import { mockArchiveArticles } from "@/lib/mock/articles";
import { mockEditorialArticles } from "@/lib/mock/editorial";

export const metadata: Metadata = { title: "New correction · Corrections" };

export const instant = false;

type NewCorrectionPageProps = {
  searchParams: Promise<{ article?: string; source?: string }>;
};

export default async function NewCorrectionPage({
  searchParams,
}: NewCorrectionPageProps) {
  const { article, source } = await searchParams;
  const editorial = mockEditorialArticles.find((item) => item.slug === article);
  const archiveOptions = mockArchiveArticles.map((item) => ({
    slug: item.slug,
    title: item.title,
  }));

  return (
    <div className="flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New correction</h1>
        <p className="text-muted-foreground">
          Record a factual correction or a new development on a published
          article.
        </p>
      </div>
      <CorrectionEditor
        articleSlug={editorial?.slug ?? article ?? ""}
        articleTitle={editorial?.title ?? "Untitled article"}
        defaultSourceSlug={source}
        archiveOptions={archiveOptions}
      />
    </div>
  );
}
