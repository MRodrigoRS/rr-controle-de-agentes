# Detalhamento da Stack — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1  
**Marca:** RR Tech Studio | Autor: Rodrigo Rafael  
**Última Reconciliação:** 2026-10-06  

---

## 1. Stack Oficial em Execução

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Biblioteca Base:** React 19
- **Estilização:** Tailwind CSS 4
- **Ícones & UI:** Lucide React
- **Linguagem:** TypeScript 5

### Backend
- **Runtime:** Node.js 22 (suporte a recursos nativos)
- **API Engine:** Next.js Route Handlers + Hono Routing Patterns
- **Banco de Dados:** SQLite nativo via `node:sqlite` (`DatabaseSync`) em modo WAL
- **Validação de Dados:** Zod

### Ferramentas, Qualidade & DevOps
- **Linter & Formatador:** Biome (análise estática e formatação ultrarrápidas)
- **Executor & Testes:** TSX e Vitest
- **CI/CD:** GitHub Actions
- **Scanner de Segurança:** Verificador nativo de segredos (`verificar-segredos.mjs`)

---

## 2. Catálogo de Ferramentas Oficiais do Projeto

> **Regra Mandatória de Implementação:** Todas as tecnologias listadas abaixo foram contratadas e aprovadas para o projeto. Utilize-as estritamente. É terminantemente proibido inventar soluções caseiras (ad-hoc) ou instalar bibliotecas concorrentes/redundantes para responsabilidades já atendidas nesta stack. Para propor novas dependências, consulte previamente o [CATALOGO_TECNOLOGIAS.md](../skills/CATALOGO_TECNOLOGIAS.md) e obtenha autorização do usuário.

| ID | Tecnologia | Categoria | Papel / Responsabilidade no Projeto |
|:--:|---|---|---|
| 19 | **Next.js** | Frontend | Framework web fullstack com suporte a App Router e SSR |
| 20 | **React** | Frontend | Criação modular da interface de usuário com componentes |
| 21 | **Tailwind CSS** | Frontend | Estilização utilitária de componentes com CSS moderno |
| 56 | **Lucide React** | Bibliotecas | Ícones vetoriais consistentes em toda a interface web |
| 23 | **TypeScript** | Linguagens | Tipagem estática rigorosa no frontend e backend |
| 41 | **Node.js** | Runtimes & Build | Ambiente de execução JavaScript e TypeScript do servidor |
| 7 | **SQLite** | Bancos de Dados | Persistência local atômica via `node:sqlite` nativo (`dados/rr.db`) |
| 118 | **Hono** | Backend | Roteador e handlers leves para APIs do servidor |
| 11 | **Zod** | Bibliotecas | Validação de schemas e contratos de entrada em runtime |
| 31 | **Biome** | Qualidade & Testes | Análise estática (lint) e formatação de código unificada |
| 33 | **Vitest** | Qualidade & Testes | Execução de testes de unidade e integridade dos templates |
| 119 | **GitHub Actions** | DevOps | Automação de CI/CD para validação contínua e builds |

---

*Documento mantido e reconciliado conforme os padrões da RR Tech Studio.*
