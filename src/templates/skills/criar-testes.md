---
name: criar-testes
description: Padrões de testes por stack e fluxo de depuração de testes falhando.
---

# Skill: Criar Testes

> Orienta o agente a criar e manter testes adequados à stack do projeto,
> seguindo as convenções e garantindo cobertura mínima aceitável.

## Quando Executar

Esta skill é acionada **automaticamente** durante:

- **Cada tarefa de cada sprint** — após implementar o código, o agente
  deve escrever os testes correspondentes **antes** de passar para a
  próxima etapa
- **Correção de bugs** — após corrigir um erro, o agente escreve um
  teste que reproduza o bug para evitar regressão
- **Refatoração** — testes existentes devem continuar passando; novos
  cenários devem ser cobertos

## Por Stack

### Next.js / React + TypeScript

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | Vitest | `testes/unit/` — espelha `src/` |
| Componente | Vitest + Testing Library | `testes/unit/componentes/` |
| Integração | Vitest | `testes/integracao/` |
| E2E | Playwright | `testes/e2e/` |

**Comandos:**
```bash
npm run test          # vitest (unitário + integração)
npx vitest --run      # modo CI
npx playwright test   # e2e
```

### Google Apps Script (GAS)

| Tipo | Abordagem |
|------|-----------|
| Unitário | Funções puras testadas com `console.assert` ou `@gas-unit` |
| Integração | Teste manual na planilha/web app após deploy |
| Logs | `console.log()` + Stackdriver Logging |

**Comandos:** (nenhum automatizado — use `clasp run` para funções isoladas)

### Go

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | `testing` padrão | `*_test.go` ao lado do arquivo |
| Integração | `testing` + `httptest` | `testes/integracao/` |
| Benchmark | `testing.Benchmark` | nos próprios testes |

**Comandos:**
```bash
go test ./...              # todos os testes
go test -v ./...           # verbose
go test -cover ./...       # cobertura
```

### .NET (Blazor / ASP.NET Core)

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | xUnit | `testes/unit/` — espelha `src/` |
| Componente (Razor) | bUnit | `testes/unit/componentes/` |
| Integração/API | xUnit + WebApplicationFactory | `testes/integracao/` |
| Cobertura | coverlet | `dotnet test --collect:"XPlat Code Coverage"` |

**Comandos:**
```bash
dotnet test                     # todos os testes
dotnet test --filter Category=Unit  # filtro por categoria
dotnet test -c Release --collect:"XPlat Code Coverage"  # cobertura
```

### Node.js (Express, Fastify)

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | Vitest / Jest | `testes/unit/` |
| Integração | Vitest + supertest | `testes/integracao/` |
| API | Vitest + supertest | `testes/integracao/api/` |

**Comandos:** mesmos do Next.js acima.

### Python (FastAPI / NiceGUI)

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | pytest | `testes/unit/` — espelha `src/` |
| API | pytest + httpx (TestClient) | `testes/integracao/api/` |
| UI (NiceGUI) | pytest + utilitários do NiceGUI | `testes/ui/` |
| Cobertura | pytest-cov | `testes/` |

**Comandos:**
```bash
uv run pytest                     # todos os testes
uv run pytest testes/unit/        # filtro por diretório
uv run pytest --cov=src --cov-report=term-missing   # cobertura
```

**Convenções:**
- Nome de arquivos: `test_<modulo>.py`; funções `test_<comportamento>` ou classes `Test<Modulo>`
- API: use `TestClient`/`httpx` contra a app FastAPI com banco de teste isolado (SQLite em memória ou banco descartável)
- Regras de negócio: testes unitários puros nas funções de `src/servicos/`, sem tocar banco/HTTP

### Python Desktop (PySide6)

| Tipo | Ferramenta | Localização |
|------|-----------|-------------|
| Unitário | pytest | `testes/unit/` — espelha `src/` |
| UI (Qt) | pytest + pytest-qt (`qtbot`) | `testes/ui/` |
| Persistência | pytest + banco temporário | `testes/dados/` |
| Cobertura | pytest-cov | `testes/` |

**Comandos:**
```bash
uv run pytest                     # todos os testes
uv run pytest testes/ui/          # testes da interface
uv run pytest --cov=src --cov-report=term-missing   # cobertura
```

**Convenções:**
- Teste o **comportamento**, não o widget em si — use `qtbot` para simular
  cliques, entrada de texto e verificar o estado resultante
- Regras de negócio: testes unitários puros em `src/servicos/`, sem instanciar a UI
- Persistência: banco SQLite temporário (`tmp_path`), nunca o banco real do usuário

### Mobile (MAUI / Flutter / React Native)

| Stack | Tipo | Ferramenta | Localização |
|-------|------|-----------|-------------|
| MAUI | Unit (ViewModels/Services) | xUnit + Moq | `testes/unit/` |
| MAUI | Integração de API | xUnit + HttpClient fake | `testes/integracao/` |
| Flutter | Unit / Widget | Flutter Test | `test/<modulo>_test.dart` |
| Flutter | Integração | integration_test | `integration_test/` |
| React Native | Unit / Componente | Jest + Testing Library | `src/__tests__/` |
| React Native | E2E | Detox ou Maestro | `e2e/` |

**Comandos:**
```bash
dotnet test                        # MAUI (xUnit)
flutter test                       # Flutter (unit + widget)
flutter test integration_test      # Flutter (integração)
npx jest                           # React Native
```

**Convenções:**
- Teste ViewModels/Services isolando dependências com mock (Moq / manual fakes) — nunca o emulador no teste unitário
- Regras de negócio fora dos widgets/Views — em camadas testáveis (`Services`/`servicos`/`lib`)
- Permissões, deep links e notificações exigem validação em **dispositivo físico**

## Cobertura Mínima

- **Funções puras** (helpers, utils, validações): 90%+ de cobertura
- **Componentes de UI**: cenários de renderização, estados vazio/erro/sucesso
- **APIs / Server Actions**: status codes, validação de entrada, autenticação
- **Casos de erro**: pelo menos 1 teste para cada caminho de erro conhecido
- **Regressão**: 1 teste para cada bug corrigido

## Estrutura de Teste Recomendada

```typescript
// Nome do arquivo: funcionalidade.test.ts
describe("módulo / funcionalidade", () => {
  it("deve fazer X quando condição Y", () => {
    // Arrange
    // Act
    // Assert
  });

  it("deve falhar quando condição Z", () => {
    // Teste de caminho de erro
  });
});
```

## Depuração de Testes Falhando

Quando um teste falhar, siga este fluxo:

1. Reproduza o erro e capture a mensagem completa
2. Entenda o erro: o que era esperado vs. o que aconteceu?
3. Isole a causa (busca binária, logs, stack trace)
4. Levante 1-3 hipóteses
5. Teste a mais provável (uma mudança de cada vez)
6. Corrija e verifique (todos os testes passando)
7. Previna regressão: escreva um teste que reproduza o bug

## Regras

- **Nunca commitar sem testes** — a menos que o usuário autorize
  explicitamente (ex: protótipo descartável)
- **Teste o comportamento, não a implementação** — não trave testes em
  nomes de função internas
- **Mantenha testes independentes** — um teste nunca deve depender de
  outro para passar
- **Testes lentos vão para integração/e2e** — unitários devem ser rápidos
- Se a stack não tiver ferramenta de teste definida, **pergunte ao usuário**
  qual prefere antes de configurar
