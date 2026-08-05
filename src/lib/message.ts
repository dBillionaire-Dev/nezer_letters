export const MAX_MESSAGE_LENGTH = 2000;
export const MIN_MESSAGE_LENGTH = 2;

/**
 * Strips control characters and collapses runaway whitespace.
 * Content is always rendered as text (never as HTML), so no markup is trusted.
 */
export function sanitizeMessage(input: string): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}
