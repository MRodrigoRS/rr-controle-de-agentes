# Skill: Manter Contexto

> Orienta o agente a gerenciar seu próprio contexto entre sessões de trabalho,
> maximizando a continuidade e minimizando a perda de informação.

## Ao Final de Cada Sessão

1. **Atualize o front-matter da sprint atual:**
   ```yaml
   status: em_andamento
   ultima_modificacao: 2026-07-13
   sessao_atual: 3
   ```

2. **Marque exatamente onde parou** no corpo da sprint:
   ```markdown
   - [x] Etapa 1 concluída
   - [ ] Etapa 2 ← estou aqui
   ```

3. **Escreva o resumo da sessão** nas notas persistentes do `AGENTS.md`:
   ```
   === INÍCIO DAS NOTAS PERSISTENTES DO AGENTE ===

   Sprint ativa: 02-importacao.md

   Sessão 3 (13/07):
   - Implementei a autenticação JWT
   - Decisão: usar bcrypt em vez de argon2 por simplicidade
   - Próximo passo: middleware de autorização
   - Bloqueio: aguardando usuário definir roles

   === FIM DAS NOTAS PERSISTENTES DO AGENTE ===
   ```

   A primeira linha das notas (após a marca de início) deve sempre conter a
   **sprint ativa atual** no formato `Sprint ativa: NN-titulo.md`.
   Isso permite que qualquer agente, em qualquer sessão, saiba exatamente
   qual sprint está em andamento sem precisar escanear todos os arquivos.

4. **Arquive sprints concluídas** (veja `arquivar-sprints.md`)

## Ao Iniciar uma Nova Sessão

1. Leia o `AGENTS.md` — foque nas notas persistentes
2. Identifique a **sprint ativa** pela linha `Sprint ativa:` nas notas
3. Abra o arquivo da sprint — o front-matter diz onde está
4. Procure por `← estou aqui` para retomar exatamente

## Formato do Resumo de Sessão

Seja conciso. Use bullet points:

```
Sessão N (data):
- O que foi feito
- Decisões tomadas
- Próximos passos
- Bloqueios (se houver)
```
