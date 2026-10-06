# Workflow: Research

> Investigação progressiva de um repositório ou tema desconhecido, produzindo
> um artefato de contexto reutilizável.

## Quando Usar

- Entrar em um repositório que você não conhece
- Investigar uma área antes de planejar uma mudança

## Passos

1. **Fase 1 — estrutura superficial:** pastas, entry points, README
2. **Fase 2 — configurações e dependências:** `package.json`, `tsconfig.json`,
   `.env.example`, `go.mod`, `pyproject.toml`, `*.csproj`, `docker-compose.yml`
3. **Fase 3 — entradas, modelos e serviços:** entidades, rotas, camadas de dados
4. **Fase 4 — fluxos críticos:** autenticação, pagamento, sincronização, jobs
5. **Fase 5 — deep dive apenas onde necessário**

## Saída

`governanca/relatorios/pesquisa-<tema>.md` — resumo reutilizável de contexto:
o que o sistema faz, arquitetura, dependências, fluxos críticos e lacunas.

## Critérios de Conclusão

- Consegue explicar o sistema sem reler "tudo" a cada sessão
- O artefato está registrado e disponível para sessões futuras

## Próximo Passo Recomendado

Com o diagnóstico e as descobertas registradas no relatório de pesquisa:
- Se estiver definindo um novo recurso do zero, execute `/spec` (workflow [spec.md](spec.md)) para estruturar requisitos no [PRD.md](../PRD.md).
- Se estiver pronto para estruturar a próxima sprint de engenharia, execute `/plan` (workflow [plan.md](plan.md)).
- Se a pesquisa foi realizada para destravar uma tarefa de sprint ativa, retorne a `/implement` (workflow [implement.md](implement.md)).
