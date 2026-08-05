import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart, Loader2, Send, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import { submitLetter } from "@/lib/letters.functions";
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH } from "@/lib/message";
import { celebrate } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  message: z
    .string()
    .trim()
    .min(MIN_MESSAGE_LENGTH, "Please write a little more.")
    .max(MAX_MESSAGE_LENGTH, `Please keep it under ${MAX_MESSAGE_LENGTH} characters.`),
});

type FormValues = z.infer<typeof formSchema>;

export function LetterModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const send = useServerFn(submitLetter);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { message: "" } });

  const value = watch("message") ?? "";
  const remaining = MAX_MESSAGE_LENGTH - value.length;

  useEffect(() => {
    if (!open) {
      const timeout = window.setTimeout(() => {
        setSent(false);
        setServerError(null);
        reset({ message: "" });
      }, 250);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await send({ data: { message: values.message } });
      setSent(true);
      celebrate();
      window.setTimeout(() => successRef.current?.focus(), 60);
    } catch {
      setServerError("Something went wrong sending your letter. Please try again.");
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="glass fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 sm:p-8"
              >
                <Dialog.Close
                  aria-label="Close"
                  className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-5" aria-hidden />
                </Dialog.Close>

                {sent ? (
                  <div
                    ref={successRef}
                    tabIndex={-1}
                    role="status"
                    className="flex flex-col items-center gap-4 py-8 text-center outline-none"
                  >
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 220, damping: 14 }}
                      className="inline-flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary"
                    >
                      <Heart className="size-8" aria-hidden />
                    </motion.span>
                    <Dialog.Title className="font-display text-3xl">Thank you.</Dialog.Title>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Your anonymous message has reached me. No name, no trace — just your words.
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSent(false);
                          reset({ message: "" });
                        }}
                        className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                      >
                        Write another
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} noValidate>
                    <Dialog.Title className="font-display text-2xl sm:text-3xl">
                      Leave me an anonymous letter
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nothing about you is collected. Only the words below.
                    </p>

                    <label htmlFor="letter-message" className="sr-only">
                      Your anonymous message
                    </label>
                    <textarea
                      id="letter-message"
                      autoFocus
                      rows={7}
                      maxLength={MAX_MESSAGE_LENGTH}
                      placeholder="Tell me absolutely anything…"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby="letter-counter letter-error"
                      className="mt-5 w-full resize-none rounded-2xl border border-input bg-secondary/40 p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                      {...register("message")}
                    />

                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                      <span id="letter-error" className="text-destructive" role="alert">
                        {errors.message?.message ?? serverError ?? ""}
                      </span>
                      <span
                        id="letter-counter"
                        className={cn(
                          "tabular-nums text-muted-foreground",
                          remaining < 100 && "text-primary",
                        )}
                      >
                        {value.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="min-h-11 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Send className="size-4" aria-hidden />
                        )}
                        {isSubmitting ? "Sending…" : "Send letter"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
