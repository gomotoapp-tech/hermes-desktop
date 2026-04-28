# Security Fix Plan

## Critical (Phase 1)

### 1. SSRF через remote URL
- Создать `src/shared/validate-url.ts` с `validateRemoteUrl(url)`:
  - Проверяет схему `https://` (или `http://localhost`)
  - Блокирует private/loopback IP
  - Проверяет DNS-резолв
- Применить в `testRemoteConnection()`, `setConnectionConfig()`, `setClaw3dWsUrl()`

### 2. setModelConfig / baseUrl — валидация
- Добавить проверку baseUrl в `setModelConfig`

### 3. Electron security
- Явно `contextIsolation: true`
- CSP через HTTP header (`session.webRequest.onHeadersReceived`)
- `will-navigate` / `setWindowOpenHandler` валидация
- `sandbox: false` остаётся (необходим для preload)

## High (Phase 2)

### 4. getSkillContent — path traversal
- Принимать имя скилла, а не путь
- Искать только в разрешённых директориях

### 5. runHermesImport — валидация пути
- `realpathSync`, проверка расширения, блокировка `..` и `-`

## Medium (Phase 3)

### 6. profileHome() — валидация имени профиля
- `sanitizeProfileName(name)`: только `[a-zA-Z0-9_-]`, max 64

### 7. XSS: rehype-sanitize
- `npm install rehype-sanitize`
- Добавить в AgentMarkdown.tsx

### 8. CLI argument injection
- `sanitizeCliArg()` в utils.ts, применить ко всем IPC

### 9. open-external — protocol whitelist
- Только `http:`, `https:`, `mailto:`

### 10. dangerouslySetInnerHTML
- Экранировать HTML-entities в интерполированных значениях

## Low (Phase 4)

### 11. electron-builder.yml — явный asar
- Добавить `asar: true`

### 12. macOS entitlements — документировать
