---
name: modularizar-padroes-recorrentes
description: Varre o repositório, detecta duplicação de código (lógica, fluxos de API, marcação visual, estados), extrai módulos/componentes reutilizáveis e centraliza a manutenção com regressão zero.
---

# Skill: Modularizar Padrões Recorrentes

> Skill de engenharia de software pura (DRY + modularização), **agnóstica de
> stack** — atua em Frontend (React/Vue, JSX/templates, Vanilla HTML/CSS/JS)
> e Backend (Node, Python, Go, C#). Complementa a auditoria: `auditar-repositorio.md`
> **detecta** a duplicação; esta skill **executa** a modularização com regressão zero.

## Quando Executar

- Durante ou ao final de sprints com código repetido
- Antes de refatorações
- Quando a auditoria (`auditar-repositorio.md`) apontar duplicação
- Sob demanda ("elimine duplicação", "modularize X")

## Fluxo

### Passo 1 — Varredura & Detecção

Identifique trechos com **mais de 2 ocorrências estruturais semelhantes**:

- **Frontend com framework (React/Vue):** blocos repetidos de JSX/templates —
  modais, empty states, cards, paginação, inputs, formulários
- **Vanilla HTML/CSS/JS:** formatadores (data/moeda), wrappers de `fetch`,
  manipuladores de DOM, templates HTML concatenados
- **Backend (Node, Python, Go, C#):** validações repetidas, tratadores de erro,
  mappers de banco, middlewares duplicados, serviços

Marque cada ocorrência (arquivo:linha) **antes** de tocar no código.

### Passo 2 — Parametrização

Defina o **contrato** do módulo reutilizável que cobre todos os casos de uso
**existentes**:

- props/parâmetros, variantes e comportamento padrão
- sem acoplamento rígido; não generalize além dos casos reais

### Passo 3 — Extração & Substituição Segura

- Crie o módulo/componente no diretório compartilhado — veja
  `convencoes-estrutura-de-pastas.md` (`src/componentes/`, `src/lib/`,
  `src/servicos/`, etc.)
- Substitua as chamadas antigas **uma a uma** (não em lote cego), verificando
  cada ponto

### Passo 4 — Validação & Regressão Zero

- Rode a suíte completa (veja `criar-testes.md`): **100% verde**
- Verifique o comportamento exato (fluxos exercitados, evidências)
- Se algo quebrar, **corrija antes de seguir** — nunca avance com teste falhando

## Regras

- **Não modularize o que é usado uma vez** — sem prematuridade
- O contrato cobre os casos **reais**, não futuros imaginários
- Mudanças pequenas e verificáveis — menor surpresa
- Registre o que foi extraído (módulo, onde, quais pontos substituídos) nas
  notas persistentes do `AGENTS.md`
