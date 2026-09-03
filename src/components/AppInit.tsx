"use client";

import { useEffect } from "react";
import { seedDemoDataIfNeeded } from "@/lib/data/seed";

/** Seeds simulated roster/rep history once per browser, client-side only
 * (localStorage isn't available during server rendering). */
export function AppInit() {
  useEffect(() => {
    seedDemoDataIfNeeded();
  }, []);
  return null;
}
