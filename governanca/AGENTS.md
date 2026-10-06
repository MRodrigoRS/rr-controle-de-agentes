# Governança — rr-controle-de-agentes-1.1

> Arquivo gerado automaticamente por RR Controle de Agentes.
> Marca: RR Tech Studio | Autor: Rodrigo Rafael

## Orçamento de Contexto & Progressive Disclosure

> **Teto Estrito:** Este arquivo opera sob o limite estrito de até **150 linhas (~12 KB)** para proteger a governança contra o truncamento silencioso de contexto do OpenAI Codex (teto de 32 KiB) e manter o foco cognitivo dos modelos de IA nas regras fundamentais.
> **Progressive Disclosure:** Manuais profundos ([padroes/](padroes/)), fluxos operacionais ([workflows/](workflows/)) e habilidades ([skills/](skills/)) devem ser lidos estritamente sob demanda (*just-in-time*), nunca carregados em bloco na abertura da sessão.

---

## Primeira Sessão e Auto-Diagnóstico de Contexto

Se for o primeiro contato, siga [INICIO.md](INICIO.md) (ou [VINCULAR.md](VINCULAR.md) se houver código existente).
Ao receber saudações ou prompts genéricos (*"Oi"*, *"Leia AGENTS"*, *"Comece"*), faça auto-diagnóstico em 3 segundos e declare a ação:
1. **Brownfield (Código vivo sem governança preenchida):** Proponha vinculação imediata da stack via [VINCULAR.md](VINCULAR.md).
2. **Greenfield (Repositório novo sem código):** Proponha especificação do PRD e planejamento da Sprint 01 via [INICIO.md](INICIO.md).
3. **Sprint em Andamento:** Reporte a sprint e etapa ativa de [SESSAO.md](SESSAO.md) e aponte para a próxima tarefa.

---

## Stack Tecnológica & Não-Reinvenção

A fonte da verdade técnica do projeto reside em [02-stack.md](livro-arquitetura/02-stack.md).
- **Consulta Obrigatória:** Consulte [02-stack.md](livro-arquitetura/02-stack.md) antes de propor qualquer código ou dependência.
- **Não-Reinvenção:** É proibido criar soluções ad-hoc ou instalar bibliotecas concorrentes para o que já existe no catálogo.
- **Novas Dependências:** Consulte primeiro [CATALOGO_TECNOLOGIAS.md](skills/CATALOGO_TECNOLOGIAS.md) e obtenha aprovação prévia do usuário.
- **Dever de Crítica:** Não seja um assistente passivo. Se o usuário sugerir algo frágil ou que gere dívida técnica, alerte com firmeza e proponha alternativas seguras.

---

## Cláusulas Pétreas (Regras Inegociáveis)

1. **Escopo Estrito:** Não implemente fora do escopo da sprint/etapa ativa sem alinhamento prévio.
2. **Zero Testes Quebrados:** Nunca avance de etapa com testes falhando. Corrija imediatamente.
3. **Zero Vazamento de Segredos:** Proibido comitar credenciais, tokens ou senhas. Use `.env.example` e passe no scanner nativo.
4. **Português Brasileiro no Domínio:** Nomes de entidades, regras, variáveis, tabelas e funções em português. Termos técnicos universais (id, payload, props, status, token, req/res) em inglês.
5. **Backend como Autoridade Única (Zero-Trust):** O cliente é manipulável. Toda validação, cálculo e autorização deve ser re-executada no backend.
6. **Dependências Justificadas:** Toda biblioteca precisa de justificativa registrada no PRD/livro de arquitetura.
7. **Changelog a Cada Commit:**
   - **Produto:** Registre obrigatoriamente o delta consolidado (Adicionado/Modificado/Corrigido) no `CHANGELOG.md` da raiz (`../CHANGELOG.md`) antes de fechar qualquer commit com código, APIs ou regras de negócio. Nunca narre micro-passos.
   - **Governança:** Alterações estruturais ou em manuais são registradas em [governanca/CHANGELOG.md](CHANGELOG.md).

---

## Critérios de Qualidade de Engenharia

- **Build Limpo:** Passar em `npm run build` (ou equivalente na stack) sem alertas impeditivos.
- **Commits Descritivos:** Mensagens claras em português explicando o que mudou e por quê.
- **Estrutura de Pastas:** Respeitar [convencoes-estrutura-de-pastas.md](skills/convencoes-estrutura-de-pastas.md). Zero arquivos soltos na raiz.
- **Linguagem de Negócio:** Textos voltados ao cliente (telas, toasts, e-mails) sem jargão técnico e sem dados fictícios.
- **Honestidade Radical:** Nunca diga "está pronto" sem evidência comprovada. Declare o que não foi testado.

---

## Manuais Especializados de Engenharia

Consulte *just-in-time* em [padroes/](padroes/):
- **Frontend & Usabilidade:** Siga [frontend.md](padroes/frontend.md) (consistência visual, toasts, estados assíncronos, HTML semântico, fechamento com ESC, alvos de toque mobile ~44px e zero inchaço).
- **Backend & Segurança:** Siga [backend.md](padroes/backend.md) (Zero-Trust, Strict CSP com nonce, HSTS permanente, Rate Limiting, OWASP Agentic Top 10 e transações ACID).
- **Sincronização Remota:** Siga [sincronizacao-remota.md](padroes/sincronizacao-remota.md) (sync essencial e total via `sincronizar.mjs`).
- **Modelo de Dados:** Schema real do banco em [05-modelo-de-dados.md](livro-arquitetura/05-modelo-de-dados.md).

---

## Níveis de Execução e Cerimônia

- **Nível 1 — Tarefas Rápidas / Polimentos (`/fix`):** Correções pontuais e bugs rápidos. Sem criação de sprint. Diagnóstico → implementação → evidência (com validação humana para UI) → commit convencional → registro de 1 linha em [SESSAO.md](SESSAO.md). Detalhes em [workflows/fix.md](workflows/fix.md).
- **Nível 2 — Entregas Estruturadas (Sprints):** Features, refatorações amplas e arquitetura. Conduzidas em [sprints/](sprints/) com dois gates obrigatórios:
  - **Gate 1 (Aprovação do Plano):** Plano, riscos e critérios aceitos pelo usuário antes do código.
  - **Gate 2 (Aprovação da Entrega):** Evidências + limitações + changelog atualizado. Commit só com autorização expressa.

---

## Workflows e Ferramentas

Procedimentos operacionais disponíveis em [workflows/](workflows/):
- `/status`: Orientação de sessão e calibração com código real em [SESSAO.md](SESSAO.md).
- `/fix`: Fast-track para correção ágil sem overhead burocrático.
- `/spec`: Decomposição de requisitos em especificação verificável ([PRD.md](PRD.md)).
- `/plan`: Estruturação formal de nova sprint em [sprints/](sprints/).
- `/implement`: Ciclo guiado de codificação com testes e gates.
- `/test`: Protocolos de teste e validação por stack com teto de tentativas.
- `/review`: Revisão adversarial independente pré-entrega.
- `/release`: Checklist rigoroso de prontidão para produção.

---

## Gestão de Contexto e Notas Persistentes

As anotações vivas de sessão residem exclusivamente em **[SESSAO.md](SESSAO.md)**.
- **Início de Sessão:** Execute `/status` ou siga o roteiro consolidado em [SESSAO.md](SESSAO.md).
- **Término de Sessão:** Registre o progresso em `## Registro de Sessões` de [SESSAO.md](SESSAO.md).
- **Arquivamento de Sprints:** Após Gate 2 e commit, mova para `governanca/sprints/concluidas/` e aponte para a próxima sprint ativa.
- **Decisões Arquiteturais:** Decisões contestadas ou de impacto estrutural viram ADRs em [decisoes/](livro-arquitetura/decisoes/).
