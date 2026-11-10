import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getMatchFn, getNewsFn, getScheduleFn, getSquadFn, getStandingsFn, getConferenceStandingsFn } from "./football.functions";
import type { DataEnvelope } from "./types";

export const scheduleQuery = () =>
  queryOptions({
    queryKey: ["schedule"],
    queryFn: () => getScheduleFn({ data: {} }),
    // Poll only while a match is live — the source refreshes roughly every minute.
    refetchInterval: (q) => (q.state.data?.data.some((m) => m.state === "in") ? 60_000 : false),
  });

export const matchQuery = (id: string) =>
  queryOptions({
    queryKey: ["match", id],
    queryFn: () => getMatchFn({ data: { id } }),
    refetchInterval: (q) => (q.state.data?.data?.state === "in" ? 30_000 : false),
  });

export const standingsQuery = () =>
  queryOptions({ queryKey: ["standings"], queryFn: () => getStandingsFn({ data: {} }), staleTime: 5 * 60_000 });

export const conferenceStandingsQuery = () =>\n  queryOptions({ queryKey: ["standings", "conference"], queryFn: () => getConferenceStandingsFn({ data: {} }), staleTime: 5 * 60_000 });\n\nexport const squadQuery = () =>
  queryOptions({ queryKey: ["squad"], queryFn: () => getSquadFn({ data: {} }), staleTime: 30 * 60_000 });

export const newsQuery = () =>
  queryOptions({ queryKey: ["news"], queryFn: () => getNewsFn({ data: {} }), staleTime: 5 * 60_000 });

const FORCE: Record<string, (id?: string) => Promise<DataEnvelope<unknown>>> = {
  schedule: () => getScheduleFn({ data: { force: true } }),
  standings: () => getStandingsFn({ data: { force: true } }),\n  "standings:conference": () => getConferenceStandingsFn({ data: { force: true } }),
  squad: () => getSquadFn({ data: { force: true } }),
  news: () => getNewsFn({ data: { force: true } }),
  match: (id) => getMatchFn({ data: { id: id!, force: true } }),
};

/** Manual "Yenile": bypasses the server cache and writes the result into the query cache. */
export function useRefresh(queryKey: readonly unknown[]) {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const [kind, id] = queryKey as [string, string | undefined];
    setPending(true);
    setError(null);
    try {
      const data = await FORCE[kind](id);
      qc.setQueryData(queryKey, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yenilenemedi");
    } finally {
      setPending(false);
    }
  }, [qc, queryKey]);
  return { refresh, pending, error };
}