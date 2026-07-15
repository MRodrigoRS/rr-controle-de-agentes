# Skill: Criar PRD

> Instrui o agente a transformar o plano/descrição do projeto em um
> **Product Requirements Document (PRD)** estruturado, padronizando
> requisitos, critérios de aceite e escopo.

## Quando Executar

Esta skill é acionada **automaticamente** durante:

- **`INICIO.md` — Passo 1:** após ler `PLANO.md`, o agente pergunta se
  deve criar o PRD e executa esta skill
- **`VINCULAR.md` — Passo 1:** após ler `PLANO.md`, o agente pergunta
  se deve criar o PRD e executa esta skill

## Como Executar

1. **Leia `governanca/PLANO.md`** para entender a visão do projeto
2. **Pergunte ao usuário** se deseja criar um PRD estruturado
3. Se sim, **analise o plano** e extraia:
   - Resumo executivo (2-3 frases)
   - Requisitos funcionais (liste em tabela com ID, descrição, prioridade)
   - Requisitos não-funcionais (desempenho, segurança, usabilidade)
   - Casos de uso principais (se aplicável)
   - Critérios de aceite globais
   - Fora de escopo (o que fica para versões futuras)
4. **Crie o arquivo** `governanca/PRD.md` usando o template
   `governanca/skills/PRD.md` — preencha cada seção com base no plano
5. **Apresente o PRD ao usuário** para validação
6. Após aprovação, **registre nas notas persistentes** do `AGENTS.md`
   que o PRD foi criado

## Regras

- **Não invente requisitos** que não estejam no plano do usuário
- Se o plano for vago, **pergunte** ao usuário para detalhar antes de
  preencher as seções
- Mantenha o PRD atualizado: se o escopo mudar durante as sprints,
  edite o `PRD.md` para refletir a mudança
- O PRD é o documento de referência para **todas as sprints** —
  nada deve ser implementado sem estar respaldado por ele
