# Skill: Auditar Comercialização

> Audita minuciosamente a camada de pagamento e comercialização do sistema.
> Onde um erro custa dinheiro real — centavo duplicado, webhook não
> verificado, estado de pedido inconsistente.

## Quando Executar

- **Antes de ativar pagamentos reais** (trocar `sk_test_` por `sk_live_`)
- **Após integrar um novo provedor** (Stripe, Mercado Pago, PayPal, etc.)
- **Antes de campanhas de alto volume** (Black Friday, lançamento)
- **Sempre que o usuário solicitar** auditoria de comercialização

## Categorias de Análise

### 1. Segurança

- [ ] Dados brutos de cartão **nunca** trafegam pelo servidor próprio —
  tokenização é feita no frontend com SDK do provedor (Stripe Elements,
  Mercado Pago Checkout, etc.)
- [ ] **Chave secreta** (`sk_live_`, `access_token`) nunca está no source
  — apenas em variável de ambiente
- [ ] **Chave de teste** (`sk_test_`) nunca é usada em produção
- [ ] Webhooks têm **verificação de assinatura** ativa
  (`stripe.webhooks.constructEvent()`, `x-signature` no Mercado Pago)
- [ ] **Idempotência** em toda requisição de cobrança — `Idempotency-Key`
  ou `X-Idempotency-Key` para evitar cobrança dupla em retry

### 2. Fluxos e Estados

- [ ] Máquina de estados documentada e implementada no backend:
  `pending → processing → completed / failed / refunded / disputed`
- [ ] **Transições proibidas** são rejeitadas (ex: `failed` não pode ir
  direto para `completed` sem nova cobrança)
- [ ] Webhook trata **todos os eventos relevantes do provedor** —
  não só `payment_intent.succeeded`:
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `charge.refunded` / `charge.partially_refunded`
  - `dispute.created` / `dispute.closed`
- [ ] **Reconciliação:** o estado no banco local bate com o estado no
  provedor? Existe job de reconciliação?
- [ ] Webhooks tratam **eventos duplicados** corretamente (idempotência
  por `event.id`)
- [ ] Webhooks fora de ordem são tratados (ex: `refunded` chega antes
  de `completed` em casos extremos)

### 3. Resiliência

- [ ] Timeout configurado em chamadas ao provedor (máx. 10-15s)
- [ ] **Retry com backoff** para falhas de rede/5xx do provedor (Stripe
  recomenda exponential backoff com jitter)
- [ ] **Graceful degradation:** se o provedor estiver offline, o usuário
  vê mensagem clara — não um stack trace
- [ ] **Fila de reconciliação:** webhooks perdidos ou falhos entram em
  fila para reprocessamento?
- [ ] O sistema sobrevive a um **burst de webhooks** (ex: 500 pagamentos
  em 5 minutos após campanha)

### 4. Lógica de Negócio

- [ ] **Cálculo de valores no backend**, nunca no frontend —
  o cliente não decide quanto paga
- [ ] Impostos, descontos e frete são calculados e exibidos
  transparentemente antes da cobrança
- [ ] **Refund parcial vs. total:** o sistema distingue e ajusta estoque
  corretamente
- [ ] **Estorno:** o valor retorna ao meio de pagamento original
- [ ] **Assinaturas** (se aplicável):
  - [ ] Trial → cobrança automática funciona
  - [ ] Upgrade/downgrade proporcional calculado corretamente
  - [ ] Cancelamento não cobra o próximo ciclo
  - [ ] Renovação falha: notifica usuário e retenta (não cancela
    silenciosamente)
- [ ] **Comprovantes:** email de recibo/nota fiscal enviado após
  pagamento confirmado
- [ ] **Chargeback:** alerta imediato para operador + bloqueio de
  novo pedido do mesmo cliente até resolução

### 5. Testabilidade

- [ ] **Modo sandbox/teste** configurável por variável de ambiente
- [ ] Webhooks **simuláveis localmente** (Stripe CLI, cards de teste
  do Mercado Pago, ngrok/webhook.site)
- [ ] **Fixture de respostas do provedor** para testes unitários
  (mock do SDK, não chamada real)
- [ ] Testes cobrem: pagamento aprovado, pagamento recusado, webhook
  duplicado, refund, disputa, timeout

---

## Saída

Gere o relatório em `governanca/relatorios/auditoria-comercializacao.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para itens que **custam dinheiro real se falharem**:
  cobrança dupla, webhook sem assinatura, segredo exposto, chave de
  teste em produção
- Use `[REC]` para itens de alto impacto: reconciliação ausente,
  estados de pedido inconsistentes, timeout sem retry
- Use `[SUG]` para melhorias: fixture de testes, documentação de
  fluxos de estorno, PIX/boleto como fallback

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint com etapas
por severidade. Cada item do checklist que não passou deve virar uma
tarefa concreta na etapa correspondente.
