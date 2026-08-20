"use client";

import { useAnimatedNumber } from "@/lib/use-animated-number";

export function AnimatedNumber({ value, durationMs = 900 }: { value: number; durationMs?: number }) {
  const animated = useAnimatedNumber(value, durationMs);
  return <>{Math.round(animated).toLocaleString()}</>;
}
