import { Construction } from "lucide-react";
import type { NavItem } from "@/lib/nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModulePlaceholderProps = {
  item: NavItem;
};

export function ModulePlaceholder({ item }: ModulePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{item.label}</h1>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Construction className="size-5 text-muted-foreground" aria-hidden />
            <CardTitle className="text-base">UI in progress</CardTitle>
          </div>
          <CardDescription>
            This module will be built in a later phase. Navigation is wired so
            you can explore the full product map.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Refer to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">feature.md</code>{" "}
          for the full scope of {item.label}.
        </CardContent>
      </Card>
    </div>
  );
}
