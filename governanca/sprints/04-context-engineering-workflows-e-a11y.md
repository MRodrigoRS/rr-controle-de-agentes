---
status: pendente
ultima_modificacao: 2026-10-06
sessao_atual: 0
---

# Sprint 04: Ergonomia dos Workflows, Context Engineering e Acessibilidade (a11y) — rr-controle-de-agentes-1.1

**Objetivo:** Otimizar o consumo de tokens e a atenção dos agentes estabelecendo orçamentos rígidos de contexto (blindagem contra truncamento silencioso de 32 KiB do Codex), eliminar becos sem saída nos workflows guiando a autonomia contínua, instituir rigor visual no fast-track `/fix`, padronizar acessibilidade nativa (WCAG 2.1 AA) no frontend e reconciliar o Livro de Arquitetura com o código real da progenitora.

---

## Etapas

### Etapa 1: Context Engineering & Orçamento Rígido no `AGENTS.md`
**Objetivo:** Proteger a governança contra a perda silenciosa de regras no OpenAI Codex (teto de 32 KiB) e evitar dispersão de atenção dos modelos com arquivos de raiz inchados.
**Tarefas:**
- [ ] Atualizar [governanca/AGENTS.md](governanca/AGENTS.md) e [src/templates/AGENTS.md](src/templates/AGENTS.md):
  - Estabelecer a cláusula formal de **Orçamento Máximo de Contexto**: o arquivo `AGENTS.md` da raiz nunca deve ultrapassar 150 linhas (ou ~12 KB), reservando espaço estrito para regras pétreas, princípios de não-reinvenção e ponteiros operacionais.
  - Adotar o princípio de **Progressive Disclosure**: manuais profundos (`padroes/`), procedimentos (`workflows/`) e habilidades técnicas (`skills/`) devem ser consultados estritamente sob demanda (*just-in-time*), nunca carregados em bloco na inicialização.
  - Mover trechos prolixos e descrições detalhadas de comandos para os manuais de referência em `padroes/`.
**Critérios de Aceite:**
- [ ] `AGENTS.md` com menos de 150 linhas, objetivo, denso em autoridade e sem prolixidade.

### Etapa 2: Encadeamento Contínuo dos Workflows (Eliminação de Becos Sem Saída)
**Objetivo:** Garantir que todo fluxo operacional guie o agente diretamente para a próxima etapa, sem paradas desnecessárias ou dúvidas de "o que fazer agora".
**Tarefas:**
- [ ] Adicionar a seção explícita **Próximo Passo Recomendado** ao final dos seguintes workflows em `governanca/workflows/` (e templates equivalentes):
  - `spec.md`: *"Próximo passo: execute `/plan` para decompor a especificação em sprints executáveis."*
  - `plan.md`: *"Próximo passo: execute `/implement` após a aprovação formal do usuário no Gate 1."*
  - `research.md`: *"Próximo passo: execute `/spec` para novos requisitos ou retorne a `/plan`/`/implement` para integrar os achados."*
  - `review.md`: *"Próximo passo: retorne a `/implement` para validação final no Gate 2 e aprovação do commit."*
  - `release.md`: *"Próximo passo: gerar tag Git correspondente (`vX.Y.Z`) e registrar resumo no `CHANGELOG.md`."*
- [ ] Atualizar o encerramento de [governanca/VINCULAR.md](governanca/VINCULAR.md) orientando a transição imediata para a Sprint 1 ou execução de `/status`.
**Critérios de Aceite:**
- [ ] Nenhum workflow terminando abruptamente; jornada 100% encadeada de ponta a ponta.

### Etapa 3: Rigor Visual no Fast-Track (`/fix`) e Trava em `/test`
**Objetivo:** Evitar commits cosméticos às cegas no `/fix` e loops infinitos de refatoração no `/test`.
**Tarefas:**
- [ ] Atualizar [governanca/workflows/fix.md](governanca/workflows/fix.md):
  - Adicionar aos critérios de conclusão: `- Evidência visual (screenshot/print) obrigatória caso o ajuste envolva telas, componentes visuais ou regras de CSS.`
- [ ] Atualizar [governanca/workflows/test.md](governanca/workflows/test.md):
  - Estabelecer teto de tentativas: em caso de testes falhando, o agente tem o limite de até **3 tentativas estruturadas** de correção; caso os testes persistam falhando, o agente deve interromper o loop, diagnosticar o erro ao usuário e solicitar alinhamento antes de novas mutações.
**Critérios de Aceite:**
- [ ] `/fix` exigindo evidência visual para UI; `/test` com trava contra loops infinitos de tentativas.

### Etapa 4: Padrão Nativo de Acessibilidade (WCAG 2.1 AA) no Frontend
**Objetivo:** Elevar a qualidade de interfaces criadas pelo estúdio sem instalar bibliotecas pesadas de acessibilidade, usando boas práticas nativas de HTML e CSS.
**Tarefas:**
- [ ] Atualizar [governanca/padroes/frontend.md](governanca/padroes/frontend.md) e template com a seção **Acessibilidade Nativa & Usabilidade Universal (WCAG 2.1 AA)**:
  - *HTML Semântico:* Uso obrigatório de `<button>` para ações e `<a>` para navegação (proibido `<div onClick>`); labels associados a inputs (`<label htmlFor>`).
  - *Navegação por Teclado & Foco:* Foco visível preservado em elementos interativos (`focus-visible`); fechamento de modais via tecla `Escape` e armadilha de foco (*focus trap*) dentro do modal aberto.
  - *Feedback Dinâmico:* Uso de `aria-live="polite"` em toasts e mensagens dinâmicas de erro/sucesso.
  - *Contraste e Dimensões Mobile:* Contraste mínimo de 4.5:1 para textos normais e alvos de toque (*touch targets*) de no mínimo 44x44px em mobile.
**Critérios de Aceite:**
- [ ] Manual `frontend.md` com checklist prático e nativo de acessibilidade.

### Etapa 5: Reconciliação do Livro de Arquitetura da Matriz com o Código Vivo
**Objetivo:** Eliminar dados em branco e tabelas sintéticas do livro de arquitetura da Matriz, tornando-o um espelho real da aplicação `rr-controle-de-agentes-1.1`.
**Tarefas:**
- [ ] Atualizar [governanca/livro-arquitetura/01-visao-geral.md](governanca/livro-arquitetura/01-visao-geral.md): corrigir títulos duplicados e documentar a proposta do sistema web de governança.
- [ ] Atualizar [governanca/livro-arquitetura/02-stack.md](governanca/livro-arquitetura/02-stack.md): remover a referência a `@supabase/ssr`, calibrando a stack com Node.js + Hono, Next.js 16, Prisma e SQLite local (`rr.db`).
- [ ] Atualizar [governanca/livro-arquitetura/03-logica-do-sistema.md](governanca/livro-arquitetura/03-logica-do-sistema.md): documentar as regras reais de geração, sincronização essencial/total e cálculo de integridade.
- [ ] Atualizar [governanca/livro-arquitetura/04-comportamento-autonomo.md](governanca/livro-arquitetura/04-comportamento-autonomo.md): inserir metadados de cabeçalho e documentar os scripts portáteis (`sincronizar.mjs`, `ui.mjs`, `harness.mjs`).
- [ ] Atualizar [governanca/livro-arquitetura/05-modelo-de-dados.md](governanca/livro-arquitetura/05-modelo-de-dados.md): preencher com as tabelas reais do SQLite (`projetos`, `tecnologias`, `presets`, `historico`).
**Critérios de Aceite:**
- [ ] Livro de arquitetura (volumes 01 a 05) 100% preenchido com dados reais do repositório.

---

## Andamento

- [ ] Etapa em andamento
- [ ] Testes passando
- [ ] Código revisado

---

## Instruções ao Agente

1. **Gate 1 — aprovação do plano:** Apresente ao usuário as 5 etapas de ergonomia, context engineering e livro de arquitetura.
2. Mantenha os manuais concisos e voltados à prática, sem textos acadêmicos ou excesso de teoria.
3. Assegure que o livro de arquitetura reflita o estado real do código vivo.
4. **Gate 2 — aprovação da entrega:** Apresente resumo e evidências antes do commit final.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-04: context engineering no AGENTS.md, encadeamento de workflows, acessibilidade WCAG e livro de arquitetura
```

---

## Roteiro de Verificação

1. Verificar que `governanca/AGENTS.md` possui menos de 150 linhas e leitura fluida.
2. Inspecionar `governanca/workflows/spec.md`, `plan.md` e `review.md` e conferir a presença das chamadas para o "Próximo Passo".
3. Abrir `governanca/padroes/frontend.md` e verificar os padrões de HTML semântico, teclado e ARIA.
4. Ler `governanca/livro-arquitetura/05-modelo-de-dados.md` e confirmar a documentação real do schema SQLite.
5. Executar `npm test` para assegurar integridade total de links e templates.

---

## Evidências

- [ ] `AGENTS.md` sob orçamento estrito (< 150 linhas)
- [ ] Workflows encadeados sem becos sem saída
- [ ] `npm test` 100% verde
- [ ] Livro de arquitetura reconciliado

## Limitações

- A validação de contraste e teclado deve ser conferida na UI real em conjunto com o usuário durante testes manuais de interface.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
