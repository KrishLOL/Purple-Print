"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type BrowseParams, browseParamsToSearchString, parseBrowseParams } from "@/lib/browse/params";

export function useBrowseParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => parseBrowseParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  // Tracks the most recently *requested* params synchronously. router.push
  // updates the URL asynchronously, so two filter clicks fired in quick
  // succession (before the first navigation has committed and re-rendered
  // this hook with fresh `params`) would otherwise both merge against the
  // same stale snapshot — the second click would silently undo the first.
  // Merging onto this ref instead of `params` keeps each click building on
  // the previous one. The effect below resyncs it after a real navigation
  // (e.g. back/forward) lands.
  const pendingRef = useRef<BrowseParams>(params);
  useEffect(() => {
    pendingRef.current = params;
  }, [params]);

  const updateParams = useCallback(
    (updates: Partial<BrowseParams>, opts: { history?: "push" | "replace" } = {}) => {
      const next: BrowseParams = { ...pendingRef.current, ...updates };
      pendingRef.current = next;
      const qs = browseParamsToSearchString(next);
      const href = `${pathname}${qs}`;
      if (opts.history === "replace") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router],
  );

  return { params, updateParams };
}
