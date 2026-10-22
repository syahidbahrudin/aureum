import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { lookup } from "node:dns/promises";
import type { LookupOptions } from "node:dns";
import { Agent } from "undici";
import { isBlockedAddress, isIpLiteral, urlShapeError } from "@/lib/ingest";

// ponytail: checks the saved host only. The fetcher must re-check every redirect hop.
export async function assertPublicIngestUrl(
  raw: string,
): Promise<string | null> {
  const shape = urlShapeError(raw);
  if (shape) return shape;
  const host = new URL(raw).hostname.replace(/^\[|\]$/g, "");
  if (isIpLiteral(host)) return null;
  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    return "That host could not be resolved.";
  }
  if (
    records.length === 0 ||
    records.some((record) => isBlockedAddress(record.address))
  ) {
    return "That address is not allowed for ingest.";
  }
  return null;
}

type ResolvedAddress = { address: string; family: number };

// ponytail: v4 first. Node's 250ms IPv6 attempt returns ETIMEDOUT on this network before it tries v4.
export function orderPublicAddresses(
  records: ResolvedAddress[],
): ResolvedAddress[] | "blocked" {
  if (
    records.length === 0 ||
    records.some((record) => isBlockedAddress(record.address))
  ) {
    return "blocked";
  }
  return [
    ...records.filter((record) => record.family === 4),
    ...records.filter((record) => record.family === 6),
  ];
}

function lookupPublic(
  hostname: string,
  options: LookupOptions,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string | ResolvedAddress[],
    family?: number,
  ) => void,
) {
  lookup(hostname, { all: true, verbatim: true })
    .then((records) => {
      const ordered = orderPublicAddresses(records);
      if (ordered === "blocked") {
        const error = new Error(
          "That address is not allowed for ingest.",
        ) as NodeJS.ErrnoException;
        error.code = "EACCES";
        callback(error, "", 4);
        return;
      }
      if (options.all) {
        callback(null, ordered);
        return;
      }
      callback(null, ordered[0].address, ordered[0].family);
    })
    .catch((error: NodeJS.ErrnoException) => {
      callback(error, "", 4);
    });
}

export const ingestDispatcher = new Agent({
  connect: { lookup: lookupPublic },
});

export function ingestKey(): Buffer | null {
  const secret = process.env.INGEST_SECRET_KEY;
  if (!secret) return null;
  return scryptSync(secret, "aureum-ingest-v1", 32);
}

export function sealSecret(plain: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function openSecret(sealed: string, key: Buffer): string {
  const [version, iv, tag, ciphertext] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext)
    throw new Error("Unreadable secret.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
