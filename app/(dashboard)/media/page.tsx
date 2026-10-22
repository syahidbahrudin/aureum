import { MediaLibrary } from "@/components/media/media-library";
import { mockMediaAssets } from "@/lib/mock/media";

export default function MediaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          Uploads, ingested images, and AI-generated assets with credit and usage
          references.
        </p>
      </div>
      <MediaLibrary assets={mockMediaAssets} />
    </div>
  );
}
