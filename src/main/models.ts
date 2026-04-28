import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import https from "https";
import { HERMES_HOME } from "./installer";
import { safeWriteFile } from "./utils";
import DEFAULT_MODELS from "./default-models";

const MODELS_FILE = join(HERMES_HOME, "models.json");
const KILO_CACHE_FILE = join(HERMES_HOME, "models-kilo-cache.json");

export interface SavedModel {
  id: string;
  name: string;
  provider: string;
  model: string;
  baseUrl: string;
  createdAt: number;
}

function readModels(): SavedModel[] {
  try {
    if (!existsSync(MODELS_FILE)) return [];
    return JSON.parse(readFileSync(MODELS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeModels(models: SavedModel[]): void {
  safeWriteFile(MODELS_FILE, JSON.stringify(models, null, 2));
}

function seedDefaults(): SavedModel[] {
  const models: SavedModel[] = DEFAULT_MODELS.map((m) => ({
    id: randomUUID(),
    name: m.name,
    provider: m.provider,
    model: m.model,
    baseUrl: m.baseUrl,
    createdAt: Date.now(),
  }));
  writeModels(models);
  return models;
}

export function listModels(): SavedModel[] {
  if (!existsSync(MODELS_FILE)) {
    return seedDefaults();
  }
  return readModels();
}

export function addModel(
  name: string,
  provider: string,
  model: string,
  baseUrl: string,
): SavedModel {
  const models = readModels();

  // Dedup: if same model ID + provider exists, return existing
  const existing = models.find(
    (m) => m.model === model && m.provider === provider,
  );
  if (existing) return existing;

  const entry: SavedModel = {
    id: randomUUID(),
    name,
    provider,
    model,
    baseUrl: baseUrl || "",
    createdAt: Date.now(),
  };
  models.push(entry);
  writeModels(models);
  return entry;
}

export function removeModel(id: string): boolean {
  const models = readModels();
  const filtered = models.filter((m) => m.id !== id);
  if (filtered.length === models.length) return false;
  writeModels(filtered);
  return true;
}

export function updateModel(
  id: string,
  fields: Partial<Pick<SavedModel, "name" | "provider" | "model" | "baseUrl">>,
): boolean {
  const models = readModels();
  const idx = models.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  models[idx] = { ...models[idx], ...fields };
  writeModels(models);
  return true;
}

export function discoverKiloModels(): Promise<
  Array<{ id: string; name: string; model: string; provider: string }>
> {
  try {
    if (existsSync(KILO_CACHE_FILE)) {
      const cache = JSON.parse(readFileSync(KILO_CACHE_FILE, "utf-8"));
      if (cache.fetchedAt && Date.now() - cache.fetchedAt < 60 * 60 * 1000) {
        return Promise.resolve(cache.models || []);
      }
    }
  } catch {
    // ignore cache read errors
  }

  return new Promise((resolve) => {
    const req = https.get(
      "https://api.kilo.ai/api/gateway/models",
      { timeout: 10000 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const models = (json.data || []).map((item: any) => ({
              id: item.id,
              name: item.name || item.id,
              model: item.id,
              provider: "kilo",
            }));
            safeWriteFile(
              KILO_CACHE_FILE,
              JSON.stringify({ fetchedAt: Date.now(), models }, null, 2),
            );
            resolve(models);
          } catch {
            resolve([]);
          }
        });
      },
    );
    req.on("error", () => resolve([]));
    req.on("timeout", () => {
      req.destroy();
      resolve([]);
    });
  });
}
