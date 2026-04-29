/**
 * Default models seeded on first install.
 *
 * Contributors: add new models here! They'll be available to all users
 * on fresh install. Format:
 *   { name: "Display Name", provider: "provider-key", model: "model-id", baseUrl: "" }
 *
 * Provider keys: openrouter, anthropic, openai, custom
 * For openrouter models, use the full path (e.g. "anthropic/claude-sonnet-4-20250514")
 * For direct provider models, use the provider's model ID (e.g. "claude-sonnet-4-20250514")
 */

export interface DefaultModel {
  name: string;
  provider: string;
  model: string;
  baseUrl: string;
}

const DEFAULT_MODELS: DefaultModel[] = [
  // ── OpenRouter (200+ models via single API key) ──────────────────────
  {
    name: "Claude Sonnet 4",
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4-20250514",
    baseUrl: "",
  },

  // ── Anthropic (direct) ───────────────────────────────────────────────
  {
    name: "Claude Sonnet 4",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    baseUrl: "",
  },

  // ── OpenAI (direct) ──────────────────────────────────────────────────
  {
    name: "GPT-4.1",
    provider: "openai",
    model: "gpt-4.1",
    baseUrl: "",
  },

  // ── Kilo Gateway (all models via single API key) ─────────────────────
  {
    name: "GPT-4.1",
    provider: "kilo",
    model: "openai/gpt-4.1",
    baseUrl: "",
  },
  {
    name: "Claude Sonnet 4",
    provider: "kilo",
    model: "anthropic/claude-sonnet-4-20250514",
    baseUrl: "",
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "kilo",
    model: "google/gemini-2.5-pro-preview-03-25",
    baseUrl: "",
  },
  {
    name: "DeepSeek V3",
    provider: "kilo",
    model: "deepseek/deepseek-chat",
    baseUrl: "",
  },
  {
    name: "Kimi K2.5",
    provider: "kilo",
    model: "moonshotai/kimi-k2.5",
    baseUrl: "",
  },
  {
    name: "DeepSeek V4 Lite (flash)",
    provider: "kilo",
    model: "deepseek/deepseek-v4-lite-flash",
    baseUrl: "",
  },
  {
    name: "Kimi 2.6",
    provider: "kilo",
    model: "moonshotai/kimi-2.6",
    baseUrl: "",
  },
  {
    name: "MiniMax 2.7",
    provider: "kilo",
    model: "minimax/minimax-m2.7",
    baseUrl: "",
  },
];

export default DEFAULT_MODELS;
