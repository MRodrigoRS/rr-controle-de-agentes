# Workflow: Fix (Correção Rápida / Polimento)

> Procedimento ágil (Fast-Track) para resolver bugs pontuais, ajustes visuais,
> erros de digitação e pequenos polimentos avulsos sem a cerimônia de uma sprint formal.

## Quando Usar

- Correção de bug pontual ou erro reportado
- Ajustes finos de CSS, layout, espaçamento ou responsividade
- Correção de tipagem TypeScript, lint ou imports
- Pequenas refatorações cirúrgicas em 1 ou 2 arquivos
- Tarefas pequenas e avulsas detectadas em cima da hora

## Quando NÃO Usar (Use `/plan` e Sprint Formal)

- Novas funcionalidades ou telas completas
- Alterações em regras de negócio ou fluxo de múltiplos módulos
- Mudanças no esquema do banco de dados (migrations)
- Refatorações amplas que tocam muitos arquivos

---

## Passos

1. **Diagnóstico Rápido (3 linhas):**
   Apresente brevemente ao usuário:
   - **Problema:** o que está quebrado ou precisa de ajuste
   - **Causa raiz:** por que está ocorrendo
   - **Solução proposta:** o que será alterado

2. **Implementação Direta:**
   Aplique a correção respeitando os padrões de engenharia em [padroes/](../padroes/) ([frontend.md](../padroes/frontend.md) ou [backend.md](../padroes/backend.md)).

3. **Verificação & Validação:**
   - Execute os testes automatizados existentes (`npm test` ou comando da stack).
   - Se for bug lógico ou de backend, adicione um teste unitário que comprove que o bug não voltará a ocorrer e apresente o output.
   - Verifique que o linter e o build passam sem erros.
   - **Validação Visual Humana (Obrigatória para Ajustes de UI/CSS):** O agente **nunca deve** tentar escanear a tela ou capturar telas de forma autônoma. O agente deve descrever com exatidão o que alterou, indicar a rota/componente afetado e explicar o que se espera que o usuário visualize, **aguardando confirmação explícita do usuário** antes de avançar para o commit.

4. **Changelog & Commit:**
   - Atualize o `CHANGELOG.md` na raiz do projeto sob `### Corrigido` (e `governanca/CHANGELOG.md` se for ajuste de governança) registrando o delta conciso da correção antes de comitar.
   - Faça commit convencional direto:
     ```bash
     git commit -m "fix(escopo): descrição concisa da correção"
     ```
   - Registre uma linha objetiva em [SESSAO.md](../SESSAO.md) sob a sessão atual:
     `- [Fix] Corrigido bug no componente X (commit: hash).`

---

## Critérios de Conclusão

- Bug corrigido ou ajuste aplicado com sucesso
- Build e testes passando com regressão zero
- Padrões de engenharia seguidos ([padroes/](../padroes/))
- Validação humana confirmada (para alterações de UI/CSS)
- Delta registrado em `CHANGELOG.md` da raiz do projeto
- Commit realizado e registrado em [SESSAO.md](../SESSAO.md)

## Próximo Passo Recomendado

Após o commit do fix e registro no changelog, execute `/status` (workflow [status.md](status.md)) para retomar a sprint em andamento.
