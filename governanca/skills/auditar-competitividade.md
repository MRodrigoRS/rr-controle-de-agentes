---
name: auditar-competitividade
description: Analisa propósito, completude como produto, concorrência real e gap analysis de funcionalidades e precificação.
---

# Skill: Auditar Competitividade

> Analisa o propósito do projeto, avalia sua completude como produto,
> pesquisa concorrentes reais no mercado e gera um gap analysis de
> funcionalidades e precificação.

## Quando Executar

- **No onboarding** (após definir sprints) — para saber onde o projeto está
  e para onde precisa ir
- **Antes de um lançamento público** — para garantir que não está sendo
  lançado um produto incompleto ou sem diferencial
- **Periodicamente** — o mercado muda, concorrentes evoluem
- **Sempre que o usuário solicitar** uma análise competitiva

## Fase 1: Deduzir o Propósito

Examine estes artefatos para entender **o que o projeto faz**:

1. [PRD.md](governanca/PRD.md) — qual problema o produto resolve?
2. [PLANO.md](governanca/PLANO.md) — qual o escopo planejado?
3. README do projeto (se houver na raiz) — como o projeto se descreve?
4. **Rotas e páginas** — examine `src/app/`, `src/pages/`, endpoints de API
   para listar as funcionalidades implementadas
5. **Schema do banco** — `prisma/schema.prisma`, migrações SQL, modelos
   principais (entidades revelam o domínio)
6. **Nome do repositório** e `package.json` → `name` e `description`

Com base nisso, redija uma **frase de propósito**:

```
Propósito deduzido: "SaaS de agendamento para clínicas com gestão de
pacientes, horários, notificações e relatórios financeiros."
```

## Fase 2: Analisar a Completude como Produto

Para cada categoria abaixo, examine o código e a interface para responder
"sim", "não" ou "parcial". Itens com "não" ou "parcial" viram achados no
relatório.

### 2.1 CRUD Fundamental
- [ ] Toda entidade principal pode ser **criada**, **editada**, **listada**
  e **excluída** (existe rota/UI para cada operação?)
- [ ] Exclusão tem **confirmação** com nome do registro
- [ ] Listas têm **paginação** ou busca (ou o usuário precisa scroll infinito?)
- [ ] Formulários têm **validação** de campos obrigatórios e formato

### 2.2 Estados de Interface
- [ ] **Loading state** — feedback visual enquanto carrega (skeleton, spinner)
- [ ] **Empty state** — mensagem clara quando não há dados
  ("Nenhum paciente cadastrado. Crie o primeiro.")
- [ ] **Error state** — mensagem amigável em vez de tela branca ou stack trace
- [ ] **Success state** — toast/feedback após salvar ou excluir

### 2.3 Regras de Negócio Visíveis
- [ ] **Duplicatas são impedidas** — cadastro de CPF/email repetido bloqueado
- [ ] **Limites são respeitados** — não permite criar horário sobreposto,
  estoque negativo, etc.
- [ ] **Concorrência tratada** — dois usuários editando o mesmo registro
  não sobrescrevem silenciosamente
- [ ] **Impedimentos explicados** — se não pode excluir (por dependência),
  o sistema informa o motivo

### 2.4 Relatórios e Histórico
- [ ] O usuário consegue ver **o que aconteceu** (log de atividades,
  histórico de alterações)
- [ ] Existe ao menos **um relatório/visão agregada** (totais, gráfico,
  planilha exportável)
- [ ] Dá para **filtrar por período** em listas com dados temporais
- [ ] **Exportação** (CSV, PDF, planilha) disponível para dados relevantes

### 2.5 Integrações Esperadas
- [ ] **Notificação** (email, push, WhatsApp) para eventos importantes
  (confirmação, lembrete, alteração)
- [ ] **Integração com serviços do domínio** (ex: agendamento → Google
  Calendar, e-commerce → transportadora, financeiro → contas a pagar)
- [ ] **Webhooks ou API pública** — outros sistemas conseguem consumir
  ou alimentar dados?

### 2.6 Integridade de Dados
- [ ] **Exclusão segura** — deletar um registro com dependências mostra
  aviso ou bloqueia
- [ ] **Cascatas documentadas** — o que mais é afetado ao excluir X?
- [ ] **Dados órfãos** — não sobram registros sem dono após exclusão

### 2.7 Tratamento de Erros
- [ ] Erros de rede mostram "Sem conexão" (não timeout genérico)
- [ ] Erros de servidor mostram "Tente novamente" (não 500 interno)
- [ ] Erros de formulário destacam o campo com problema e a mensagem
- [ ] Nenhum erro expõe stack trace, nome de tabela, caminho de arquivo

## Fase 3: Pesquisar a Concorrência

Com base no **propósito deduzido** (Fase 1), pesquise na web concorrentes
reais. Encontre de **3 a 5 concorrentes** que resolvem o mesmo problema.

### Para cada concorrente, extraia:

- **Nome e URL**
- **Funcionalidades em destaque** — o que eles usam como headline?
- **Modelo de precificação** — gratuito? freemium? por assinatura
  (mensal/anual)? por uso? por usuário? preços quando disponíveis
- **Público-alvo** — freelancers, PMEs, enterprise?
- **Diferenciais competitivos** — o que eles usam para se destacar
- **Pontos fracos aparentes** — avaliações negativas, reclamações comuns

### Organize num quadro comparativo:

```
| Concorrente | Funcionalidades-chave | Precificação | Diferenciais |
|---|---|---|---|
| *ex: Calendly* | *Agendamento, Zoom/Meet, reminders, equipes* | *Grátis (1 tipo), US$ 10/mês Essentials, US$ 16/mês Teams* | *Simplicidade, integrações* |
| *ex: Appointy* | *Agendamento, pagamentos, email marketing, multi-unidades* | *Grátis (5 agents), US$ 29.99/mês Growth, US$ 79.99/mês Business* | *Multi-unidades* |
```

## Fase 4: Gerar o Relatório

Gere `governanca/relatorios/auditoria-competitividade.md` usando o template
em `governanca/relatorios/_template.md`.

Além das seções padrão do template, inclua:

### Seções adicionais no relatório

```
## Propósito Deduzido

> (frase de propósito da Fase 1)

## Concorrentes Identificados

(quadro comparativo da Fase 3)

## Gap Analysis

| Funcionalidade | Seu projeto | Concorrentes | Impacto |
|---|---|---|---|
| *Integração com Google Calendar* | ❌ Ausente | Calendly ✅, Appointy ✅ | [BLOQ] essencial no segmento |
| *Notificação por email* | ✅ Presente | Todos ✅ | — |

## Precificação vs. Posicionamento

(análise de onde o projeto se encaixaria no mercado
— grátis, freemium, premium — com base nos preços dos concorrentes)
```

### Critérios de severidade

- **[BLOQ]** — funcionalidade que todos os concorrentes têm e o projeto não:
  sem ela o produto é inviável no mercado
- **[REC]** — funcionalidade presente em >50% dos concorrentes: importante
  para não ser superficial
- **[SUG]** — funcionalidade presente em <50% ou diferencial opcional:
  pode virar vantagem competitiva se implementada

Ao preencher a seção `## Sprint Sugerida`, crie sprints priorizando:
1. Itens [BLOQ] (mínimo para competir)
2. Itens [REC] (não ser superficial)
3. Itens [SUG] (diferenciais)

## Após Gerar o Relatório

1. **Registre nas notas persistentes** de `governanca/SESSAO.md` que a auditoria foi
   realizada e o caminho do relatório
2. **Apresente o resumo** ao usuário:
   - Propósito deduzido (validar se está correto)
   - Concorrentes encontrados
   - Principais gaps encontrados
   - Sugestão de posicionamento/precificação
3. **Pergunte** se deseja transformar gaps em tarefas de sprint
4. Se autorizado, crie as sprints correspondentes

## Regras

- **Nunca invente concorrentes** — pesquise de verdade na web. Se não
  encontrar concorrentes claros, documente "nicho sem concorrência direta
  identificada" e sugira análise de substitutos (excel, papel, sistemas
  genéricos)
- **Preços devem ser reais** — extraia dos sites dos concorrentes. Se não
  encontrar preços públicos, documente "sob consulta" ou "não divulgado"
- **Seja honesto sobre o propósito** — se o projeto é claramente um MVP
  com 3 telas, não finja que é um produto completo. Diagnostique o estágio
  real e sugira o próximo passo concreto
