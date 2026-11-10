import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loadMatch, loadNews, loadSchedule, loadSquad, loadStandings, loadConferenceStandings } from "./registry.server";

const refresh = z.object({ force: z.boolean().optional() }).optional();

export const getScheduleFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => refresh.parse(d))
  .handler(({ data }) => loadSchedule(data?.force));

export const getMatchFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().min(1).max(40).regex(/^[\w-]+$/), force: z.boolean().optional() }).parse(d),
  )
  .handler(({ data }) => loadMatch(data.id, data.force));

export const getStandingsFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => refresh.parse(d))
  .handler(({ data }) => loadStandings(data?.force));

export const getSquadFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => refresh.parse(d))
  .handler(({ data }) => loadSquad(data?.force));

export const getNewsFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => refresh.parse(d))
  .handler(({ data }) => loadNews(data?.force));