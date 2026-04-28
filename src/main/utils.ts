import { join, dirname } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { HERMES_HOME } from "./installer";
import { sanitizeProfileName } from "../shared/sanitize";

/**
 * Strip ANSI escape codes from terminal output.
 * Used by hermes.ts, claw3d.ts, and installer.ts when processing
 * child process output for display in the renderer.
 */
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*[a-zA-Z]|\x1B\][^\x07]*\x07|\x1B\(B|\r/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_RE, "");
}

/**
 * Resolve the home directory for a given profile.
 * 'default' or undefined maps to ~/.hermes; named profiles
 * live under ~/.hermes/profiles/<name>.
 */
export function profileHome(profile?: string): string {
  if (profile && profile !== "default") {
    const sanitized = sanitizeProfileName(profile);
    if (!sanitized) return HERMES_HOME;
    return join(HERMES_HOME, "profiles", sanitized);
  }
  return HERMES_HOME;
}

/**
 * Escape special regex characters in a string so it can be
 * safely interpolated into a RegExp constructor.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Write a file, creating parent directories if they don't exist.
 * Prevents ENOENT crashes when ~/.hermes has been deleted or doesn't exist yet.
 */
export function safeWriteFile(filePath: string, content: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, "utf-8");
}

/**
 * Validate and sanitize a CLI argument.
 * Returns null if invalid, the trimmed string if valid.
 */
export function sanitizeCliArg(arg: string): string | null {
  if (!arg || typeof arg !== "string") return null;
  const trimmed = arg.trim();
  if (!trimmed) return null;
  if (trimmed.length > 256) return null;
  // Allow alphanumeric, hyphens, underscores, dots, slashes, colons, @
  if (!/^[\w\-.@:/]+$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Escape HTML entities.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
