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
*Template gerado pelo RR Controle de Agentes.*
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

## Rodapé

Todo template, sem exceção, termina com o rodapé de autoria. A única variação
é o `AGENTS.md`, que coloca a atribuição no topo como blockquote.

```markdown
*Template gerado pelo RR Controle de Agentes.*
```
