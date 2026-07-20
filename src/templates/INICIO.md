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

> O plano/descrição do projeto está em `governanca/PLANO.md`. Leia-o para o
> usuário e pergunte se está correto ou se falta algo.

**Só avance após o usuário confirmar a visão.**

> **Crie o PRD:** pergunte ao usuário se deseja um PRD estruturado. Se sim,
> analise o plano e extraia: resumo executivo, requisitos (tabela ID/descrição/
> prioridade), critérios de aceite, fora de escopo. Crie `governanca/PRD.md`
> usando o template em `governanca/PRD.md`. Apresente para validação e registre
> nas notas persistentes do `AGENTS.md`.

> Se o plano/PRD do usuário contiver um esboço de stack técnica, **não avance**
> antes de executar a skill `comparar-stack-com-plano.md` em
> `governanca/skills/`. Ela orienta a comparação bidirecional entre a stack do
> preset e a stack do plano, e a decisão de qual caminho seguir.

---

## Passo 2 — Definição das Sprints

Com base na visão, proponha uma estrutura inicial de sprints:

- A **Sprint 1** deve ser a mais simples possível: um MVP funcional mínimo.
- Cada sprint posterior incrementa uma funcionalidade.
- Crie os arquivos em `governanca/sprints/` seguindo o formato `NN-titulo.md`.
- Use o template em `governanca/sprints/_template.md` como base.

**Valide a ordem e o escopo com o usuário antes de criar os arquivos.**

---

## Passo 3 — Alinhamento da Stack

Confirme a stack técnica com o usuário:

{{#if temPresets}}
**Presets selecionados:**
- Frontend: `{{frontend}}` ({{frontendFramework}}, {{frontendEstilo}})
- Backend: `{{backend}}` ({{backendRuntime}}, {{backendBanco}})
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

 1. Crie os arquivos de configuração do projeto:
    {{#if temPresets}}
    - Frontend: `package.json`, `tsconfig.json`, configs de build/lint
    - Backend: {{setupBackend}}
    {{else}}
    - Crie os arquivos conforme a stack definida
    {{/if}}
 2. Crie os scripts auxiliares seguindo a skill `criar-scripts-auxiliares.md` em `governanca/skills/`.
 3. Instale as dependências e verifique se o build base funciona.
 4. Atualize a documentação em `governanca/livro-arquitetura/` com as decisões tomadas.

**Não avance sem o build passando.**

---

## Passo 5 — Iniciar Sprint 1

Com o ambiente pronto, inicie a Sprint 1:

1. Marque o status da sprint como `em_andamento` no front-matter.
2. Siga as etapas definidas no arquivo da sprint.
3. Ao finalizar cada etapa, apresente o resultado ao usuário.

---

## Lembretes

- Sempre valide com o usuário antes de decisões importantes.
- Mantenha as notas persistentes em AGENTS.md atualizadas.
- Registre decisões técnicas no livro de arquitetura.

*Template gerado pelo RR Controle de Agentes.*
