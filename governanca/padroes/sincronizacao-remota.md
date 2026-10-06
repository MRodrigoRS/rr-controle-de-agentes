# Manual de Sincronização Remota da Governança Matriz

> **Marca:** RR Tech Studio | **Autor:** Rodrigo Rafael  
> **Escopo:** Distribuição universal e consumo da governança em qualquer máquina ou projeto.

---

## 1. Visão Geral

A governança da **RR Tech Studio** opera em modelo matriz-satélite:
- **Matriz (Progenitora):** O repositório central (`MRodrigoRS/rr-controle-de-agentes`) mantém a fonte da verdade de padrões de engenharia, workflows, skills, presets e o catálogo de tecnologias.
- **Satélites (Projetos Associados):** Qualquer repositório de produto que herda a pasta `governanca/` e o harness `.agents/`.

Este manual estabelece como configurar, disponibilizar e consumir a governança da matriz em repositórios privados do GitHub a partir de qualquer computador.

---

## 2. Modos de Sincronização

A governança possui dois modos formais de atualização:

| Modo | Comando | Comportamento | Impacto no Projeto |
| :--- | :--- | :--- | :--- |
| **🟢 Essencial** *(Padrão)* | `node governanca/scripts/sincronizar.mjs`<br>`npm run rr:sync` | Atualiza padrões (`padroes/`), workflows (`workflows/`), skills (`skills/`), catálogo e `CHANGELOG.md`. | **Zero risco:** preserva intocados `SESSAO.md`, `PRD.md`, `sprints/` e `livro-arquitetura/`. |
| **🔴 Total** *(Hard Reset)* | `node governanca/scripts/sincronizar.mjs --total`<br>`npm run rr:sync -- --total` | Regenera 100% dos arquivos a partir dos templates da matriz para os presets configurados. | **Destrutivo com rede de segurança:** exige confirmação digitada (`REGENERAR TUDO`) e salva backup automático em `.backup-governanca-*`. |

---

## 3. Configuração de Acesso ao Repositório Privado

Como o repositório matriz é **privado**, outras máquinas precisam de autorização do GitHub para baixar os arquivos. Essa configuração é feita em duas etapas:

### Etapa 3.1: Gerar o Personal Access Token (PAT) no GitHub
*(Executado apenas uma única vez no navegador)*

1. Acesse o GitHub e clique na sua **foto de perfil** (canto superior direito) → **Settings**.
2. Na barra lateral esquerda, role até o final e clique em **Developer Settings**.
3. Selecione **Personal access tokens** → **Tokens (classic)**.
4. Clique em **Generate new token** → **Generate new token (classic)**.
5. Preencha os campos:
   - **Note:** `RR_GOVERNANCA_SYNC`
   - **Expiration:** Prazo desejado (ex: `90 days` ou `No expiration`)
   - **Scopes:** Marque a caixinha **`repo`** (acesso completo de leitura a repositórios privados).
6. Clique em **Generate token** e copie o token gerado (`ghp_...`).

---

### Etapa 3.2: Configurar o Token na Máquina de Trabalho
*(Executado uma vez por computador onde você for programar)*

#### No Windows (PowerShell):
Grave a variável de ambiente permanentemente no escopo do seu usuário:
```powershell
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_SEU_TOKEN_AQUI", "User")
```
*Feche e reabra o terminal para carregar a variável.*

#### No Linux / macOS / Codespaces (Terminal):
Grave a variável no seu arquivo de perfil:
```bash
echo 'export GITHUB_TOKEN="ghp_SEU_TOKEN_AQUI"' >> ~/.bashrc
source ~/.bashrc
```

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

O script `sincronizar.mjs` (Node.js 18+ nativo, zero dependências externas):
1. Lê `governanca/.matriz.json`.
2. Conecta à API do GitHub com o `GITHUB_TOKEN`.
3. Baixa as versões mais recentes dos manuais, workflows, skills e o `CHANGELOG.md`.
4. Invoca o `harness.mjs` para refletir as mudanças em `.agents/rules/`, `.agents/workflows/` e `.agents/skills/`.

---

### Cenário B: Vinculando um Projeto Novo do Zero em Outra Máquina
Se você estiver em um computador sem a progenitora clonada e quiser vincular um projeto novo:
1. Copie o script `sincronizar.mjs` para `governanca/scripts/sincronizar.mjs`.
2. Crie o arquivo `governanca/.matriz.json` com os presets desejados:
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

## 5. Pela Interface Web da Progenitora

No computador onde a aplicação Web da progenitora estiver em execução (`npm run dev`):
1. Acesse o painel de projetos.
2. No projeto desejado, clique no botão **Recriar Governança ▾**.
3. Escolha:
   - **🟢 Sincronizar Essencial (Seguro):** Atualização instantânea sem tocar no contexto local.
   - **🔴 Regeneração Total...:** Exibe a **Modal de Confirmação** com alerta detalhado e dispara a regeneração completa com backup automático.

---

## 6. Hábito Obrigatório: Manutenção do CHANGELOG.md

Toda vez que a governança matriz for alterada e for realizado um commit na matriz:
1. **Auditoria de Mudanças:** Execute `git diff` e `git status` para inspecionar todas as modificações.
2. **Atualização do Changelog:** Registre uma nova entrada em `governanca/CHANGELOG.md` e em `src/templates/CHANGELOG.md`, agrupando por `Adicionado`, `Modificado`, `Corrigido` ou `Removido`.
3. **Commit:** Só conclua o commit após o changelog estar devidamente sincronizado.
