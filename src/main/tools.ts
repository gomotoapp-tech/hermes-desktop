import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { load } from "js-yaml";
import { profileHome, safeWriteFile } from "./utils";
import { t } from "../shared/i18n";
import { getAppLocale } from "./locale";

export interface ToolsetInfo {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const TOOLSET_DEFS: {
  key: string;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    key: "web",
    labelKey: "tools.web.label",
    descriptionKey: "tools.web.description",
  },
  {
    key: "browser",
    labelKey: "tools.browser.label",
    descriptionKey: "tools.browser.description",
  },
  {
    key: "terminal",
    labelKey: "tools.terminal.label",
    descriptionKey: "tools.terminal.description",
  },
  {
    key: "file",
    labelKey: "tools.file.label",
    descriptionKey: "tools.file.description",
  },
  {
    key: "code_execution",
    labelKey: "tools.code_execution.label",
    descriptionKey: "tools.code_execution.description",
  },
  {
    key: "vision",
    labelKey: "tools.vision.label",
    descriptionKey: "tools.vision.description",
  },
  {
    key: "image_gen",
    labelKey: "tools.image_gen.label",
    descriptionKey: "tools.image_gen.description",
  },
  {
    key: "tts",
    labelKey: "tools.tts.label",
    descriptionKey: "tools.tts.description",
  },
  {
    key: "skills",
    labelKey: "tools.skills.label",
    descriptionKey: "tools.skills.description",
  },
  {
    key: "memory",
    labelKey: "tools.memory.label",
    descriptionKey: "tools.memory.description",
  },
  {
    key: "session_search",
    labelKey: "tools.session_search.label",
    descriptionKey: "tools.session_search.description",
  },
  {
    key: "clarify",
    labelKey: "tools.clarify.label",
    descriptionKey: "tools.clarify.description",
  },
  {
    key: "delegation",
    labelKey: "tools.delegation.label",
    descriptionKey: "tools.delegation.description",
  },
  {
    key: "cronjob",
    labelKey: "tools.cronjob.label",
    descriptionKey: "tools.cronjob.description",
  },
  {
    key: "moa",
    labelKey: "tools.moa.label",
    descriptionKey: "tools.moa.description",
  },
  {
    key: "todo",
    labelKey: "tools.todo.label",
    descriptionKey: "tools.todo.description",
  },
];

function localizeToolDefs(
  enabled: boolean | ((key: string) => boolean),
): ToolsetInfo[] {
  const locale = getAppLocale();
  return TOOLSET_DEFS.map((toolDef) => ({
    key: toolDef.key,
    label: t(toolDef.labelKey, locale),
    description: t(toolDef.descriptionKey, locale),
    enabled: typeof enabled === "function" ? enabled(toolDef.key) : enabled,
  }));
}

function parseEnabledToolsets(configContent: string): Set<string> {
  try {
    const doc = load(configContent) as Record<string, unknown> | null;
    const pts = doc?.platform_toolsets as Record<string, unknown> | undefined;
    const cli = pts?.cli as string[] | undefined;
    return new Set(cli || []);
  } catch {
    return new Set();
  }
}

export function getToolsets(profile?: string): ToolsetInfo[] {
  const configFile = join(profileHome(profile), "config.yaml");

  // If no config, assume all toolsets are enabled (hermes default behavior)
  if (!existsSync(configFile)) {
    return localizeToolDefs(true);
  }

  try {
    const content = readFileSync(configFile, "utf-8");
    const enabledSet = parseEnabledToolsets(content);

    // If no platform_toolsets.cli section exists, all are enabled by default
    if (enabledSet.size === 0 && !content.includes("platform_toolsets")) {
      return localizeToolDefs(true);
    }

    return localizeToolDefs((key) => enabledSet.has(key));
  } catch {
    return localizeToolDefs(true);
  }
}

export function setToolsetEnabled(
  key: string,
  enabled: boolean,
  profile?: string,
): boolean {
  const configFile = join(profileHome(profile), "config.yaml");
  if (!existsSync(configFile)) return false;

  try {
    const content = readFileSync(configFile, "utf-8");
    const currentEnabled = parseEnabledToolsets(content);

    if (enabled) {
      currentEnabled.add(key);
    } else {
      currentEnabled.delete(key);
    }

    // Rebuild the platform_toolsets.cli section
    const toolsetLines = Array.from(currentEnabled)
      .sort()
      .map((t) => `      - ${t}`)
      .join("\n");

    const newSection = `  cli:\n${toolsetLines}`;

    // Check if platform_toolsets section exists
    if (content.includes("platform_toolsets")) {
      // Replace existing cli section within platform_toolsets
      const lines = content.split("\n");
      const result: string[] = [];
      let inPlatformToolsets = false;
      let inCli = false;
      let cliInserted = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimEnd();

        if (/^\s*platform_toolsets\s*:/.test(trimmed)) {
          inPlatformToolsets = true;
          result.push(line);
          continue;
        }

        if (inPlatformToolsets && /^\s+cli\s*:/.test(trimmed)) {
          inCli = true;
          // Output the new cli section
          result.push(newSection);
          cliInserted = true;
          continue;
        }

        if (inCli) {
          // Skip old list items
          if (/^\s+-\s/.test(trimmed)) continue;
          // End of cli section
          if (
            /^\s{4}\S/.test(trimmed) ||
            /^\S/.test(trimmed) ||
            trimmed === ""
          ) {
            inCli = false;
            if (
              trimmed === "" &&
              i + 1 < lines.length &&
              /^\S/.test(lines[i + 1].trimEnd())
            ) {
              result.push(line);
              continue;
            }
            result.push(line);
            continue;
          }
          continue;
        }

        if (inPlatformToolsets && /^\S/.test(trimmed) && trimmed !== "") {
          inPlatformToolsets = false;
          if (!cliInserted) {
            result.push(newSection);
            cliInserted = true;
          }
        }

        result.push(line);
      }

      safeWriteFile(configFile, result.join("\n"));
    } else {
      // Append platform_toolsets section at end
      const newContent =
        content.trimEnd() + "\n\nplatform_toolsets:\n" + newSection + "\n";
      safeWriteFile(configFile, newContent);
    }

    return true;
  } catch {
    return false;
  }
}
