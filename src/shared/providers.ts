export interface ProviderApiKeyField {
  key: string;
  labelKey: string;
  hintKey: string;
}

export interface ProviderRegistryEntry {
  id: string;
  nameKey: string;
  descKey?: string;
  tagKey?: string;
  url?: string;
  placeholder?: string;
  configProvider?: string;
  baseUrl?: string;
  needsKey?: boolean;
  showInSetup: boolean;
  showInOptions?: boolean;
  isLocal?: boolean;
  urlPattern?: RegExp;
  apiKeys: ProviderApiKeyField[];
}

export const PROVIDERS_REGISTRY: ProviderRegistryEntry[] = [
  // ── Setup + Options providers ─────────────────────────
  {
    id: "openrouter",
    nameKey: "constants.openrouterName",
    descKey: "constants.openrouterDesc",
    tagKey: "constants.openrouterTag",
    url: "https://openrouter.ai/keys",
    placeholder: "sk-or-v1-...",
    configProvider: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    needsKey: true,
    showInSetup: true,
    urlPattern: /openrouter\.ai/i,
    apiKeys: [
      {
        key: "OPENROUTER_API_KEY",
        labelKey: "constants.openrouterApiKey",
        hintKey: "constants.openrouterHint",
      },
    ],
  },
  {
    id: "anthropic",
    nameKey: "constants.anthropicName",
    descKey: "constants.anthropicDesc",
    url: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
    configProvider: "anthropic",
    needsKey: true,
    showInSetup: true,
    urlPattern: /anthropic\.com/i,
    apiKeys: [
      {
        key: "ANTHROPIC_API_KEY",
        labelKey: "constants.anthropicApiKey",
        hintKey: "constants.anthropicHint",
      },
    ],
  },
  {
    id: "openai",
    nameKey: "constants.openaiName",
    descKey: "constants.openaiDesc",
    url: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
    configProvider: "openai",
    needsKey: true,
    showInSetup: true,
    urlPattern: /openai\.com/i,
    apiKeys: [
      {
        key: "OPENAI_API_KEY",
        labelKey: "constants.openaiApiKey",
        hintKey: "constants.openaiHint",
      },
    ],
  },
  {
    id: "google",
    nameKey: "constants.googleName",
    descKey: "constants.googleDesc",
    url: "https://aistudio.google.com/app/apikey",
    placeholder: "AIza...",
    configProvider: "google",
    needsKey: true,
    showInSetup: true,
    apiKeys: [
      {
        key: "GOOGLE_API_KEY",
        labelKey: "constants.googleApiKey",
        hintKey: "constants.googleHint",
      },
    ],
  },
  {
    id: "xai",
    nameKey: "constants.xaiName",
    descKey: "constants.xaiDesc",
    url: "https://console.x.ai",
    placeholder: "xai-...",
    configProvider: "xai",
    needsKey: true,
    showInSetup: true,
    apiKeys: [
      {
        key: "XAI_API_KEY",
        labelKey: "constants.xaiApiKey",
        hintKey: "constants.xaiHint",
      },
    ],
  },
  {
    id: "kilo",
    nameKey: "constants.kiloName",
    descKey: "constants.kiloDesc",
    url: "https://kilo.ai/settings/api",
    placeholder: "kilo-...",
    configProvider: "kilo",
    needsKey: true,
    showInSetup: true,
    urlPattern: /kilo\.ai/i,
    apiKeys: [
      {
        key: "KILO_API_KEY",
        labelKey: "constants.kiloApiKey",
        hintKey: "constants.kiloHint",
      },
    ],
  },
  {
    id: "nous",
    nameKey: "constants.nousName",
    descKey: "constants.nousDesc",
    tagKey: "constants.nousTag",
    configProvider: "nous",
    needsKey: false,
    showInSetup: true,
    apiKeys: [],
  },
  {
    id: "local",
    nameKey: "constants.localName",
    descKey: "constants.localDesc",
    tagKey: "constants.localTag",
    configProvider: "custom",
    baseUrl: "http://localhost:1234/v1",
    needsKey: false,
    showInSetup: true,
    showInOptions: false,
    apiKeys: [],
  },

  // ── Options-only providers ────────────────────────────
  {
    id: "qwen",
    nameKey: "Qwen",
    configProvider: "qwen",
    showInSetup: false,
    apiKeys: [],
  },
  {
    id: "minimax",
    nameKey: "MiniMax",
    configProvider: "minimax",
    needsKey: true,
    showInSetup: false,
    apiKeys: [
      {
        key: "MINIMAX_API_KEY",
        labelKey: "constants.minimaxApiKey",
        hintKey: "constants.minimaxHint",
      },
      {
        key: "MINIMAX_CN_API_KEY",
        labelKey: "constants.minimaxCnApiKey",
        hintKey: "constants.minimaxCnHint",
      },
    ],
  },
  {
    id: "custom",
    nameKey: "Local / Custom",
    configProvider: "custom",
    showInSetup: false,
    showInOptions: true,
    apiKeys: [],
  },

  // ── API-key-only providers (from SETTINGS_SECTIONS) ───
  {
    id: "groq",
    nameKey: "Groq",
    url: "https://console.groq.com/keys",
    placeholder: "gsk-...",
    configProvider: "groq",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    apiKeys: [
      {
        key: "GROQ_API_KEY",
        labelKey: "constants.groqApiKey",
        hintKey: "constants.groqHint",
      },
    ],
  },
  {
    id: "glm",
    nameKey: "z.ai / GLM",
    configProvider: "glm",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    apiKeys: [
      {
        key: "GLM_API_KEY",
        labelKey: "constants.glmApiKey",
        hintKey: "constants.glmHint",
      },
    ],
  },
  {
    id: "kimi",
    nameKey: "Kimi / Moonshot",
    configProvider: "kimi",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    apiKeys: [
      {
        key: "KIMI_API_KEY",
        labelKey: "constants.kimiApiKey",
        hintKey: "constants.kimiHint",
      },
    ],
  },
  {
    id: "opencode_zen",
    nameKey: "OpenCode Zen",
    configProvider: "opencode_zen",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    apiKeys: [
      {
        key: "OPENCODE_ZEN_API_KEY",
        labelKey: "constants.opencodeZenApiKey",
        hintKey: "constants.opencodeZenHint",
      },
    ],
  },
  {
    id: "opencode_go",
    nameKey: "OpenCode Go",
    configProvider: "opencode_go",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    apiKeys: [
      {
        key: "OPENCODE_GO_API_KEY",
        labelKey: "constants.opencodeGoApiKey",
        hintKey: "constants.opencodeGoHint",
      },
    ],
  },
  {
    id: "hf",
    nameKey: "Hugging Face",
    url: "https://huggingface.co/settings/tokens",
    placeholder: "hf_...",
    configProvider: "hf",
    needsKey: true,
    showInSetup: false,
    showInOptions: false,
    urlPattern: /huggingface\.co/i,
    apiKeys: [
      {
        key: "HF_TOKEN",
        labelKey: "constants.hfToken",
        hintKey: "constants.hfHint",
      },
    ],
  },
];

export const LOCAL_PRESET_IDS = [
  "custom",
  "lmstudio",
  "ollama",
  "vllm",
  "llamacpp",
];

export function getKnownApiKeys(): string[] {
  const keys = new Set<string>();
  for (const provider of PROVIDERS_REGISTRY) {
    for (const apiKey of provider.apiKeys) {
      keys.add(apiKey.key);
    }
  }
  return Array.from(keys);
}

export function getUrlKeyMap(): Array<{ pattern: RegExp; envKey: string }> {
  const map: Array<{ pattern: RegExp; envKey: string }> = [];
  for (const provider of PROVIDERS_REGISTRY) {
    if (provider.urlPattern && provider.apiKeys.length > 0) {
      map.push({
        pattern: provider.urlPattern,
        envKey: provider.apiKeys[0].key,
      });
    }
  }
  return map;
}

export function getLocalProviderIds(): string[] {
  return LOCAL_PRESET_IDS;
}

export function getProviderById(id: string): ProviderRegistryEntry | undefined {
  return PROVIDERS_REGISTRY.find((p) => p.id === id);
}
