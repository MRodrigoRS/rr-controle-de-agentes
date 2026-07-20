# Auditoria: [NOME] — [DATA]

**Projeto:** {{nomeProjeto}}
**Severidade:** Bloqueantes X | Recomendações Y | Sugestões Z

---

## Resumo

| Severidade | Quantidade |
|------------|------------|
| Bloqueantes | X |
| Recomendações | Y |
| Sugestões | Z |

---

## Bloqueantes

*Itens que impedem o deploy ou representam risco crítico de segurança,
dados ou estabilidade.*

### [BLOQ] Título curto e descritivo

- **Local:** `src/path/arquivo.ts:42`
- **Problema:** o que está errado e qual o risco concreto
- **Correção:** como resolver (passo a passo se necessário)

### [BLOQ] Título curto e descritivo

- **Local:** `src/path/arquivo.ts:42`
- **Problema:**
- **Correção:**

---

## Recomendações

*Itens importantes que devem ser resolvidos na sprint atual ou na próxima.*

### [REC] Título curto e descritivo

- **Local:** `src/path/arquivo.ts`
- **Problema:** descrição do que está subótimo
- **Sugestão:** como melhorar

### [REC] Título curto e descritivo

- **Local:** `src/path/arquivo.ts`
- **Problema:**
- **Sugestão:**

---

## Sugestões

*Otimizações de baixa prioridade, melhorias de DX, ideias para o futuro.*

### [SUG] Título curto e descritivo

- **Local:** `src/path/arquivo.ts`
- **Sugestão:** proposta de melhoria

### [SUG] Título curto e descritivo

- **Local:** `src/path/arquivo.ts`
- **Sugestão:**

---

## Ações Tomadas

- [ ] Pendente: todos os itens — aguardando sprint de correção

---

## Sprint Sugerida

*Colar abaixo do `---` para `governanca/sprints/XX-sugestao.md`.
Corrige todos os achados não tratados deste relatório.*

```markdown
---
status: pendente
ultima_modificacao: [DATA]
sessao_atual: 0
---

# Sprint XX: Correções da Auditoria [NOME]

**Objetivo:** Resolver os achados da auditoria [NOME] realizada em [DATA].

---

## Etapas

### Etapa 1: Bloqueantes (X itens)

**Objetivo:** Corrigir os itens que impedem deploy ou representam risco crítico.

**Tarefas:**
- [ ] [BLOQ] descrição
- [ ] [BLOQ] descrição

**Critérios de Aceite:**
- [ ] Nenhum item bloqueante pendente
- [ ] Build passa sem erros

### Etapa 2: Recomendações (Y itens)

**Objetivo:** Corrigir os itens recomendados com alto impacto.

**Tarefas:**
- [ ] [REC] descrição
- [ ] [REC] descrição

**Critérios de Aceite:**
- [ ] Itens recomendados implementados ou justificados

### Etapa 3: Sugestões (Z itens)

**Objetivo:** Implementar as sugestões de melhoria.

**Tarefas:**
- [ ] [SUG] descrição
- [ ] [SUG] descrição

**Critérios de Aceite:**
- [ ] Sugestões avaliadas e implementadas (ou adiadas com justificativa)

---

## Conclusão

**Mensagem de commit sugerida:**
\`\`\`
fix: correcoes da auditoria [NOME] ([DATA])
\`\`\`

---

## Aprendizados e Decisões

### Aprendizados Técnicos

- *Liste descobertas importantes durante as correções*

### Decisões de Design Confirmadas

- *Liste decisões tomadas durante as correções*
```
