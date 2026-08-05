import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Private access - Letters to Nezer" },
      { name: "description", content: "Private sign-in for the Letters to Nezer dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Private access - Letters to Nezer" },
      { property: "og:description", content: "Private sign-in for the Letters to Nezer dashboard." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/auth" },
    ],
    links: [
      { rel: "canonical", href: "/auth" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Those credentials didn't work.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 opacity-50" />
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={onSubmit}
        className="glass relative w-full max-w-sm rounded-3xl p-7"
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lock className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl">Private access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the owner of this page can read the letters.
        </p>

        <label htmlFor="email" className="mt-6 block text-xs font-medium text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm focus:border-primary/50 focus:outline-none"
        />

        <label htmlFor="password" className="mt-4 block text-xs font-medium text-muted-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-secondary/40 px-4 py-3 text-sm focus:border-primary/50 focus:outline-none"
        />

        {error ? (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Sign in
        </button>
      </motion.form>
    </main>
  );
}
