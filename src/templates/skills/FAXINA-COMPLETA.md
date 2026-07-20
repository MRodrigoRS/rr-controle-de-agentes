# FAXINA COMPLETA

> Meta-skill que orquestra todas as auditorias do projeto em uma única
> varredura, do código interno à liberação para produção. Execute quando
> quiser fazer a "faxina geral" de uma só vez.

## Fases

Execute em ordem. Cada fase gera seu próprio relatório usando o template
em `governanca/relatorios/_template.md`.

| Fase | Skill | Relatório gerado |
|------|-------|-----------------|
| 1 | `auditar-repositorio.md` | `auditoria-repositorio.md` |
| 2 | `auditar-consistencia-visual.md` | `auditoria-consistencia.md` |
| 3 | `auditar-responsividade.md` | `auditoria-responsividade.md` |
| 4 | `superar-codigo.md` | `auditoria-superacao.md` |
| 5 | `auditar-prontidao-producao.md` | `auditoria-producao.md` |

**Por que esta ordem?** Corrige fundamentos (segurança, práticas) → unifica
visual → garante mobile → otimiza → libera para produção. Cada fase constrói
sobre a anterior.

## Como Executar

Para cada fase, **uma de cada vez**:

1. Execute a skill correspondente
2. Corrija todos os itens **[BLOQ]** e **[REC]** identificados
3. Marque as ações tomadas no relatório da fase
4. Pergunte ao usuário: *"Continuar para a próxima fase?"*
5. Só avance com autorização

Se o usuário quiser pular uma fase (ex: projeto não tem UI mobile), pule
e registre no relatório unificado que a fase foi ignorada com justificativa.

## Saída

Após a última fase, gere o sumário unificado em
`governanca/relatorios/faxina-completa.md`:

```markdown
# Faxina Completa — {{data}}

**Projeto:** {{nomeProjeto}}

---

## Sumário

| Fase | Bloqueantes | Recomendações | Sugestões | Status |
|------|-------------|---------------|-----------|--------|
| 1. Repositório | X | Y | Z | Concluída |
| 2. Consistência | X | Y | Z | Concluída |
| 3. Responsividade | X | Y | Z | Concluída |
| 4. Superação | X | Y | Z | Concluída |
| 5. Produção | X | Y | Z | Concluída |
| **Total** | **X** | **Y** | **Z** | |

---

## Pendências

*Itens que ficaram pendentes após a faxina.*

- [ ] descrição (fase X, arquivo: path)

---

## Sprints Recomendadas

*Para cada fase que gerou achados significativos, a sprint sugerida está
no próprio relatório da fase (seção `## Sprint Sugerida`). Copie de lá.*

- Fase 1: `auditoria-repositorio.md` → `sprints/XX-correcoes-repositorio.md`
- Fase 2: `auditoria-consistencia.md` → `sprints/XX-correcoes-consistencia.md`
- ...
```

## Após a Faxina

1. Apresente o sumário ao usuário
2. Pergunte se deseja criar as sprints sugeridas
3. Se autorizado, copie a `Sprint Sugerida` de cada relatório para
   `governanca/sprints/`
4. Registre nas notas persistentes do `AGENTS.md` que a faxina foi concluída
