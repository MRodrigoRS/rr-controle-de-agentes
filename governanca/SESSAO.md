# Sessão Atual e Notas Persistentes — rr-controle-de-agentes-1.1

> Arquivo exclusivo para notas de progresso e contexto entre sessões.
> Este arquivo nunca é sobrescrito na regeneração da governança.

**Gerado em:** 2026-10-02
**Sprint Ativa:** Nenhuma (Fast-Track / Refatoração Estratégica)

---

## Protocolo de Início de Sessão

> Siga estes passos ao abrir uma nova sessão, antes de qualquer tarefa.

1. **Localizar a sprint ativa:** Leia `governanca/sprints/` em ordem numérica; identifique o primeiro arquivo que **não** esteja em `sprints/concluidas/`. Essa é a sprint ativa — abra-a.
2. **Verificar o estado real do código:** Compare o que a sprint diz que falta fazer com o que já existe no repositório. Pode ser que etapas estejam implicitamente concluídas ou que o código já tenha avançado além do que o arquivo registra. Corrija o diagnóstico antes de continuar.
3. **Auditar os registros deste arquivo:** Leia as notas em `## Registro de Sessões` abaixo. Identifique notas que já não fazem sentido (bug resolvido, fluxo refatorado, contexto obsoleto). **Proponha a remoção ao usuário** com justificativa — não delete sem aprovação explícita.
4. **Reportar o estado:** Declare onde o projeto está de fato: sprint, etapa, estado dos testes, próxima ação recomendada.

---

## Como Usar Este Arquivo

- **Ao Final de Cada Sessão:** Registre um resumo conciso da sessão atual em `## Registro de Sessões`.
- **Ao Concluir uma Sprint:** Atualize a linha `**Sprint Ativa:**` acima com a próxima sprint planejada.
- **Ao Arquivar Sprints:** Mova o arquivo para `sprints/concluidas/` após aprovação no Gate 2.

---

## Estacionamento de Ideias e Débitos

> Ideias fora do escopo da sprint ativa que não devem ser perdidas nem implementadas agora.
> Registre aqui para não desviar o foco. Revisar ao planejar a próxima sprint.

*(Nenhuma ideia estacionada ainda)*

---


## Registro de Sessões

### Sessão — 2026-10-06: Sincronização Remota da Governança e Seleção Essencial/Total na Web UI
- **Objetivo:** Permitir que a governança matriz seja sincronizada a partir da fonte por projetos associados em qualquer computador, com modos Essencial (seguro) e Total (hard reset com confirmação e backup), tanto via CLI/Node quanto via Web UI.
- **Entregas Realizadas:**
  - `src/app/api/projetos/[id]/route.ts`: Rota PUT evoluída para receber `{ modo: "essencial" | "total" }` com backup automático de segurança no modo total.
  - `src/componentes/botao-recriar-governanca.tsx` & `modal-confirmar-regeneracao-total.tsx`: Botão expandido com seletor das duas opções (Essencial e Total) e modal de confirmação com alerta visual e aviso de backup para regeneração total.
  - `src/servidor/gerador.ts`: Suporte formal a `modoRegeneracao?: "essencial" | "total"`, blindagem de contexto local no modo essencial e gravação de metadados em `governanca/.matriz.json`.
  - `src/templates/scripts/sincronizar.mjs` & `governanca/scripts/sincronizar.mjs`: Script universal portátil (Node.js nativo 18+, zero dependências) com download remoto de matriz via GitHub API/raw, suporte a `--total`, travas de segurança e invocação automática do harness.
  - `src/scripts/sincronizar.ts` & `package.json`: Comando CLI `npm run rr:sync -- [caminho] [--total]`.
  - Documentação atualizada: `governanca/AGENTS.md`, `src/templates/AGENTS.md`, `governanca/skills/evoluir-governanca.md` e `src/templates/skills/evoluir-governanca.md`.
  - Validações: `npm test` 100% verde (55/55 templates aprovados e 274 links markdown verificados) e `npm run build` concluído com sucesso.

### Sessão — 2026-10-02: Blindagem, Eliminação de Duplos Sentidos e Auto-Governança
- **Objetivo:** Sanear todas as fragilidades, condições mortas/órfãs, inconsistências semânticas e aplicar auto-governança na progenitora.
- **Entregas Realizadas:**
  - `src/servidor/db/migrar-e-seed.ts` e `db.ts`: Implementado auto-seed transparente em bancos vazios com preservação estrita de `id` e `criado_em` do snapshot, eliminando o risco de corrupção dos 27 presets ao recriar o banco.
  - `src/servidor/gerador.ts`: Eliminado hardcoding estático de 40+ caminhos por descoberta dinâmica de `skills/`, `workflows/`, `padroes/`, `relatorios/` e `scripts/`. Blindado `PLANO.md` contra perda de dados. Removida a variável morta `ehGas`.
  - `src/servidor/harness.ts`: Implementada escrita segura com backup para ponteiros raiz preexistentes (`CLAUDE.md`, `AGENTS.md`) e gerador do script portátil autônomo `governanca/scripts/harness.mjs` (zero dependências).
  - 10 Skills de governança saneadas: Eliminada a referência confusa a "notas persistentes do `AGENTS.md`", padronizando 100% dos registros em `governanca/SESSAO.md`.
  - Unificação de marca: Substituída a menção legada a "RR Software" por "RR Tech Studio" em todos os templates e convenções.
  - Alinhamento de pastas do modelo de dados: Extratores direcionados para `governanca/livro-arquitetura/modelo-de-dados/`, respeitando a regra pétrea de zero pastas soltas na raiz.
  - Web UI: Busca do catálogo expandida para buscar por ID (ex: `#129`) e termos de `aplicabilidade`.
  - Auto-governança implantada na própria progenitora (`rr-controle-de-agentes-1.1`).
- **Próximos Passos:** Manter testes 100% verdes e validar o build de produção do Next.js.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
