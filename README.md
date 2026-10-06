# RR Tech Studio — Controle de Agentes & Governança de Software

Sistema oficial de governança, padrões de engenharia, catálogo tecnológico e orquestração autônoma de agentes de inteligência artificial (Antigravity, Claude Code, Cursor, Copilot e Windsurf) da **RR Tech Studio**.

---

## 🚀 Destaques do Ecossistema

- 🌐 **Interface Web Dedicada nos Satélites ([ui.mjs](governanca/scripts/ui.mjs)):** Painel local visual moderno em tempo real com métricas de código, estimativa de tokens (`~3,8 carac/token`), gráfico SVG interativo de evolução de linhas e leitor Markdown embutido — com **zero dependências externas**.
- 📡 **Sincronização Remota Universal ([sincronizar.mjs](governanca/scripts/sincronizar.mjs)):** Conecta qualquer projeto satélite à matriz pública no GitHub, permitindo atualizações essenciais ou regeneração total com backup automático.
- 🤖 **Harness Automatizado ([harness.mjs](governanca/scripts/harness.mjs)):** Popula dinamicamente regras, workflows e skills em `.agents/` para agentes de IA operarem com contexto cirúrgico.
- 📚 **Livro de Arquitetura Vivo:** Documentação estruturada em 5 volumes cobrindo visão geral, stack, lógica, comportamento autônomo e modelo de dados.
- 🔗 **Integridade Absoluta:** 100% de links Markdown verificados por suíte de testes automatizados com cobertura contínua.

---

## ⚡ Inicialização Rápida em Qualquer Projeto (Bootstrap)

Em qualquer máquina com Node.js (18+), abra o terminal na pasta do seu projeto e execute o comando de uma linha correspondente:

### No Windows (PowerShell):
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -OutFile "sincronizar.mjs"; node sincronizar.mjs --total -y; Remove-Item "sincronizar.mjs"
```

### No Linux / macOS (Bash / zsh):
```bash
curl -fsSL "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -o sincronizar.mjs && node sincronizar.mjs --total -y && rm sincronizar.mjs
```

O comando baixa a governança matriz, inicializa a pasta `governanca/`, os arquivos de contexto raiz [AGENTS.md](governanca/AGENTS.md) e [CLAUDE.md](CLAUDE.md), e sincroniza o harness do agente em `.agents/`.

---

## 🖥️ Painel Web Dedicado do Projeto

Após sincronizar, suba o painel dedicado do projeto com o comando nativo:

```bash
# Execução direta com Node nativo:
node governanca/scripts/ui.mjs

# Ou pelo atalho npm:
npm run rr:ui
```

O servidor abrirá instantaneamente em `http://localhost:3333` exibindo a identidade do projeto, métricas vivas, histórico de commits e navegação interativa de governança.

---

## 💻 Executando a Aplicação Progenitora (Painel Central)

Para executar o painel web central Next.js com banco de dados SQLite e gerenciador de todos os projetos:

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

---

## 📖 Documentação e Diretrizes

- **Ponto de Entrada da Governança:** [governanca/AGENTS.md](governanca/AGENTS.md)
- **Guia de Início:** [governanca/INICIO.md](governanca/INICIO.md)
- **Manual de Sincronização Remota:** [governanca/padroes/sincronizacao-remota.md](governanca/padroes/sincronizacao-remota.md)
- **Catálogo de Tecnologias & Presets:** [governanca/skills/CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md)
- **Histórico de Versões:** [governanca/CHANGELOG.md](governanca/CHANGELOG.md)

---

*Desenvolvido por RR Tech Studio (Rodrigo Rafael).*
