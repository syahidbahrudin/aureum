"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileText, ImagePlus } from "lucide-react";
import { generateEditorialDraft } from "@/app/(dashboard)/editorial/actions";
import {
  EditorialBodyEditor,
  type EditorialBodyEditorHandle,
} from "@/components/editorial/editorial-body-editor";
import { saveEditorialDraft } from "@/components/editorial/editorial-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  mergeDraftSuggestion,
  type DraftSuggestion,
} from "@/lib/editorial-draft";
import { mockMediaAssets } from "@/lib/mock/media";
import { mockTopics } from "@/lib/mock/topics";
import type { EditorialArticle } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type EditorialStudioProps = {
  initialArticle?: EditorialArticle;
};

export function EditorialStudio({ initialArticle }: EditorialStudioProps) {
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();
  const bodyEditorRef = useRef<EditorialBodyEditorHandle>(null);

  const [title, setTitle] = useState(initialArticle?.title ?? "");
  const [standfirst, setStandfirst] = useState(
    initialArticle?.standfirst ?? "",
  );
  const [author, setAuthor] = useState(initialArticle?.author ?? "");
  const [topicSlug, setTopicSlug] = useState(initialArticle?.topicSlug ?? "");
  const [coverUrl, setCoverUrl] = useState(
    initialArticle?.coverImageUrl ?? mockMediaAssets[0]?.url ?? "",
  );
  const [insertAssetId, setInsertAssetId] = useState(
    mockMediaAssets[0]?.id ?? "",
  );
  const [angle, setAngle] = useState("");
  const [suggestion, setSuggestion] = useState<DraftSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coverAsset = mockMediaAssets.find((asset) => asset.url === coverUrl);
  const insertAsset = mockMediaAssets.find(
    (asset) => asset.id === insertAssetId,
  );
  const canSave = title.trim() !== "";

  function handleInsertImage() {
    if (!insertAsset) return;
    bodyEditorRef.current?.insertImage(insertAsset.url);
  }

  function handleGenerate() {
    setError(null);
    setSuggestion(null);
    startGenerating(async () => {
      const result = await generateEditorialDraft({ topicSlug, angle });
      if (result.ok) {
        setSuggestion(result.draft);
      } else {
        setError(result.error);
      }
    });
  }

  function handleAcceptSuggestion() {
    if (!suggestion) return;
    const currentBody = bodyEditorRef.current?.getMarkdown() ?? "";
    const merged = mergeDraftSuggestion(
      { title, standfirst, body: currentBody },
      suggestion,
    );
    setTitle(merged.title);
    setStandfirst(merged.standfirst);
    bodyEditorRef.current?.setMarkdown(merged.body);
    setSuggestion(null);
  }

  function handleSave() {
    if (!canSave) return;
    const slug =
      initialArticle?.slug ?? (slugify(title) || `draft-${Date.now()}`);
    saveEditorialDraft({
      id: initialArticle?.id ?? `ed-draft-${Date.now()}`,
      title: title.trim(),
      slug,
      state: initialArticle?.state ?? "draft",
      author: author.trim() || "Unassigned",
      updatedAt: new Date().toISOString(),
      scheduledAt: initialArticle?.scheduledAt ?? null,
      sourceCount: initialArticle?.sourceCount ?? 0,
      standfirst: standfirst.trim(),
      topicSlug: topicSlug || null,
      coverImageUrl: coverUrl,
      body: bodyEditorRef.current?.getMarkdown() ?? "",
    });
    router.push("/editorial");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Article</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="ed-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="ed-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Headline"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ed-standfirst" className="text-sm font-medium">
              Standfirst
            </label>
            <Textarea
              id="ed-standfirst"
              value={standfirst}
              onChange={(event) => setStandfirst(event.target.value)}
              placeholder="One or two sentences summarising the article..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ed-topic" className="text-sm font-medium">
                Related topic
              </label>
              <Select
                value={topicSlug}
                onValueChange={(value) => setTopicSlug(value ?? "")}
              >
                <SelectTrigger id="ed-topic" className="w-full">
                  <SelectValue>
                    {(value) =>
                      mockTopics.find((topic) => topic.slug === value)?.name ??
                      "Select a topic"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {mockTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.slug}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ed-author" className="text-sm font-medium">
                Author
              </label>
              <Input
                id="ed-author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ed-body" className="text-sm font-medium">
              Body
            </label>
            <EditorialBodyEditor
              id="ed-body"
              initialMarkdown={initialArticle?.body ?? ""}
              ref={bodyEditorRef}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
            <label htmlFor="ed-insert-image" className="text-sm font-medium">
              Insert image from library
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <Select
                value={insertAssetId}
                onValueChange={(value) => setInsertAssetId(value ?? "")}
              >
                <SelectTrigger id="ed-insert-image" className="w-full sm:w-72">
                  <SelectValue>
                    {(value) =>
                      mockMediaAssets.find((asset) => asset.id === value)
                        ?.filename ?? "Select an image"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {mockMediaAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={handleInsertImage}
                disabled={!insertAsset}
              >
                <ImagePlus data-icon="inline-start" />
                Insert at cursor
              </Button>
            </div>
            {insertAsset && (
              <p className="text-xs text-muted-foreground">
                Credit: {insertAsset.credit}
                <span aria-hidden> · </span>
                {insertAsset.source}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => router.push("/editorial")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              Save draft
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Saving stores a draft for this session only. A refresh clears it;
            nothing is published.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
              {coverUrl && (
                <Image
                  src={coverUrl}
                  alt={coverAsset?.altText ?? ""}
                  fill
                  className="object-cover"
                  sizes="20rem"
                />
              )}
            </div>
            <Select
              value={coverUrl}
              onValueChange={(value) => setCoverUrl(value ?? "")}
            >
              <SelectTrigger
                id="ed-cover"
                aria-label="Cover image"
                className="w-full"
              >
                <SelectValue>
                  {(value) =>
                    mockMediaAssets.find((asset) => asset.url === value)
                      ?.filename ?? "Select a cover"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {mockMediaAssets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.url}>
                    {asset.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {coverAsset && (
              <p className="text-xs text-muted-foreground">
                Credit: {coverAsset.credit}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Draft from topic</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Generates a suggested headline, standfirst and body from the
              selected topic. It never overwrites text you have already typed.
            </p>
            <label htmlFor="ed-angle" className="text-sm font-medium">
              Angle (optional)
            </label>
            <Input
              id="ed-angle"
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              placeholder="Impact on savers"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating || topicSlug === ""}
            >
              <FileText data-icon="inline-start" />
              {isGenerating ? "Generating..." : "Generate draft"}
            </Button>
            {topicSlug === "" && (
              <p className="text-xs text-muted-foreground">
                Select a related topic first.
              </p>
            )}
            {error && (
              <p
                className="rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            {suggestion && (
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Suggestion
                </p>
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.standfirst}
                </p>
                <p className="line-clamp-6 text-xs whitespace-pre-wrap text-muted-foreground">
                  {suggestion.body}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuggestion(null)}
                  >
                    Discard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAcceptSuggestion}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
