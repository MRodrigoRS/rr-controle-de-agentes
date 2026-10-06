---
status: pendente
ultima_modificacao: 2026-10-06
sessao_atual: 0
---

# Sprint 03: Análise de Código Zero-Token, Higiene e Modernização do Catálogo — rr-controle-de-agentes-1.1

**Objetivo:** Integrar ferramentas de análise estática e higiene de alta alavancagem que rodam offline em sub-milissegundos e poupam milhares de tokens de IA (Knip, Biome), sanear a taxonomia do catálogo SQLite de 141 tecnologias e calibrar todos os 27 presets com linters nativos.

---

## Etapas

### Etapa 1: Integração do Knip para Detecção Zero-Token de Código Morto
**Objetivo:** Permitir que agentes e desenvolvedores auditem bases de código sem ler dezenas de arquivos via tokens, usando a ferramenta analítica Knip.
**Tarefas:**
- [ ] Atualizar [governanca/skills/auditar-repositorio.md](governanca/skills/auditar-repositorio.md) e [src/templates/skills/auditar-repositorio.md](src/templates/skills/auditar-repositorio.md):
  - Adicionar a seção oficial **Auditoria de Código Morto & Dependências Zumbis (Zero-Token com Knip)**.
  - Instruir o agente a rodar localmente `npx knip --reporter compact` (ou equivalente na stack) para obter em 2 segundos o inventário de arquivos não utilizados, exports mortos, tipos não importados e dependências fantasmas no `package.json`.
  - Estabelecer a regra de que o agente não deve ler arquivos um a um para caçar código morto se houver comando offline disponível.
**Critérios de Aceite:**
- [ ] Skill `auditar-repositorio.md` ensinando o uso de Knip com instruções de execução e análise de saída.

### Etapa 2: Adoção do Biome nos Presets Web e Catálogo
**Objetivo:** Estabelecer o Biome como padrão de excelência para linting e formatação instantânea em novos projetos TypeScript/Node/Next.js.
**Tarefas:**
- [ ] Atualizar [src/servidor/dados/presets.json](src/servidor/dados/presets.json):
  - No preset `nextjs-app-router`, `react-vite`, `node-api` e `hono-api`, definir Biome como ferramenta primária recomendada em `arquitetura.lint` e `arquitetura.formatacao`.
- [ ] Atualizar [governanca/skills/CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md) e a base SQLite para destacar o Biome (ID 131) como linter consolidado.
**Critérios de Aceite:**
- [ ] Presets atualizados recomendando Biome para novas stacks web modernas.

### Etapa 3: Saneamento Taxonômico e Aposentadoria de Legados no SQLite
**Objetivo:** Corrigir as distorções de taxonomia encontradas pela auditoria no banco de dados SQLite (`dados/rr.db`), mantendo paridade com os snapshots.
**Tarefas:**
- [ ] Executar script de migração/ajuste no SQLite:
  - Consolidar os 3 itens da categoria `Testes` (`Jest`, `integration_test`, `testify`) dentro da categoria oficial `Qualidade & Testes`.
  - Eliminar a categoria monotemática `Linguagens & Tipagem`, movendo `@types/google-apps-script` para `Bibliotecas` ou `Qualidade & Testes`.
  - Reclassificar `SHA-256 + pepper + UUID` na categoria de arquitetura/padrões ou renomeá-la para refletir biblioteca real.
  - Descontinuar ferramentas obsoletas: marcar `PyInstaller` (ID 45) como preterido por `Nuitka`, e `dotenv` (ID 53) como preterido pelo `--env-file` nativo do Node 20+.
  - Cadastrar novas tecnologias do ecossistema 2026: `Gitleaks`, `Knip`, `Oxlint`, `Bun`, `Deno`.
- [ ] Regenerar `dados/tecnologias-snapshot.json`, `src/servidor/dados/tecnologias.json` e o documento [governanca/skills/CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md).
**Critérios de Aceite:**
- [ ] Catálogo SQLite com categorias limpas e consistentes.
- [ ] `npm test` validando integridade referencial dos presets após o saneamento.

### Etapa 4: Paridade Total dos Presets com Linters Nativos
**Objetivo:** Vincular IDs reais de linters aos presets que continham ferramentas apenas em texto (`.NET Roslyn`, `golangci-lint`, `flutter_lints`).
**Tarefas:**
- [ ] Cadastrar no SQLite e snapshot os linters nativos específicos: `.NET Roslyn Analyzers`, `golangci-lint`, `gofumpt` e `flutter_lints`.
- [ ] Atualizar [src/servidor/dados/presets.json](src/servidor/dados/presets.json) preenchendo os campos `tecnologiaIds` dos presets C#, Go e Flutter com os novos IDs cadastrados.
**Critérios de Aceite:**
- [ ] Todos os linters citados nos 27 presets com IDs mapeados e verificados em `presets.json`.

### Etapa 5: Desacoplamento de Escopo das Skills de Auditoria
**Objetivo:** Eliminar duplicações de trabalho e desperdício de tokens na meta-skill `faxina-completa.md`.
**Tarefas:**
- [ ] Atualizar [governanca/skills/auditar-repositorio.md](governanca/skills/auditar-repositorio.md):
  - Remover do checklist os tópicos de consistência visual (cores, espaçamentos) e layout mobile responsivo, deixando essas atribuições estritamente para [auditar-consistencia-visual.md](governanca/skills/auditar-consistencia-visual.md) e [auditar-responsividade.md](governanca/skills/auditar-responsividade.md).
- [ ] Atualizar [governanca/skills/faxina-completa.md](governanca/skills/faxina-completa.md) refletindo a separação limpa de fases.
**Critérios de Aceite:**
- [ ] Cada skill de auditoria com escopo exclusivo, sem repetição de tarefas na `faxina-completa`.

---

## Andamento

- [ ] Etapa em andamento
- [ ] Testes passando
- [ ] Código revisado

---

## Instruções ao Agente

1. **Gate 1 — aprovação do plano:** Apresente ao usuário as tarefas de saneamento de catálogo e ferramentas zero-token.
2. Execute a migração do SQLite de forma atômica, mantendo `dados/tecnologias-snapshot.json` sincronizado.
3. Rode `npm test` após as mudanças nos presets para garantir que nenhum preset aponta para tecnologia órfã.
4. **Gate 2 — aprovação da entrega:** Apresente os diffs do catálogo e as novas seções de skills ao usuário antes de commitar.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-03: analise zero-token com Knip, adocao de Biome e saneamento taxonomico do catalogo
```

---

## Roteiro de Verificação

1. Executar `npm test` e verificar que a checagem de presets x catálogo SQLite continua 100% verde (27 presets válidos).
2. Abrir `governanca/skills/CATALOGO_TECNOLOGIAS.md` e verificar as novas categorias consolidadas (sem `Testes` separado de `Qualidade & Testes`).
3. Abrir `governanca/skills/auditar-repositorio.md` e conferir as novas instruções de Knip e a remoção de duplicatas de UI.

---

## Evidências

- [ ] `npm test` passando com presets válidos
- [ ] Catálogo SQLite sincronizado com snapshot JSON
- [ ] Skill `auditar-repositorio.md` atualizada

## Limitações

- A execução do `knip` em projetos satélites depende de conectividade local com o registro npm para rodar via `npx` quando não instalado globalmente.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
