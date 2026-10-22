"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CalendarItemKindBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCalendarAgendaDay,
  formatCalendarMonthYear,
  formatTimeShort,
  MOCK_APP_NOW,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalendarItem, CalendarItemKind } from "@/lib/types";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const INITIAL_YEAR = 2026;
const INITIAL_MONTH = 9; // October
const MAX_VISIBLE_EVENTS = 3;

type CalendarView = "month" | "schedule";

type EditorialCalendarProps = {
  items: CalendarItem[];
};

type GridCell = {
  date: Date;
  inMonth: boolean;
};

const eventTone: Record<CalendarItemKind, string> = {
  lead: "bg-[#e8f0fe] text-[#174ea6] hover:bg-[#d2e3fc] dark:bg-[#174ea6]/25 dark:text-[#aecbfa] dark:hover:bg-[#174ea6]/35",
  assignment:
    "bg-[#e6f4ea] text-[#137333] hover:bg-[#ceead6] dark:bg-[#137333]/25 dark:text-[#81c995] dark:hover:bg-[#137333]/35",
  draft:
    "bg-[#fef7e0] text-[#b06000] hover:bg-[#feefc3] dark:bg-[#b06000]/20 dark:text-[#fdd663] dark:hover:bg-[#b06000]/30",
  scheduled:
    "bg-[#f3e8fd] text-[#7627bb] hover:bg-[#e9d2fd] dark:bg-[#7627bb]/25 dark:text-[#d7aefb] dark:hover:bg-[#7627bb]/35",
};

function dayKeyFromDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayKeyFromIso(iso: string): string {
  return dayKeyFromDate(new Date(iso));
}

function itemsByDay(items: CalendarItem[]): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const key = dayKeyFromIso(item.date);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  return map;
}

function buildCalendarGrid(year: number, month: number): GridCell[] {
  const firstOfMonth = Date.UTC(year, month, 1);
  const startDow = new Date(firstOfMonth).getUTCDay();
  const gridStart = firstOfMonth - startDow * 86_400_000;
  const cells: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart + i * 86_400_000);
    cells.push({
      date,
      inMonth: date.getUTCMonth() === month && date.getUTCFullYear() === year,
    });
  }
  return cells;
}

function isSameDayAsMockToday(date: Date): boolean {
  return dayKeyFromDate(date) === dayKeyFromDate(MOCK_APP_NOW);
}

function EventChip({
  item,
  selected,
  onSelect,
  className,
}: {
  item: CalendarItem;
  selected: boolean;
  onSelect: (item: CalendarItem) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight font-medium transition-colors",
        eventTone[item.kind],
        selected && "ring-2 ring-[#1a73e8] ring-offset-1 dark:ring-offset-background",
        className,
      )}
      title={`${formatTimeShort(item.date)} · ${item.title}`}
    >
      <span className="tabular-nums">{formatTimeShort(item.date)}</span>{" "}
      {item.title}
    </button>
  );
}

function EventDetailPanel({
  item,
  onClose,
}: {
  item: CalendarItem;
  onClose: () => void;
}) {
  return (
    <div
      className="border-t bg-card px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
      role="region"
      aria-label="Event details"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarItemKindBadge kind={item.kind} />
            {item.overdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <h3 className="text-lg font-medium leading-snug">{item.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCalendarAgendaDay(item.date)} · {formatTimeShort(item.date)}{" "}
            UTC
          </p>
          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd>{item.owner}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{item.status}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Linked to</dt>
              <dd>{item.link}</dd>
            </div>
          </dl>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 self-end sm:self-start"
          onClick={onClose}
          aria-label="Close event details"
        >
          <X />
        </Button>
      </div>
    </div>
  );
}

function MonthView({
  year,
  month,
  items,
  selectedId,
  onSelect,
}: {
  year: number;
  month: number;
  items: CalendarItem[];
  selectedId: string | null;
  onSelect: (item: CalendarItem) => void;
}) {
  const byDay = useMemo(() => itemsByDay(items), [items]);
  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());

  const toggleExpanded = (key: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/80">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-medium tracking-wide text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const key = dayKeyFromDate(cell.date);
          const dayItems = byDay.get(key) ?? [];
          const expanded = expandedDays.has(key);
          const visible = expanded ? dayItems : dayItems.slice(0, MAX_VISIBLE_EVENTS);
          const hiddenCount = dayItems.length - MAX_VISIBLE_EVENTS;
          const today = isSameDayAsMockToday(cell.date);

          return (
            <div
              key={key}
              className={cn(
                "flex min-h-[7.5rem] flex-col border-b border-r border-border/80 p-1 last:border-r-0",
                !cell.inMonth && "bg-muted/30",
                today && cell.inMonth && "bg-[#e8f0fe]/40 dark:bg-[#174ea6]/10",
              )}
            >
              <div className="flex justify-end px-1 pt-0.5">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-xs tabular-nums",
                    !cell.inMonth && "text-muted-foreground/70",
                    cell.inMonth && !today && "text-foreground",
                    today &&
                      "bg-[#1a73e8] font-medium text-white dark:bg-[#8ab4f8] dark:text-[#202124]",
                  )}
                >
                  {cell.date.getUTCDate()}
                </span>
              </div>
              <ul className="mt-0.5 flex flex-1 flex-col gap-0.5 px-0.5 pb-1">
                {visible.map((item) => (
                  <li key={item.id}>
                    <EventChip
                      item={item}
                      selected={selectedId === item.id}
                      onSelect={onSelect}
                    />
                  </li>
                ))}
                {!expanded && hiddenCount > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(key)}
                      className="w-full rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      +{hiddenCount} more
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleView({
  items,
  selectedId,
  onSelect,
}: {
  items: CalendarItem[];
  selectedId: string | null;
  onSelect: (item: CalendarItem) => void;
}) {
  const groups = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const map = new Map<string, CalendarItem[]>();
    for (const item of sorted) {
      const key = dayKeyFromIso(item.date);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [items]);

  if (groups.length === 0) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Nothing scheduled in this range.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {groups.map(([dayKey, dayItems]) => {
        const headerIso = dayItems[0]?.date ?? `${dayKey}T12:00:00Z`;
        const today = dayKey === dayKeyFromDate(MOCK_APP_NOW);
        return (
          <section key={dayKey} className="px-4 py-3">
            <h3
              className={cn(
                "mb-3 text-sm font-medium",
                today ? "text-[#1a73e8] dark:text-[#8ab4f8]" : "text-foreground",
              )}
            >
              {formatCalendarAgendaDay(headerIso)}
            </h3>
            <ul className="space-y-1">
              {dayItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60",
                      selectedId === item.id && "bg-muted",
                    )}
                  >
                    <span className="w-16 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                      {formatTimeShort(item.date)}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 rounded-md px-2 py-1.5 text-sm font-medium",
                        eventTone[item.kind],
                      )}
                    >
                      {item.title}
                      <span className="mt-0.5 block text-xs font-normal opacity-80">
                        {item.owner} · {item.status}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function EditorialCalendar({ items }: EditorialCalendarProps) {
  const [cursor, setCursor] = useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });
  const { year, month } = cursor;
  const [view, setView] = useState<CalendarView>("month");
  const [selected, setSelected] = useState<CalendarItem | null>(null);

  const monthLabel = formatCalendarMonthYear(year, month);

  const shiftMonth = useCallback((delta: number) => {
    setCursor(({ year: y, month: m }) => {
      let nextMonth = m + delta;
      let nextYear = y;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      } else if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
      return { year: nextYear, month: nextMonth };
    });
  }, []);

  const goToday = useCallback(() => {
    setCursor({
      year: MOCK_APP_NOW.getUTCFullYear(),
      month: MOCK_APP_NOW.getUTCMonth(),
    });
  }, []);

  const onSelect = useCallback((item: CalendarItem) => {
    setSelected((prev) => (prev?.id === item.id ? null : item));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 px-3 py-2 sm:gap-3 sm:px-4">
        <Button type="button" variant="outline" size="sm" onClick={goToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
        <h2 className="min-w-[10rem] text-lg font-normal tracking-tight sm:text-xl">
          {monthLabel}
        </h2>
        <div
          className="ml-auto flex rounded-lg border border-border/80 p-0.5"
          role="tablist"
          aria-label="Calendar view"
        >
          {(
            [
              { id: "month" as const, label: "Month" },
              { id: "schedule" as const, label: "Schedule" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                "rounded-md px-3 py-1 text-sm transition-colors",
                view === tab.id
                  ? "bg-[#e8f0fe] font-medium text-[#174ea6] dark:bg-[#174ea6]/30 dark:text-[#aecbfa]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <MonthView
          year={year}
          month={month}
          items={items}
          selectedId={selected?.id ?? null}
          onSelect={onSelect}
        />
      ) : (
        <ScheduleView
          items={items}
          selectedId={selected?.id ?? null}
          onSelect={onSelect}
        />
      )}

      {selected && (
        <EventDetailPanel item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
