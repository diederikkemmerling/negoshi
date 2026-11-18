"use client";
import { useEffect } from "react";

/** Counts a page view once per brief per browser session. */
export function HitBeacon({ id }: { id: string }) {
  useEffect(() => {
    try {
      const k = `ns_hit_${id}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    try { navigator.sendBeacon("/api/hit", id); } catch {}
  }, [id]);
  return null;
}
