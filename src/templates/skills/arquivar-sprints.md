# Skill: Arquivar Sprints

> Instrui o agente a arquivar sprints concluídas para reduzir o contexto
> necessário nas sessões seguintes.

## Quando Arquivar

Quando uma sprint for **aprovada pelo usuário** e o commit final for feito.

## Como Arquivar

```bash
# Crie a pasta de concluídas se não existir
mkdir -p governanca/sprints/concluidas

# Mova o arquivo da sprint concluída
mv governanca/sprints/01-fundacao.md governanca/sprints/concluidas/01-fundacao.md
```

## Regras

- **Nunca delete** uma sprint concluída — apenas mova para `concluidas/`
- **Atualize o front-matter** antes de arquivar:
  ```yaml
  status: concluido
  ultima_modificacao: 2026-07-13
  sessao_atual: 5
  ```
- **Mantenha o template** `_template.md` sempre em `governanca/sprints/`
- **Não arquive** sprints que ainda têm etapas pendentes

## Depois da Última Sprint

Se não houver mais sprints ativas em `governanca/sprints/` (exceto `_template.md`):

1. **Pergunte ao usuário** se deseja continuar o desenvolvimento com novas sprints
2. Se sim, **proponha uma nova sequência** baseada no que foi entregue e no que falta
3. **Crie cada nova sprint** copiando `_template.md` para `NN-titulo.md` (ex: `03-nova-funcionalidade.md`, `04-outra-funcionalidade.md`)
4. **Valide a ordem e o escopo** com o usuário antes de começar a primeira

## Benefícios

- Reduz a lista de sprints que o agente precisa escanear
- Mantém histórico completo acessível em `concluidas/`
- Sinaliza claramente o progresso geral do projeto
