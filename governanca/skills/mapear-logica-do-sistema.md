---
name: mapear-logica-do-sistema
description: Extrai e documenta regras de negócio, fórmulas, fluxos, estados e integrações (livro-arquitetura/03).
---

# Skill: Mapear Lógica do Sistema

> Instrui o agente a extrair e documentar o comportamento do sistema:
> regras de negócio, fórmulas, fluxos de dados, máquinas de estado,
> workflows e integrações — o que o sistema *faz* e *como calcula*.

## Quando Executar

Esta skill é acionada **automaticamente** ao final de cada sprint
(pelas instruções do workflow `/implement`), após executar [criar-testes.md](governanca/skills/criar-testes.md)
e antes de apresentar o resultado ao usuário.

Também pode ser executada:
- **Sob demanda** — quando o usuário pedir um mapeamento completo
- **Antes de auditorias** — para o auditor entender o comportamento
  esperado antes de procurar problemas
- **Reconciliação global** — para realinhar simultaneamente todos os volumes do livro de arquitetura (01 a 04), utilize a skill [sincronizar-documentacao.md](governanca/skills/sincronizar-documentacao.md)


## Como Executar

### 1. Varra o Código Fonte

Percorra os arquivos de código relevantes (`src/`, `prisma/`, `appsscript.json`,
`*.go`, etc.) extraindo:

| Categoria | O que procurar |
|-----------|---------------|
| Regras de Negócio | Condicionais que refletem regras do domínio (`if (status === "aprovado")`, `if (saldo < limite)`) |
| Fórmulas | Cálculos matemáticos, totais, percentuais, conversões, prazos |
| Fluxos de dados | Como os dados trafegam: API → validação → banco → resposta |
| Estados | Enums, constantes, `switch` que definem estado de entidades |
| Workflows | Sequências de passos em mais de um arquivo/módulo |
| Integrações | Chamadas HTTP, webhooks, bibliotecas externas (GmailApp, Mercado Pago, Stripe) |
| Efeitos colaterais | Envio de e-mail, notificações, cache, log, jobs agendados |

### 2. Atualize [03-logica-do-sistema.md](governanca/livro-arquitetura/03-logica-do-sistema.md)

Para cada categoria, preencha ou atualize a tabela correspondente:

- **Regras de Negócio:** extraia cada regra com ID (`RN-01`), descrição,
  localização no código e referência ao requisito no [PRD.md](governanca/PRD.md)
- **Fórmulas e Cálculos:** documente a fórmula em linguagem natural e a
  localização. Inclua exemplos numéricos se possível
- **Fluxos de Dados:** descreva o percurso dos dados com diagrama textual
- **Máquinas de Estado:** liste estados, transições e condições
- **Workflows:** descreva a sequência de passos e os módulos envolvidos
- **Integrações:** complete a tabela com serviço, tipo, entrada, saída,
  autenticação e arquivo
- **Efeitos Colaterais:** liste cada ação, seu gatilho e onde ocorre

### 3. Valide com o Usuário

- Apresente as atualizações: "Atualizei a lógica do sistema com o que foi
  implementado nesta sprint. Aqui estão as principais mudanças:"
- Pergunte se a documentação reflete corretamente o comportamento esperado

## Regras

- **Nunca documente comportamento que não existe no código** — a lógica
  documentada deve refletir o que o sistema realmente faz
- Se encontrar regras duplicadas ou contraditórias, **sinalize** no documento
  e mencione para o usuário
- Mantenha IDs sequenciais (`RN-01`, `RN-02`, etc.) — nunca reutilize um ID
  para uma regra diferente
- Se uma regra/fórmula foi removida do código, **remova-a** do documento
- Ao final de cada sprint, **atualize apenas as seções afetadas** — não
  reescreva o documento inteiro sem necessidade
