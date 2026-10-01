---
name: mapear-grafo-de-conhecimento
description: Indexa o repositório com o Graphify (Tree-sitter, offline, zero tokens) e produz um grafo de conhecimento navegável para análise de dependências, blast radius e aceleração do onboarding em repositórios legados.
---

# Skill: Mapear Grafo de Conhecimento (Graphify)

> Gera um mapa estrutural do código via AST local, sem gastar tokens de IA
> e sem enviar o código para fora da máquina. Usado para orientar o agente
> em repositórios grandes ou antes de refatorações de alto risco.

## Quando Usar

- **Onboarding em repositório existente/legado:** Quando o agente assume um projeto
  com mais de ~30 arquivos de código e precisa de orientação arquitetural rápida.
- **Análise de Impacto (Blast Radius):** Antes de alterar um módulo crítico
  compartilhado (autenticação, pagamento, ORM principal, serviço central).
- **Aceleração da Sincronização:** No início das Etapas 1 e 3 da skill
  `sincronizar-documentacao` em projetos de médio/grande porte para acelerar
  o mapeamento de domínios e fluxos de chamada.

## Quando NÃO Usar

- Fixes pontuais (`/fix`): overhead desnecessário.
- Sprints cirúrgicas em 1–2 arquivos conhecidos.
- Projetos novos sem código-fonte real ainda (nada a indexar).

---

## Pré-requisito: Instalação (uma vez por máquina)

O Graphify é uma ferramenta de ambiente/CLI. **Não é instalado no projeto cliente (não polui `package.json`).**

```bash
# Via uv (recomendado — rápido e isolado):
uv tool install graphifyy

# Alternativas:
pipx install graphifyy   # via pipx
pip install graphifyy    # via pip (garanta que o diretório de scripts esteja no PATH)
```

> **Nota:** O pacote PyPI chama-se `graphifyy` (dois "y"), enquanto o comando CLI
> é `graphify` (um "y").

---

## Execução

Execute sempre da raiz do repositório do projeto cliente:

```bash
# 1. Indexar o repositório (Tree-sitter local, offline, zero tokens):
uvx graphifyy .

# 2. Mover os artefatos para a pasta de relatórios da governança:
mkdir -p governanca/relatorios/grafo
mv graph.json graph.html GRAPH_REPORT.md governanca/relatorios/grafo/
```

> **Por que mover?** Evita poluir a raiz do repositório com arquivos que não
> são código do produto. A pasta `governanca/relatorios/grafo/` centraliza
> essas análises.

---

## Higiene de Arquivos (Gitignore do Projeto Cliente)

Para manter o repositório limpo, garanta no `.gitignore` do projeto cliente:

```
# Grafo de conhecimento (artefato de análise local regenerável)
governanca/relatorios/grafo/graph.json
governanca/relatorios/grafo/graph.html
```

> O `GRAPH_REPORT.md` **pode** ser versionado opcionalmente se você e o usuário
> quiserem manter uma "foto" resumida da arquitetura em texto puro no histórico.

---

## Consultas Disponíveis (pós-indexação)

Com o grafo gerado, o agente pode consultar caminhos e relações sem ler arquivos inteiros:

```bash
# Descobrir quais módulos chamam ou dependem de um componente:
graphify query "quais componentes chamam o servico de autenticacao?"

# Traçar o caminho exato entre dois nós do código:
graphify path "LoginController" "UsuarioRepository"

# Explicar o papel estrutural de um módulo:
graphify explain "NomeDoModulo"
```

---

## Interpretando os Resultados

Após gerar o `GRAPH_REPORT.md`, leia-o para identificar:

1. **Clusters (Domínios Funcionais):** Grupos de arquivos que o algoritmo
   detectou como unidades coesas. Eles correspondem aos módulos a serem
   documentados em `governanca/livro-arquitetura/01-visao-geral.md`.

2. **God Nodes:** Arquivos ou funções chamados por quase todo o sistema. São
   pontos de alto acoplamento e alto risco — qualquer refatoração ali exige
   revisão rigorosa e testes abrangentes.

3. **Grau de Certeza das Relações:**
   - `EXTRACTED`: Relação concreta identificada via AST (ex: `import X from Y`). Confiabilidade máxima.
   - `INFERRED`: Relação lógica inferida (ex: eventos/mensageria). Valide no código antes de agir.
   - `AMBIGUOUS`: Relação incerta, requer confirmação visual.

---

## Uso Responsável: O Grafo é Auxiliar, Não Definitivo

> ⚠️ O grafo descreve *relações estruturais do código*, não *responsabilidades
> de negócio* nem *decisões de arquitetura (ADRs)*. Ele orienta onde olhar,
> mas não substitui a curadoria.

- Use o grafo para **orientar** o agente; redija os volumes de arquitetura com **curadoria**.
- Preserve ADRs e notas de contexto de negócio já existentes nos documentos.
- Nunca copie e cole o relatório bruto do Graphify diretamente no livro de arquitetura sem adequação conceitual.

---

## Atualização do Grafo

O grafo envelhece conforme o código evolui. Reconstrua-o quando:
- Novos módulos ou domínios forem criados.
- Houver refatorações amplas em serviços centrais.
- For realizar uma nova rodada de auditoria ou sincronização documental.

```bash
# O cache do Graphify é incremental — apenas arquivos modificados são reanalisados:
uvx graphifyy .
mv graph.json graph.html GRAPH_REPORT.md governanca/relatorios/grafo/
```

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
