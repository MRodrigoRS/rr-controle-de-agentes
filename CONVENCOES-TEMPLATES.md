# Convenções de Templates

> Guia de estilo para manter a consistência semântica entre todos os
> templates da governança. Consulte este documento antes de criar ou
> modificar qualquer template.

---

## H1 (Título Principal)

Use **em-dash (`—`)** como separador universal.

### Instruções ao agente (documentos que o agente lê e segue)

```
# TIPO — {{nomeProjeto}}
```

| Documento | H1 |
|---|---|
| AGENTS.md | `# Governança — {{nomeProjeto}}` |
| SESSAO.md | `# Sessão Atual e Notas Persistentes — {{nomeProjeto}}` |
| INICIO.md | `# Inicialização — {{nomeProjeto}}` |
| VINCULAR.md | `# Vinculação — {{nomeProjeto}}` |

### Templates a preencher (documentos que o agente edita)

```
# TIPO: {{titulo}} — {{nomeProjeto}}
```

| Documento | H1 |
|---|---|
| SPRINT.md | `# Sprint {{numero}}: {{titulo}} — {{nomeProjeto}}` |
| PLANO.md | `# Plano — {{nomeProjeto}}` |
| PRD.md | `# PRD — {{nomeProjeto}}` |
| 01-visao-geral.md | `# Visão Geral da Arquitetura — {{nomeProjeto}}` |
| 02-stack.md | `# Detalhamento da Stack — {{nomeProjeto}}` |
| 03-logica-do-sistema.md | `# Lógica do Sistema — {{nomeProjeto}}` |

### Relatórios (preenchidos pelo agente em runtime)

O título usa `[NOME]` e `[DATA]` preenchidos manualmente. O `{{nomeProjeto}}`
vai nos metadados do corpo.

```markdown
# Auditoria: [NOME] — [DATA]

**Projeto:** {{nomeProjeto}}
```

---

## Variáveis

Duas sintaxes, dois propósitos distintos:

| Sintaxe | Resolvida por | Uso |
|---|---|---|
| `{{variavel}}` | Template engine (`processarTemplate`) na geração | Dados do projeto (nome, stack, data de geração) |
| `[TEXTO]` | Agente, ao preencher o documento | Campos que só existem em runtime (nome da auditoria, data do relatório) |

**Nunca misture** as duas sintaxes para o mesmo propósito. Se é conhecido na
geração, use `{{ }}`. Se é preenchido depois, use `[ ]`.

---

## Metadados

Todo template deve incluir:

```markdown
**Gerado em:** {{data}}
```

E todo template deve terminar com:

```markdown
*Template gerado por RR Tech Studio (Rodrigo Rafael).*
```

### Exceções

- **AGENTS.md**: o rodapé fica no topo como blockquote, não no final.
- **SPRINT.md**: tem front-matter YAML com `ultima_modificacao: {{data}}` —
  não precisa da linha `**Gerado em:**` no corpo.
- **relatorios/_template.md**: a data é preenchida pelo agente (`[DATA]`),
  não pelo template engine.

---

## Tom

**Português (você)**, imperativo, 3ª pessoa do singular:

```
Leia o arquivo. Execute o comando. Apresente o resultado.
```

Evite construções passivas (`"deve ser lido"` → `"leia"`).

---

## Estrutura

- Use **H2 (`##`)** para seções principais. Nunca entregue um documento sem
  ao menos uma seção H2.
- Numeração de seções em documentos de instrução: `## 1. Título`, `## 2. Título`.
  Sem decimais no meio (`3.5`), sem saltos na sequência.
- **Front-matter YAML** só no `SPRINT.md` (template de sprint). Não use em
  outros documentos.

---

## Links Obrigatórios (Zero Texto Puro e Navegação Relativa em Subpastas)

Toda menção a qualquer arquivo, documento, manual, skill ou workflow da governança **DEVE** ser um link Markdown real, e **NUNCA** texto puro solto.

- ❌ Incorreto: `Consulte SESSAO.md e use a skill evoluir-governanca.`
- ✅ Correto (a partir da raiz do repositório): `Consulte [SESSAO.md](governanca/SESSAO.md) e use a skill [evoluir-governanca.md](governanca/skills/evoluir-governanca.md).`

### Regra Mandatória de Resolução Relativa em Subpastas
No GitHub, VS Code e qualquer leitor CommonMark/GFM padrão, links Markdown sem barra inicial são resolvidos **em relação ao diretório do arquivo atual**:
- **Arquivos na raiz do repositório** (ex: `AGENTS.md`, `CLAUDE.md`): usam o prefixo `governanca/...` (ex: `[SESSAO.md](governanca/SESSAO.md)`).
- **Arquivos dentro de subpastas** (ex: `governanca/padroes/`, `governanca/livro-arquitetura/`, `governanca/workflows/`, `governanca/skills/`, `governanca/sprints/`): **DEVEM** usar caminhos relativos navegáveis (`../`, `./`):
  - Exemplo em `governanca/padroes/backend.md`: `[desenvolver-e-auditar-gas.md](../skills/desenvolver-e-auditar-gas.md)` (nunca com prefixo `governanca/`).
  - Exemplo em `governanca/livro-arquitetura/01-visao-geral.md`: `[AGENTS.md](../AGENTS.md)` ou `[skills/](../skills/)`.
  - Exemplo em `governanca/workflows/fix.md`: `[padroes/](../padroes/)` e `[SESSAO.md](../SESSAO.md)`.
- É proibido usar caminhos que dependem de fallback na raiz quando o arquivo está em uma subpasta, pois causam erro 404 ao serem clicados diretamente na interface web do repositório ou no editor.

O validador de integridade (`npm test` / `src/scripts/validar-templates.ts`) audita automaticamente cada link gerado com resolução estrita para assegurar que não existam links quebrados nem menções não navegáveis.

---

## Rodapé

Todo template, sem exceção, termina com o rodapé de autoria. A única variação
é o `AGENTS.md`, que coloca a atribuição no topo como blockquote.

```markdown
*Template gerado por RR Tech Studio (Rodrigo Rafael).*
```
