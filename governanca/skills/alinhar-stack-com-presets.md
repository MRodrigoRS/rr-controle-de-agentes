---
name: alinhar-stack-com-presets
description: Alinha a stack do plano/repositório com os presets da progenitora e atualiza presets e catálogo quando há ganho real.
---

# Skill: Alinhar Stack com Presets

> Instrui o agente a alinhar a stack do projeto com os presets da
> progenitora em dois cenários: (1) o plano/PRD do usuário traz um esboço
> de stack, e (2) um repositório existente está sendo vinculado. Compara
> as stacks, decide o caminho, e mantém presets e catálogo de tecnologias
> atualizados.

## Quando Usar

- **No onboarding ou vinculação**, quando o plano/PRD do usuário contiver
  um esboço de stack técnica (tecnologias, frameworks, bibliotecas,
  serviços, padrões, convenções)
- **Durante a vinculação de um repositório existente**, após examinar a
  estrutura e dependências do projeto

## Fluxo

### 1. Investigue a Stack

Compare **cada item** da stack em investigação com o preset embarcado na
governança, nos dois sentidos:

| Direção | Pergunta |
|---------|----------|
| Preset → Stack | O que o preset tem que a stack **não** tem? Isso é melhor? |
| Stack → Preset | O que a stack tem que o preset **não** tem? Isso agrega? |

Classifique cada gap como:
- **Superior** — substitui ou é estritamente melhor que o equivalente
- **Agrega** — adiciona algo que não existe no outro lado
- **Irrelevante** — não faz diferença prática (ex: lint que não se aplica ao runtime)

**Cenário A — stack do plano/PRD:** compare com o preset escolhido no
cadastro do projeto.

**Cenário B — repositório existente:** extraia as tecnologias dos
arquivos de configuração:

| Arquivo | O que procurar |
|---------|----------------|
| `package.json` | `dependencies`, `devDependencies`, `scripts` |
| `.clasp.json` | script ID, rootDir |
| `appsscript.json` | runtimeVersion, oauthScopes, timeZone |
| `tsconfig.json` | module, target, strict |
| `go.mod` | module name, Go version, dependências |
| `Dockerfile` | FROM image, exposições |
| `docker-compose.yml` | serviços, imagens, volumes |
| `.env.example` | variáveis de ambiente (indicam serviços) |
| `composer.json` | require, require-dev (PHP) |
| `Cargo.toml` | dependencies (Rust) |
| `*.csproj` | TargetFramework, PackageReference (C#) |
| `requirements.txt`, `pyproject.toml` | dependências (Python) |
| `Gemfile` | dependências (Ruby) |

Consulte também a estrutura de pastas para identificar padrões
arquiteturais (ex: `src/app/` → Next.js App Router, `prisma/` → Prisma,
`src/cenas/` → Three.js). Calcule o nível de match com cada preset:

| Nível | Critério | Ação |
|-------|----------|------|
| **Match alto** (>80% do preset presente) | O projeto segue fielmente o preset | Documente qual preset foi identificado |
| **Match médio** (50-80%) | Stack próxima com diferenças significativas | Avalie se é uma variação do preset |
| **Match baixo** (<50%) | Stack muito diferente de qualquer preset | Pergunte ao usuário se deseja criar um novo preset |

### 2. Apresente ao Usuário

Mostre a comparação em duas tabelas:
1. O que o preset tem de melhor que a stack
2. O que a stack tem que o preset não cobre

Pergunte: *"Com a visão completa, posso seguir com a stack mais completa
e evoluída?"*

### 3. Decisão

| Cenário | Ação |
|---------|------|
| **Preset é superior** em todos os aspectos relevantes | Siga o preset. Explique as substituições. |
| **A stack agrega** tecnologias/padrões que o preset não tem | **Não reescreva ainda.** Primeiro atualize os presets e o catálogo na progenitora (seção 4). |
| **Stack totalmente nova** — nenhum match com preset existente | Pergunte ao usuário se deseja criar um novo preset partindo dela. Se autorizado, crie seguindo o formato dos existentes em `presets.json` e faça commit. |
| **Repositório vinculado** representa evolução do preset | Atualize o preset e o registro do projeto (seções 4 e 5). |

> **Só atualize o preset se o repositório for claramente superior ou
> complementar.** Se a stack é mais antiga ou inferior, não altere o
> preset. **Nunca remova** tecnologias do preset baseadas em um único
> projeto.

### 4. Atualizar Presets e Catálogo na Progenitora

1. Para cadastrar uma tecnologia inédita no catálogo da progenitora, execute o comando atômico:
   ```bash
   cd ./
   npm run rr:tecnologia -- --nome "NomeDaTecnologia" --categoria "Categoria" --aplicabilidade "Breve descrição do caso de uso" --descricao "Descrição completa explicando o que é e para que serve"
   ```
   *O SQLite da progenitora atribuirá um ID inteiro auto-incremental imediatamente, atualizará o snapshot do Git e regerará o catálogo de tecnologias.*

2. Para vincular a tecnologia ao preset em `src/servidor/dados/presets.json`:
   - Adicione o ID numérico gerado no array `tecnologiaIds` do preset afetado.
   - Adicione o nome no array `stack`.
   - Se aplicável, adicione pastas novas em `pastas` e ajuste `descricao` e `destaque`.
   - **Validação obrigatória:** Execute `npm test` na progenitora para confirmar que todos os presets mantêm 100% de integridade referencial com o banco SQLite.

3. Faça um commit na progenitora para registrar a evolução:
   ```bash
   cd ./
   git add dados/ src/servidor/dados/
   git commit -m "feat(catalogo): adiciona <NomeDaTecnologia> e atualiza preset <id>"
   ```

4. Informe o usuário que o catálogo e os presets foram enriquecidos e ofereça regenerar a governança com os novos dados.

### 5. Registre no Projeto

- **Repositório vinculado:** documente a stack real em
  `governanca/livro-arquitetura/02-stack.md` e registre nas notas
  persistentes de `governanca/SESSAO.md`.
- Atualize o registro do projeto na progenitora para que o card exiba os
  presets corretos:
  ```bash
  cd ./
  curl -s -X PATCH http://localhost:3000/api/projetos/<ID_DO_PROJETO> \
    -H "Content-Type: application/json" \
    -d '{"presetFrontend": "<id>", "presetBackend": "<id>"}'
  ```
  > Substitua `<ID_DO_PROJETO>` pelo id real (consulte as notas
  > persistentes de `governanca/SESSAO.md` ou `dados/projetos.json` na progenitora).

### 6. Exemplo Prático

**Cenário:** Repositório tem `package.json` com Next.js 16, Tailwind 4,
shadcn/ui, Zod, Vitest e estrutura `src/app/`, `src/componentes/`.

**Detecção:** match com `nextjs-app-router`: 100%. Preset já cobre tudo.
Nenhuma atualização necessária.

**Cenário 2:** Repositório GAS usa `GmailApp`, `DocumentApp`, `UrlFetchApp`,
`ScriptApp` que o preset `gas-sheets` não cobre.

**Detecção:** match parcial (~70%). Repositório é uma evolução do preset →
adicionar as services ao `stack` do `gas-sheets`.

## Regras

- A stack do preset é a **base** — pode **agregar**, mas não deve
  **ignorar** o que o preset define, a menos que haja justificativa clara
- Tecnologias **inferiores** ao equivalente do preset são substituídas sem
  discussão (ex: lint desatualizado vs Biome/ESLint)
- Tecnologias que **não agregam** valor ao preset (específicas do domínio)
  ficam só no plano, sem entrar no preset
- **Só adicione** ao preset tecnologias reutilizáveis — nunca específicas
  de um único domínio
- Prefira sempre atualizar um preset existente a criar um novo
