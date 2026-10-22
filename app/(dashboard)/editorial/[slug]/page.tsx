import type { Metadata } from "next";
import { EditorialStudioLoader } from "@/components/editorial/editorial-studio-loader";
import { findEditorialArticle, mockEditorialArticles } from "@/lib/mock/editorial";

export const instant = false;

export function generateStaticParams() {
  return mockEditorialArticles.map((article) => ({ slug: article.slug }));
}

type EditorialSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: EditorialSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findEditorialArticle(slug);
  return { title: article ? `${article.title} · Editorial` : "Editorial" };
}

export default async function EditorialSlugPage({
  params,
}: EditorialSlugPageProps) {
  const { slug } = await params;
  const article = findEditorialArticle(slug);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit article</h1>
        <p className="text-muted-foreground">
          Update the draft, insert images, or generate a fresh draft from the
          related topic.
        </p>
      </div>
      <EditorialStudioLoader slug={slug} serverArticle={article} />
    </div>
  );
}
