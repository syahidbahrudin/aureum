import Link from "next/link";
import { CmsMark } from "@/components/integrations/cms-mark";
import { mockIntegrations } from "@/lib/mock/integrations";

export default function IntegrationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Step-by-step guides for publishing an approved article to a CMS. Code
          snippets are placeholders until each connection is wired.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockIntegrations.map((integration) => (
          <Link
            key={integration.slug}
            href={`/integrations/${integration.slug}`}
            className="flex flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CmsMark slug={integration.slug} className="size-10 text-foreground" />
            <div>
              <h2 className="font-medium">{integration.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {integration.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
