"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  type CompareParams,
  compareParamsToSearchString,
  parseCompareParams,
} from "@/lib/compare/params";

export function useCompareParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => parseCompareParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  // See components/browse/use-browse-params.ts for why this ref exists:
  // router.push updates the URL asynchronously, so rapid clicks (e.g.
  // adding two items back to back) need to merge onto each other rather
  // than both reading the same stale `params` snapshot.
  const pendingRef = useRef<CompareParams>(params);
  useEffect(() => {
    pendingRef.current = params;
  }, [params]);

  const updateParams = useCallback(
    (updates: Partial<CompareParams>) => {
      const next: CompareParams = { ...pendingRef.current, ...updates };
      pendingRef.current = next;
      router.push(`${pathname}${compareParamsToSearchString(next)}`, { scroll: false });
    },
    [pathname, router],
  );

  return { params, updateParams };
}
