# Skill: Deduzir Presets do Repositório

> Instrui o agente a examinar o código de um repositório existente, deduzir
> qual(is) preset(s) da progenitora mais se aproximam da stack encontrada,
> e atualizar os presets se o repositório representar uma evolução.

## Quando Usar

Durante a **vinculação de um repositório existente** (VINCULAR.md), após
examinar a estrutura e dependências do projeto.

## Fluxo

### 1. Examine as Dependências do Repositório

Para cada arquivo de configuração encontrado, extraia as tecnologias
identificadas:

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
arquiteturais (ex: `src/app/` → Next.js App Router, `src/pages/` →
Next.js Pages Router, `prisma/` → Prisma ORM, `src/cenas/` → Three.js).

### 2. Compare com os Presets da Progenitora

Monte uma lista das tecnologias detectadas e compare com os presets
disponíveis em `src/servidor/dados/presets.json` na progenitora.

Para cada preset (frontend e backend), calcule:

- **Match exato:** quantas tecnologias do preset estão presentes no repo
- **Match parcial:** tecnologias similares ou substitutas
- **Tecnologias extras no repo:** o que o repo tem que o preset não cobre
- **Tecnologias do preset ausentes no repo:** o que o preset espera mas o
  repo não tem

Classifique a similaridade:

| Nível | Critério | Ação |
|-------|----------|------|
| **Match alto** (>80% do preset presente) | O repositório segue fielmente o preset | Documente qual preset foi identificado |
| **Match médio** (50-80%) | Stack próxima mas com diferenças significativas | Avalie se o repo é uma variação do preset |
| **Match baixo** (<50%) | Stack muito diferente de qualquer preset | Identifique as tecnologias principais e considere criar novo preset |

### 3. Avalie se o Repositório Melhora o Preset

Se o repositório representa uma **evolução** em relação ao preset match:

- Adiciona tecnologias que faltavam no preset
- Remove dependências obsoletas
- Adota padrões mais modernos
- Tem uma arquitetura melhor documentada

Então atualize o preset na progenitora:

1. Edite `src/servidor/dados/presets.json`
2. Para o preset afetado:
   - Adicione tecnologias relevantes no array `stack`
   - Atualize `descricao` e `destaque` se necessário
   - Ajuste `pastas` e `arquitetura` se o repo revelar novos padrões
3. Execute a skill `contribuir-tecnologias.md` para registrar no catálogo
   qualquer tecnologia inédita
4. Faça commit das alterações:

   ```bash
   cd {{caminhoRR}}
   git add src/servidor/dados/presets.json
   git commit -m "preset(s) <id> melhorado(s) a partir de repositorio: <sumario das melhorias>"
   ```
5. Se houver tecnologias novas, commit separado:

   ```bash
   cd {{caminhoRR}}
   git add src/servidor/dados/tecnologias.json
   git commit -m "tecnologias novas incluídas a partir de repositorio: <lista>"
   ```
6. Atualize o registro do projeto na progenitora com os presets detectados:

   ```bash
   cd {{caminhoRR}}
   curl -s -X PATCH http://localhost:3000/api/projetos/<ID_DO_PROJETO> \
     -H "Content-Type: application/json" \
     -d '{"presetFrontend": "<id do preset frontend>", "presetBackend": "<id do preset backend>"}'
   ```

   > Substitua `<ID_DO_PROJETO>` pelo id real (consulte o AGENTS.md ou
   > `dados/projetos.json` na progenitora). Isso faz o card do projeto
   > exibir os presets corretos em vez de "nenhum / nenhum".

> **Importante:** Só atualize o preset se o repositório for claramente
> superior ou complementar. Se o repositório usa uma stack mais antiga
> ou inferior, não altere o preset.

### 4. Atualize a Stack no AGENTS.md

Com a stack detectada e os presets definidos, edite o arquivo
`governanca/AGENTS.md` no repositório do projeto para refletir
a stack real detectada:

1. Localize o bloco entre `=== INÍCIO DA STACK DETECTADA ===` e
   `=== FIM DA STACK DETECTADA ===`
2. Substitua o conteúdo pelas tecnologias identificadas:
   ```markdown
   === INÍCIO DA STACK DETECTADA ===
   - **Frontend:** Next.js 16 (React, Tailwind CSS, shadcn/ui)
   - **Backend:** Google Apps Script (GmailApp, Sheets, Drive)
   === FIM DA STACK DETECTADA ===
   ```
3. Este bloco é permanente — não será perdido na regeneração da governança

### 5. Exemplo Prático

**Cenário:** Repositório tem `package.json` com Next.js 16, Tailwind CSS 4,
shadcn/ui, Zod, Vitest, e estrutura `src/app/`, `src/componentes/`.

**Detecção:**
- Match com preset `nextjs-app-router`: 100%
- Tecnologias adicionais: Zod (já existe no preset), nenhuma extra relevante
- Conclusão: preset já cobre tudo. Nenhuma atualização necessária.

**Cenário 2:** Repositório GAS tem `GmailApp`, `DocumentApp`, `UrlFetchApp`,
`ScriptApp` que o preset `gas-sheets` não cobre.

**Detecção:**
- Match parcial com `gas-sheets`: 70% (faltam as services de e-mail/docs/pagamento)
- Tecnologias adicionais: GmailApp, DocumentApp, UrlFetchApp, ScriptApp
- Conclusão: repositório é uma evolução do preset → atualizar.

## Regras

- **Nunca remova** tecnologias do preset baseadas em um único repositório
- **Só adicione** tecnologias que sejam reutilizáveis (não específicas do
  domínio do repositório)
- Se o repositório tiver uma stack completamente nova que não se encaixa
  em nenhum preset existente, apenas documente — não crie um preset novo
- Prefira sempre atualizar um preset existente a criar um novo
