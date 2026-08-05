import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MailOpen, RotateCcw, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type LetterRow = {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  deleted: boolean;
};

function formatFull(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

export function LetterViewModal({
  letter,
  onOpenChange,
  onToggleRead,
  onToggleDeleted,
}: {
  letter: LetterRow | null;
  onOpenChange: (open: boolean) => void;
  onToggleRead: (input: { id: string; isRead: boolean }) => void;
  onToggleDeleted: (input: { id: string; deleted: boolean }) => void;
}) {
  const open = letter !== null;
  const stamp = letter ? formatFull(letter.created_at) : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && letter && stamp ? (
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

            <Dialog.Content asChild forceMount aria-describedby="letter-view-body">
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

                <div className="flex flex-wrap items-center gap-3 pr-10 text-xs text-muted-foreground">
                  <time dateTime={letter.created_at}>
                    {stamp.day} · {stamp.time}
                  </time>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      letter.is_read ? "bg-secondary text-muted-foreground" : "bg-primary/15 text-primary",
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

                <Dialog.Title className="sr-only">Letter</Dialog.Title>

                <p
                  id="letter-view-body"
                  className="mt-5 max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-base leading-relaxed text-foreground"
                >
                  {letter.message}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleRead({ id: letter.id, isRead: !letter.is_read })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs transition hover:bg-secondary"
                  >
                    {letter.is_read ? (
                      <Mail className="size-3.5" aria-hidden />
                    ) : (
                      <MailOpen className="size-3.5" aria-hidden />
                    )}
                    {letter.is_read ? "Mark unread" : "Mark read"}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
