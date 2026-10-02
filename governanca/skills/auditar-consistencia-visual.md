---
name: auditar-consistencia-visual
description: Detecta e corrige divergências visuais da UI, propondo componentes reutilizáveis no lugar de estilos avulsos.
---

# Skill: Auditar Consistência Visual

> Detecta e corrige divergências visuais entre diferentes partes da mesma
> aplicação, propondo componentes reutilizáveis no lugar de estilos avulsos.

## Propósito

Em projetos com múltiplos agentes ou múltiplas sessões, é comum que cada
implementação use um padrão visual ligeiramente diferente — um botão com
padding `p-2`, outro com `px-6 py-3`; uma aba com underline, outra com
background. Essa miscelânea estética degrada a experiência do usuário e
aumenta a dívida técnica.

Esta skill ensina o agente a auditar a consistência visual e a refatorar
para componentes compartilhados.

## Escopo de Verificação

Para cada página/rota da aplicação, examine:

| Elemento | O que verificar |
|----------|-----------------|
| Botões | altura, padding, cor, hover, tamanho de fonte, borda, ícone interno |
| Abas/Tabs | estilo ativo vs. inativo, underline, cor, padding |
| Inputs/Formulários | label, borda, placeholder, altura, foco, erro |
| Cards/Containers | sombra, padding, border-radius, cor de fundo |
| Cores | se cores fora do design system / tailwind config foram usadas |
| Tipografia | tamanhos de heading, body, cor de texto, line-height |
| Ícones | posição, tamanho, gap em botões com ícone |
| Modais/Diálogos | largura, overlay, padding botões, botão fechar |
| Tabelas/Listas | estilo do header, linhas zebradas, padding, alinhamento |

## Metodologia

1. Liste todas as páginas/rotas ativas (consulte as rotas, navegue pelos
   arquivos ou pergunte ao usuário)
2. Para cada página, anote o padrão usado em cada tipo de elemento
3. Compare os padrões entre páginas — onde há divergência?
4. Para cada divergência, decida:
   - **Variação intencional** — ex: botão primário (`bg-blue-600`) vs.
     botão de perigo (`bg-red-600`). OK, desde que via props do mesmo
     componente.
   - **Design drift** — ex: botão na página A usa `rounded-md`, na página B
     usa `rounded-full`, e isso não é intencional. Deve ser unificado.
5. Para cada drift, crie ou atualize um **componente reutilizável**
6. Atualize todas as ocorrências para usar o componente

## Saída

Gere o relatório em `governanca/relatorios/auditoria-consistencia.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para divergências visuais severas que afetam usabilidade
  (ex: elementos sobrepostos, cores contrastantes que prejudicam leitura)
- Use `[REC]` para drift visual entre componentes equivalentes em
  páginas diferentes (ex: botão com padding diferente, cor divergente)
- Use `[SUG]` para extração de novos componentes e padronização de props

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint com etapas
por severidade. Para cada componente proposto, inclua a criação do
componente como tarefa + a substituição em todos os locais afetados.

## Prevenção

Após a auditoria, edite `AGENTS.md` (seção Padrões de Implementação) para
relacionar os componentes oficiais com suas props. Exemplo:

```
### Componentes de UI

- `Button` — variants: primary, secondary, danger; sizes: sm, md, lg
- `Input` — variants: default, error; size: sm, md
- `Card` — variants: default, elevated, bordered
```

Isso garante que o próximo agente que tocar no projeto já encontre a
convenção estabelecida.
