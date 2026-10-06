# Workflow: Release

> Libera a solução para produção. Amarra as auditorias existentes.

## Quando Usar

- Antes do primeiro deploy e de cada release pública

## Passos

1. Execute a skill [auditar-prontidao-producao.md](../skills/auditar-prontidao-producao.md) (infra, segurança, resiliência)
2. Execute a skill [auditar-textos-usuario.md](../skills/auditar-textos-usuario.md) (jargão técnico, contatos fictícios)
3. Se houver pagamentos: execute a skill [auditar-comercializacao.md](../skills/auditar-comercializacao.md)
4. Corrija os bloqueantes antes de liberar
5. **Consolidação do Changelog:** No `CHANGELOG.md` da raiz do projeto, transforme a seção `## [Não lançado]` no cabeçalho formal da release (ex: `## [1.0.0] — AAAA-MM-DD`), conferindo se todos os deltas do software estão refletidos.
6. Documente URLs de produção e contato de emergência
7. Deploy + verificação pós-release (smoke test, logs, monitoramento)

## Saída

Release feita com bloqueantes zerados, changelog do produto oficializado e pós-release verificado.

## Critérios de Conclusão

- Nenhum `[BLOQ]` em aberto
- Versão consolidada e documentada em `CHANGELOG.md` da raiz do projeto
- Aplicação verificada em produção após o deploy

## Próximo Passo Recomendado

Com a publicação em produção concluída e verificada:
1. Registre a versão oficial no `CHANGELOG.md` da raiz e na governança ([CHANGELOG.md](../CHANGELOG.md)).
2. Gere a tag Git anotada da release (`git tag -a vX.Y.Z -m "Release vX.Y.Z"`).
3. Atualize [SESSAO.md](../SESSAO.md) e planeje o próximo ciclo com o usuário.
