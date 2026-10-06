# Workflow: Test

> Verificação e produção de evidências. Consulte a skill [criar-testes.md](../skills/criar-testes.md)
> para os padrões por stack.

## Quando Usar

- Após implementar cada tarefa
- Antes de qualquer entrega

## Passos

1. Escreva testes seguindo a skill [criar-testes.md](../skills/criar-testes.md)
2. Execute build e testes
3. Verifique o comportamento no ambiente real (browser/execução/banco)
4. Registre as evidências em `## Evidências` e as limitações em `## Limitações`
   (em linguagem de negócio) e produza o `## Roteiro de Verificação` para o
   usuário conferir sozinho

## Evidência por tipo

- **Backend:** testes, requests reais, banco, logs, contratos
- **Frontend:** browser, screenshots, interações, console
- **Desktop:** execução real, UI, logs
- **Mobile:** emulador **e** dispositivo físico

## Critérios de Conclusão

- Todos os testes passando
- Fluxos críticos exercitados no ambiente real
- Limitações honestamente registradas
