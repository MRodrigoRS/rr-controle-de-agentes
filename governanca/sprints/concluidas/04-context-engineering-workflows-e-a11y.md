---
status: concluida
ultima_modificacao: 2026-10-06
sessao_atual: 1
---

# Sprint 04: Ergonomia dos Workflows, Context Engineering e Usabilidade Nativa — rr-controle-de-agentes-1.1

**Objetivo:** Otimizar o consumo de tokens e a atenção dos agentes estabelecendo orçamentos rígidos de contexto (blindagem contra truncamento silencioso de 32 KiB do Codex), eliminar becos sem saída nos workflows guiando a autonomia contínua, instituir validação humana de telas no fast-track `/fix`, padronizar ergonomia e usabilidade nativa (zero-bloat) no frontend e reconciliar o Livro de Arquitetura com o código real da aplicação.

---

## Etapas

### Etapa 1: Context Engineering & Orçamento Rígido no `AGENTS.md`
**Objetivo:** Proteger a governança contra a perda silenciosa de regras no OpenAI Codex (teto de 32 KiB) e evitar dispersão de atenção dos modelos com arquivos de raiz inchados.
**Tarefas:**
- [x] Atualizar [governanca/AGENTS.md](../AGENTS.md) e [src/templates/AGENTS.md](../../src/templates/AGENTS.md):
  - Estabelecer a cláusula formal de **Orçamento Máximo de Contexto**: o arquivo `AGENTS.md` da raiz nunca deve ultrapassar 150 linhas (ou ~12 KB), reservando espaço estrito para regras pétreas, princípios de não-reinvenção e ponteiros operacionais.
  - Adotar o princípio de **Progressive Disclosure**: manuais profundos (`padroes/`), procedimentos (`workflows/`) e habilidades técnicas (`skills/`) devem ser consultados estritamente sob demanda (*just-in-time*), nunca carregados em bloco na inicialização.
  - Mover trechos prolixos e descrições detalhadas de comandos para os manuais de referência em `padroes/`.
**Critérios de Aceite:**
- [x] `AGENTS.md` com menos de 150 linhas (reduzido para 97 linhas / ~6.8 KB), objetivo, denso em autoridade e sem prolixidade.

### Etapa 2: Encadeamento Contínuo dos Workflows (Eliminação de Becos Sem Saída)
**Objetivo:** Garantir que todo fluxo operacional guie o agente diretamente para a próxima etapa, sem paradas desnecessárias ou dúvidas de "o que fazer agora".
**Tarefas:**
- [x] Adicionar a seção explícita **Próximo Passo Recomendado** ao final dos seguintes workflows em `governanca/workflows/` (e templates equivalentes em `src/templates/workflows/`):
  - `spec.md`: *"Próximo passo: execute `/plan` para decompor a especificação em sprints executáveis."*
  - `plan.md`: *"Próximo passo: apresente o plano ao usuário para aprovação no Gate 1 e execute `/implement`."*
  - `research.md`: *"Próximo passo: execute `/spec` para novos requisitos ou retorne a `/plan`/`/implement` para integrar os achados."*
  - `implement.md`: *"Próximo passo: execute `/review` para validação adversarial pré-Gate 2 e `/status` após o commit."*
  - `review.md`: *"Próximo passo: se aprovado, apresente evidências no Gate 2, registre changelog e faça commit; se houver falhas, retorne a `/implement`."*
  - `release.md`: *"Próximo passo: oficializar versão no `CHANGELOG.md` da raiz e da governança, gerar tag Git (`vX.Y.Z`) e atualizar `SESSAO.md`."*
- [x] Atualizar o encerramento de [governanca/VINCULAR.md](../VINCULAR.md) (e template) orientando a transição imediata para a Sprint 1 via `/status`.
**Critérios de Aceite:**
- [x] Nenhum workflow terminando abruptamente; jornada 100% encadeada de ponta a ponta.

### Etapa 3: Rigor Visual no Fast-Track (`/fix`) e Trava em `/test`
**Objetivo:** Evitar commits cosméticos às cegas no `/fix` e loops infinitos de refatoração no `/test`.
**Tarefas:**
- [x] Atualizar [governanca/workflows/fix.md](../workflows/fix.md) e template:
  - Adicionar aos critérios de conclusão: caso a correção envolva telas, componentes de interface ou regras de CSS, o agente **não deve tentar escanear a tela de forma autônoma**; o agente deve especificar detalhadamente ao usuário **o que foi alterado, em qual rota/tela testar e o que se espera observar**, aguardando a confirmação visual explícita do usuário antes de avançar para o commit.
- [x] Atualizar [governanca/workflows/test.md](../workflows/test.md) e template:
  - Estabelecer teto de tentativas: em caso de testes falhando, o agente tem o limite de até **3 tentativas estruturadas** de correção; caso os testes persistam falhando, o agente deve interromper o loop, diagnosticar o erro ao usuário e solicitar alinhamento antes de novas mutações.
**Critérios de Aceite:**
- [x] `/fix` exigindo descrição detalhada e validação humana explícita para alterações de UI; `/test` com trava formal contra loops infinitos de tentativas.

### Etapa 4: Usabilidade Prática e Ergonomia de Interface (Zero-Bloat)
**Objetivo:** Garantir código limpo e experiência fluida para qualquer usuário no desktop e mobile sem inchar o código com bibliotecas externas de acessibilidade ou ARIA redundante.
**Tarefas:**
- [x] Atualizar [governanca/padroes/frontend.md](../padroes/frontend.md) e template com a seção **7. Usabilidade Nativa e Ergonomia de Interface (Zero-Bloat)**:
  - *HTML Semântico (Código Menor):* Uso obrigatório de `<button>` para ações e `<a>` para navegação em vez de `<div onClick>` com listeners manuais de clique/teclado. Tags nativas reduzem código JS e já vêm com suporte nativo do navegador.
  - *Interações Intuitivas:* Modais, gavetas (*drawers*) e menus flutuantes devem fechar nativamente com a tecla `Escape` (ESC).
  - *Alvos de Toque no Mobile:* Botões e links clicáveis em interfaces mobile devem possuir área confortável de toque (mínimo de ~40-44px), evitando toques acidentais ou cliques errados.
  - *Legibilidade e Contraste:* Garantir que textos e ícones tenham contraste visual nítido contra o fundo (evitando tons de cinza lavados que dificultam leitura).
  - *Zero Inchaço:* Proibição de inclusão de pacotes pesados de acessibilidade ou atributos complexos e redundantes sem demanda real.
**Critérios de Aceite:**
- [x] Padrão de engenharia limpa em `frontend.md` documentando usabilidade natural, sem dependências adicionais e sem inflar o código.

### Etapa 5: Reconciliação do Livro de Arquitetura da Matriz com o Código Vivo
**Objetivo:** Eliminar dados em branco e tabelas sintéticas do livro de arquitetura da Matriz, tornando-o um espelho real da aplicação `rr-controle-de-agentes-1.1`.
**Tarefas:**
- [x] Atualizar [governanca/livro-arquitetura/01-visao-geral.md](../livro-arquitetura/01-visao-geral.md): documentar a visão, papéis e estrutura física real do repositório.
- [x] Atualizar [governanca/livro-arquitetura/02-stack.md](../livro-arquitetura/02-stack.md): remover Prisma e Supabase e detalhar as 12 ferramentas contratadas e em execução (Next.js 16, React 19, Tailwind CSS 4, SQLite nativo WAL `node:sqlite`, Hono, Biome, Vitest).
- [x] Atualizar [governanca/livro-arquitetura/03-logica-do-sistema.md](../livro-arquitetura/03-logica-do-sistema.md): documentar as 6 regras de negócio reais (RN-01 a RN-06), fluxos de dados, máquina de estados e rotas REST da API.
- [x] Atualizar [governanca/livro-arquitetura/04-comportamento-autonomo.md](../livro-arquitetura/04-comportamento-autonomo.md): documentar rotinas autônomas de banco (WAL, auto-migration, auto-seed), qualidade em CI e guardrails de sessão.
- [x] Atualizar [governanca/livro-arquitetura/05-modelo-de-dados.md](../livro-arquitetura/05-modelo-de-dados.md): preencher com as tabelas reais do SQLite (`tecnologias`, `projetos`, `metricas_git`) com diagrama Mermaid ERD completo e catálogo de colunas.
**Critérios de Aceite:**
- [x] Livro de arquitetura (volumes 01 a 05) 100% preenchido com dados reais do repositório.

---

## Andamento

- [x] Etapa 1: Context Engineering no `AGENTS.md` concluída
- [x] Etapa 2: Encadeamento de Workflows concluída
- [x] Etapa 3: Rigor Visual no `/fix` e Trava no `/test` concluída
- [x] Etapa 4: Usabilidade Nativa Zero-Bloat concluída
- [x] Etapa 5: Reconciliação do Livro de Arquitetura concluída
- [x] Testes passando (873 links Markdown locais íntegros, 61 templates válidos)
- [x] Build de produção limpo (`npm run build`)
- [x] Scanner de segredos limpo (177 arquivos auditados)

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-04: context engineering no AGENTS.md, encadeamento de workflows, ergonomia nativa e livro de arquitetura
```

---

## Roteiro de Verificação

1. Verificar que `governanca/AGENTS.md` possui 97 linhas (menos de 150 linhas) e leitura fluida e densa.
2. Inspecionar `governanca/workflows/spec.md`, `plan.md`, `implement.md`, `review.md`, `release.md`, `fix.md` e `test.md` e conferir as chamadas para o "Próximo Passo Recomendado".
3. Abrir `governanca/padroes/frontend.md` e verificar a seção 7 de Usabilidade Nativa (zero-bloat, tags nativas, ESC, touch targets ~44px).
4. Ler `governanca/livro-arquitetura/05-modelo-de-dados.md` e confirmar a documentação real do schema SQLite (`tecnologias`, `projetos`, `metricas_git`).
5. Executar `npm test` para assegurar integridade total de links e templates.
6. Executar `npm run build` para garantir a compilação de produção sem quebras.

---

## Evidências

- [x] `AGENTS.md` sob orçamento estrito: 97 linhas (~6.8 KB) contra o teto de 150 linhas (~12 KB).
- [x] Workflows encadeados sem becos sem saída: seção `## Próximo Passo Recomendado` em todos os fluxos.
- [x] Fast-Track `/fix` com validação humana mandatória para UI e `/test` com trava de até 3 tentativas.
- [x] Seção de Usabilidade Nativa em `padroes/frontend.md` focada em engenharia limpa sem inchaço.
- [x] Volumes 01 a 05 do Livro de Arquitetura totalmente reconciliados com a stack viva.
- [x] `npm test` verde: 61 templates aprovados, 27 presets e 27 wrappers do harness íntegros, 873 links verificados.
- [x] `verificar-segredos.mjs --all`: 177 arquivos verificados com zero segredos.
- [x] `npm run build`: compilado com sucesso com Next.js 16 / Turbopack.

## Limitações

- A validação visual subjetiva de novas telas deve sempre ser acompanhada diretamente pelo usuário no navegador local (`npm run dev` ou `npm run rr:ui`).

---

*Documento mantido e reconciliado conforme os padrões da RR Tech Studio.*
