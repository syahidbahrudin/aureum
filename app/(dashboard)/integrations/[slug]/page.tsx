import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsMark } from "@/components/integrations/cms-mark";
import { findIntegration, mockIntegrations } from "@/lib/mock/integrations";

export function generateStaticParams() {
  return mockIntegrations.map((integration) => ({ slug: integration.slug }));
}

type IntegrationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: IntegrationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const integration = findIntegration(slug);
  return {
    title: integration
      ? `${integration.name} · Integrations`
      : "Integrations",
  };
}

export default async function IntegrationGuidePage({
  params,
}: IntegrationPageProps) {
  const { slug } = await params;
  const integration = findIntegration(slug);
  if (!integration) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8 p-6">
      <div className="flex items-start gap-4">
        <CmsMark slug={integration.slug} className="size-10 shrink-0 text-foreground" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {integration.name}
          </h1>
          <p className="mt-1 text-muted-foreground">{integration.summary}</p>
          <a
            href={integration.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-foreground underline underline-offset-4 hover:no-underline"
          >
            API documentation
          </a>
        </div>
      </div>

      <ol className="flex flex-col gap-6">
        {integration.steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <h2 className="font-medium">{step.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </div>
            <div className="ml-9 overflow-hidden rounded-lg ring-1 ring-foreground/10">
              {step.code ? (
                <pre className="overflow-x-auto bg-muted/50 p-4 text-xs leading-relaxed">
                  <code>{step.code}</code>
                </pre>
              ) : (
                <div className="flex min-h-24 items-center justify-center bg-muted/30 p-4 text-xs text-muted-foreground">
                  Snippet not written yet
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
