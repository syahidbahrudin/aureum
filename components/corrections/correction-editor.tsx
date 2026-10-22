"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addDraftRecord } from "@/components/corrections/corrections-store";
import { correctionKindLabel } from "@/lib/labels";
import type { CorrectionKind } from "@/lib/types";

type ArchiveOption = { slug: string; title: string };

type CorrectionEditorProps = {
  articleSlug: string;
  articleTitle: string;
  defaultSourceSlug?: string;
  archiveOptions: ArchiveOption[];
};

const kinds: CorrectionKind[] = ["factual", "development"];

export function CorrectionEditor({
  articleSlug,
  articleTitle,
  defaultSourceSlug,
  archiveOptions,
}: CorrectionEditorProps) {
  const router = useRouter();
  const [kind, setKind] = useState<CorrectionKind>("factual");
  const [reason, setReason] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [sourceSlug, setSourceSlug] = useState(
    defaultSourceSlug ?? archiveOptions[0]?.slug ?? "",
  );
  const [editor, setEditor] = useState("");
  const [publicNote, setPublicNote] = useState("");
  const [updatedDate, setUpdatedDate] = useState("2026-10-08");
  const [relatedClaim, setRelatedClaim] = useState("");

  const canSave = reason.trim() !== "" && editor.trim() !== "";

  function handleSave() {
    if (!canSave) return;
    const source = archiveOptions.find((option) => option.slug === sourceSlug);
    addDraftRecord({
      id: `cor-draft-${Date.now()}`,
      articleSlug,
      articleTitle,
      kind,
      reason: reason.trim(),
      before: before.trim(),
      after: after.trim(),
      sourceSlug,
      sourceTitle: source?.title ?? "",
      editor: editor.trim(),
      createdAt: new Date().toISOString(),
      publicNote: publicNote.trim(),
      updatedDate: updatedDate
        ? new Date(`${updatedDate}T00:00:00Z`).toISOString()
        : "",
      relatedClaim: relatedClaim.trim() || undefined,
      affectedChannels: [],
    });
    router.push("/corrections?tab=records");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Correction for “{articleTitle}”</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="correction-kind" className="text-sm font-medium">
              Kind
            </label>
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as CorrectionKind)}
            >
              <SelectTrigger id="correction-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kinds.map((value) => (
                  <SelectItem key={value} value={value}>
                    {correctionKindLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="correction-source" className="text-sm font-medium">
              Supporting source
            </label>
            <Select
              value={sourceSlug}
              onValueChange={(value) => setSourceSlug(value ?? "")}
            >
              <SelectTrigger id="correction-source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {archiveOptions.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correction-reason" className="text-sm font-medium">
            Reason
          </label>
          <Textarea
            id="correction-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="What changed and why..."
            rows={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="correction-before" className="text-sm font-medium">
              Before
            </label>
            <Textarea
              id="correction-before"
              value={before}
              onChange={(event) => setBefore(event.target.value)}
              placeholder="The published text as it stands..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="correction-after" className="text-sm font-medium">
              After
            </label>
            <Textarea
              id="correction-after"
              value={after}
              onChange={(event) => setAfter(event.target.value)}
              placeholder="The corrected text..."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correction-claim" className="text-sm font-medium">
            Related claim <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="correction-claim"
            value={relatedClaim}
            onChange={(event) => setRelatedClaim(event.target.value)}
            placeholder="A claim this correction affects..."
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correction-note" className="text-sm font-medium">
            Public correction note
          </label>
          <Textarea
            id="correction-note"
            value={publicNote}
            onChange={(event) => setPublicNote(event.target.value)}
            placeholder="The note shown to readers..."
            rows={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="correction-editor" className="text-sm font-medium">
              Editor
            </label>
            <Input
              id="correction-editor"
              value={editor}
              onChange={(event) => setEditor(event.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="correction-updated" className="text-sm font-medium">
              Updated date (shown to readers)
            </label>
            <Input
              id="correction-updated"
              type="date"
              value={updatedDate}
              onChange={(event) => setUpdatedDate(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Saving records the correction. It does not rewrite the published
          article. Preview only — nothing is persisted, so a refresh clears it.
        </p>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save correction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
