import { Suspense, lazy, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LetterModal } from "@/components/letter-modal";
import { Particles } from "@/components/particles";

const PhotoSphere = lazy(() => import("@/components/photo-sphere"));
const siteUrl = "https://nezer-bday.vercel.app";
const title = "Letters to Nezer";
const description = "Leave Nezer something you've always wanted to say. Completely anonymous.";
const image = `${siteUrl}/og-image.png`;

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title },
      {
        name: "description",
        content: description,
      },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content: description,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: image },
      { property: "og:site_name", content: title },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "twitter:title", content: title },
      { property: "twitter:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: siteUrl,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Letters to Nezer",
          description: "Send Nezer a completely anonymous birthday letter.",
          url: siteUrl,
          image,
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
      {/*<Particles />*/}

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-10 px-5 md-10 sm:py-24 text-center">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl"
        >
          <span className="text-gradient">Happy Birthday To Me</span>
        </motion.h1>

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

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Today I'm celebrating another year of growth. If you've ever wanted to tell me something,
          a compliment, a confession, a criticism, or a thank you, today is the day.
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
            No name. No email. No login. Only your message is received.
          </p>
        </motion.div>
      </div>

      <LetterModal open={open} onOpenChange={setOpen} />
    </main>
  );
}
