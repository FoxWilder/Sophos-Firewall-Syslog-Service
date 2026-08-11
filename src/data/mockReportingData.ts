import { UserWebSession } from "../types";

export const initialWebSessions: UserWebSession[] = [];

export interface SessionTimeWindow {
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m${secs > 0 ? ` ${secs}s` : ""}`;
  }
  return `${mins}m ${secs}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculates non-overlapping merged active duration in seconds across multiple connections/sessions.
 * Handles overlapping connections to prevent multiplying duration when multiple sockets/requests exist.
 * Optionally clamps intervals to [rangeStartMs, rangeEndMs] if a timeframe filter is applied.
 */
export function calculateMergedDurationSeconds(
  sessions: SessionTimeWindow[],
  rangeStartMs?: number,
  rangeEndMs?: number
): number {
  if (!sessions || sessions.length === 0) return 0;

  const rawIntervals: [number, number][] = [];

  for (const s of sessions) {
    let endMs = Date.parse(s.endTime || s.startTime);
    if (isNaN(endMs)) endMs = Date.now();

    let durSec = s.durationSeconds;
    if (durSec === undefined || isNaN(durSec) || durSec <= 0) {
      durSec = 60;
    }

    let startMs = Date.parse(s.startTime);
    if (isNaN(startMs) || startMs === endMs) {
      startMs = endMs - durSec * 1000;
    }

    if (startMs > endMs) {
      const tmp = startMs;
      startMs = endMs;
      endMs = tmp;
    }

    // Clamp to filter timeframe if specified
    if (rangeStartMs !== undefined && !isNaN(rangeStartMs)) {
      startMs = Math.max(startMs, rangeStartMs);
    }
    if (rangeEndMs !== undefined && !isNaN(rangeEndMs)) {
      endMs = Math.min(endMs, rangeEndMs);
    }

    if (endMs > startMs) {
      rawIntervals.push([startMs, endMs]);
    }
  }

  if (rawIntervals.length === 0) return 0;

  // 1. Sort intervals by start time ascending
  rawIntervals.sort((a, b) => a[0] - b[0]);

  // 2. Merge overlapping or contiguous intervals
  const merged: [number, number][] = [rawIntervals[0]];

  for (let i = 1; i < rawIntervals.length; i++) {
    const current = rawIntervals[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      // Overlapping or touching intervals -> extend end
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push([current[0], current[1]]);
    }
  }

  // 3. Sum non-overlapping interval lengths in seconds
  let totalMs = 0;
  for (const [start, end] of merged) {
    totalMs += (end - start);
  }

  return Math.round(totalMs / 1000);
}

