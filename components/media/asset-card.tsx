import Image from "next/image";
import { MediaAssetKindBadge } from "@/components/status-badges";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MediaAsset } from "@/lib/types";

type AssetCardProps = {
  asset: MediaAsset;
};

export function AssetCard({ asset }: AssetCardProps) {
  const inUse = asset.usedBy.length > 0;

  return (
    <Card className="h-full overflow-hidden pt-0">
      <div className="relative aspect-4/3 w-full bg-muted">
        <Image
          src={asset.url}
          alt={asset.altText}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base font-medium">
            {asset.filename}
          </CardTitle>
          <MediaAssetKindBadge kind={asset.kind} />
        </div>
        <CardDescription className="line-clamp-1">
          {asset.width}×{asset.height} · {asset.credit}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-2 pt-0 text-sm">
        <p className="min-h-5 text-muted-foreground">
          {asset.kind === "ai" && asset.model ? (
            <>
              Model: <span className="text-foreground">{asset.model}</span>
            </>
          ) : null}
        </p>
        <p className="text-muted-foreground">
          {inUse ? (
            <>
              In use ·{" "}
              <span className="text-foreground tabular-nums">
                {asset.usedBy.length}
              </span>
            </>
          ) : (
            <span>Unused</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
