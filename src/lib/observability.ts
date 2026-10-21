"use client";

import posthog from "posthog-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";

export interface TelemetryEventRecord {
  id: string;
  eventName: string;
  timestamp: string;
  anonId: string;
  userId: string | null;
  properties: Record<string, unknown>;
  syncedToPosthog: boolean;
  syncedToSupabase: boolean;
}

const LOCAL_TELEMETRY_KEY = "winegrid_telemetry_log_v1";
const ANON_ID_KEY = "winegrid_anon_id_v1";

let posthogInitialized = false;

export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "server-anon";
  let anonId = window.localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = `anon_${crypto.randomUUID()}`;
    window.localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}

export function initObservability(): void {
  if (typeof window === "undefined" || posthogInitialized) return;

  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (phKey && phKey.startsWith("phc_") && phKey !== "phc_your_posthog_project_key") {
    posthog.init(phKey, {
      api_host: phHost,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    });
    posthogInitialized = true;
  }

  // Global client error & unhandled rejection capture for observability
  window.addEventListener("error", (event) => {
    trackEvent("client_runtime_error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("unhandled_promise_rejection", {
      reason: String(event.reason),
    });
  });
}

export function identifyObservabilityUser(userId: string, email?: string): void {
  if (typeof window === "undefined") return;
  if (posthogInitialized) {
    posthog.identify(userId, { email });
  }
  trackEvent("user_identified", { userId, email: email ?? "hidden" }, userId);
}

export function getLocalTelemetryEvents(): TelemetryEventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TELEMETRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TelemetryEventRecord[];
  } catch {
    return [];
  }
}

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  explicitUserId?: string | null
): Promise<void> {
  if (typeof window === "undefined") return;

  const anonId = getOrCreateAnonId();
  const supabase = getSupabaseBrowserClient();
  let userId = explicitUserId ?? null;

  if (!userId && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      userId = data.session?.user?.id ?? null;
    } catch {
      // Ignore session fetch error
    }
  }

  let syncedPosthog = false;
  if (posthogInitialized) {
    try {
      posthog.capture(eventName, {
        ...properties,
        anon_id: anonId,
        user_id: userId,
      });
      syncedPosthog = true;
    } catch {
      syncedPosthog = false;
    }
  }

  let syncedSupabase = false;
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("telemetry_events").insert({
        event_name: eventName,
        user_id: userId,
        anon_id: anonId,
        properties,
        page_path: window.location.pathname,
        user_agent: navigator.userAgent,
      });
      if (!error) syncedSupabase = true;
    } catch {
      syncedSupabase = false;
    }
  }

  // Persist to local ring buffer (last 100 events) for the in-app Observability Dashboard
  try {
    const existing = getLocalTelemetryEvents();
    const record: TelemetryEventRecord = {
      id: crypto.randomUUID(),
      eventName,
      timestamp: new Date().toISOString(),
      anonId,
      userId,
      properties,
      syncedToPosthog: syncedPosthog,
      syncedToSupabase: syncedSupabase,
    };
    const updated = [record, ...existing].slice(0, 100);
    window.localStorage.setItem(LOCAL_TELEMETRY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("winegrid:telemetry_updated"));
  } catch {
    // Ignore storage quota errors
  }
}
