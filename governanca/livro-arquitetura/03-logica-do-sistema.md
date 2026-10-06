# Lógica do Sistema — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1  
**Marca:** RR Tech Studio | Autor: Rodrigo Rafael  
**Última Reconciliação:** 2026-10-06  

---

## 1. Regras de Negócio do Sistema

| ID | Regra de Negócio | Onde Está Implementado | Descrição / Comportamento |
|----|------------------|------------------------|---------------------------|
| **RN-01** | Cadastro de Projetos Greenfield | `src/servidor/projetos.ts` e `src/servidor/gerador.ts` | Cria o registro no banco SQLite (`projetos`), gera a pasta no disco, instancia o scaffold com templates compilados e inicializa o Git se necessário. |
| **RN-02** | Vinculação Brownfield com Stack Real | `src/servidor/projetos.ts` e `src/scripts/vincular.ts` | Analisa arquivos do repositório existente, detecta stack técnica automaticamente e injeta governança mantendo código e configs intactos. |
| **RN-03** | Injeção e Compilação de Templates | `src/servidor/gerador.ts` | Processa os 61 templates oficiais (`src/templates/`) substituindo placeholders Mustache (`{{nomeProjeto}}`, `{{clausulas}}`, `{{qualidade}}`, etc.) na pasta `governanca/` de destino. |
| **RN-04** | Harness Agêntico Unificado | `src/servidor/harness.ts` e `governanca/scripts/harness.mjs` | Configura e mantém paridade estrita entre regras (`.agents/rules/`), workflows (`.agents/workflows/`) e wrappers de habilidades (`.agents/skills/`). |
| **RN-05** | Catálogo e Presets Integrados | `src/servidor/db.ts` | Gerencia o catálogo de 151 tecnologias em 11 categorias e garante integridade referencial dos 27 presets mapeados para desenvolvimento. |
| **RN-06** | Contagem de Métricas de Código | `src/servidor/db.ts` (`metricas_git`) | Calcula o total de arquivos, linhas e caracteres do repositório persistindo o histórico associado ao commit hash. |

---

## 2. Fluxos de Dados Principais

```
[Interface Web / API Client]
       │ (JSON Payload)
       ▼
[Next.js API Route (/api/...)]
       │ (Zod Validation)
       ▼
[src/servidor/projetos.ts | db.ts]
       │ (Atomic SQL Transaction)
       ▼
[SQLite: dados/rr.db] ──► [src/servidor/gerador.ts] ──► [Disco do Projeto]
```

---

## 3. Máquina de Estados do Projeto

```
┌─────────────┐       vinculação       ┌───────────────┐
│ Greenfield  │ ─────────────────────► │  Vinculado /  │
│  (Novo)     │                        │ Governança OK │
└─────────────┘                        └───────────────┘
       │                                       │
       │ criação do zero                       │ execução de sprints
       ▼                                       ▼
┌─────────────┐       sprint-00        ┌───────────────┐
│ Scaffolding │ ─────────────────────► │ Em Produção / │
│ Inicial     │                        │  Evolução     │
└─────────────┘                        └───────────────┘
```

---

## 4. Endpoints e Rotas de Integração da API

| Rota | Método | Função | Módulo Responsável |
|------|:------:|--------|--------------------|
| `/api/projetos` | `GET` | Lista todos os projetos cadastrados com métricas | `src/app/api/projetos/route.ts` |
| `/api/projetos` | `POST` | Cria ou vincula um novo projeto na governança | `src/app/api/projetos/route.ts` |
| `/api/projetos/[id]` | `GET` / `DELETE` | Detalha ou remove projeto cadastrado | `src/app/api/projetos/[id]/route.ts` |
| `/api/presets` | `GET` | Retorna os 27 presets oficiais de frontend e backend | `src/app/api/presets/route.ts` |
| `/api/tecnologias` | `GET` / `POST` | Consulta e gerencia o catálogo de 151 tecnologias | `src/app/api/tecnologias/route.ts` |
| `/api/selecionar-pasta`| `POST` | Diálogo nativo para seleção de diretório local | `src/app/api/selecionar-pasta/route.ts` |

---

*Documento mantido e reconciliado conforme os padrões da RR Tech Studio.*
