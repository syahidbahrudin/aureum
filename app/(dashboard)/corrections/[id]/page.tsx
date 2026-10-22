import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CorrectionKindBadge } from "@/components/status-badges";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, formatEventDate } from "@/lib/format";
import { distributionChannelLabel } from "@/lib/labels";
import { findCorrectionRecord, mockCorrectionRecords } from "@/lib/mock/corrections";

export function generateStaticParams() {
  return mockCorrectionRecords.map((record) => ({ id: record.id }));
}

type CorrectionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CorrectionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const record = findCorrectionRecord(id);
  return { title: record ? `${record.reason} · Corrections` : "Corrections" };
}

export default async function CorrectionDetailPage({
  params,
}: CorrectionDetailPageProps) {
  const { id } = await params;
  const record = findCorrectionRecord(id);
  if (!record) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CorrectionKindBadge kind={record.kind} />
          <span className="text-sm text-muted-foreground">
            {formatDateTime(record.createdAt)} · {record.editor}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {record.reason}
        </h1>
        <p className="text-muted-foreground">
          {record.articleTitle}. This record does not rewrite the published
          article.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">Before</p>
            <p className="text-sm">{record.before || "—"}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">After</p>
            <p className="text-sm">{record.after || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence and impact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground">Supporting source</p>
            <Link
              href={`/archive/${record.sourceSlug}`}
              className="hover:underline"
            >
              {record.sourceTitle}
            </Link>
          </div>
          {record.relatedClaim && (
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground">Related claim</p>
              {/* Claims module is not built yet, so this is reference text only. */}
              <p>{record.relatedClaim}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground">
              Affected distribution versions
            </p>
            {record.affectedChannels.length === 0 ? (
              <p className="text-muted-foreground">None flagged.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {record.affectedChannels.map((channel) => (
                  <li key={channel}>
                    <Link
                      href={`/distribution/${record.articleSlug}`}
                      className="hover:underline"
                    >
                      {distributionChannelLabel(channel)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public note</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>{record.publicNote || "—"}</p>
          {record.updatedDate && (
            <p className="text-muted-foreground">
              Updated {formatEventDate(record.updatedDate)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
