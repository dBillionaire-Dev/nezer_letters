import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  getLetterStats,
  listLetters,
  markLetterRead,
  setLetterDeleted,
} from "@/lib/letters.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Letters dashboard — Letters to Nezer" },
      { name: "description", content: "Private dashboard for reading anonymous letters." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Letters dashboard" },
      { property: "og:description", content: "Private dashboard for reading anonymous letters." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [
      { rel: "canonical", href: "/dashboard" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  { id: "deleted", label: "Deleted" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

const PAGE_SIZE = 8;

function formatDate(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      {value === undefined ? (
        <div className="mt-2 h-7 w-12 animate-pulse rounded bg-secondary" />
      ) : (
        <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
      )}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchLetters = useServerFn(listLetters);
  const fetchStats = useServerFn(getLetterStats);
  const toggleRead = useServerFn(markLetterRead);
  const toggleDeleted = useServerFn(setLetterDeleted);

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const stats = useQuery({
    queryKey: ["letter-stats"],
    queryFn: () => fetchStats({ data: undefined }),
  });

  const letters = useQuery({
    queryKey: ["letters", filter, search, page],
    queryFn: () => fetchLetters({ data: { filter, search, page, pageSize: PAGE_SIZE } }),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["letters"] });
    void queryClient.invalidateQueries({ queryKey: ["letter-stats"] });
  }

  const readMutation = useMutation({
    mutationFn: (input: { id: string; isRead: boolean }) => toggleRead({ data: input }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (input: { id: string; deleted: boolean }) => toggleDeleted({ data: input }),
    onSuccess: invalidate,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const total = letters.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isForbidden = letters.isError || stats.isError;

  return (
    <main className="relative min-h-dvh px-4 py-8 sm:px-8">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Letters to Nezer
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">Your letters</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm transition hover:bg-secondary"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </header>

        {isForbidden ? (
          <div className="glass mt-8 rounded-2xl p-6 text-sm text-muted-foreground" role="alert">
            This account isn't authorised to read the letters.
          </div>
        ) : null}

        <section aria-label="Statistics" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Total" value={stats.data?.total} />
          <StatCard label="Unread" value={stats.data?.unread} />
          <StatCard label="Read" value={stats.data?.read} />
          <StatCard label="Deleted" value={stats.data?.deleted} />
          <StatCard label="Today" value={stats.data?.today} />
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <label htmlFor="search" className="sr-only">
              Search letters
            </label>
            <input
              id="search"
              type="search"
              value={search}
              placeholder="Search letters…"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none sm:w-56"
            />
          </div>

          <div role="tablist" aria-label="Filter letters" className="glass flex gap-1 rounded-full p-1">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                role="tab"
                aria-selected={filter === option.id}
                onClick={() => {
                  setFilter(option.id);
                  setPage(1);
                }}
                className={cn(
                  "min-h-9 rounded-full px-4 text-xs font-medium transition",
                  filter === option.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <section aria-label="Letters" className="mt-6 space-y-3">
          {letters.isPending ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="glass h-28 animate-pulse rounded-2xl" />
            ))
          ) : letters.data && letters.data.letters.length === 0 ? (
            <div className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-14 text-center">
              <Inbox className="size-6 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">No letters here yet.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {letters.data?.letters.map((letter) => {
                const stamp = formatDate(letter.created_at);
                return (
                  <motion.article
                    key={letter.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="glass rounded-2xl p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <time dateTime={letter.created_at}>
                        {stamp.day} · {stamp.time}
                      </time>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium",
                          letter.is_read
                            ? "bg-secondary text-muted-foreground"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        {letter.is_read ? "Read" : "Unread"}
                      </span>
                      {letter.deleted ? (
                        <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-medium text-destructive">
                          Deleted
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {letter.message}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          readMutation.mutate({ id: letter.id, isRead: !letter.is_read })
                        }
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs transition hover:bg-secondary"
                      >
                        {letter.is_read ? (
                          <Mail className="size-3.5" aria-hidden />
                        ) : (
                          <MailOpen className="size-3.5" aria-hidden />
                        )}
                        {letter.is_read ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteMutation.mutate({ id: letter.id, deleted: !letter.deleted })
                        }
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs transition hover:bg-secondary",
                          !letter.deleted && "text-destructive",
                        )}
                      >
                        {letter.deleted ? (
                          <RotateCcw className="size-3.5" aria-hidden />
                        ) : (
                          <Trash2 className="size-3.5" aria-hidden />
                        )}
                        {letter.deleted ? "Restore" : "Delete"}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </section>

        {pageCount > 1 ? (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border transition hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
