export function sanitizeProfileName(name: string, allowDefault = false): string | null {
  if (!name || typeof name !== "string") return null;

  const trimmed = name.trim();
  if (!trimmed) return null;
  if (trimmed.length > 64) return null;

  if (!/^[\w\-.]+$/.test(trimmed)) return null;

  if (!allowDefault && trimmed === "default") return null;

  return trimmed;
}

export function sanitizeCliArg(arg: string): string | null {
  if (!arg || typeof arg !== "string") return null;

  if (!arg.trim()) return null;

  if (arg.startsWith("--") && arg.length > 2) return null;

  if (/^-[a-zA-Z]$/.test(arg)) return null;

  if (/[;&|`$(){}[\]!<>~\n\r]/.test(arg)) return null;

  if (arg.length > 256) return null;

  return arg.trim();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function validateArg(arg: string, name: string): string | null {
  if (!arg || typeof arg !== "string") {
    return `${name} is required`;
  }
  if (arg.startsWith("-")) {
    return `${name} cannot start with a dash`;
  }
  if (arg.length > 256) {
    return `${name} is too long (max 256 chars)`;
  }
  return null;
}
