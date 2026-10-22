"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockAiModelConfig,
  mockAiProviders,
  mockCmsUsers,
  mockEditorialDefaults,
  mockEmbeddingModelOnFile,
  mockModelOptions,
  mockPermissionRows,
} from "@/lib/mock/settings";
import { permissionLevelLabel, roleLabel } from "@/lib/labels";
import type { AiModelConfig, CmsUser, EditorialDefaults, Role } from "@/lib/types";

const roles: Role[] = ["admin", "editor", "reviewer"];

const aiTaskLabels: { key: keyof AiModelConfig; label: string }[] = [
  { key: "embeddings", label: "Embeddings" },
  { key: "extraction", label: "Extraction" },
  { key: "writing", label: "Writing" },
  { key: "images", label: "Images" },
];

function providerKindLabel(kind: "hosted" | "local") {
  return kind === "hosted" ? "Hosted" : "Local endpoint";
}

type ModelSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  "aria-label": string;
};

function ModelSelect({ value, onValueChange, id, "aria-label": ariaLabel }: ModelSelectProps) {
  const options = mockModelOptions.includes(value as (typeof mockModelOptions)[number])
    ? mockModelOptions
    : [value, ...mockModelOptions];

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger id={id} className="w-full max-w-xs" aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type RoleSelectProps = {
  value: Role;
  onValueChange: (role: Role) => void;
  id: string;
};

function RoleSelect({ value, onValueChange, id }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v as Role)}>
      <SelectTrigger id={id} className="w-[9rem]" aria-label="Role">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SettingsPanel() {
  const [models, setModels] = useState<AiModelConfig>(() => ({
    ...mockAiModelConfig,
  }));
  const [editorial, setEditorial] = useState<EditorialDefaults>(() => ({
    ...mockEditorialDefaults,
  }));
  const [users, setUsers] = useState<CmsUser[]>(() => [...mockCmsUsers]);
  const [providerTests, setProviderTests] = useState<Record<string, string>>({});
  const [reembedMessage, setReembedMessage] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<Role>("editor");

  function handleProviderTest(providerId: string) {
    setProviderTests((prev) => ({
      ...prev,
      [providerId]: "Preview only: connection not checked.",
    }));
  }

  function updateUser(id: string, patch: Partial<CmsUser>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function addUser() {
    const name = newUserName.trim();
    const email = newUserEmail.trim();
    if (!name || !email) return;
    setUsers((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        name,
        email,
        role: newUserRole,
        active: true,
      },
    ]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("editor");
  }

  return (
    <Tabs defaultValue="ai" className="gap-4">
      <TabsList>
        <TabsTrigger value="ai">AI</TabsTrigger>
        <TabsTrigger value="editorial">Editorial</TabsTrigger>
        <TabsTrigger value="access">Access</TabsTrigger>
      </TabsList>

      <TabsContent value="ai" className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Providers</CardTitle>
            <CardDescription>
              API keys stay on the server; only masked values appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {mockAiProviders.map((provider) => (
                <li
                  key={provider.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{provider.name}</p>
                      <Badge variant="outline">{providerKindLabel(provider.kind)}</Badge>
                    </div>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {provider.maskedKey}
                    </p>
                    {providerTests[provider.id] ? (
                      <p className="text-sm text-muted-foreground" role="status">
                        {providerTests[provider.id]}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => handleProviderTest(provider.id)}
                  >
                    Test connection
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Models by task</CardTitle>
            <CardDescription>
              Separate models for embeddings, extraction, writing, and images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {aiTaskLabels.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <dt className="text-sm font-medium">{label}</dt>
                  <dd>
                    <ModelSelect
                      id={`model-${key}`}
                      aria-label={`${label} model`}
                      value={models[key]}
                      onValueChange={(value) =>
                        setModels((prev) => ({ ...prev, [key]: value }))
                      }
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Embeddings on file</CardTitle>
            <CardDescription>
              Vectors in the index were built with this model. Changing it requires
              re-embedding.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-sm">{mockEmbeddingModelOnFile}</p>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setReembedMessage(
                    "Search indexing is not connected in this preview.",
                  )
                }
              >
                Re-embed archive
              </Button>
              {reembedMessage ? (
                <p className="text-sm text-muted-foreground" role="status">
                  {reembedMessage}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No usage reported yet.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="editorial" className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editorial defaults</CardTitle>
            <CardDescription>
              Applied to new drafts and schedules. Changes here are not saved in
              this preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid max-w-2xl gap-4">
            <div className="space-y-1.5">
              <label htmlFor="default-language" className="text-sm font-medium">
                Default language
              </label>
              <Input
                id="default-language"
                value={editorial.defaultLanguage}
                onChange={(e) =>
                  setEditorial((prev) => ({
                    ...prev,
                    defaultLanguage: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="editorial-timezone" className="text-sm font-medium">
                Editorial timezone
              </label>
              <Input
                id="editorial-timezone"
                value={editorial.editorialTimezone}
                onChange={(e) =>
                  setEditorial((prev) => ({
                    ...prev,
                    editorialTimezone: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="writing-style" className="text-sm font-medium">
                Writing style
              </label>
              <textarea
                id="writing-style"
                rows={3}
                className="flex min-h-[4rem] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={editorial.writingStyle}
                onChange={(e) =>
                  setEditorial((prev) => ({
                    ...prev,
                    writingStyle: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ai-use-label" className="text-sm font-medium">
                AI-use label
              </label>
              <textarea
                id="ai-use-label"
                rows={2}
                className="flex min-h-[3rem] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={editorial.aiUseLabel}
                onChange={(e) =>
                  setEditorial((prev) => ({
                    ...prev,
                    aiUseLabel: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="access" className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>
              Assign admin, editor, or reviewer. New users exist only until you
              refresh the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleSelect
                          id={`role-${user.id}`}
                          value={user.role}
                          onValueChange={(role) => updateUser(user.id, { role })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() =>
                            updateUser(user.id, { active: !user.active })
                          }
                        >
                          <Badge
                            variant={user.active ? "default" : "secondary"}
                          >
                            {user.active ? "Active" : "Disabled"}
                          </Badge>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-3 text-sm font-medium">Add user</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="space-y-1.5 sm:min-w-[10rem] sm:flex-1">
                  <label htmlFor="new-user-name" className="text-xs text-muted-foreground">
                    Name
                  </label>
                  <Input
                    id="new-user-name"
                    placeholder="Full name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:min-w-[12rem] sm:flex-1">
                  <label htmlFor="new-user-email" className="text-xs text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder="email@aureumhouse.test"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <RoleSelect
                  id="new-user-role"
                  value={newUserRole}
                  onValueChange={setNewUserRole}
                />
                <Button type="button" onClick={addUser}>
                  Add user
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role permissions</CardTitle>
            <CardDescription>
              Fixed policy for this release. Admins manage settings; reviewers read
              knowledge and review drafts without publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capability</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Editor</TableHead>
                    <TableHead>Reviewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPermissionRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.capability}</TableCell>
                      <TableCell>{permissionLevelLabel(row.admin)}</TableCell>
                      <TableCell>{permissionLevelLabel(row.editor)}</TableCell>
                      <TableCell>{permissionLevelLabel(row.reviewer)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
