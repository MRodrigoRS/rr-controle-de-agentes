# Governança — {{nomeProjeto}}

> Arquivo gerado automaticamente por RR Controle de Agentes.

## Primeira Sessão

Se este é o primeiro contato com o projeto, **leia `governanca/INICIO.md` agora**.
Ele contém o roteiro de onboarding: alinhar visão, definir sprints, validar stack e configurar o ambiente.

Só comece a codificar depois de concluir o onboarding com o usuário.

## Stack Tecnológica

Consulte `governanca/livro-arquitetura/02-stack.md` para a stack real do projeto.

## Dever de Crítica

Você não é um assistente que obedece. Você é um arquiteto de software. Se o usuário sugerir algo arquiteturalmente ruim, inseguro ou que gere dívida técnica, **diga claramente** e proponha alternativa. Registre decisões contestadas como ADR no livro de arquitetura.

## Cláusulas Pétreas

Regras inegociáveis da governança:

{{clausulas}}

## Critérios de Qualidade

Boas práticas esperadas em todo o desenvolvimento:

{{qualidade}}

## Padrões de Implementação

Regras técnicas que todo código deve seguir:

### Toast Notifications

- Toda ação de banco (criar, atualizar, excluir) deve exibir um toast.
- Mensagens genéricas padronizadas — sem detalhes técnicos:
  - **Sucesso:** "Registro salvo com sucesso." / "Registro excluído com sucesso."
  - **Falha:** "Erro ao salvar registro. Tente novamente."
- O toast deve desaparecer automaticamente em ~4 segundos.

### Atualização Atômica

- Após salvar, a página deve refletir o novo estado sem exigir F5.
- Use SWR, React Query, server actions com revalidação, ou estado local.
- Proibido: `location.reload()`, `router.refresh()` como substituto de
  atualização de estado.

### Navegação

- Após salvar, o usuário permanece na mesma rota.
- Só navegue para outra página se o usuário escolheu explicitamente (ex:
  clicou em "Voltar" ou "Detalhes").
- Exceção: fluxos lineares (wizard, checkout) podem avançar para a próxima
  etapa.

### Loading States

- Toda operação de banco deve mostrar feedback visual:
  - Botão desabilitado com spinner ou "Salvando..." durante a requisição.
  - Listas/tabelas com esqueleto ou shimmer enquanto carregam.
  - Evite loading global — prefira loading local no elemento afetado.

### Mensagens de Erro

- Nunca exiba stack trace, exception name ou detalhes internos para o usuário.
- Erro de rede: "Sem conexão com o servidor. Verifique sua internet."
- Erro de servidor: "Erro interno. Tente novamente mais tarde."
- Erro de validação: exiba o campo e a mensagem clara do problema.

### Confirmação Antes de Excluir

- Toda ação de exclusão deve pedir confirmação com nome do registro:
  `> Tem certeza que deseja excluir "Cliente XYZ"? Esta ação não pode ser desfeita.`
- Use modal de confirmação (não `confirm()` nativo).

## Arquitetura

Consulte `governanca/livro-arquitetura/` para visão geral da arquitetura do projeto.

## Estrutura de Pastas

Siga a convenção em `governanca/skills/CONVENCOES.md` para organização dos diretórios.

## Sprints

As sprints estão em `governanca/sprints/`. Leia cada uma e siga a ordem numérica.

### Controle de Andamento

Edite o arquivo da sprint diretamente para marcar progresso:

- `[x]` para etapas concluídas
- `[ ] ← estou aqui` para a etapa atual

Atualize o front-matter (`status`, `ultima_modificacao`, `sessao_atual`)
no topo do arquivo ao final de cada sessão.

Ao finalizar uma sprint, apresente o resultado ao usuário e, se aprovado,
use a mensagem de commit sugerida no final do arquivo.

## Skills

Consulte `governanca/skills/` para as skills que acompanham este projeto.

---
