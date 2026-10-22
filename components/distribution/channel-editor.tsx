"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { DistributionStateBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { distributionChannelLabel } from "@/lib/labels";
import type { DistributionItem, DistributionState } from "@/lib/types";

type VersionState = {
  body: string;
  state: DistributionState;
  justCopied: boolean;
};

export function ChannelEditor({ item }: { item: DistributionItem }) {
  const [versions, setVersions] = useState<VersionState[]>(() =>
    item.versions.map((version) => ({
      body: version.body,
      state: version.state,
      justCopied: false,
    })),
  );

  function updateBody(index: number, body: string) {
    setVersions((current) =>
      current.map((version, i) =>
        i === index ? { ...version, body } : version,
      ),
    );
  }

  async function copy(index: number) {
    const body = versions[index].body;
    if (!body.trim()) return;
    try {
      await navigator.clipboard.writeText(body);
    } catch {
      return;
    }
    setVersions((current) =>
      current.map((version, i) =>
        i === index
          ? {
              ...version,
              // Preview only: a correction flag stays until an editor clears it.
              state:
                version.state === "needs_review" ? version.state : "exported",
              justCopied: true,
            }
          : version,
      ),
    );
    window.setTimeout(() => {
      setVersions((current) =>
        current.map((version, i) =>
          i === index ? { ...version, justCopied: false } : version,
        ),
      );
    }, 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      {item.versions.map((version, index) => {
        const local = versions[index];
        const channelLabel = distributionChannelLabel(version.channel);
        const textareaId = `channel-${version.channel}`;
        return (
          <Card key={version.channel}>
            <CardHeader>
              <CardTitle className="text-base">
                <label htmlFor={textareaId}>{channelLabel}</label>
              </CardTitle>
              <CardAction>
                <DistributionStateBadge state={local.state} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {local.state === "needs_review" && (
                <p className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-muted-foreground">
                  A correction to the source article flagged this version.
                  Re-check the copy before using it.
                </p>
              )}
              <Textarea
                id={textareaId}
                value={local.body}
                onChange={(event) => updateBody(index, event.target.value)}
                placeholder={`Write the ${channelLabel.toLowerCase()} here...`}
                rows={5}
              />
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(index)}
                  disabled={!local.body.trim()}
                >
                  {local.justCopied ? <Check /> : <Copy />}
                  {local.justCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
