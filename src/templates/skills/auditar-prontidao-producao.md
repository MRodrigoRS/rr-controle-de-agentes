---
name: auditar-prontidao-producao
description: Checklist pré-deploy — ambiente, build, segurança, resiliência, banco, monitoramento, performance e conformidade.
---

# Skill: Auditar Prontidão para Produção

> Prepara o sistema para deploy em produção. Deve ser executada antes do
> primeiro deploy e após cada sprint que toque infraestrutura, segurança
> ou dependências externas.

## Como Executar

1. Percorra todas as categorias abaixo
2. Para cada item, marque **OK**, **Bloqueante**, **Recomendado** ou **N/A**
3. Gere relatório em `governanca/relatorios/prontidao-producao.md`
4. Corrija todos os itens **Bloqueantes** antes do deploy
5. **Execute a skill [auditar-textos-usuario.md](auditar-textos-usuario.md)** — garanta que nada de
   jargão técnico ou contatos/valores fictícios irá a público no que o cliente vê
6. Apresente o relatório ao usuário com as ações tomadas

---

## 1. Ambiente e Configuração

- [ ] `.env.example` existe e documenta todas as variáveis com descrição
- [ ] Nenhum segredo real está no repositório (chaves, tokens, senhas no source)
- [ ] `.env` está em `.gitignore` e o `.env.example` não contém valores reais
- [ ] URLs de APIs externas no código apontam para produção (não localhost)
- [ ] Configurações por ambiente (`development`, `production`) são coerentes

## 2. Build e Deploy

- [ ] Build passa sem erros **e sem warnings**
- [ ] Script de deploy documentado (ou CI/CD configurado)
- [ ] Bundle analisado: sem duplicação, tree-shaking ativo, code splitting onde cabe
- [ ] `npm audit` (ou equivalente) **zero** vulnerabilidades críticas/altas
- [ ] Dependências fixadas (sem `^`/`~` que quebram em produção)
- [ ] Dependências não utilizadas ou devDependencies em produção?

## 3. Segurança

- [ ] Headers de segurança presentes (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] CORS configurado com origens específicas (nunca `*` em produção)
- [ ] Rate limiting ativo em endpoints críticos (login, API)
- [ ] Autenticação e autorização verificadas em **toda** rota/endpoint
- [ ] Inputs validados e sanitizados (XSS, SQL injection, command injection)
- [ ] Nenhuma informação sensível em logs, mensagens de erro ou stack traces

## 4. Resiliência e Tratamento de Erros

- [ ] Páginas de erro customizadas (404, 500) sem stack trace
- [ ] Timeouts configurados em chamadas externas (fetch, banco, fila)
- [ ] Retry com backoff para operações críticas (envio de email, pagamento)
- [ ] Fallback para modo offline/read se serviço externo falhar
- [ ] Graceful shutdown: o app trata SIGTERM sem perder requisições

## 5. Banco de Dados

- [ ] Migrações aplicáveis com estratégia de rollback documentada
- [ ] Índices nos campos de busca/filtro frequentes
- [ ] Backups automáticos configurados e com restauração testada
- [ ] Pool de conexões configurado (não ilimitado)
- [ ] Sem queries N+1 nos endpoints de listagem principais

## 6. Monitoramento e Operações

- [ ] Endpoint de health check (`/api/health`) implementado
- [ ] Logging estruturado (JSON) com níveis (info, warn, error)
- [ ] Logs de erro com stack trace capturados em produção
- [ ] Métricas básicas (tempo de resposta por rota, taxa de erro, uptime)
- [ ] Alerta configurado para falhas críticas (500, downtime)

## 7. Performance

- [ ] Cache headers configurados para assets estáticos (JS, CSS, imagens)
- [ ] Compressão ativa (gzip/brotli)
- [ ] Imagens otimizadas (lazy loading, formato moderno, dimensões corretas)
- [ ] LCP, FID, CLS dentro do aceitável (Core Web Vitals ≥ 90%)
- [ ] API responde em < 200ms nos endpoints principais (sem carga)

## 8. Documentação e Conformidade

- [ ] `governanca/livro-arquitetura/` reflete a stack real de produção
- [ ] URLs de produção documentadas (domínio, painel admin, API)
- [ ] Contato de emergência documentado (quem chamar se o sistema cair)
- [ ] Termos de uso / política de privacidade visíveis (se aplicável)
- [ ] README com instruções mínimas para um operador noturno

---

## Saída

Gere o relatório em `governanca/relatorios/auditoria-producao.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para itens que impedem o deploy (build quebrado, segredo
  exposto, sem health check, CORS `*`)
- Use `[REC]` para itens com alto impacto mas sem bloqueio
  (dependências não fixadas, sem rate limiting, sem backups)
- Use `[SUG]` para itens desejáveis mas não urgentes
  (compressão, Core Web Vitals, PWA)

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint com etapas
por severidade. Cada checklist da auditoria que não passou deve virar
uma tarefa concreta na etapa correspondente.
