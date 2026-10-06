---
name: sincronizar-governanca
description: Sincroniza a governança local com a matriz pública da RR Tech Studio (modo essencial ou total), atualiza o harness (.agents/), valida o painel web e resume o CHANGELOG.md.
---

# Skill: Sincronizar Governança com a Matriz

> Permite ao agente atualizar a governança deste projeto diretamente a partir do repositório matriz público da RR Tech Studio no GitHub, garantindo paridade de padrões, novas skills, workflows e melhorias na interface local sem tocar no contexto vivo do projeto.

---

## Quando Usar

- Sempre que o usuário pedir: *"sincronize a governança"*, *"atualize a governança"*, *"traga as novidades da matriz"* ou chamar `/sincronizar-governanca`.
- No início de uma nova sprint para garantir que o projeto está usando as skills e workflows mais recentes.
- Quando houver necessidade de reset ou regeneração completa dos templates base.

---

## Princípios de Execução

1. **Segurança por Padrão (Modo Essencial):** A sincronização de rotina atualiza apenas padrões, workflows, skills e ferramentas operacionais. **Nunca** toca em [SESSAO.md](../SESSAO.md), [PRD.md](../PRD.md), [PLANO.md](../PLANO.md), [sprints/](../sprints/) ou [livro-arquitetura/](../livro-arquitetura/), preservando 100% do trabalho em andamento.
2. **Zero Dependências:** Todos os comandos rodam com Node.js nativo (18+) via scripts locais em `governanca/scripts/`.
3. **Comunicação Transparente:** O agente deve sempre ler o [CHANGELOG.md](../CHANGELOG.md) pós-sincronização e apresentar ao usuário exatamente o que mudou.

---

## Roteiro de Execução do Agente

### Passo 1: Determinar o Modo de Sincronização

Avalie a intenção expressa pelo usuário:
- **Modo Essencial (Padrão):** Se o usuário pediu apenas para atualizar, sincronizar ou trazer novidades.
- **Modo Total (Hard Reset):** Se o usuário pediu explicitamente para *"regenerar tudo"*, *"resetar a governança"* ou *"recriar templates do zero"*.

---

### Passo 2: Executar a Sincronização

Execute o comando correspondente no terminal:

```bash
# Modo Essencial (Seguro / Rotina):
node governanca/scripts/sincronizar.mjs
# Ou: npm run rr:sync

# Modo Total (Regeneração Completa com Backup Prévio):
node governanca/scripts/sincronizar.mjs --total -y
```

O script [sincronizar.mjs](../scripts/sincronizar.mjs):
1. Conecta ao repositório matriz no GitHub.
2. Baixa as versões mais recentes dos manuais, workflows, skills, scripts operacionais e o [CHANGELOG.md](../CHANGELOG.md).
3. Invoca automaticamente o [harness.mjs](../scripts/harness.mjs) para espelhar as alterações em `.agents/`.

---

### Passo 3: Validar a Prontidão da Interface Local

Execute a checagem rápida da interface web com a flag síncrona:

```bash
node governanca/scripts/ui.mjs --check
```

Confirme que o script reporta a integridade de métricas, arquivos e histórico Git com sucesso (`exit code 0`).

---

### Passo 4: Auditar o Changelog e Reportar ao Usuário

1. Abra e leia as últimas entradas de [CHANGELOG.md](../CHANGELOG.md).
2. Apresente ao usuário um resumo executivo estruturado:
   - **Novidades Adicionadas:** Quais novas skills, workflows ou funcionalidades chegaram.
   - **Padrões Atualizados:** O que foi aprimorado ou corrigido na governança.
   - **Status do Painel Web:** Confirmação de que [ui.mjs](../scripts/ui.mjs) está operacional.

---

### Passo 5: Registrar no Diário de Bordo

Adicione uma linha de registro na seção de notas recentes em [SESSAO.md](../SESSAO.md):
```markdown
- **[YYYY-MM-DD]:** Governança sincronizada com a matriz no modo <essencial|total> (versão <X.X.X>).
```

---

*Manual de referência oficial: [sincronizacao-remota.md](../padroes/sincronizacao-remota.md).*
