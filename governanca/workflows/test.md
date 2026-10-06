# Workflow: Test

> Verificação e produção de evidências. Consulte a skill [criar-testes.md](../skills/criar-testes.md)
> para os padrões por stack.

## Quando Usar

- Após implementar cada tarefa
- Antes de qualquer entrega

## Passos

1. Escreva testes seguindo a skill [criar-testes.md](../skills/criar-testes.md)
2. Execute build e testes
3. **Trava de Não-Persistência em Loop (Teto de 3 Tentativas):**
   Se houver falha de testes durante a implementação e a tentativa de correção não resolver após **3 tentativas consecutivas**, interrompa imediatamente o ciclo autônomo. Não tente adivinhar ou aplicar remendos às cegas: reporte a causa raiz, os logs de erro e as hipóteses ao usuário para alinhamento.
4. Verifique o comportamento no ambiente real (browser/execução/banco)
5. Registre as evidências em `## Evidências` e as limitações em `## Limitações`
   (em linguagem de negócio) e produza o `## Roteiro de Verificação` para o
   usuário conferir sozinho

## Evidência por tipo

- **Backend:** testes automatizados, requests reais, banco, logs, contratos
- **Frontend:** verificação no navegador, rotas testadas, ausência de erros no console e validação visual humana
- **Desktop:** execução real, interface gráfica, logs
- **Mobile:** emulador **e** dispositivo físico

## Critérios de Conclusão

- Todos os testes passando (ou loop interrompido na 3ª tentativa para alinhamento com o usuário)
- Fluxos críticos exercitados no ambiente real
- Limitações honestamente registradas

## Próximo Passo Recomendado

Com os testes e verificações aprovados, avance para `/review` (workflow [review.md](review.md)) para realizar a revisão adversarial independente pré-Gate 2.
