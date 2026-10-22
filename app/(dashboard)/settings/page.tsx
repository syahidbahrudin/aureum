import { SettingsPanel } from "@/components/settings/settings-panel";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          AI providers, editorial defaults, and access control. Preview only —
          nothing is saved.
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
