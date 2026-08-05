import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MAX_MESSAGE_LENGTH, sanitizeMessage } from "@/lib/message";

const submitSchema = z.object({
  message: z
    .string()
    .transform((value) => sanitizeMessage(value))
    .refine((value) => value.length > 0, { message: "Your letter can't be empty." })
    .refine((value) => value.length <= MAX_MESSAGE_LENGTH, {
      message: `Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
    }),
});

function createAnonServerClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured.");

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Public: anyone may leave one anonymous letter. Nothing but the text is stored. */
export const submitLetter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createAnonServerClient();
    const { error } = await supabase.from("letters").insert({ message: data.message });
    if (error) throw new Error("Your letter could not be delivered. Please try again.");
    return { ok: true as const };
  });

async function assertAdmin(context: { supabase: ReturnType<typeof createAnonServerClient>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

const listSchema = z.object({
  search: z.string().max(120).optional(),
  filter: z.enum(["all", "unread", "read", "deleted"]).default("all"),
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export const listLetters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    let query = context.supabase
      .from("letters")
      .select("id, message, created_at, is_read, deleted", { count: "exact" })
      .order("created_at", { ascending: false });

    if (data.filter === "deleted") query = query.eq("deleted", true);
    else if (data.filter === "unread") query = query.eq("deleted", false).eq("is_read", false);
    else if (data.filter === "read") query = query.eq("deleted", false).eq("is_read", true);
    else query = query.eq("deleted", false);

    if (data.search && data.search.trim().length > 0) {
      query = query.ilike("message", `%${data.search.trim().replace(/[%_]/g, "")}%`);
    }

    const from = (data.page - 1) * data.pageSize;
    const { data: rows, count, error } = await query.range(from, from + data.pageSize - 1);
    if (error) throw new Error("Could not load letters.");

    return { letters: rows ?? [], total: count ?? 0 };
  });

export const getLetterStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const { data, error } = await context.supabase.from("letters").select("is_read, deleted, created_at");
    if (error) throw new Error("Could not load statistics.");

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const live = (data ?? []).filter((row) => !row.deleted);
    return {
      total: live.length,
      unread: live.filter((row) => !row.is_read).length,
      read: live.filter((row) => row.is_read).length,
      deleted: (data ?? []).filter((row) => row.deleted).length,
      today: live.filter((row) => new Date(row.created_at) >= startOfToday).length,
    };
  });

const mutateSchema = z.object({ id: z.string().uuid() });

export const markLetterRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => mutateSchema.extend({ isRead: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("letters")
      .update({ is_read: data.isRead })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the letter.");
    return { ok: true as const };
  });

export const setLetterDeleted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => mutateSchema.extend({ deleted: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("letters")
      .update({ deleted: data.deleted })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the letter.");
    return { ok: true as const };
  });

export const getIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });
