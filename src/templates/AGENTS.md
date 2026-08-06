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

### Consistência Visual

- Sempre use componentes compartilhados para UI (Button, Input, Card, Modal).
- Se notar um elemento com estilos inline, classes avulsas ou variações de
  padding/cor/borda entre telas, extraia um componente imediatamente.
- A estética deve ser uniforme em todas as páginas — contraste, espaçamento,
  cantos arredondados e hover states devem seguir o mesmo padrão.

{{#if temPostgres}}
### Modelo de Dados

A fonte da verdade do schema é o estado **atual** do banco, extraído pelo
script `governanca/scripts/extrair-modelo.ps1` — **não** as migrations acumuladas.

- Antes de consultar ou alterar o banco, execute o script para regenerar `modelo-de-dados/`.
- **Mantenha sempre atualizado:** após aplicar novas migrations, regenere o modelo antes de prosseguir.
- Leia `modelo-de-dados/index.md` para a visão macro (domínios e dependências);
  abra a página do domínio (`modelo-de-dados/tabelas/`) apenas quando precisar dos detalhes.
- Se tabelas caírem em "Outros", atualize o mapeamento em
  `governanca/scripts/extrair-modelo.ts` e regenere.
- **Exceção:** migrations podem ser consultadas diretamente apenas quando for
  necessário confirmar dados sensíveis ou específicos que o modelo extraído
  não cobre (ex: valores de seed, defaults com dados sensíveis, histórico de
  alterações).
{{/if}}

## Arquitetura

Consulte `governanca/livro-arquitetura/` para visão geral da arquitetura do projeto.

## Estrutura de Pastas

Siga a convenção em `governanca/skills/convencoes-estrutura-de-pastas.md` para organização dos diretórios.

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
Abra **apenas** a skill relevante para a tarefa atual:

| Skill | Quando usar |
|---|---|
| `convencoes-estrutura-de-pastas.md` | Organizar pastas, criar estrutura, mover arquivos |
| `alinhar-stack-com-presets.md` | Plano/PRD com esboço de stack; vinculação de repositório existente |
| `criar-scripts-auxiliares.md` | Setup do ambiente; automatizar tarefas repetitivas |
| `criar-testes.md` | A cada tarefa: padrões de teste por stack e depuração de testes falhando |
| `mapear-logica-do-sistema.md` | Ao final de cada sprint (atualiza `livro-arquitetura/03-logica-do-sistema.md`) |
| `mapear-comportamento-autonomo.md` | Quando existir trigger/job/webhook/worker novo (atualiza `livro-arquitetura/04-comportamento-autonomo.md`) |
{{#if temPostgres}}| `criar-extrair-modelo.md` | Projetos PostgreSQL: criar o script que extrai `modelo-de-dados/` do banco real |{{/if}}
| `auditar-repositorio.md` | Auditoria de segurança, más práticas, inconsistências e oportunidades (onboarding, antes de produção, periódico) |
| `auditar-responsividade.md` | Auditoria mobile (onboarding, antes de release) |
| `auditar-consistencia-visual.md` | Unificar a aparência da UI em componentes compartilhados |
| `auditar-prontidao-producao.md` | Antes do primeiro deploy e após mudanças de infraestrutura/segurança |
| `auditar-comercializacao.md` | Antes de ativar pagamentos reais; após integrar provedor de pagamento |
| `auditar-competitividade.md` | Análise de mercado, concorrência e precificação |
{{#if ehGas}}| `auditar-repositorio-gas.md` | Projetos GAS: reforma de repositório (performance de I/O, LockService, quotas, segurança, deploy) |{{/if}}
| `faxina-completa.md` | "Faxina geral" orquestrando todas as auditorias em sequência |

`CATALOGO_TECNOLOGIAS.md` é o catálogo de tecnologias da progenitora — consulte
antes de escolher ou propor novas tecnologias.

## Gestão de Contexto

### Ao Final de Cada Sessão

1. Atualize o front-matter da sprint (`status`, `ultima_modificacao`, `sessao_atual`)
2. Marque onde parou com `← estou aqui` no corpo da sprint
3. Escreva o resumo da sessão nas notas persistentes (seção abaixo) no formato:
   ```
   Sessão N (data):
   - O que foi feito
   - Decisões tomadas
   - Próximos passos
   - Bloqueios (se houver)
   ```
4. Arquive sprints concluídas (veja `Arquivamento de Sprints` abaixo)

### Ao Iniciar uma Nova Sessão

1. Leia as notas persistentes abaixo
2. Identifique a sprint ativa pela linha `Sprint ativa:` nas notas
3. Abra o arquivo da sprint e procure por `← estou aqui`
4. Pode notas obsoletas: remova notas que referenciam tarefas ou débitos já resolvidos

### Arquivamento de Sprints

Após aprovação do usuário e commit, arquive a sprint:

```bash
mkdir -p governanca/sprints/concluidas
mv governanca/sprints/XX-titulo.md governanca/sprints/concluidas/XX-titulo.md
```

- **Nunca delete** uma sprint — apenas mova para `concluidas/`
- **Atualize o front-matter** antes de arquivar (`status: concluido`)
- **Mantenha o template** `_template.md` sempre em `sprints/`
- **Atualize as notas persistentes**: se a sprint arquivada era a ativa,
  troque `Sprint ativa:` para a próxima; se não houver mais sprints,
  remova a linha
- **Se for a última sprint**, pergunte ao usuário se deseja continuar com
  novas sprints; se sim, proponha e crie a sequência

---
