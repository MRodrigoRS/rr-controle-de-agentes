---
status: pendente
ultima_modificacao: 2026-10-06
sessao_atual: 0
---

# Sprint 02: Blindagem Agêntica e Segurança Moderna (OWASP 2026 & Zero-Trust) — rr-controle-de-agentes-1.1

**Objetivo:** Elevar a postura de segurança da governança e dos projetos para o estado da arte de 2026, implementando proteções contra manipulação de agentes (OWASP Agentic Top 10), barreiras mecânicas contra vazamento de segredos (Gitleaks), cabeçalhos defensivos no backend (Strict CSP / Rate Limiting) e política rigorosa de menor privilégio para ferramentas e MCPs.

---

## Etapas

### Etapa 1: OWASP Top 10 for Agentic Applications 2026 (ASI01–ASI07)
**Objetivo:** Blindar os agentes contra ataques de injeção indireta, sequestro de objetivos e poluição de memória ao interagir com ferramentas e APIs externas.
**Tarefas:**
- [ ] Atualizar [governanca/padroes/backend.md](governanca/padroes/backend.md) e [src/templates/padroes/backend.md](src/templates/padroes/backend.md) incluindo uma seção dedicada a **Segurança Agêntica & Interfaces de IA**:
  - *ASI01 (Goal Hijacking):* Regra mandatória de que prompts ou saídas retornadas por ferramentas externas, banco de dados ou web scraping são estritamente tratados como dados não-confiáveis, nunca como instruções executáveis.
  - *ASI02 (Tool Misuse / Poisoning):* Proibição de ferramentas externas sobreporem parâmetros de controle ou regras pétreas do sistema.
  - *ASI06 (Memory/Context Poisoning):* Blindagem das anotações persistentes (`SESSAO.md`) contra injeção cega de dados de terceiros.
- [ ] Atualizar [governanca/skills/usar-harness-do-agente.md](governanca/skills/usar-harness-do-agente.md) detalhando a postura operacional defensiva do agente contra injeção indireta de prompts.
**Critérios de Aceite:**
- [ ] Diretrizes de Zero-Trust de Contexto formalizadas nos padrões de backend e nas skills do harness.

### Etapa 2: Barreira Determinística contra Vazamento de Segredos (Gitleaks)
**Objetivo:** Impedir que chaves de API, senhas ou tokens sensíveis sejam acidentalmente comitados no Git por humanos ou agentes de IA.
**Tarefas:**
- [ ] Criar um script utilitário portátil em Node.js nativo: `governanca/scripts/verificar-segredos.mjs` (com cópia em `src/templates/scripts/verificar-segredos.mjs`).
  - O script verifica se o executável `gitleaks` está disponível no ambiente e executa a varredura nos arquivos staged (`git diff --staged`); caso ausente, executa um escaneamento leve por regex nativo procurando padrões conhecidos (chaves OpenAI, Anthropic, Stripe, AWS, certificados privados e atribuições `.env`).
- [ ] Atualizar [governanca/skills/auditar-prontidao-producao.md](governanca/skills/auditar-prontidao-producao.md) e [governanca/skills/auditar-repositorio.md](governanca/skills/auditar-repositorio.md), incluindo a execução obrigatória do `verificar-segredos.mjs` no checklist pré-deploy.
**Critérios de Aceite:**
- [ ] Script `verificar-segredos.mjs` testado com arquivos simulados contendo chaves fictícias, bloqueando com sucesso com código de saída != 0.
- [ ] Checklist de prontidão para produção exigindo varredura limpa de segredos.

### Etapa 3: Defesa em Profundidade no Backend (Strict CSP & Rate Limiting)
**Objetivo:** Padronizar defesas ativas de rede e cabeçalhos HTTP nos manuais de engenharia para projetos web.
**Tarefas:**
- [ ] Atualizar [governanca/padroes/backend.md](governanca/padroes/backend.md) com a subseção **Cabeçalhos Defensivos e Infraestrutura HTTP**:
  - *Strict CSP:* Uso mandatório de Content Security Policy com nonce ou hash criptográfico e diretiva `strict-dynamic`, bloqueando injeções inline não autorizadas (`object-src 'none'`, `base-uri 'none'`).
  - *Cabeçalhos Mandatórios:* `Strict-Transport-Security (HSTS)`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - *Rate Limiting Obrigatório:* Limitação de taxa de requisições por IP ou conta em endpoints de login, recuperação de senha, geração de tokens e webhooks sensíveis.
- [ ] Atualizar a checklist de segurança de [governanca/skills/auditar-prontidao-producao.md](governanca/skills/auditar-prontidao-producao.md) para auditar a presença desses cabeçalhos e do rate limiting.
**Critérios de Aceite:**
- [ ] Padrões de cabeçalhos e rate limiting documentados com clareza em `backend.md`.

### Etapa 4: Política de MCP Mínimo e Proteção contra Tool Poisoning
**Objetivo:** Garantir que conexões via Model Context Protocol (MCP) sigam a política de menor privilégio e não introduzam vulnerabilidades no ambiente de desenvolvimento.
**Tarefas:**
- [ ] Atualizar [governanca/skills/configurar-harness.md](governanca/skills/configurar-harness.md) e [governanca/skills/usar-harness-do-agente.md](governanca/skills/usar-harness-do-agente.md):
  - Estabelecer a regra de *Allowlist Explícita*: nenhum MCP deve ser configurado sem justificativa direta fundamentada na stack do [02-stack.md](governanca/livro-arquitetura/02-stack.md).
  - Padrão *Read-Only First*: servidores MCP que conectam a bancos de dados ou sistemas externos devem iniciar configurados em modo somente-leitura.
  - Aprovação humana obrigatória antes de qualquer ação destrutiva via MCP (escrita, deleção, deploy).
**Critérios de Aceite:**
- [ ] Regras de governança de MCP formalizadas nas skills do harness.

---

## Andamento

- [ ] Etapa em andamento
- [ ] Testes passando
- [ ] Código revisado

---

## Instruções ao Agente

1. **Gate 1 — aprovação do plano:** Apresente ao usuário as 4 etapas de blindagem e segurança. Só execute após confirmação.
2. Não introduza dependências externas pesadas no repositório; prefira regras prescritivas nos manuais Markdown e scripts utilitários em Node.js nativo.
3. Teste o script de segredos com fixtures locais antes de concluir.
4. **Gate 2 — aprovação da entrega:** Apresente evidências, limitações e roteiro de verificação para o usuário autorizar o commit.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-02: blindagem agentica OWASP 2026, verificacao de segredos e defesa em profundidade
```

---

## Roteiro de Verificação

1. Executar `node governanca/scripts/verificar-segredos.mjs` no repositório limpo e confirmar saída verde (nenhum segredo detectado).
2. Criar um arquivo temporário com uma string fictícia de chave Stripe (`sk_test_...`) e rodar o script, confirmando que ele detecta e alerta com erro.
3. Abrir `governanca/padroes/backend.md` e verificar se as seções de OWASP Agentic, Strict CSP e Rate Limiting estão presentes e legíveis.
4. Executar `npm test` para assegurar que nenhum link quebrou.

---

## Evidências

- [ ] Script `verificar-segredos.mjs` executado e aprovado
- [ ] `npm test` passando com 100% dos links íntegros
- [ ] Manuais atualizados com OWASP 2026 e Strict CSP

## Limitações

- O script de verificação de segredos analisa diffs locais; o rastreamento em repositórios remotos contínuos requer integração futura com GitHub Secret Scanning no CI.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
