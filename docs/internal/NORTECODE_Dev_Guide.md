# Norte Code — Guia de Desenvolvimento Local

---

## 1. Ambiente (Windows 11)

**Máquina:** notebook do Gui (`C:\Users\guiid`)

| Ferramenta | Versão | Status |
|---|---|---|
| Node.js | 24.15.0 | ✅ instalado |
| Git | 2.x | ✅ instalado |
| JDK | 17 (Adoptium Temurin) | ✅ instalado |
| Android Studio + SDK | API Level 34 | ✅ instalado |
| Variáveis de ambiente | ANDROID_HOME + PATH | ✅ configuradas |

**ANDROID_HOME:** `C:\Users\guiid\AppData\Local\Android\Sdk`  
**PATH inclui:** `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\emulator`

**Repositório:** `C:\Users\guiid\norte-code`  
**Celular:** Android com Modo Desenvolvedor e USB Debugging ativos. Development build (`com.nortecode.app`) já instalado.

---

## 2. Stack e Versões

| Lib | Versão no projeto |
|---|---|
| Expo SDK | ~54.0.33 |
| React Native | 0.81.5 |
| expo-dev-client | ~6.0.21 ← crítico: deve ser 6.x, não 55.x |
| expo-router | ~6.0.23 |
| TypeScript | ~5.9.2 |

> Se o `expo-dev-client` estiver em v55+, o build quebra com erro de Kotlin no `expo-dev-menu`. Correção: `npx expo install --fix`.

---

## 3. Fluxo do Dia a Dia

### Iniciar

```bash
cd C:\Users\guiid\norte-code
npx expo start
```

Com o celular conectado via USB, pressione **`a`** no terminal. O app abre e conecta ao Metro. A partir daí, salvar qualquer arquivo `.ts` / `.tsx` atualiza o app automaticamente em 1–3 segundos (Fast Refresh).

### Atalhos do Metro

| Tecla | Ação |
|---|---|
| `a` | Abre no Android (USB) |
| `r` | Reload completo do app |
| `j` | Abre o debugger no browser |
| `m` | Toggle do menu de dev no celular |
| `Ctrl+C` | Encerra o Metro |

---

## 4. Rebuild vs. Reload

| Situação | O que fazer |
|---|---|
| Mudei arquivo `.ts` / `.tsx` / `.js` | Nada — Fast Refresh automático |
| UI travada ou estado estranho | `r` no terminal |
| Instalei lib com código nativo | `npx expo run:android` |
| Mudei `app.json` ou `app.config.ts` | `npx expo run:android` |
| Mudei variável no `.env` | `Ctrl+C` → `npx expo start` |
| App sumiu do celular | `npx expo run:android` |

---

## 5. Erros Comuns e Soluções

**`expo-dev-menu: 'onDidCreateReactActivityDelegateNotification' overrides nothing`**  
Incompatibilidade de versão do `expo-dev-client` (v55 com SDK 54).
```bash
npx expo install --fix
npx expo prebuild --clean
npx expo run:android
```

---

**`INSTALL_FAILED_UPDATE_INCOMPATIBLE: signatures do not match`**  
Já existe uma versão do app no celular com assinatura diferente.  
Desinstalar o app manualmente no celular → `npx expo run:android`.

---

**`No development build (com.nortecode.app) is installed`**  
App foi desinstalado do celular.
```bash
npx expo run:android
```

---

**`Gradle build failed`** (genérico, primeira tentativa)  
Timeout de download de dependências do Gradle.  
Rodar `npx expo run:android` novamente — o cache já existe e na segunda tentativa vai.

---

**App abre mas crasha imediatamente**  
Variável de ambiente faltando. Verificar o arquivo `.env` na raiz — usar `.env.example` como referência.

---

**Metro perdeu conexão com o celular**  
Pressionar `a` no terminal para reconectar. Se não funcionar: `Ctrl+C` → `npx expo start` → `a`.

---

## 6. Comandos de Referência Rápida

```bash
# Dev do dia a dia
npx expo start

# Rebuild completo (após instalar lib nativa ou mudança em app.config)
npx expo run:android

# Corrigir versões incompatíveis de libs
npx expo install --fix

# Regenerar pasta android/ do zero
npx expo prebuild --clean

# Verificar celular conectado
adb devices
```

---

*Atualizado em maio/2026.*
