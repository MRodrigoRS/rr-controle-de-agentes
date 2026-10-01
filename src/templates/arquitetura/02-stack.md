# Detalhamento da Stack — {{nomeProjeto}}

**Projeto:** {{nomeProjeto}}
**Gerado em:** {{data}}

{{#if ehMigracaoStack}}
> [!IMPORTANT]
> **Stack Alvo da Refatoração / Migração:** Este projeto foi vinculado no modo de **Modernização de Stack (Replatforming)**. A tabela abaixo representa a stack tecnológica moderna contratada como **destino** da migração. Consulte a skill `governanca/skills/migrar-stack-legada.md` para o protocolo de migração side-by-side.
{{/if}}

## Frontend

- **Framework:** {{frontendFramework}}
- **Estilização:** {{frontendEstilo}}
- **Testes:** {{frontendTestes}}

## Backend

- **Runtime:** {{backendRuntime}}
- **Banco:** {{backendBanco}}
- **ORM:** {{backendORM}}

## Ferramentas & Padrões

- **Lint:** {{lint}}
- **Formatação:** {{formatacao}}
- **CI/CD:** {{cicd}}

---

## Catálogo de Ferramentas Oficiais do Projeto

> **Regra Mandatória de Implementação:** Todas as tecnologias e bibliotecas listadas abaixo foram contratadas e aprovadas pelo preset do projeto. Use-as prioritariamente desde o início da implementação. É proibido inventar soluções caseiras (ad-hoc) ou instalar bibliotecas concorrentes para responsabilidades já atendidas nesta stack (ex: use Zustand para estado global, Zod para schemas/validações, Lucide para ícones, etc.).

{{#if stackFrontend}}
### Tecnologias do Frontend

{{tabelaStackFrontend}}
{{/if}}

{{#if stackBackend}}
### Tecnologias do Backend

{{tabelaStackBackend}}
{{/if}}

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
