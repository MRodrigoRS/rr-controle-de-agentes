---
name: sincronizar-documentacao
description: Reconcilia e realinha todo o livro-arquitetura (5 volumes) e documentos de produto (PRD/Plano) com o código vivo do repositório.
---

# Skill: Sincronizar Documentação Arquitetural e de Produto

> Reconciliação completa da governança técnica e de produto: varre minuciosamente a base
> de código atual e realinha os 5 volumes do [livro de arquitetura](governanca/livro-arquitetura/) e os
> documentos de produto ([PRD.md](governanca/PRD.md) e [PLANO.md](governanca/PLANO.md)), garantindo fidelidade total à realidade do sistema.

## Quando Executar

- **Sob demanda:** Sempre que o usuário solicitar ("sincronize a documentação", "atualize o livro de arquitetura", "realinhe a doc com o código").
- **Final de ciclos de desenvolvimento:** Após sprints volumosas ou refatorações estruturais.
- **Antes de auditorias ou releases:** Para garantir que revisores e novos agentes tenham a visão exata do projeto.
- **Ao assumir repositório legado/existente:** Logo após a vinculação para espelhar o estado real herdado.

---

## Estratégia de Execução (Contexto Limpo via Subagentes)

Em repositórios médios ou grandes, varrer todos os arquivos do projeto em uma única sessão polui a janela de contexto do agente e degrada a precisão das análises.
Quando o harness suportar subagentes (conforme orientações na skill [usar-subagentes.md](governanca/skills/usar-subagentes.md)), **o agente orquestrador deve preferir delegar as frentes de análise a subagentes com contexto limpo e handoff direto por arquivo**:

1. **Subagente 1 — Arquitetura & Stack (Etapas 1 e 2):**
   - Varre pastas, módulos, ADRs e manifests (`package.json`, `go.mod`, etc.).
   - **Handoff:** Atualiza diretamente [01-visao-geral.md](governanca/livro-arquitetura/01-visao-geral.md) e [02-stack.md](governanca/livro-arquitetura/02-stack.md).
2. **Subagente 2 — Lógica & Autonomia (Etapas 3 e 4):**
   - Varre regras de negócio, fluxos de dados, serviços e rotinas assíncronas/background/crons.
   - **Handoff:** Atualiza diretamente [03-logica-do-sistema.md](governanca/livro-arquitetura/03-logica-do-sistema.md) e [04-comportamento-autonomo.md](governanca/livro-arquitetura/04-comportamento-autonomo.md).
3. **Subagente 3 — Modelo de Dados (Etapa 5):**
   - Varre schemas de banco, migrações SQL ou executa scripts de extração.
   - **Handoff:** Atualiza diretamente [05-modelo-de-dados.md](governanca/livro-arquitetura/05-modelo-de-dados.md).
4. **Agente Orquestrador — Produto & Reconciliação (Etapa 6):**
   - Com a arquitetura atualizada diretamente nos arquivos pelos subagentes técnicos, o orquestrador compara as funcionalidades ativas com [PRD.md](governanca/PRD.md) e [PLANO.md](governanca/PLANO.md).
   - Gera um diagnóstico no chat (ou opcionalmente em [relatorios/](governanca/relatorios/)) e **solicita validação e aprovação do usuário antes de alterar PRD e PLANO**.

*Nota:* Se o harness não suportar subagentes, o agente orquestrador executa as 6 etapas sequencialmente em sua própria sessão.

> **Acelerador Opcional (Graphify):** Em repositórios médios/grandes (30+ arquivos), antes de iniciar as Etapas 1 e 3, o agente (ou Subagente 1) pode consultar a skill [mapear-grafo-de-conhecimento.md](governanca/skills/mapear-grafo-de-conhecimento.md) para indexar o projeto via AST local e gerar o `GRAPH_REPORT.md`. O relatório revela os clusters (domínios funcionais) e god nodes em segundos, acelerando o mapeamento de [01-visao-geral.md](governanca/livro-arquitetura/01-visao-geral.md) e [03-logica-do-sistema.md](governanca/livro-arquitetura/03-logica-do-sistema.md) com zero custo de tokens.

---

## Fluxo de Execução (6 Etapas)

Execute a reconciliação cobrindo os 5 volumes do livro de arquitetura e a reconciliação de produto:

### Etapa 1. Sincronizar Visão Geral ([01-visao-geral.md](governanca/livro-arquitetura/01-visao-geral.md))

1. **Estrutura de Diretórios Real:**
   - Varra as pastas de primeiro e segundo nível do projeto (ex: `src/app/`, `src/componentes/`, `src/servidor/`, `prisma/`, etc.).
   - Atualize a árvore ASCII no documento, refletindo pastas criadas ou renomeadas e explicando a responsabilidade de cada diretório.
2. **Módulos e Domínios do Sistema:**
   - Identifique os grandes blocos funcionais do projeto (ex: Autenticação, Faturamento, Catálogo, Notificações).
   - Documente o propósito de cada módulo e onde seus componentes residem.
3. **Decisões Arquiteturais (ADRs):**
   - Preserve os ADRs existentes.
   - Se identificar decisões de design consolidadas no código que ainda não estavam registradas (ex: substituição de uma lib, escolha de um padrão de cache), registre um novo ADR sequencial (`ADR-0X`).

---

### Etapa 2. Sincronizar Detalhamento da Stack ([02-stack.md](governanca/livro-arquitetura/02-stack.md))

1. **Inspeção de Manifests:**
   - Leia os arquivos de dependência reais do projeto (`package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, `composer.json`, etc.).
2. **Reconciliação de Versões & Ferramentas:**
   - Verifique a versão exata do framework, banco de dados, ORM, ferramentas de lint/formatação e suíte de testes.
   - Atualize os campos de cabeçalho (`## Frontend`, `## Backend`, `## Ferramentas & Padrões`).
3. **Detecção de Dependências Não Documentadas:**
   - Identifique bibliotecas instaladas no projeto que não constavam nas tabelas oficiais.
   - Atualize as tabelas de tecnologias do Frontend e Backend com o papel claro de cada pacote.
   - *Nota:* Se uma biblioteca instalada quebrar os padrões do projeto ou concorrer com o preset oficial, sinalize no sumário ao usuário.

---

### Etapa 3. Sincronizar Lógica do Sistema ([03-logica-do-sistema.md](governanca/livro-arquitetura/03-logica-do-sistema.md))

Varra o código fonte buscando regras, cálculos e fluxos de dados:

1. **Regras de Negócio (`RN-xx`):**
   - Identifique condicionais e validações de domínio (ex: `if (plano === 'pro')`, `if (saldo < valor)`).
   - Mantenha os IDs existentes (`RN-01`, `RN-02`) e adicione novas regras detectadas.
   - Se uma regra foi deletada do código, remova-a da tabela.
2. **Fórmulas e Cálculos:**
   - Documente equações financeiras, métricas, conversões de unidade e prazos com suas funções de origem e exemplos práticos.
3. **Fluxos de Dados & Máquinas de Estado:**
   - Mapeie o ciclo de vida de entidades centrais (ex: `Pendente` → `Processando` → `Concluído` / `Cancelado`).
   - Registre os caminhos ponta-a-ponta (Borda/API → Validação → Service → Banco → Resposta).
4. **Integrações Externas:**
   - Mapeie todas as chamadas a serviços externos (APIs REST, SDKs, webhooks de saída, gateways de pagamento, envio de e-mails/mensagens).

---

### Etapa 4. Sincronizar Comportamento Autônomo ([04-comportamento-autonomo.md](governanca/livro-arquitetura/04-comportamento-autonomo.md))

Varra o projeto em busca de rotinas que executam sem interação manual direta do usuário:

1. **Database Triggers & Cascatas:**
   - Migrations SQL, procedures, triggers `AFTER INSERT/UPDATE`, cascatas de deleção (`ON DELETE CASCADE`).
2. **Jobs Agendados & Cron:**
   - Rotinas temporizadas (`cron.schedule`, BullMQ, Cloud Scheduler, timers de sistema).
3. **Webhooks de Entrada:**
   - Rotas receptoras de callbacks externos com validação de assinatura (ex: `/api/webhooks/stripe`).
4. **Workers, Filas & Middleware:**
   - Processamento assíncrono em background, middleware de autenticação/rate-limit e ciclo de vida de servidor.
5. **Automações de CI & Git Hooks:**
   - Pipelines em `.github/workflows/`, hooks Husky ou scripts pós-instalação (`postinstall`).

---

### Etapa 5. Sincronizar Modelo de Dados & Entidades ([05-modelo-de-dados.md](governanca/livro-arquitetura/05-modelo-de-dados.md))

Varra as definições de dados reais do projeto para mapear tabelas, colunas, tipos e relacionamentos:

1. **Inspeção de Schemas e Migrações:**
   - Varra `prisma/schema.prisma`, `migrations/`, arquivos `.sql`, definições Drizzle/TypeORM/Mongoose ou `schema.prisma`.
   - Se for banco SQLite ou Postgres com script existente, execute `governanca/scripts/extrair-modelo.ts` (ou `extrair-modelo-sqlite.ts`).
2. **Atualização do Catálogo de Entidades:**
   - Mantenha ou adicione tabelas/entidades com seus nomes exatos.
   - Documente colunas: nome, tipo de dado no banco, obrigatoriedade (NULL/NOT NULL), chaves (PK/FK/Índices), default e enums válidos.
3. **Diagrama e Relacionamentos:**
   - Atualize os relacionamentos no diagrama Mermaid ERD (1:1, 1:N, N:N) e as regras de integridade referencial (`ON DELETE CASCADE` / `RESTRICT`).

---

### Etapa 6. Reconciliar Documentos de Produto ([PRD.md](governanca/PRD.md) e [PLANO.md](governanca/PLANO.md)) — Discussão e Aprovação Obrigatórias

Diferente do livro de arquitetura (que é estritamente técnico e espelha os fatos do código), o [PRD.md](governanca/PRD.md) e o [PLANO.md](governanca/PLANO.md) são o **contrato de produto, valor e escopo do negócio**. O agente **NUNCA** deve alterá-los de forma unilateral.

1. **Varredura Funcional vs Requisitos:**
   - Compare telas, rotas de API e regras de negócio ativas no código com os requisitos funcionais (`RF-xx`) de [PRD.md](governanca/PRD.md).
   - Identifique:
     - **Gaps de Requisitos:** Módulos, telas ou rotas implementadas no código que não possuem `RF-xx` registrado no PRD.
     - **Status de Entrega:** Quais `RF-xx` já foram 100% implementados vs quais ainda constam como pendentes ou parciais.
     - **Invasões de Escopo:** Itens marcados como "Fora de Escopo" no PRD que acabaram sendo desenvolvidos no código.
     - **Alinhamento do Plano:** Se a descrição e objetivos macro em [PLANO.md](governanca/PLANO.md) continuam fiéis à direção atual do produto.
2. **Protocolo Mandatório de Discussão:**
   - O agente formula e apresenta um diagnóstico estruturado ao usuário com a proposta de conciliação:
     > "Durante a varredura funcional, identifiquei divergências entre o código vivo e o [PRD.md](governanca/PRD.md):
     > - **Novas Funcionalidades no Código:** Módulos ativos sem requisito correspondente (ex: Autenticação OAuth, Exportação CSV, Webhook Pix).
     > - **Requisitos Entregues:** Requisitos do PRD que já possuem código e testes validados.
     > - **Requisitos Pendentes:** Requisitos previstos que ainda não foram iniciados.
     > 
     > **Proposta de Atualização:**
     > - Cadastrar novos `RF-xx` para as funcionalidades já existentes.
     > - Atualizar o status dos requisitos no [PRD.md](governanca/PRD.md) para `Implementado` ou `Pendente`.
     > - Atualizar os critérios de aceite globais e objetivos no [PLANO.md](governanca/PLANO.md).
     > 
     > Gostaria de debater algum ponto ou aprova esta atualização no [PRD.md](governanca/PRD.md) e [PLANO.md](governanca/PLANO.md)?"
3. **Aplicação Pós-Aprovação:**
   - **Somente após o usuário debater, validar e aprovar**, o agente realiza a edição de [PRD.md](governanca/PRD.md) e [PLANO.md](governanca/PLANO.md).
   - Registre na sessão ativa ([SESSAO.md](governanca/SESSAO.md)) que o escopo e o PRD foram reconciliados e aprovados pelo usuário.

---

## Saída e Apresentação

Após atualizar os arquivos de governança:

1. **Livro de Arquitetura (Técnico):** Atualizado diretamente com base no código vivo, preservando contexto e notas manuais úteis.
2. **Sumário Técnico ao Usuário:** Apresente brevemente novas pastas catalogadas, dependências atualizadas, regras mapeadas e triggers.
3. **Diagnóstico de Produto (PRD/PLANO):** Apresente a proposta de conciliação de escopo e **solicite a aprovação do usuário** antes de aplicar qualquer alteração nestes documentos.

