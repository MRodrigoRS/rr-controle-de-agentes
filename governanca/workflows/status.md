# Workflow: Status

> Orientação rápida de sessão — retorna o estado real do projeto em menos de 1 minuto,
> sem efeitos colaterais. Use no início de sessão ou para reorientar após uma pausa.

## Quando Usar

- Ao abrir qualquer sessão nova (complementa o Protocolo de Início de Sessão)
- Quando a sessão perdeu o fio da meada e você precisa se reorientar

## Passos

1. **Sprint ativa:** Liste [sprints/](governanca/sprints/) em ordem numérica. Identifique o primeiro arquivo **não** presente em `sprints/concluidas/`. Abra-o e informe: número da sprint, título, etapa atual (procure `← estou aqui`).
2. **Estado do repositório:** Execute `git status` e `git log --oneline -5`. Informe: branch atual, arquivos modificados não comitados, últimos commits.
3. **Calibrar contra o código:** Verifique rapidamente se as etapas já marcadas como pendentes na sprint foram implementadas no código desde o último registro. Corrija o diagnóstico se necessário.
4. **Notas obsoletas:** Revise [SESSAO.md](governanca/SESSAO.md) — há registros que já não fazem sentido? Liste-os e proponha remoção ao usuário.
5. **Reportar:** Entregue um resumo em 4 linhas:
   - Sprint e etapa atual
   - Estado do repositório (branch, pendências de commit)
   - Calibração (código avançou além da sprint? Etapas implicitamente concluídas?)
   - Próxima ação recomendada

## O Que Este Workflow NÃO Faz

- **Não executa testes** — para rodar os testes, use `/test`
- **Não abre PRs** — para publicar, use `/release`
- **Não escreve código** — é puramente diagnóstico

## Saída Esperada

Resumo no chat com o diagnóstico consolidado.
