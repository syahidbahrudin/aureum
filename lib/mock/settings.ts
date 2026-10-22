import type {
  AiModelConfig,
  AiProvider,
  CmsUser,
  EditorialDefaults,
  PermissionRow,
} from "@/lib/types";

export const mockAiProviders: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    kind: "hosted",
    maskedKey: "sk-…4f2a",
  },
  {
    id: "local-llm",
    name: "Studio LAN",
    kind: "local",
    maskedKey: "http://192.168.1.42:11434",
  },
];

export const mockAiModelConfig: AiModelConfig = {
  embeddings: "text-embedding-3-small",
  extraction: "gpt-4o-mini",
  writing: "gpt-4o",
  images: "gpt-4o",
};

export const mockEmbeddingModelOnFile = "text-embedding-3-small";

export const mockModelOptions = [
  "text-embedding-3-small",
  "text-embedding-3-large",
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
] as const;

export const mockEditorialDefaults: EditorialDefaults = {
  defaultLanguage: "en",
  editorialTimezone: "Asia/Kuala_Lumpur",
  writingStyle: "Clear newsroom prose; short ledes; attribute sources in line.",
  aiUseLabel: "Draft assisted with AI; edited and verified by Aureum House.",
};

export const mockCmsUsers: CmsUser[] = [
  {
    id: "user-alex",
    name: "Alex Kim",
    email: "alex.kim@aureumhouse.test",
    role: "admin",
    active: true,
  },
  {
    id: "user-maya",
    name: "Maya Chen",
    email: "maya.chen@aureumhouse.test",
    role: "editor",
    active: true,
  },
  {
    id: "user-james",
    name: "James Okonkwo",
    email: "james.okonkwo@aureumhouse.test",
    role: "editor",
    active: true,
  },
  {
    id: "user-sofia",
    name: "Sofia Martinez",
    email: "sofia.martinez@aureumhouse.test",
    role: "reviewer",
    active: true,
  },
];

export const mockPermissionRows: PermissionRow[] = [
  {
    id: "settings",
    capability: "Settings, keys, users",
    admin: "yes",
    editor: "no",
    reviewer: "no",
  },
  {
    id: "sources",
    capability: "Sources",
    admin: "yes",
    editor: "yes",
    reviewer: "no",
  },
  {
    id: "knowledge",
    capability: "Archive, entities, topics",
    admin: "yes",
    editor: "yes",
    reviewer: "read",
  },
  {
    id: "drafts",
    capability: "Drafts and media",
    admin: "yes",
    editor: "yes",
    reviewer: "no",
  },
  {
    id: "claims",
    capability: "Claims review, comments, return",
    admin: "yes",
    editor: "yes",
    reviewer: "yes",
  },
  {
    id: "publish",
    capability: "Approve and publish",
    admin: "yes",
    editor: "yes",
    reviewer: "no",
  },
  {
    id: "corrections",
    capability: "Corrections",
    admin: "yes",
    editor: "yes",
    reviewer: "no",
  },
];
