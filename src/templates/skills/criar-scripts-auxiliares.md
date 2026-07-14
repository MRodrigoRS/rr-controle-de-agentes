# Skill: Criar Scripts Auxiliares

> Instrui o agente a criar e manter scripts utilitários que automatizam
> tarefas recorrentes de desenvolvimento, garantindo consistência entre
> sessões e facilitando o uso por parte do usuário.

## Local

Todos os scripts devem ficar em `governanca/scripts/`.

## Quando Criar

- **Setup do ambiente** (Passo 4 do INICIO.md) — crie os scripts padrão
  conhecidos para a stack do projeto
- **Sob demanda** — quando você ou o usuário identificar uma tarefa manual
  repetitiva, crie um script para automatizá-la

## Scripts Padrão por Stack

Para cada stack, crie os scripts aplicáveis:

### Node.js / TypeScript / Next.js / Vite

| Nome | Comando | Quando usar |
|------|---------|-------------|
| `scripts/dev.ps1` | `npm run dev` | Iniciar servidor de desenvolvimento |
| `scripts/build.ps1` | `npm run build` | Build de produção |
| `scripts/test.ps1` | `npm run test` | Rodar testes |
| `scripts/lint.ps1` | `npx biome check` | Verificar lint e formatação |
| `scripts/typecheck.ps1` | `npx tsc --noEmit` | Verificar tipos TypeScript |

### Google Apps Script

| Nome | Comando | Quando usar |
|------|---------|-------------|
| `scripts/deploy.ps1` | `clasp push` | Enviar código para o GAS |
| `scripts/open.ps1` | `clasp open` | Abrir projeto no editor do GAS |
| `scripts/version.ps1` | `clasp version` | Criar nova versão |

### Prisma / Drizzle (se aplicável)

| Nome | Comando | Quando usar |
|------|---------|-------------|
| `scripts/migrate.ps1` | Conforme ORM | Rodar migrations |
| `scripts/seed.ps1` | Conforme projeto | Popular banco com dados de teste |
| `scripts/reset-db.ps1` | Conforme ORM | Resetar banco de dados |

### Go

| Nome | Comando | Quando usar |
|------|---------|-------------|
| `scripts/build.ps1` | `go build ./...` | Compilar o projeto |
| `scripts/test.ps1` | `go test ./...` | Rodar testes |
| `scripts/lint.ps1` | `golangci-lint run` | Verificar lint |

## Scripts Descobertos

Sempre que você ou o usuário perceber uma tarefa manual repetitiva, crie
um script. Exemplos comuns:

| Situação | Script sugerido |
|----------|-----------------|
| Precisa extrair o modelo de dados do banco e gerar documentação | `scripts/extrair-modelo.ps1` |
| Precisa importar dados de um CSV para o banco regularmente | `scripts/importar-csv.ps1` |
| Precisa limpar dados de teste antes de cada sessão | `scripts/limpar-dados.ps1` |
| Precisa criar um backup manual do banco | `scripts/backup.ps1` |
| Precisa reiniciar serviços (DB, cache, etc.) | `scripts/restart-servicos.ps1` |
| Precisa gerar relatório de uso/debug | `scripts/relatorio.ps1` |

## Extrutura de um Script

Siga este modelo para criar scripts no Windows (PowerShell):

```powershell
#!/usr/bin/env pwsh
# scripts/<nome>.ps1
# <descrição curta do que o script faz>
# Uso: ./scripts/<nome>.ps1 [argumentos]

$ErrorActionPreference = "Stop"
Write-Host "=== <nome>: <descrição> ===" -ForegroundColor Cyan

# --- lógica aqui ---

Write-Host "=== Concluído ===" -ForegroundColor Green
```

Para sistemas Unix, crie também uma versão `.sh` equivalente se o time
usar múltiplos ambientes.

## Registro em AGENTS.md

Toda vez que criar um script **ou** descobrir a necessidade de um novo,
adicione uma entrada nas notas persistentes do `AGENTS.md`:

```
Scripts disponíveis em scripts/:
- dev.ps1 — npm run dev
- test.ps1 — npm run test
- extrair-modelo.ps1 — extrai schema do banco para docs/modelo-de-dados.md
```

Isso garante que nas próximas sessões o agente (e o usuário) saibam
exatamente quais comandos usar sem ter que reler toda a configuração.

## Regras

- **Sempre use os scripts** em vez de digitar comandos soltos —
  consistência entre sessões depende disso
- **Mantenha os scripts atualizados** — se um comando mudar
  (ex: migrou de npm para pnpm), atualize o script correspondente
- **Nunca remova um script sem avisar** — o usuário pode estar
  acostumado a usá-lo manualmente
- **Comite os scripts** junto com o código — eles fazem parte do
  projeto
