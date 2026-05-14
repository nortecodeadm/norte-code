# Norte Code — Setup e Workflow de Desenvolvimento

**Documento permanente.** Atualizado quando o workflow mudar.
**Propósito:** Registrar como o Gui roda o projeto na máquina local, qual app instalar no celular, quando usar cada tipo de build, e como qualquer IA (Manus, Claude Code, futuros substitutos) deve operar.

---

## 1. Ambiente do Gui

**Sistema operacional:** Windows
**Repositório:** `https://github.com/nortecodeadm/norte-code` (clonado em pasta local)
**Conta Expo:** `norte.code.adm`
**Ferramentas instaladas:**
- Node.js 24
- JDK 17
- Android Studio + SDK API 34
- `ANDROID_HOME` configurado
- Git CLI

**Celular de teste:** Samsung S928B com depuração USB ativada.

---

## 2. Os dois tipos de build (entender antes de fazer qualquer coisa)

O Norte Code usa **dois tipos diferentes de instalação no celular**, com finalidades distintas:

### 2.1. Dev Build (development client)

- App instalado no celular que **se conecta ao Metro Bundler** rodando no computador
- Quando o Gui muda código, **Fast Refresh** atualiza o app em segundos via Wi-Fi
- **Não funciona sem o `expo start` rodando** (precisa do servidor pra puxar o JS atualizado)
- Maior em tamanho (tem libs de debug)
- Performance menor que a final
- **Pra quem usa:** desenvolvedor (Gui durante implementação e teste de níveis)

### 2.2. APK Release

- App **completo e autônomo** — JavaScript embutido no APK
- Não precisa de `expo start` nem do computador rodando
- Não atualiza sozinho — se mudou código, precisa gerar APK novo
- Otimizado, tamanho menor
- Performance final (igual ao que o usuário final teria)
- **Pra quem usa:** Benjamin testar como "produto", esposa testar, demo pra quem for, validação final antes de release público

**Regra prática:** Gui desenvolve com dev build (rápido), gera APK release quando quer mostrar pra alguém ou jogar de verdade.

---

## 3. Como gerar o dev build (uma vez por instalação no celular)

Pré-requisito: ambiente Android instalado (já está, ver Seção 1).

**Passos:**

1. Celular conectado por **cabo USB** ao computador.
2. Depuração USB ativada (Configurações → Sobre o celular → Toca 7× em "Número da versão" → libera Opções de Desenvolvedor → ativa "Depuração USB").
3. No terminal, dentro da pasta do projeto:
   ```
   npx expo run:android
   ```
4. Espera 5-15 minutos (primeira execução compila tudo do zero; rebuilds são mais rápidos).
5. App é instalado automaticamente no celular e abre.

**Quando precisa rebuilder o dev build:**
- Adicionou ou removeu lib nativa (raro — geralmente só durante setup inicial)
- Atualizou versão do Expo SDK
- Mudou configuração nativa (`app.json` com permissões novas, etc.)

**Quando NÃO precisa rebuilder:**
- Mudou código React Native (componente, lógica, level config, etc.) → Fast Refresh resolve

---

## 4. Workflow diário de desenvolvimento

**Cenário típico:** Claude Code (ou outro Dev Temporário) entregou código de um novo nível. Gui quer testar.

1. **No computador**, dentro da pasta do projeto:
   ```
   git pull origin main
   npx expo start
   ```
   (`--clear` no fim se quiser limpar cache do bundler)

2. **No celular** (na mesma rede Wi-Fi):
   - Abre o app dev build instalado (`Norte Code` no menu de apps)
   - Se a primeira vez nessa sessão, ele pode pedir pra "escanear código" → escaneia o QR do terminal
   - Conecta no Metro Bundler

3. **Testa o que precisa testar**. Toda mudança no código que o Gui (ou IA) faz, o Fast Refresh atualiza em segundos.

4. **Quando precisa forçar reload completo** (Fast Refresh às vezes falha):
   - Chacoalha o celular → abre menu de dev → "Reload"
   - OU aperta `r` no terminal
   - OU aperta `m` no terminal pra abrir o menu de dev no celular

5. **Quando terminou o dia**: `Ctrl+C` no terminal pra parar o Metro Bundler. Fecha o dev build no celular.

---

## 5. Como gerar o APK release (quando quiser instalar como "produto")

**Pré-requisito:** mesma config do dev build.

### Opção A — Build local (Windows, mais rápido)

No terminal, dentro da pasta do projeto:
```
cd android
gradlew assembleRelease
```

Espera 3-10 minutos. APK fica em:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Pra transferir pro celular:**
- Email pra você mesmo + abrir no celular
- Google Drive
- Cabo USB (Windows reconhece o celular como pasta)
- Bluetooth

**Pra instalar:** abre o `.apk` no celular. Vai pedir permissão de "instalar de fontes desconhecidas" (autoriza).

### Opção B — EAS Cloud (mais lento, mas não usa seu PC)

```
eas build --profile preview --platform android
```

Tempo: 15-30 min. Roda nos servidores da Expo. Quando termina, te dá um link pra baixar o APK direto no celular.

**Quando preferir cada um:**
- Local: você está com pressa e seu PC pode aguentar o build
- EAS: você quer o PC livre pra fazer outra coisa, ou está com pouca bateria

---

## 6. Para o Dev Temporário ativo (Manus, Claude Code, ou outro)

Algumas notas operacionais:

### Sobre o ambiente do Gui
- Não assumir que ele tem ambiente macOS / Linux — é Windows. Comandos com `/` ou `gradlew` (sem `./`) podem precisar ajuste.
- Ele já tem todo o ambiente Android montado. Não precisa orientar setup zero.

### Sobre testes
- Você **não testa no celular** — esse é trabalho do Gui (Passo 7 do Protocolo).
- Você pode rodar `npx expo start` se quiser **validar que o bundler sobe sem erro** após sua mudança (Cenário A do Protocolo Dev Temporário). Mas isso é teste técnico, não validação de UX.
- TypeScript check (`npx tsc --noEmit`) é boa prática como sanity check antes de commitar.

### Sobre builds
- **Não gere APK release você** — é decisão do Gui quando ele quer mostrar pra alguém.
- **Não gere EAS builds automaticamente** — gasta crédito e tempo, e geralmente não é o que se quer.
- Se algo precisar de rebuild nativo (mudou `app.json`, adicionou lib nativa), **sinaliza no Relatório de Execução** que o Gui vai precisar rodar `npx expo run:android` de novo. Não tenta fazer você.

### Sobre o repo
- `git push origin main` é **ação irreversível**. Por padrão, **não pushe automaticamente** — deixa os commits no local e aguarda o Gui validar no celular antes de autorizar o push. Quando ele aprovar a entrega, aí sim pode pushar (ou ele pusha).
- Conventional Commits sempre.

---

## 7. Troubleshooting comum

### "No development build for this project is installed"
Aparece quando o dev build foi desinstalado mas o Metro Bundler tá rodando. **Solução:** gerar e instalar o dev build de novo (`npx expo run:android` com cabo USB, ver Seção 3).

### "No apps connected. Sending 'reload' to all React Native apps failed"
O Metro perdeu conexão com o celular. Pode ser Wi-Fi caiu, dev build crashou, ou celular foi pra background. **Solução:** abre o app no celular de novo, ou reinicia o `expo start` com `npx expo start --clear`.

### Fast Refresh atualiza mas mudança não aparece
Cache do bundler. **Solução:** `Ctrl+C` no terminal, depois `npx expo start --clear`.

### Build local trava em "Configure project"
Geralmente é cache do Gradle. **Solução:**
```
cd android
gradlew clean
cd ..
npx expo run:android
```

### Wi-Fi corporativo / firewall bloqueia conexão
Algumas redes bloqueiam comunicação entre dispositivos. **Solução:** `npx expo start --tunnel` (força conexão via servidor Expo, mais lento mas funciona em qualquer rede).

---

## 8. Estrutura de pastas relevante

```
norte-code/
├── android/                # Projeto Android nativo (gerado pelo Expo prebuild)
├── app/                    # Telas (Expo Router)
│   ├── world.tsx          # Tela Mundo (WORLD_LAYOUT calibrado aqui)
│   └── level/[id].tsx     # Tela de nível
├── assets/
│   ├── mundo/             # Assets do Mundo permanente (mundo_*.png)
│   ├── blocks/            # Ícones dos blocos
│   └── characters/        # Avatar, mascotes
├── components/             # Componentes React Native
│   └── level/             # Componentes específicos de nível (BlockPalette, etc.)
├── lib/
│   ├── levels/index.ts    # Configuração dos níveis
│   └── interpreter/       # Lógica de execução de programas
├── docs/
│   ├── ARCHITECTURE.md
│   ├── INTERPRETER.md
│   ├── LEVELS.md
│   ├── DECISIONS.md
│   └── internal/          # Briefings, protocolos, backlog (privado)
└── package.json
```

---

*Documento criado por Claude (Estrategista) — Maio/2026.*
*Reflete o setup do Gui em Maio/2026, com workflow estabilizado de dev build + Fast Refresh por Wi-Fi e APK release pra distribuição.*
