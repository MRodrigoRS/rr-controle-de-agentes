# Workflow: Release

> Libera a solução para produção. Amarra as auditorias existentes.

## Quando Usar

- Antes do primeiro deploy e de cada release pública

## Passos

1. Execute a skill [auditar-prontidao-producao.md](../skills/auditar-prontidao-producao.md) (infra, segurança, resiliência)
2. Execute a skill [auditar-textos-usuario.md](../skills/auditar-textos-usuario.md) (jargão técnico, contatos fictícios)
3. Se houver pagamentos: execute a skill [auditar-comercializacao.md](../skills/auditar-comercializacao.md)
4. Corrija os bloqueantes antes de liberar
5. Documente URLs de produção e contato de emergência
6. Deploy + verificação pós-release (smoke test, logs, monitoramento)

## Saída

Release feita com bloqueantes zerados e pós-release verificado.

## Critérios de Conclusão

- Nenhum `[BLOQ]` em aberto
- Aplicação verificada em produção após o deploy
