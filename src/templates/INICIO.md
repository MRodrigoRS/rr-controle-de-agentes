# Inicialização — {{nomeProjeto}}

> Instruções para o agente: siga os passos abaixo **em ordem**. Não pule etapas.
> Cada passo só deve ser concluído após validação com o usuário.

**Gerado em:** {{data}}

---

## Passo 1 — Apresentação e Visão

Apresente-se ao usuário e peça que ele descreva a visão do projeto:

- O que o projeto faz? Qual o problema resolve?
- Qual o público-alvo?
- Existe algum prazo ou prioridade especial?

> O plano/descrição do projeto está em [governanca/PLANO.md](governanca/PLANO.md). Leia-o para o
> usuário e pergunte se está correto ou se falta algo.

**Só avance após o usuário confirmar a visão.**

> **Preencha o PRD:** pergunte ao usuário se deseja um PRD estruturado. Se sim,
> analise o plano e preencha [governanca/PRD.md](governanca/PRD.md) (arquivo já criado na governança):
> resumo executivo, requisitos (tabela ID/descrição/prioridade), critérios de aceite
> e itens fora de escopo. Apresente para validação do usuário e registre o status
> em [governanca/SESSAO.md](governanca/SESSAO.md).
>
> Use o workflow [spec.md](governanca/workflows/spec.md) para transformar a visão em
> uma especificação verificável (escopo, requisitos, critérios de aceite,
> riscos).

> Se o plano/PRD do usuário contiver um esboço de stack técnica, **não avance**
> antes de executar a skill [alinhar-stack-com-presets.md](governanca/skills/alinhar-stack-com-presets.md) em
> `governanca/skills/`. Ela orienta a comparação bidirecional entre a stack do
> preset e a stack do plano, e a decisão de qual caminho seguir.

---

## Passo 2 — Definição das Sprints

Com base na visão, proponha uma estrutura inicial de sprints:

- A **Sprint 1** deve ser a mais simples possível: um MVP funcional mínimo.
- Cada sprint posterior incrementa uma funcionalidade.
- Crie os arquivos em `governanca/sprints/` seguindo o formato `NN-titulo.md`.
- Use o template em [governanca/sprints/_template.md](governanca/sprints/_template.md) como base.
- Use o workflow [plan.md](governanca/workflows/plan.md) para montar cada sprint como
  um plano verificável (arquivos afetados, riscos, tarefas, critérios).

**Valide a ordem e o escopo com o usuário antes de criar os arquivos.**

---

## Passo 3 — Alinhamento da Stack

Confirme a stack técnica com o usuário:

{{#if temPresets}}
**Presets selecionados:**
- **Frontend:** `{{frontend}}` ({{frontendFramework}}, {{frontendEstilo}})
{{#if stackCategorizadaFrontend}}
  - *Ferramentas e bibliotecas:*
{{stackCategorizadaFrontend}}
{{/if}}
- **Backend:** `{{backend}}` ({{backendRuntime}}, {{backendBanco}})
{{#if stackCategorizadaBackend}}
  - *Ferramentas e bibliotecas:*
{{stackCategorizadaBackend}}
{{/if}}

> Consulte [02-stack.md](governanca/livro-arquitetura/02-stack.md) para o detalhamento da responsabilidade de cada ferramenta.
{{else}}
**Projeto sem preset definido.** Identifique a stack com o usuário:
- Frontend: framework, estilo, testes
- Backend: runtime, banco, ORM
{{/if}}

Pergunte: "Podemos seguir com essa stack ou você quer alterar algo?"

**Só avance com a stack validada.**

---

## Passo 4 — Setup do Ambiente

Com a stack validada, configure o ambiente:

 1. Crie os arquivos de configuração e dependências do projeto (ex: `package.json`, `pyproject.toml`, `go.mod`, `.csproj`, etc. conforme a stack oficial).
 2. Crie os scripts auxiliares seguindo a skill [criar-scripts-auxiliares.md](governanca/skills/criar-scripts-auxiliares.md). Se o projeto possuir banco de dados relacional (PostgreSQL, Supabase, SQLite, etc.), configure o script de extração do modelo seguindo a skill [criar-extrair-modelo.md](governanca/skills/criar-extrair-modelo.md).
 3. Instale as dependências e verifique se o build base funciona.
 4. O harness deste projeto (`.agents/`, `CLAUDE.md` e slash commands como `/spec`, `/plan`, `/implement`) já foi configurado automaticamente pela progenitora. Caso o projeto utilize serviços específicos que justifiquem MCPs adicionais pelo princípio do menor privilégio, consulte a skill [configurar-harness.md](governanca/skills/configurar-harness.md) e proponha ao usuário sob demanda.
 5. Atualize a documentação em `governanca/livro-arquitetura/` com as decisões tomadas.

**Não avance sem o build passando.**

---

## Passo 5 — Iniciar Sprint 1

Com o ambiente pronto, inicie a Sprint 1:

1. Marque o status da sprint como `em_andamento` no front-matter.
2. Siga as etapas definidas no arquivo da sprint.
3. Execute o ciclo dos workflows em `governanca/workflows/`:
   [implement.md](governanca/workflows/implement.md) (execução), [test.md](governanca/workflows/test.md) (verificação e evidências) e
   [review.md](governanca/workflows/review.md) (revisão adversarial) antes de apresentar o resultado.
4. Ao finalizar cada etapa, apresente o resultado ao usuário.

---

## Lembretes

- Sempre valide com o usuário antes de decisões importantes.
- Mantenha as notas de progresso em [governanca/SESSAO.md](governanca/SESSAO.md) atualizadas.
- Registre decisões técnicas no livro de arquitetura.

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
