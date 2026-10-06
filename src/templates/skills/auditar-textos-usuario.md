---
name: auditar-textos-usuario
description: Remove jargão técnico e contatos/valores fictícios dos textos que o cliente vê, antes de releases.
---

# Skill: Auditar Textos para o Usuário

> Audita toda a comunicação que o cliente vê — toasts, mensagens de
> erro/sucesso, labels, placeholders, empty/error states e e-mails —
> removendo jargão técnico e dados internos, e caçando contatos/valores
> fictícios ou placeholders que não deveriam ir a produção.

## Quando Executar

- **Antes do primeiro deploy** e de cada release pública
- **Ao final de sprints** que tocam a UI ou fluxos do cliente
- **Sob demanda** — sempre que o usuário pedir "polir os textos" ou revisar
  as mensagens do sistema

## Categorias de Análise

### 1. Jargão Técnico em Texto do Usuário

Varra tudo que o cliente lê: toasts, mensagens de sucesso/erro, confirmações,
labels, placeholders, tooltips, empty states, telas de erro e templates de
e-mail. Procure:

- **Nomes de serviços internos** — Supabase, Redis, S3, fila, webhook, API,
  servidor, banco de dados
- **Nomes de tabelas/colunas/entidades internas** — "id já existe na tabela
  clientes", "registro excluído de pedidos_itens"
- **Termos de engenharia** — endpoint, payload, CRUD, cache, migration,
  deploy, schema, query, status HTTP (404, 500)
- **Detalhes de implementação** — "imagem compactada e redimensionada para
  formato xx", "arquivo convertido para base64", "sincronizado via webhook"
- **Códigos/IDs técnicos** — UUIDs, hashes, nomes de função, caminhos de arquivo

**Regra:** se o cliente precisa entender engenharia para compreender a
mensagem, é jargão. Reescreva na língua do negócio.

**Exemplos de tradução:**

| Técnico (errado) | Usuário (certo) |
|---|---|
| Imagem compactada e redimensionada para formato xx e salva no supabase | Imagem do produto salva com sucesso |
| Erro ao salvar: id já existe na tabela clientes | Já existe um cliente com esse cadastro |
| Registro excluído de pedidos_itens | Item removido do pedido |
| Falha ao chamar o endpoint de pagamento (500) | Não foi possível processar o pagamento. Tente novamente |
| Cache invalidado. Refaça o login | Sua sessão foi atualizada. Entre novamente |

### 2. Dados Fictícios, Placeholders e Contatos Genéricos

Cace valores que nunca deveriam ir a produção:

- **Telefones/WhatsApp** — (99) 99999-8888, (00) 00000-0000, 12345-6789
- **E-mails** — teste@teste, exemplo@exemplo, user@example.com, nome@email.com
  ou qualquer domínio obviamente falso/de exemplo
- **Endereços** — Rua Exemplo, 123; "seu endereço"; cidade fictícia
- **Documentos** — CPF/CNPJ de exemplo (000.000.000-00, 11.222.333/0001-81)
- **Textos de preenchimento** — "Lorem ipsum", "[TEXTO]", "TBD", "TODO",
  "exemplo", "teste"
- **Dados de seed/teste visíveis** — clientes, produtos ou pedidos de teste
  aparecendo em listas, relatórios ou no site
- **URLs internas** — localhost, painel de admin, links para arquivos locais

**Regra:** **nunca presuma** o valor correto. Pergunte ao usuário os
contatos, endereços e dados reais antes de publicar.

## Saída

Gere o relatório em `governanca/relatorios/auditoria-textos.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para dados internos ou contatos/valores fictícios que iriam a
  público (expõe fluxo técnico ou informações erradas ao cliente)
- Use `[REC]` para jargão técnico que confunde o usuário
- Use `[SUG]` para melhorias de tom, clareza e consistência das mensagens

Para cada achado, inclua:
1. O local (arquivo/componente) e a mensagem atual
2. O **antes → depois** com a reescrita em linguagem de negócio
3. Para contatos/dados fictícios: marque que o valor real **precisa ser
   confirmado com o usuário** — não invente

Ao preencher a seção `## Sprint Sugerida`, agrupe as tarefas por severidade.
Cada mensagem corrigida vira uma tarefa com o antes → depois.

## Após Gerar o Relatório

1. **Registre nas notas persistentes** de `governanca/SESSAO.md` que a auditoria foi
   realizada e o caminho do relatório
2. **Apresente o resumo** ao usuário: total de achados, jargões mais comuns
   e contatos/dados fictícios encontrados
3. **Pergunte** os valores reais de qualquer contato/endereço/dado fictício —
   nunca preencha sozinho
4. Corrija os itens `[BLOQ]` **antes** do deploy; proponha os `[REC]`/`[SUG]`
   como tarefas de sprint se desejado
5. Se autorizado, crie as tarefas correspondentes nas sprints

## Regras

- **Todo texto visível ao cliente é linguagem de negócio** — sem nomes de
  serviços, tabelas, códigos técnicos ou detalhes de implementação
- **Nunca invente valores** (telefone, e-mail, endereço, CNPJ) — confirme
  com o usuário
- **Mensagens de sucesso** são simples e específicas do que o usuário fez
  ("Cliente salvo com sucesso"), não do que o sistema fez por baixo
- **Mensagens de erro** dizem o problema e a ação possível, sem termos técnicos
- Siga também a regra "Linguagem para o Usuário" nos Padrões de Implementação
  do [AGENTS.md](../AGENTS.md)
