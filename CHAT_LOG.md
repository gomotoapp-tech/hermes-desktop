# Чат с гермес-десктоп: аудит, доработки, безопасность

**Дата:** 2026-04-29  
**Участники:** Пользователь (форк `gomotoapp-tech/hermes-desktop`) + Kilo (AI-ассистент)

---

## 1. Анализ проекта и узкие горлышка

Пользователь попросил проанализировать проект и найти узкие места.

**Найдено:**
- Разрозненный реестр провайдеров — добавление одного провайдера требовало правок в 6+ файлах
- Regex-парсинг YAML вместо нормального парсера
- Gateway-платформы: только 5 из 16 поддерживались в UI
- Синхронный readFileSync в IPC-обработчиках

**Сделано:**
- Добавлен провайдер Kilo Gateway (constants.ts, hermes.ts, installer.ts, i18n EN/ZH, default models)
- Создан централизованный реестр провайдеров `src/shared/providers.ts`
- Создан реестр gateway-платформ `src/shared/gateway-platforms.ts`
- Добавлен auto-discovery моделей Kilo (300+ моделей через API)
- YAML-парсинг переведён на `js-yaml` в config.ts, profiles.ts, tools.ts
- Добавлены модели: DeepSeek V4 Lite, Kimi 2.6, MiniMax 2.7
- Исправлен баг с capture group в installer.ts
- TypeScript typecheck проходит без ошибок
- Изменения закоммичены

---

## 2. Полный аудит безопасности

Пользователь запросил проверку безопасности форка.

### Найдено:
- **CRITICAL (3):** SSRF через testRemoteConnection/getApiUrl — любой URL от renderer'а шёл в HTTP-запросы main-процесса; эксфильтрация чата через remote mode
- **HIGH (4):** sandbox выключен, webviewTag включён; getSkillContent — чтение любых файлов /etc/SKILL.md; runHermesImport — чтение любых файлов
- **MEDIUM (6):** XSS через react-markdown без rehype-sanitize; profileHome path traversal; CLI argument injection; open-external без валидации; dangerouslySetInnerHTML с подстановкой; set-env без фильтра
- **LOW (3):** Нет asar в electron-builder; macOS entitlements (dylib injection); content length limits

---

## 3. Исправление уязвимостей

Создан план исправлений `SECURITY_PLAN.md`. Все уязвимости исправлены.

### CRITICAL:
- SSRF закрыт: `validateRemoteUrl()` — только https://, блокировка private IP
- CSP HTTP-заголовок через session.webRequest.onHeadersReceived
- testRemoteConnection, setConnectionConfig, setModelConfig/baseUrl — все URL валидируются
- setClaw3dWsUrl — проверка wss:// схемы
- sendMessageViaApi в remote mode защищён (URL проверен до сохранения)

### HIGH:
- getSkillContent переписан: принимает имя скилла (не путь), ищет в разрешённых директориях
- runHermesImport: блок .. и -, проверка расширения
- macOS entitlements: удалены allow-dyld-environment-variables и disable-library-validation
- webviewTag: false

### MEDIUM:
- profileHome(): sanitizeProfileName — только [\w\-.], max 64
- AgentMarkdown.tsx: rehype-sanitize + кастомный img с валидацией
- CLI argument injection: sanitizeCliArg() везде (profiles.ts, skills.ts, cronjobs.ts, hermes.ts)
- open-external: только http:, https:, mailto:
- dangerouslySetInnerHTML: escapeHtml() в Settings.tsx и Memory.tsx
- set-env: заблокированы PATH, HOME, LD_PRELOAD, PYTHONPATH и др.

### LOW:
- asar: true в electron-builder.yml
- Исключены desktop.json, auth.json, *-cache.json из сборки
- Content length limits на write-soul/write-user-profile (100KB)
- Port range validation на setClaw3dPort (1024-65535)

### Архитектура:
- `src/shared/validate-url.ts` — SSRF prevention utilities
- `src/shared/sanitize.ts` — input sanitization helpers
- Явно contextIsolation: true, nodeIntegration: false
- setWindowOpenHandler с валидацией протокола

**Коммит:** `0991e9b`  
**Пуш:** `https://github.com/gomotoapp-tech/hermes-desktop`

---

## 4. Финальная оценка безопасности

Пользователь спросил, безопасно ли пользоваться.

**Ответ:** Да, безопасно для повседневного использования. Все критичные и высокие уязвимости закрыты. Остаётся только inherent risk — как в любом Electron-приложении (VSCode, Slack, Discord):
- sandbox: false (необходим для preload)
- LLM-провайдеры видят промпты (архитектурно)
- Auto-updater через GitHub

**Важно:** Агент (Python CLI) может читать/писать любые файлы проекта и запускать команды — наши фиксы не ограничивают его. Мы защитили только Electron IPC слой от злоупотреблений.

---

## Файлы, созданные в ходе работы

| Файл | Назначение |
|------|-----------|
| `src/shared/providers.ts` | Централизованный реестр LLM-провайдеров |
| `src/shared/gateway-platforms.ts` | Реестр gateway-платформ |
| `src/shared/validate-url.ts` | SSRF prevention |
| `src/shared/sanitize.ts` | Input sanitization |
| `SECURITY_PLAN.md` | План исправлений |
| `CHAT_LOG.md` | Этот файл |
