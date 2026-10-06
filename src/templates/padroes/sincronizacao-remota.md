# Manual de Sincronização Remota da Governança Matriz

> **Marca:** RR Tech Studio | **Autor:** Rodrigo Rafael  
> **Escopo:** Distribuição universal e consumo da governança em qualquer máquina ou projeto.

---

## 1. Visão Geral

A governança da **RR Tech Studio** opera em modelo matriz-satélite:
- **Matriz (Progenitora):** O repositório central (`MRodrigoRS/rr-controle-de-agentes`) mantém a fonte da verdade de padrões de engenharia, workflows, skills, presets e o catálogo de tecnologias em [CATALOGO_TECNOLOGIAS.md](../skills/CATALOGO_TECNOLOGIAS.md).
- **Satélites (Projetos Associados):** Qualquer repositório de produto que herda a pasta `governanca/` e o harness `.agents/`.

Este manual estabelece como configurar, disponibilizar e consumir a governança da matriz em repositórios privados do GitHub a partir de qualquer computador.

---

## 2. Modos de Sincronização

A governança possui dois modos formais de atualização:

| Modo | Comando | Comportamento | Impacto no Projeto |
| :--- | :--- | :--- | :--- |
| **🟢 Essencial** *(Padrão)* | `node governanca/scripts/sincronizar.mjs`<br>`npm run rr:sync` | Atualiza padrões em [padroes/](../padroes/), workflows em [workflows/](../workflows/), skills em [skills/](../skills/), catálogo em [CATALOGO_TECNOLOGIAS.md](../skills/CATALOGO_TECNOLOGIAS.md) e o [CHANGELOG.md](../CHANGELOG.md). | **Zero risco:** preserva intocados [SESSAO.md](../SESSAO.md), [PRD.md](../PRD.md), [sprints/](../sprints/) e [livro-arquitetura/](../livro-arquitetura/). |
| **🔴 Total** *(Hard Reset)* | `node governanca/scripts/sincronizar.mjs --total`<br>`npm run rr:sync -- --total` | Regenera 100% dos arquivos a partir dos templates da matriz para os presets configurados. | **Destrutivo com rede de segurança:** exige confirmação digitada (`REGENERAR TUDO`) e salva backup automático em `.backup-governanca-*`. |

---

## 3. Acesso Público Direto (Zero Configuração de Tokens)

Como o repositório matriz da RR Tech Studio é **público**, qualquer computador ou ambiente pode sincronizar e inicializar a governança diretamente sem necessidade de Personal Access Tokens (PAT), logins ou chaves de API:

- **Zero Configuração:** Não é necessário gerar tokens nem configurar variáveis de ambiente para o uso cotidiano.
- **Uso com Token (Opcional para CI/CD):** Caso você execute pipelines automatizados intensivos e deseje expandir a cota de chamadas da API do GitHub de 60/hora para 5.000/hora, você pode opcionalmente definir a variável `$env:GITHUB_TOKEN="ghp_xxx"` (PowerShell) ou `export GITHUB_TOKEN="ghp_xxx"` (Bash). O script [sincronizar.mjs](../scripts/sincronizar.mjs) a detecta e a consome automaticamente.

---

## 4. Como Sincronizar em Outros Projetos e Máquinas

### Cenário A: Projeto Associado Existente
Em qualquer máquina clonada, navegue até a raiz do projeto e execute:

```bash
# Atualização segura e rápida
node governanca/scripts/sincronizar.mjs

# Ou, se o atalho estiver no package.json:
npm run rr:sync
```

O script [sincronizar.mjs](../scripts/sincronizar.mjs) (Node.js 18+ nativo, zero dependências externas):
1. Lê [.matriz.json](../.matriz.json).
2. Conecta à API do GitHub com o `GITHUB_TOKEN`.
3. Baixa as versões mais recentes dos manuais, workflows, skills e o [CHANGELOG.md](../CHANGELOG.md).
4. Invoca o script [harness.mjs](../scripts/harness.mjs) para refletir as mudanças em `.agents/rules/`, `.agents/workflows/` e `.agents/skills/`.

---

### Cenário B: Vinculando um Projeto Novo do Zero em Outra Máquina
Se você estiver em um computador sem a progenitora clonada e quiser vincular um projeto novo:
1. Copie o script [sincronizar.mjs](../scripts/sincronizar.mjs) para a pasta `governanca/scripts/`.
2. Crie o arquivo [.matriz.json](../.matriz.json) com os presets desejados:
   ```json
   {
     "repositorio": "https://github.com/MRodrigoRS/rr-controle-de-agentes",
     "branch": "master",
     "presetFrontend": "nextjs-app-router",
     "presetBackend": "sqlite-local"
   }
   ```
3. Execute o modo total:
   ```bash
   node governanca/scripts/sincronizar.mjs --total
   ```

---

### Cenário C: Bootstrap em Repositório Virgem (Sem Governança e Sem [AGENTS.md](../AGENTS.md))

Quando você inicia um novo projeto ou abre um repositório legado que **nunca possuiu governança** e não tem a pasta `governanca/` nem o arquivo de entrada [AGENTS.md](../AGENTS.md), você não precisa criar pastas manualmente. O script [sincronizar.mjs](../scripts/sincronizar.mjs) pode ser baixado e executado diretamente da matriz em um único comando:

#### 1. Comando de Inicialização Rápida (One-Liner)

**No Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -OutFile "sincronizar.mjs"; node sincronizar.mjs --total -y; Remove-Item "sincronizar.mjs"
```

**No Linux / macOS (Bash / zsh):**
```bash
curl -fsSL "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -o sincronizar.mjs && node sincronizar.mjs --total -y && rm sincronizar.mjs
```

*(Como a matriz é pública, nenhuma autenticação é necessária. Se a variável `$env:GITHUB_TOKEN` estiver configurada no ambiente, o script a consome automaticamente para usufruir de cotas de API ampliadas).*

O que esse comando faz de ponta a ponta:
1. Baixa o script [sincronizar.mjs](../scripts/sincronizar.mjs) e detecta a raiz do projeto (ou progenitora local nos diretórios superiores se presente).
2. Cria a pasta `governanca/` com padrões, workflows, skills e relatórios.
3. Cria os arquivos raiz [AGENTS.md](../AGENTS.md) e [CLAUDE.md](../../CLAUDE.md).
4. Inicializa o diário de bordo [SESSAO.md](../SESSAO.md) e [.matriz.json](../.matriz.json).
5. Move o script para `governanca/scripts/` e baixa o script [harness.mjs](../scripts/harness.mjs) e [ui.mjs](../scripts/ui.mjs).
6. Executa o [harness.mjs](../scripts/harness.mjs) para popular o diretório `.agents/` com regras, workflows e skills do agente.

---

### 4.1 O que Enviar de Entrada para o Agente IA

Ao iniciar uma sessão de trabalho com qualquer agente IA (Antigravity, Claude Code, Cursor, Copilot, Windsurf):

#### Se o projeto JÁ POSSUI governança:
Envie a instrução de leitura direta:
> *"Leia atentamente as diretrizes em [AGENTS.md](../AGENTS.md) e o estado ativo da sprint em [SESSAO.md](../SESSAO.md) antes de planejar ou executar qualquer tarefa."*

#### Se o projeto NUNCA TEVE governança:
Copie e cole o seguinte prompt para o agente:

```text
Você é o agente desenvolvedor deste projeto sob a Governança Oficial RR Tech Studio.
Este repositório ainda não possui a estrutura de governança inicializada.

Por favor, execute o procedimento de bootstrap:
1. Certifique-se de que o Node.js (18+) está instalado.
2. Execute o comando de inicialização correspondente ao seu sistema operacional:
   - PowerShell:
     Invoke-WebRequest -Uri "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -OutFile "sincronizar.mjs"; node sincronizar.mjs --total -y; Remove-Item "sincronizar.mjs"
   - Bash/Linux/macOS:
     curl -fsSL "https://raw.githubusercontent.com/MRodrigoRS/rr-controle-de-agentes/master/src/templates/scripts/sincronizar.mjs" -o sincronizar.mjs && node sincronizar.mjs --total -y && rm sincronizar.mjs
3. Após a sincronização, leia obrigatoriamente:
   - [AGENTS.md](../AGENTS.md)
   - [SESSAO.md](../SESSAO.md)
   - [.matriz.json](../.matriz.json)
4. Valide a integridade do painel web executando:
   node governanca/scripts/ui.mjs --check
5. Confirme a conclusão, liste o que foi configurado e apresente o plano de trabalho para a primeira sprint.
```

---

## 5. Pela Interface Web da Progenitora

No computador onde a aplicação Web da progenitora estiver em execução (`npm run dev`):
1. Acesse o painel de projetos.
2. No projeto desejado, clique no botão **Recriar Governança ▾**.
3. Escolha:
   - **🟢 Sincronizar Essencial (Seguro):** Atualização instantânea sem tocar no contexto local.
   - **🔴 Regeneração Total...:** Exibe a modal de confirmação com alerta detalhado e dispara a regeneração completa com backup automático.

---

## 6. Pela Interface Web Dedicada do Projeto Satélite ([ui.mjs](../scripts/ui.mjs))

Em qualquer máquina (mesmo sem a progenitora clonada), você pode subir a interface web local do projeto satélite com zero dependências externas:

```bash
# Execução direta com Node.js nativo (18+)
node governanca/scripts/ui.mjs

# Ou pelo atalho npm:
npm run rr:ui

# Apenas checagem rápida de integridade para agentes/CI (sem subir servidor bloqueante):
node governanca/scripts/ui.mjs --check
```

> [!NOTE]
> O script [ui.mjs](../scripts/ui.mjs) inicia um servidor HTTP contínuo. Agentes de IA autônomos devem executá-lo em segundo plano (background daemon) caso desejem manter a sessão ativa, ou utilizar a flag `--check` para validar a interface de forma síncrona sem travar o terminal.

O comando inicia um servidor HTTP local nativo na porta `3333` (ou porta livre subsequente) e abre automaticamente a tela dedicada do projeto no navegador:
- **Painel Visual Completo:** Exibe identidade, status do Git, métricas vivas de código, estimativa de tokens (`~3,8 carac/token`), gráfico SVG interativo de evolução de linhas e visualizador da stack tecnológica.
- **Explorador Interativo de Governança:** Navegação com leitor Markdown embutido para todos os padrões, workflows, skills e sprints.
- **Ações Locais Integradas:** Botões para disparar a sincronização essencial, regeneração total com confirmação, re-sincronização do harness e abertura do projeto no editor de código.
- **Auto-Atualização:** O próprio script [ui.mjs](../scripts/ui.mjs) viaja junto com a governança e é atualizado automaticamente sempre que você sincronizar a partir da matriz.

---

## 7. Hábito Obrigatório: Manutenção do [CHANGELOG.md](../CHANGELOG.md)

Toda vez que a governança matriz for alterada e for realizado um commit na matriz:
1. **Auditoria de Mudanças:** Execute `git diff` e `git status` para inspecionar todas as modificações.
2. **Atualização do Changelog:** Registre uma nova entrada em [CHANGELOG.md](../CHANGELOG.md), agrupando por `Adicionado`, `Modificado`, `Corrigido` ou `Removido`.
3. **Links Markdown Obrigatórios:** Toda referência a arquivos, documentos, skills ou workflows deve ser escrita como link Markdown verificável (exemplo: [CHANGELOG.md](../CHANGELOG.md)), nunca como texto puro solto.
4. **Commit:** Só conclua o commit após o changelog estar devidamente sincronizado e verificado com `npm test`.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
