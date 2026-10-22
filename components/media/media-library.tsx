"use client";

import { AssetCard } from "@/components/media/asset-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { landscapeCardGridClass } from "@/lib/card-layout";
import type { MediaAsset, MediaAssetKind } from "@/lib/types";

type MediaTabValue = "all" | MediaAssetKind;

const mediaTabs: { value: MediaTabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "uploaded", label: "Uploaded" },
  { value: "external", label: "External" },
  { value: "ai", label: "AI" },
];

type MediaLibraryProps = {
  assets: MediaAsset[];
};

function filterAssets(assets: MediaAsset[], tab: MediaTabValue): MediaAsset[] {
  if (tab === "all") return assets;
  return assets.filter((asset) => asset.kind === tab);
}

export function MediaLibrary({ assets }: MediaLibraryProps) {
  return (
    <Tabs defaultValue="all" className="gap-4">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {mediaTabs.map((tab) => {
          const count =
            tab.value === "all"
              ? assets.length
              : assets.filter((a) => a.kind === tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
              {tab.label}
              <span className="text-muted-foreground tabular-nums">({count})</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {mediaTabs.map((tab) => {
        const filtered = filterAssets(assets, tab.value);
        return (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No assets in this category yet.
              </p>
            ) : (
              <ul className={landscapeCardGridClass}>
                {filtered.map((asset) => (
                  <li key={asset.id} className="h-full">
                    <AssetCard asset={asset} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
