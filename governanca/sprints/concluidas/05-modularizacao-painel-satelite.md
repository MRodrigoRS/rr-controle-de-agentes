---
status: concluida
ultima_modificacao: 2026-10-06
sessao_atual: 1
---

# Sprint 05: Modularização e Build Pipeline do Painel Satélite — rr-controle-de-agentes-1.1

**Objetivo:** Decompor o monólito de 1.433 linhas de `ui.mjs` em módulos limpos e especializados (`src/satelite-ui/`: servidor, template HTML, CSS puro e JavaScript do cliente), criando um script de bundling determinístico que gera o artefato único autocontido para distribuição aos satélites e integrando a validação ao pipeline de testes e build.

---

## Etapas

### Etapa 1: Decomposição dos Fontes em `src/satelite-ui/`
**Objetivo:** Separar as responsabilidades do painel satélite em arquivos modulares com syntax highlight nativo e fácil manutenção.
**Tarefas:**
- [x] Criar a pasta `src/satelite-ui/` e suas subpastas:
  - `src/satelite-ui/views/estilos.css`: estilos CSS do painel (variáveis dark mode, layout, badges, tabs, modais, terminal).
  - `src/satelite-ui/views/template.html`: casca HTML semântica com placeholders de injeção (`/* INJECT_STYLES */`, `/* INJECT_SCRIPT */`).
  - `src/satelite-ui/client/app.js`: lógica cliente SPA em Vanilla JS puro (estado, abas, renderizadores de arquivos, métricas, modais e chamadas de API).
  - `src/satelite-ui/server/servidor.mjs`: lógica do servidor HTTP nativo Node.js (filesystem, git metadata, rotas `/api/info`, `/api/arquivo`, `/api/sincronizar`, `/api/regenerar`, `/api/harness`, `/api/abrir-editor`).
**Critérios de Aceite:**
- [x] Fontes 100% desacoplados e legíveis em seus formatos nativos.

### Etapa 2: Script de Bundling Determinístico (`build-satelite-ui.ts`)
**Objetivo:** Gerar o bundle autocontido de 1 arquivo para o satélite rodar sem nenhuma dependência.
**Tarefas:**
- [x] Criar `src/scripts/build-satelite-ui.ts`:
  - Ler `template.html`, injetar `estilos.css` e `app.js`.
  - Injetar o HTML empacotado dentro do servidor em `servidor.mjs`.
  - Escrever o arquivo compilado em `governanca/scripts/ui.mjs` e em `src/templates/scripts/ui.mjs`.
  - Adicionar cabeçalho de aviso: *"Arquivo gerado automaticamente a partir de src/satelite-ui/. Não edite diretamente."*
**Critérios de Aceite:**
- [x] Execução de `tsx src/scripts/build-satelite-ui.ts` gera bundles idênticos e funcionais em `governanca/scripts/ui.mjs` e `src/templates/scripts/ui.mjs`.

### Etapa 3: Integração no Pipeline e Testes Automatizados
**Objetivo:** Garantir que o bundle esteja sempre sincronizado com os fontes e nunca desatualizado.
**Tarefas:**
- [x] Adicionar script `"build:ui": "tsx src/scripts/build-satelite-ui.ts"` em `package.json`.
- [x] Integrar o build do painel satélite ao `npm run build` do Next.js.
- [x] Adicionar asserção em `src/scripts/validar-templates.ts` (`npm test`) que compila os fontes e compara com o arquivo salvo em disco, alertando caso haja divergência.
**Critérios de Aceite:**
- [x] `npm test` valida paridade entre fontes e bundle compilado.

### Etapa 4: Validação Funcional e Não-Regressão
**Objetivo:** Comprovar que o bundle compilado mantém 100% das funcionalidades do painel.
**Tarefas:**
- [x] Executar o bundle gerado via `node governanca/scripts/ui.mjs --check` para validar leitura de métricas e governança.
- [x] Validar servidor HTTP nativo e endpoints de API.
- [x] Rodar scanner de segredos `node governanca/scripts/verificar-segredos.mjs --all`.
**Critérios de Aceite:**
- [x] Testes de prontidão aprovados com regressão zero.

### Etapa 5: Reconciliação da Documentação e Changelog
**Objetivo:** Atualizar os registros de arquitetura e histórico de versões com a nova infraestrutura modular.
**Tarefas:**
- [x] Atualizar `governanca/livro-arquitetura/01-visao-geral.md` e `04-comportamento-autonomo.md` documentando a arquitetura modular de `src/satelite-ui/`.
- [x] Atualizar `CHANGELOG.md` da raiz e `governanca/CHANGELOG.md` com os deltas da Sprint 05.
- [x] Atualizar `governanca/SESSAO.md`.
**Critérios de Aceite:**
- [x] Documentação 100% reconciliada e pronta para o Gate 2.

---

## Andamento

- [x] Etapa 1: Decomposição dos Fontes em `src/satelite-ui/` concluída
- [x] Etapa 2: Script de Bundling Determinístico concluída
- [x] Etapa 3: Integração no Pipeline e Testes Automatizados concluída
- [x] Etapa 4: Validação Funcional e Não-Regressão concluída
- [x] Etapa 5: Reconciliação da Documentação e Changelog concluída

---

## Instruções ao Agente

1. **Gate 1:** Plano aprovado pelo usuário.
2. Manter zero dependências no satélite (o bundle final continua sendo Vanilla JS + Node nativo).
3. Garantir idempotência e testes determinísticos.
4. **Gate 2:** Apresentar evidências antes do commit final.

---

## Evidências

- [x] Fontes modulares criados em `src/satelite-ui/`: `estilos.css` (8 KB), `template.html` (7.7 KB), `app.js` (17.4 KB) e `servidor.mjs` (19.8 KB).
- [x] Script de bundling `src/scripts/build-satelite-ui.ts` operacional.
- [x] Bundle compilado com sucesso em `governanca/scripts/ui.mjs` e `src/templates/scripts/ui.mjs`.
- [x] Validação de paridade estrita integrada ao `npm test` (`validarParidadeSateliteUi`).
- [x] `npm test`, `npm run build` e scanner de segredos 100% verdes.
- [x] `node governanca/scripts/ui.mjs --check` e `node src/templates/scripts/ui.mjs --check` executados com sucesso total.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
