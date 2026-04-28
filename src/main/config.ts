import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { load, dump } from "js-yaml";
import { HERMES_HOME } from "./installer";
import { profileHome, escapeRegex, safeWriteFile } from "./utils";
import { GATEWAY_PLATFORM_KEYS } from "../shared/gateway-platforms";

// ── Connection Config (local vs remote) ─────────────────

export interface ConnectionConfig {
  mode: "local" | "remote";
  remoteUrl: string;
  apiKey: string;
}

// Lazy getter — avoids circular dependency with installer.ts
// (HERMES_HOME may not be assigned yet when this module first loads)
function desktopConfigFile(): string {
  return join(HERMES_HOME, "desktop.json");
}

function readDesktopConfig(): Record<string, unknown> {
  try {
    const f = desktopConfigFile();
    if (!existsSync(f)) return {};
    return JSON.parse(readFileSync(f, "utf-8"));
  } catch {
    return {};
  }
}

function writeDesktopConfig(data: Record<string, unknown>): void {
  if (!existsSync(HERMES_HOME)) {
    mkdirSync(HERMES_HOME, { recursive: true });
  }
  writeFileSync(desktopConfigFile(), JSON.stringify(data, null, 2), "utf-8");
}

export function getConnectionConfig(): ConnectionConfig {
  const data = readDesktopConfig();
  return {
    mode: (data.connectionMode as "local" | "remote") || "local",
    remoteUrl: (data.remoteUrl as string) || "",
    apiKey: (data.remoteApiKey as string) || "",
  };
}

export function setConnectionConfig(config: ConnectionConfig): void {
  const data = readDesktopConfig();
  data.connectionMode = config.mode;
  data.remoteUrl = config.remoteUrl;
  data.remoteApiKey = config.apiKey;
  writeDesktopConfig(data);
}

// ── In-memory cache with TTL ─────────────────────────────
const CACHE_TTL = 5000; // 5 seconds
const _cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string): T | undefined {
  const entry = _cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) {
    _cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  _cache.set(key, { data, ts: Date.now() });
}

function invalidateCache(prefix: string): void {
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) _cache.delete(key);
  }
}

function profilePaths(profile?: string): {
  envFile: string;
  configFile: string;
  home: string;
} {
  const home = profileHome(profile);
  return {
    home,
    envFile: join(home, ".env"),
    configFile: join(home, "config.yaml"),
  };
}

export function readEnv(profile?: string): Record<string, string> {
  const cacheKey = `env:${profile || "default"}`;
  const cached = getCached<Record<string, string>>(cacheKey);
  if (cached) return cached;

  const { envFile } = profilePaths(profile);
  if (!existsSync(envFile)) return {};

  const content = readFileSync(envFile, "utf-8");
  const result: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const eqIndex = trimmed.indexOf("=");
    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value) result[key] = value;
  }

  setCache(cacheKey, result);
  return result;
}

export function setEnvValue(
  key: string,
  value: string,
  profile?: string,
): void {
  const { envFile } = profilePaths(profile);
  invalidateCache(`env:${profile || "default"}`);

  if (!existsSync(envFile)) {
    safeWriteFile(envFile, `${key}=${value}\n`);
    return;
  }

  const content = readFileSync(envFile, "utf-8");
  const lines = content.split("\n");
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.match(new RegExp(`^#?\\s*${escapeRegex(key)}\\s*=`))) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }

  if (!found) {
    lines.push(`${key}=${value}`);
  }

  safeWriteFile(envFile, lines.join("\n"));
}

export function getConfigValue(key: string, profile?: string): string | null {
  const { configFile } = profilePaths(profile);
  if (!existsSync(configFile)) return null;

  const content = readFileSync(configFile, "utf-8");
  const doc = load(content) as Record<string, unknown> | null;
  if (!doc) return null;
  const val = doc[key];
  return typeof val === "string" ? val : null;
}

export function setConfigValue(
  key: string,
  value: string,
  profile?: string,
): void {
  const { configFile } = profilePaths(profile);
  if (!existsSync(configFile)) return;

  const content = readFileSync(configFile, "utf-8");
  const doc = (load(content) as Record<string, unknown>) || {};
  doc[key] = value;
  safeWriteFile(configFile, dump(doc));
}

export function getModelConfig(profile?: string): {
  provider: string;
  model: string;
  baseUrl: string;
} {
  const cacheKey = `mc:${profile || "default"}`;
  const cached = getCached<{ provider: string; model: string; baseUrl: string }>(cacheKey);
  if (cached) return cached;

  const { configFile } = profilePaths(profile);
  const defaults = { provider: "auto", model: "", baseUrl: "" };
  if (!existsSync(configFile)) return defaults;

  const content = readFileSync(configFile, "utf-8");
  const doc = (load(content) as Record<string, unknown>) || {};

  const provider = doc.provider;
  const model = doc.default;
  const baseUrl = doc.base_url;

  const result = {
    provider: typeof provider === "string" ? provider.trim() : defaults.provider,
    model: typeof model === "string" ? model.trim() : defaults.model,
    baseUrl: typeof baseUrl === "string" ? baseUrl.trim() : defaults.baseUrl,
  };

  setCache(cacheKey, result);
  return result;
}

export function setModelConfig(
  provider: string,
  model: string,
  baseUrl: string,
  profile?: string,
): void {
  invalidateCache(`mc:${profile || "default"}`);
  const { configFile } = profilePaths(profile);
  if (!existsSync(configFile)) return;

  const content = readFileSync(configFile, "utf-8");
  const doc = (load(content) as Record<string, unknown>) || {};
  doc.provider = provider;
  doc.default = model;
  doc.base_url = baseUrl;

  if (doc.smart_model_routing && typeof doc.smart_model_routing === "object") {
    (doc.smart_model_routing as Record<string, unknown>).enabled = false;
  }

  if (doc.streaming !== undefined) doc.streaming = true;

  safeWriteFile(configFile, dump(doc));
}

export function getHermesHome(profile?: string): string {
  return profilePaths(profile).home;
}

// ── Platform enabled/disabled in config.yaml ────────────

export function getPlatformEnabled(profile?: string): Record<string, boolean> {
  const { configFile } = profilePaths(profile);
  if (!existsSync(configFile)) return {};

  const content = readFileSync(configFile, "utf-8");
  const doc = (load(content) as Record<string, unknown>) || {};
  const platforms = (doc.platforms as Record<string, unknown>) || {};
  const result: Record<string, boolean> = {};

  for (const key of GATEWAY_PLATFORM_KEYS) {
    result[key] = (platforms[key] as Record<string, unknown>)?.enabled === true;
  }

  return result;
}

export function setPlatformEnabled(
  platform: string,
  enabled: boolean,
  profile?: string,
): void {
  const allowed = new Set(GATEWAY_PLATFORM_KEYS);
  if (!allowed.has(platform)) return;

  const { configFile } = profilePaths(profile);
  if (!existsSync(configFile)) return;

  const content = readFileSync(configFile, "utf-8");
  const doc = (load(content) as Record<string, unknown>) || {};
  if (!doc.platforms || typeof doc.platforms !== "object") {
    doc.platforms = {};
  }
  const platforms = doc.platforms as Record<string, unknown>;
  if (!platforms[platform] || typeof platforms[platform] !== "object") {
    platforms[platform] = {};
  }
  (platforms[platform] as Record<string, unknown>).enabled = enabled;

  safeWriteFile(configFile, dump(doc));
}

// ── Credential Pool (auth.json) ──────────────────────────

function authFilePath(): string {
  return join(HERMES_HOME, "auth.json");
}

interface CredentialEntry {
  key: string;
  label: string;
}

function readAuthStore(): Record<string, unknown> {
  try {
    const p = authFilePath();
    if (!existsSync(p)) return {};
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

function writeAuthStore(store: Record<string, unknown>): void {
  safeWriteFile(authFilePath(), JSON.stringify(store, null, 2));
}

export function getCredentialPool(): Record<string, CredentialEntry[]> {
  const store = readAuthStore();
  const pool = store.credential_pool;
  if (!pool || typeof pool !== "object") return {};
  return pool as Record<string, CredentialEntry[]>;
}

export function setCredentialPool(
  provider: string,
  entries: CredentialEntry[],
): void {
  const store = readAuthStore();
  if (!store.credential_pool || typeof store.credential_pool !== "object") {
    store.credential_pool = {};
  }
  (store.credential_pool as Record<string, CredentialEntry[]>)[provider] =
    entries;
  writeAuthStore(store);
}
