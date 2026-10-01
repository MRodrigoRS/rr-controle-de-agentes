# Lógica do Sistema — {{nomeProjeto}}

> Documenta o comportamento do sistema: regras de negócio, fórmulas, fluxos
> de dados, estados, workflows e integrações. Atualize sempre que uma sprint
> implementar ou modificar lógica.

**Gerado em:** {{data}}

---

## Regras de Negócio

*Extraídas do código. Liste cada regra com localização.*

| ID | Regra | Onde | Referência |
|----|-------|------|------------|
| RN-01 | | | |
| RN-02 | | | |

## Fórmulas e Cálculos

*Extraídos do código: totais, descontos, prazos, conversões, qualquer lógica matemática.*

| ID | Fórmula | Descrição | Onde |
|----|---------|-----------|------|
| F-01 | | | |
| F-02 | | | |

## Fluxos de Dados

*Como os dados entram, são processados e saem.*

```
[Origem] → [Processo] → [Armazenamento] → [Saída]
```

## Máquinas de Estado

*Estados de cada entidade e transições possíveis.*

**Entidade:** (ex: Pedido, Usuário, Atendimento)

```
┌──────────┐    ação 1    ┌──────────┐
│ Estado A │ ──────────→ │ Estado B │
└──────────┘             └──────────┘
     ↑                        │
     └────────────────────────┘
           ação 2
```

| De | Para | Ação | Condição |
|----|------|------|----------|
| | | | |

## Workflows

*Sequências coreografadas de passos que envolvem múltiplas partes do sistema.*

**Workflow:** (nome)

1. 
2. 
3. 

**Envolve:** (módulos, serviços ou arquivos participantes)

## Integrações

*APIs externas, webhooks, callbacks, serviços consumidos ou expostos.*

| Serviço | Tipo | Entrada | Saída | Autenticação | Arquivo |
|---------|------|---------|-------|-------------|---------|
| | | | | | |

## Efeitos Colaterais

*Tudo que o sistema faz além do fluxo principal: notificações, logs, caches,
envio de e-mail, atualização de relatórios.*

| Ação | Gatilho | Onde |
|------|---------|------|
| | | |

---

> Mantenha atualizado — use a skill `mapear-logica-do-sistema.md` ao final
> de cada sprint (ou `sincronizar-documentacao.md` para reconciliação global).

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
