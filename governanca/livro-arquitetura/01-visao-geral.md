# Visão Geral da Arquitetura — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1  
**Marca:** RR Tech Studio | Autor: Rodrigo Rafael  
**Última Reconciliação:** 2026-10-06  

## 1. Propósito e Visão do Produto

O **RR Controle de Agentes** é a matriz oficial e o painel de engenharia da RR Tech Studio para controle, governança, scaffolding e auditoria contínua de projetos assistidos por agentes autônomos de IA.

Suas responsabilidades centrais incluem:
- **Catálogo & Presets de Arquitetura:** Gestão de 151 tecnologias homologadas em 11 categorias e 27 presets de stack técnica pré-configurados.
- **Scaffolding e Vinculação:** Criação de novos projetos (Greenfield) ou vinculação de repositórios existentes (Brownfield) com injeção automática de governança.
- **Harness Agêntico Nativo:** Configuração de regras para agentes (`.agents/rules/`), workflows executáveis e wrappers de skills em total paridade.
- **Métricas e Monitoramento:** Histórico de linhas de código, commits e auditoria de maturidade de governança.

---

## 2. Stack Tecnológica Viva

A stack real executada pelo repositório é composta por:
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Lucide React + TypeScript.
- **Backend & APIs:** Next.js App Router API Routes + handlers modulares em Node.js 22 runtime nativo.
- **Banco de Dados:** SQLite nativo via módulo `node:sqlite` (`DatabaseSync`) em modo WAL (`dados/rr.db`), eliminando ORMs pesados e dependências externas.
- **Qualidade & Lint:** Biome para formatação e lint ultrarrápidos, Vitest e TSX para testes e scripts utilitários.

---

## 3. Estrutura de Diretórios do Repositório

```
rr-controle-de-agentes-1.1/
├── src/
│   ├── app/                 ← Páginas App Router (/, /criar, /projetos/[id]) e rotas de API
│   │   └── api/             ← Endpoints REST (/projetos, /tecnologias, /presets, etc.)
│   ├── componentes/         ← Componentes de interface do usuário
│   ├── servidor/            ← Lógica de backend (db.ts, projetos.ts, gerador.ts, harness.ts)
│   ├── scripts/             ← Scripts utilitários de CLI e validação de templates
│   └── templates/           ← 61 templates oficiais de governança
├── governanca/              ← Governança viva do próprio projeto (matriz)
│   ├── livro-arquitetura/   ← Volumes 01 a 05 e decisões arquiteturais (ADRs)
│   ├── padroes/             ← Manuais de frontend, backend e sincronização
│   ├── workflows/           ← 9 fluxos operacionais (/status, /fix, /spec, /plan, etc.)
│   ├── skills/              ← 27 habilidades especializadas da governança
│   ├── sprints/             ← Registro de sprints ativas e concluídas
│   └── scripts/             ← Utilitários portáteis (harness.mjs, verificar-segredos.mjs, etc.)
├── dados/                   ← Banco de dados local SQLite (rr.db) e snapshots
└── .agents/                 ← Harness agêntico local configurado
```

---

## 4. Registro de Decisões Arquiteturais (ADRs)

Decisões de design arquitetural de alto impacto ou contestadas residem em [decisoes/](decisoes/).
Consulte as decisões vigentes ou utilize o template [_template.md](decisoes/_template.md) antes de propor mudanças estruturais na aplicação.

---

*Documento mantido e reconciliado conforme os padrões da RR Tech Studio.*
