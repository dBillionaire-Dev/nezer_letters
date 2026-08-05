import { Suspense, lazy, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { LetterModal } from "@/components/letter-modal";
import { Particles } from "@/components/particles";

const PhotoSphere = lazy(() => import("@/components/photo-sphere"));

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Letters to Nezer — Send an anonymous birthday letter" },
      {
        name: "description",
        content:
          "Leave Nezer something you've always wanted to say. Completely anonymous — no name, no email, no login. Just your words, for one day only.",
      },
      { property: "og:title", content: "Letters to Nezer" },
      {
        property: "og:description",
        content: "Leave me something you've always wanted to say. Completely anonymous.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Letters to Nezer",
          description: "Send Nezer a completely anonymous birthday letter.",
        }),
      },
    ],
  }),
});

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function SphereFallback() {
  return (
    <div
      className="mx-auto aspect-square w-full max-w-[420px] animate-pulse rounded-full bg-secondary/40"
      aria-hidden
    />
  );
}

function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 opacity-70" />
      <Particles />

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-10 px-5 py-16 text-center sm:py-24">
        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          Letters to Nezer
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-[300px] w-full max-w-[460px] sm:h-[420px]"
        >
          <ClientOnly fallback={<SphereFallback />}>
            <Suspense fallback={<SphereFallback />}>
              <PhotoSphere />
            </Suspense>
          </ClientOnly>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="text-gradient">Happy Birthday To Me</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Today I'm celebrating another year of growth. If you've ever wanted to tell me something —
          a compliment, a confession, a criticism, or a thank you — today is the day.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glow group inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-[0.99] sm:text-base"
          >
            Leave Me An Anonymous Letter
          </button>
          <p className="text-xs text-muted-foreground">
            No name. No email. No login. Only your message is stored.
          </p>
        </motion.div>
      </div>

      <LetterModal open={open} onOpenChange={setOpen} />
    </main>
  );
}
