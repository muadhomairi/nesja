"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { AnalyticsEventMap, AnalyticsEventName } from "@/lib/analytics/events";

/** Fires an analytics event once when a page/section mounts. */
export function TrackOnView<E extends AnalyticsEventName>({ event, props }: { event: E; props: AnalyticsEventMap[E] }) {
  useEffect(() => { track(event, props); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
