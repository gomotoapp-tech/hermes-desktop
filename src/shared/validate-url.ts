import { URL } from "url";

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^198\.(1[89]|20)\./,
  /^203\.0\.113\./,
];

const PRIVATE_HOSTNAMES = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];

function isPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (PRIVATE_HOSTNAMES.includes(lower)) return true;
  for (const range of PRIVATE_RANGES) {
    if (range.test(lower)) return true;
  }
  return false;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateRemoteUrl(url: string): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { valid: false, error: "Only http and https protocols are allowed" };
  }

  if (parsed.protocol === "http:" && !isPrivateHost(parsed.hostname)) {
    return { valid: false, error: "HTTP is only allowed for localhost connections" };
  }

  if (isPrivateHost(parsed.hostname) && parsed.protocol === "https:") {
    return { valid: false, error: "HTTPS connections to private/loopback addresses are not allowed for remote connections" };
  }

  return { valid: true };
}

export function validateWsUrl(url: string): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (parsed.protocol !== "wss:" && parsed.protocol !== "ws:") {
    return { valid: false, error: "Only ws and wss protocols are allowed" };
  }

  if (parsed.protocol === "ws:" && !isPrivateHost(parsed.hostname)) {
    return { valid: false, error: "WS is only allowed for localhost connections" };
  }

  return { valid: true };
}

export function validateBaseUrl(url: string | undefined | null): ValidationResult {
  if (!url) {
    return { valid: true };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid base URL format" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { valid: false, error: "Only http and https protocols are allowed for base URL" };
  }

  if (parsed.protocol === "http:" && !isPrivateHost(parsed.hostname)) {
    return { valid: false, error: "HTTP base URL is only allowed for localhost/private connections" };
  }

  return { valid: true };
}

export function validateExternalUrl(url: string): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  const allowedProtocols = ["http:", "https:", "mailto:"];
  if (!allowedProtocols.includes(parsed.protocol)) {
    return { valid: false, error: `Protocol ${parsed.protocol} is not allowed. Only http, https, and mailto are permitted` };
  }

  return { valid: true };
}
