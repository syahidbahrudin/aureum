"use client";

import { useSyncExternalStore } from "react";
import type { CorrectionRecord } from "@/lib/types";

// ponytail: module-level session store; swap for the corrections API when it exists.
const draftRecords: CorrectionRecord[] = [];
const listeners = new Set<() => void>();

export function addDraftRecord(record: CorrectionRecord) {
  draftRecords.unshift(record);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDraftRecords(): CorrectionRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => draftRecords,
    () => draftRecords,
  );
}
