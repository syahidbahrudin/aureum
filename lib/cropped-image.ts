import sharp from "sharp";
import { fetch as undiciFetch } from "undici";
import { UTApi, UTFile } from "uploadthing/server";
import { pixelCrop, type CropBox } from "@/lib/image-crop";
import { assertPublicIngestUrl, ingestDispatcher } from "@/lib/ingest-net";

const MAX_BYTES = 8_000_000;
const FETCH_MS = 15_000;
const utapi = new UTApi();

export type UploadedCrop = {
  url: string;
  key: string;
  width: number;
  height: number;
};

async function fetchImage(raw: string): Promise<Buffer | null> {
  let current = raw;
  for (let hop = 0; hop < 4; hop++) {
    if (await assertPublicIngestUrl(current)) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_MS);
    try {
      const res = await undiciFetch(current, {
        redirect: "manual",
        signal: controller.signal,
        dispatcher: ingestDispatcher,
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) return null;
        current = new URL(location, current).toString();
        continue;
      }
      if (!res.ok) return null;
      const announced = Number(res.headers.get("content-length") ?? 0);
      if (announced > MAX_BYTES) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return null;
      return buf;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

export async function uploadCroppedImage(
  sourceUrl: string,
  crop: CropBox | null,
): Promise<UploadedCrop | null> {
  const bytes = await fetchImage(sourceUrl);
  if (!bytes) return null;

  const oriented = await sharp(bytes, { failOn: "none" })
    .rotate()
    .toBuffer({ resolveWithObject: true });
  if (!oriented.info.width || !oriented.info.height) return null;

  const box = crop
    ? pixelCrop(crop, oriented.info.width, oriented.info.height)
    : null;
  let pipeline = sharp(oriented.data);
  if (box) pipeline = pipeline.extract(box);
  const out = await pipeline
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  if (!out.info.width || !out.info.height) return null;

  const uploaded = await utapi.uploadFiles(
    new UTFile([new Uint8Array(out.data)], "crop.jpg", { type: "image/jpeg" }),
  );
  if (uploaded.error || !uploaded.data) {
    throw new Error(uploaded.error?.message ?? "Image upload failed.");
  }
  return {
    url: uploaded.data.ufsUrl,
    key: uploaded.data.key,
    width: out.info.width,
    height: out.info.height,
  };
}
