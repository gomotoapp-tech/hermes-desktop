// ── Shared Types ────────────────────────────────────────

export interface FieldDef {
  key: string;
  label: string;
  type: string;
  hint: string;
}

export interface SectionDef {
  title: string;
  items: FieldDef[];
}

// ── Providers ───────────────────────────────────────────

import { PROVIDERS_REGISTRY, LOCAL_PRESET_IDS } from "../../shared/providers";

export { LOCAL_PRESET_IDS };

export const PROVIDERS = {
  options: [
    { value: "auto", label: "constants.autoDetect" },
    ...PROVIDERS_REGISTRY.filter((p) => p.showInOptions !== false).map((p) => ({
      value: p.id,
      label: p.nameKey,
    })),
  ],

  labels: {
    ...Object.fromEntries(
      PROVIDERS_REGISTRY.filter((p) => p.showInOptions !== false).map((p) => [
        p.id,
        p.nameKey,
      ]),
    ),
    custom: "Custom",
  } as Record<string, string>,

  setup: PROVIDERS_REGISTRY.filter((p) => p.showInSetup).map((p) => ({
    id: p.id,
    name: p.nameKey,
    desc: p.descKey || "",
    tag: p.tagKey || "",
    envKey: p.apiKeys[0]?.key || "",
    url: p.url || "",
    placeholder: p.placeholder || "",
    configProvider: p.configProvider || p.id,
    baseUrl: p.baseUrl || "",
    needsKey: p.needsKey ?? true,
  })),
};

export const LOCAL_PRESETS = [
  { id: "lmstudio", name: "constants.lmstudio", port: "1234" },
  { id: "ollama", name: "constants.ollama", port: "11434" },
  { id: "vllm", name: "constants.vllm", port: "8000" },
  { id: "llamacpp", name: "constants.llamacpp", port: "8080" },
];

// ── Theme ───────────────────────────────────────────────

export const THEME_OPTIONS = [
  { value: "system" as const, label: "constants.themeSystem" },
  { value: "light" as const, label: "constants.themeLight" },
  { value: "dark" as const, label: "constants.themeDark" },
];

export const THEME_STORAGE_KEY = "hermes-theme";

// ── Settings API Key Sections ───────────────────────────

const llmProviderItems: FieldDef[] = PROVIDERS_REGISTRY.flatMap((p) =>
  p.apiKeys.map((k) => ({
    key: k.key,
    label: k.labelKey,
    type: "password",
    hint: k.hintKey,
  })),
);

export const SETTINGS_SECTIONS: SectionDef[] = [
  {
    title: "constants.sectionLlmProviders",
    items: llmProviderItems,
  },
  {
    title: "constants.sectionToolApiKeys",
    items: [
      {
        key: "EXA_API_KEY",
        label: "constants.exaApiKey",
        type: "password",
        hint: "constants.exaHint",
      },
      {
        key: "PARALLEL_API_KEY",
        label: "constants.parallelApiKey",
        type: "password",
        hint: "constants.parallelHint",
      },
      {
        key: "TAVILY_API_KEY",
        label: "constants.tavilyApiKey",
        type: "password",
        hint: "constants.tavilyHint",
      },
      {
        key: "FIRECRAWL_API_KEY",
        label: "constants.firecrawlApiKey",
        type: "password",
        hint: "constants.firecrawlHint",
      },
      {
        key: "FAL_KEY",
        label: "constants.falKey",
        type: "password",
        hint: "constants.falHint",
      },
      {
        key: "HONCHO_API_KEY",
        label: "constants.honchoApiKey",
        type: "password",
        hint: "constants.honchoHint",
      },
    ],
  },
  {
    title: "constants.sectionBrowserAutomation",
    items: [
      {
        key: "BROWSERBASE_API_KEY",
        label: "constants.browserbaseApiKey",
        type: "password",
        hint: "constants.browserbaseHint",
      },
      {
        key: "BROWSERBASE_PROJECT_ID",
        label: "constants.browserbaseProjectId",
        type: "text",
        hint: "constants.browserbaseProjectHint",
      },
    ],
  },
  {
    title: "constants.sectionVoiceStt",
    items: [
      {
        key: "VOICE_TOOLS_OPENAI_KEY",
        label: "constants.voiceOpenaiKey",
        type: "password",
        hint: "constants.voiceOpenaiHint",
      },
    ],
  },
  {
    title: "constants.sectionResearchTraining",
    items: [
      {
        key: "TINKER_API_KEY",
        label: "constants.tinkerApiKey",
        type: "password",
        hint: "constants.tinkerHint",
      },
      {
        key: "WANDB_API_KEY",
        label: "constants.wandbKey",
        type: "password",
        hint: "constants.wandbHint",
      },
    ],
  },
];

// ── Gateway Sections ────────────────────────────────────

export const GATEWAY_SECTIONS: SectionDef[] = [
  {
    title: "constants.gatewayMessagingPlatforms",
    items: [
      {
        key: "TELEGRAM_BOT_TOKEN",
        label: "constants.telegramBotToken",
        type: "password",
        hint: "constants.telegramBotHint",
      },
      {
        key: "TELEGRAM_ALLOWED_USERS",
        label: "constants.telegramAllowedUsers",
        type: "text",
        hint: "constants.telegramUsersHint",
      },
      {
        key: "DISCORD_BOT_TOKEN",
        label: "constants.discordBotToken",
        type: "password",
        hint: "constants.discordBotHint",
      },
      {
        key: "DISCORD_ALLOWED_CHANNELS",
        label: "constants.discordAllowedChannels",
        type: "text",
        hint: "constants.discordChannelsHint",
      },
      {
        key: "SLACK_BOT_TOKEN",
        label: "constants.slackBotToken",
        type: "password",
        hint: "constants.slackBotHint",
      },
      {
        key: "SLACK_APP_TOKEN",
        label: "constants.slackAppToken",
        type: "password",
        hint: "constants.slackAppHint",
      },
      {
        key: "WHATSAPP_API_URL",
        label: "constants.whatsappApiUrl",
        type: "text",
        hint: "constants.whatsappUrlHint",
      },
      {
        key: "WHATSAPP_API_TOKEN",
        label: "constants.whatsappApiToken",
        type: "password",
        hint: "constants.whatsappTokenHint",
      },
      {
        key: "SIGNAL_PHONE_NUMBER",
        label: "constants.signalPhoneNumber",
        type: "text",
        hint: "constants.signalPhoneHint",
      },
      {
        key: "MATRIX_HOMESERVER",
        label: "constants.matrixHomeserver",
        type: "text",
        hint: "constants.matrixHomeHint",
      },
      {
        key: "MATRIX_USER_ID",
        label: "constants.matrixUserId",
        type: "text",
        hint: "constants.matrixUserHint",
      },
      {
        key: "MATRIX_ACCESS_TOKEN",
        label: "constants.matrixAccessToken",
        type: "password",
        hint: "constants.matrixTokenHint",
      },
      {
        key: "MATTERMOST_URL",
        label: "constants.mattermostUrl",
        type: "text",
        hint: "constants.mattermostUrlHint",
      },
      {
        key: "MATTERMOST_TOKEN",
        label: "constants.mattermostToken",
        type: "password",
        hint: "constants.mattermostTokenHint",
      },
      {
        key: "EMAIL_IMAP_SERVER",
        label: "constants.emailImapServer",
        type: "text",
        hint: "constants.emailImapHint",
      },
      {
        key: "EMAIL_SMTP_SERVER",
        label: "constants.emailSmtpServer",
        type: "text",
        hint: "constants.emailSmtpHint",
      },
      {
        key: "EMAIL_ADDRESS",
        label: "constants.emailAddress",
        type: "text",
        hint: "constants.emailAddrHint",
      },
      {
        key: "EMAIL_PASSWORD",
        label: "constants.emailPassword",
        type: "password",
        hint: "constants.emailPassHint",
      },
      {
        key: "SMS_PROVIDER",
        label: "constants.smsProvider",
        type: "text",
        hint: "constants.smsProviderHint",
      },
      {
        key: "TWILIO_ACCOUNT_SID",
        label: "constants.twilioAccountSid",
        type: "text",
        hint: "constants.twilioSidHint",
      },
      {
        key: "TWILIO_AUTH_TOKEN",
        label: "constants.twilioAuthToken",
        type: "password",
        hint: "constants.twilioTokenHint",
      },
      {
        key: "TWILIO_PHONE_NUMBER",
        label: "constants.twilioPhoneNumber",
        type: "text",
        hint: "constants.twilioPhoneHint",
      },
      {
        key: "BLUEBUBBLES_URL",
        label: "constants.bluebubblesUrl",
        type: "text",
        hint: "constants.bluebubblesUrlHint",
      },
      {
        key: "BLUEBUBBLES_PASSWORD",
        label: "constants.bluebubblesPassword",
        type: "password",
        hint: "constants.bluebubblesPassHint",
      },
      {
        key: "DINGTALK_APP_KEY",
        label: "constants.dingtalkAppKey",
        type: "password",
        hint: "constants.dingtalkKeyHint",
      },
      {
        key: "DINGTALK_APP_SECRET",
        label: "constants.dingtalkAppSecret",
        type: "password",
        hint: "constants.dingtalkSecretHint",
      },
      {
        key: "FEISHU_APP_ID",
        label: "constants.feishuAppId",
        type: "text",
        hint: "constants.feishuIdHint",
      },
      {
        key: "FEISHU_APP_SECRET",
        label: "constants.feishuAppSecret",
        type: "password",
        hint: "constants.feishuSecretHint",
      },
      {
        key: "WECOM_CORP_ID",
        label: "constants.wecomCorpId",
        type: "text",
        hint: "constants.wecomCorpHint",
      },
      {
        key: "WECOM_AGENT_ID",
        label: "constants.wecomAgentId",
        type: "text",
        hint: "constants.wecomAgentHint",
      },
      {
        key: "WECOM_SECRET",
        label: "constants.wecomSecret",
        type: "password",
        hint: "constants.wecomSecretHint",
      },
      {
        key: "WEIXIN_BOT_TOKEN",
        label: "constants.weixinBotToken",
        type: "password",
        hint: "constants.weixinTokenHint",
      },
      {
        key: "WEBHOOK_SECRET",
        label: "constants.webhookSecret",
        type: "password",
        hint: "constants.webhookHint",
      },
      {
        key: "HA_URL",
        label: "constants.haUrl",
        type: "text",
        hint: "constants.haUrlHint",
      },
      {
        key: "HA_TOKEN",
        label: "constants.haToken",
        type: "password",
        hint: "constants.haTokenHint",
      },
    ],
  },
];


// ── Install ─────────────────────────────────────────────

export const INSTALL_CMD =
  "curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash";

// Helper to resolve i18n key or return as-is
export function tk(t: (key: string) => string, value: string): string {
  if (value.startsWith("constants.")) {
    return t(value);
  }
  return value;
}
