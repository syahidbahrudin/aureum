import { z } from "zod";

export const sourceTypes = ["rss", "website", "api"] as const;
export const sourceStatuses = ["active", "paused", "inactive"] as const;

export type IngestType = (typeof sourceTypes)[number];
export type IngestStatus = (typeof sourceStatuses)[number];

export type IngestRow = {
  id: number;
  name: string;
  url: string;
  type: IngestType;
  publisher: string;
  language: string;
  status: IngestStatus;
  intervalMinutes: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  articlesTotal: number;
  hasAuthSecret: boolean;
  headers: string;
  pagination: string;
  fieldMapping: string;
  extractionRules: string;
};

export type IngestWrite = {
  id: number | null;
  name: string;
  publisher: string;
  url: string;
  type: IngestType;
  language: string | null;
  status: IngestStatus;
  intervalSeconds: number;
  authSecret: string;
  clearAuthSecret: boolean;
  headers: Record<string, string>;
  pagination: Record<string, unknown> | null;
  fieldMapping: Record<string, string> | null;
  extractionRules: Record<string, unknown> | null;
};

const formSchema = z.object({
  name: z.string().trim().min(1).max(255),
  publisher: z.string().trim().min(1).max(255),
  url: z.string().trim().min(1),
  type: z.enum(sourceTypes),
  language: z.string().trim().max(32),
  status: z.enum(sourceStatuses),
  authSecret: z.string().max(4000),
  headers: z.string().max(16000),
  pagination: z.string().max(16000),
  fieldMapping: z.string().max(16000),
  extractionRules: z.string().max(16000),
});

const fieldLabels: Record<string, string> = {
  name: "Name",
  publisher: "Publisher",
  url: "URL",
  type: "Type",
  language: "Language",
  status: "Status",
  authSecret: "Auth secret",
  headers: "Headers",
  pagination: "Pagination",
  fieldMapping: "Field mapping",
  extractionRules: "Extraction rules",
};

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function jsonObject(
  raw: string,
  label: string,
  stringValues: boolean,
): { ok: true; value: Record<string, unknown> | null } | { ok: false; error: string } {
  const text = raw.trim();
  if (!text) return { ok: true, value: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: `${label} must be a JSON object.` };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: `${label} must be a JSON object.` };
  }
  if (stringValues) {
    for (const value of Object.values(parsed)) {
      if (typeof value !== "string") {
        return { ok: false, error: `${label} values must be strings.` };
      }
    }
  }
  return { ok: true, value: parsed as Record<string, unknown> };
}

export function parseIngestForm(
  form: FormData,
): { ok: true; value: IngestWrite } | { ok: false; error: string } {
  const parsed = formSchema.safeParse({
    name: field(form, "name"),
    publisher: field(form, "publisher"),
    url: field(form, "url"),
    type: field(form, "type"),
    language: field(form, "language"),
    status: field(form, "status"),
    authSecret: field(form, "authSecret"),
    headers: field(form, "headers"),
    pagination: field(form, "pagination"),
    fieldMapping: field(form, "fieldMapping"),
    extractionRules: field(form, "extractionRules"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const label = fieldLabels[String(issue?.path[0] ?? "")] ?? "Form";
    return { ok: false, error: `${label} is invalid.` };
  }

  const minutes = Number(field(form, "intervalMinutes"));
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) {
    return { ok: false, error: "Interval must be between 1 minute and 7 days." };
  }

  const headers = jsonObject(parsed.data.headers, "Headers", true);
  if (!headers.ok) return headers;
  const pagination = jsonObject(parsed.data.pagination, "Pagination", false);
  if (!pagination.ok) return pagination;
  const fieldMapping = jsonObject(parsed.data.fieldMapping, "Field mapping", true);
  if (!fieldMapping.ok) return fieldMapping;
  const extractionRules = jsonObject(parsed.data.extractionRules, "Extraction rules", false);
  if (!extractionRules.ok) return extractionRules;

  const idRaw = field(form, "id");
  const id = /^\d+$/.test(idRaw) ? Number(idRaw) : null;

  return {
    ok: true,
    value: {
      id,
      name: parsed.data.name,
      publisher: parsed.data.publisher,
      url: parsed.data.url,
      type: parsed.data.type,
      language: parsed.data.language || null,
      status: parsed.data.status,
      intervalSeconds: minutes * 60,
      authSecret: parsed.data.authSecret,
      clearAuthSecret: field(form, "clearAuthSecret") === "on",
      headers: (headers.value ?? {}) as Record<string, string>,
      pagination: pagination.value,
      fieldMapping: fieldMapping.value as Record<string, string> | null,
      extractionRules: extractionRules.value,
    },
  };
}

export function jsonText(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  if (Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

/** Literal and hostname checks. Null means the host still needs a DNS lookup. */
export function urlShapeError(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Enter a valid http or https URL.";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Enter a valid http or https URL.";
  }
  if (url.username || url.password) {
    return "Put API credentials in the auth secret, not the URL.";
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host === "metadata.google.internal" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost") ||
    /^\d+$/.test(host)
  ) {
    return "That address is not allowed for ingest.";
  }
  if (isIpLiteral(host) && isBlockedAddress(host)) {
    return "That address is not allowed for ingest.";
  }
  return null;
}

export function isIpLiteral(host: string): boolean {
  return host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

export function isBlockedAddress(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
    return true;
  }
  const v4 = lower.startsWith("::ffff:") ? lower.slice(7) : lower;
  const parts = v4.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((part) => Number(part));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && (nums[2] === 0 || nums[2] === 2)) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

