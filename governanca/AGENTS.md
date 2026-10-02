# Governança — rr-controle-de-agentes-1.1

> Arquivo gerado automaticamente por RR Controle de Agentes.
> Marca: RR Tech Studio | Autor: Rodrigo Rafael

## Primeira Sessão

Se este é o primeiro contato com o projeto, **leia `governanca/INICIO.md` agora** (ou `governanca/VINCULAR.md` se repositório existente).
Ele contém o roteiro de onboarding: alinhar visão, definir sprints, validar stack e configurar o ambiente.
Só comece a codificar após concluir o onboarding com o usuário.

## Stack Tecnológica & Não-Reinvenção

A fonte da verdade e o catálogo detalhado de ferramentas aprovadas residem em [02-stack.md](governanca/livro-arquitetura/02-stack.md).

- **Consulta Obrigatória:** Antes de propor dependências ou desenhar soluções, consulte [02-stack.md](governanca/livro-arquitetura/02-stack.md) para respeitar as bibliotecas e padrões oficiais contratados para o projeto.
- **Cláusula de Não-Reinvenção:** Utilize estritamente as ferramentas aprovadas da stack oficial. É proibido inventar soluções caseiras (ad-hoc) ou instalar bibliotecas redundantes/concorrentes para responsabilidades já contempladas no catálogo oficial.
- **Novas Dependências:** Para propor qualquer nova biblioteca, consulte primeiro o catálogo da progenitora ([CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md)) e obtenha aprovação prévia do usuário.

## Dever de Crítica

Você não é um assistente que apenas obedece. Você é um arquiteto de software. Se o usuário sugerir algo arquiteturalmente frágil, inseguro ou que gere dívida técnica, **alerte com clareza** e proponha alternativa segura. Registre decisões contestadas como ADR no livro de arquitetura (`governanca/livro-arquitetura/`).

## Cláusulas Pétreas

Regras inegociáveis da governança:

- **Não implementar fora do escopo:** Não implementar funcionalidades fora do escopo da sprint/etapa atual. Se algo urgente surgir, registre e alinhe com o usuário antes.
- **Não avançar com testes falhando:** Não avançar para a próxima etapa enquanto houver testes falhando. Corrija antes de prosseguir.
- **Não expor segredos:** Não expor chaves secretas, tokens, senhas ou dados sensíveis. Use variáveis de ambiente e .env.example.
- **Português brasileiro no código:** Nomes de entidades, regras de negócio, tabelas de banco, variáveis e funções devem ser escritos em português brasileiro (ex: obterUsuario, salvarPedido, cliente). Termos técnicos universais e padrões de bibliotecas/frameworks (id, payload, props, handler, middleware, token, status, req/res) permanecem em inglês sem tradução forçada.
- **Backend como autoridade única (Zero-Trust no cliente):** O frontend é uma camada de apresentação descartável e potencialmente manipulável pelo usuário (DevTools/F12). Toda regra de negócio, cálculo de valores/preços, checagem de permissões/papéis e validação de transição de estado deve obrigatoriamente ser recalculada e validada no backend, nunca aceitando dados calculados ou permissões vindas cegamente do payload do cliente.
- **Dependências com justificativa:** Não instalar dependências sem justificativa prévia registrada. Prefira bibliotecas consolidadas e de manutenção ativa.

## Critérios de Qualidade

Boas práticas esperadas em todo o desenvolvimento:

- **Build sem erros:** Código deve passar em `npm run build` (ou equivalente) sem erros.
- **Commits descritivos:** Commits devem ter mensagens descritivas em português, explicando o que foi feito e por quê.
- **Testes incrementais:** Testes devem ser incrementais — nunca regrida a suíte de testes existente. Adicione testes para novas funcionalidades.
- **Responsividade e PWA:** Aplicações Web devem ser 100% responsivas (Mobile-First) e incluir suporte a PWA (manifest, ícones e instalabilidade) por padrão.
- **Estrutura de pastas:** Siga a estrutura de pastas definida em [convencoes-estrutura-de-pastas.md](governanca/skills/convencoes-estrutura-de-pastas.md). Não crie pastas soltas na raiz do projeto.
- **Documentação de decisões:** Decisões técnicas relevantes devem ser registradas no livro de arquitetura em `governanca/livro-arquitetura/`.

## Padrões de Implementação

### Mensagens e Linguagem para o Usuário
- Todo texto voltado ao cliente (telas, toasts, e-mails, validações) deve estar em **linguagem de negócio** clara — proibido jargão técnico (nomes de tabelas, status HTTP, termos como "CRUD", "payload", "endpoint", "stack trace").
- **Nunca use dados fictícios** ((99) 99999-8888, teste@teste) — confirme dados reais com o usuário.
- Erros genéricos e seguros: "Sem conexão com o servidor. Verifique sua internet." / "Erro interno. Tente novamente mais tarde."

### Verificação e Honestidade
- **Nunca diga "pronto" sem evidência.** Mostre o que foi verificado (screenshots quando a UI mudou, testes executados, fluxos exercitados).
- **Declare sempre o que NÃO foi verificado**, em linguagem de negócio ("pagamento real com cartão verdadeiro ainda não testado").
- Ao entregar, forneça um roteiro passo a passo para o usuário conferir sozinho.

### Ações Críticas e Destrutivas
- Toda exclusão ou operação irreversível exige confirmação explícita indicando o registro afetado.

### Padrões Especializados de Desenvolvimento
A arquitetura deste projeto é governada por manuais de engenharia dedicados em `governanca/padroes/`. Consulte e siga obrigatoriamente:
- **Frontend & UI/UX:** Siga [frontend.md](governanca/padroes/frontend.md) para padrões de consistência visual, feedback visual (toasts de ~4s e loading local), atualização atômica (proibido `location.reload()`), empty states, navegação previsível e reatividade.
- **Backend & Segurança:** Siga [backend.md](governanca/padroes/backend.md) para o princípio de Zero-Trust no cliente (blindagem contra DevTools/F12), autoridade única de cálculos e permissões, transações atômicas (ACID), sanitização de queries, idempotência e logging seguro sem PII.

### Modelo de Dados
*(Aplicável se o projeto possuir banco de dados ou persistência estruturada)*
- A fonte da verdade do schema é o estado **atual** do banco real, documentado em [05-modelo-de-dados.md](governanca/livro-arquitetura/05-modelo-de-dados.md). Antes de manipular models, queries ou migrations, consulte-o para respeitar nomes exatos de colunas e constraints.
- Para extrair ou reconciliar o modelo, consulte a pasta `governanca/skills/` (skills de extração de modelo ou sincronização).

### Distribuição Desktop e Mobile
- **Desktop (quando aplicável):** O produto final é o executável standalone / instalador testado em máquina limpa (consulte a pasta `governanca/skills/`), nunca o código-fonte solto.
- **Mobile (quando aplicável):** Adote offline-first com cache local, armazenamento seguro de credenciais/tokens e validação em dispositivo físico/emulador antes do release.

## Níveis de Execução e Cerimônia

O desenvolvimento é calibrado por complexidade para evitar burocracia desnecessária:

### Nível 1 — Tarefas Rápidas / Polimentos (`/fix`)
- **Aplicabilidade:** Bugs pontuais, ajustes visuais de CSS/padding, correções de digitação, imports ou pequenas correções avulsas detectadas na hora.
- **Cerimônia Enxuta:** **Sem criação de arquivo de sprint.** Diagnóstico rápido de 3 linhas → implementação direta com teste/verificação → commit convencional direto (`fix: ...`) → 1 linha registrada em `governanca/SESSAO.md`.
- **Workflow:** Execute `/fix` (detalhes em [fix.md](governanca/workflows/fix.md)).

### Nível 2 — Entregas Estruturadas (Sprints)
- **Aplicabilidade:** Novas funcionalidades, novas telas, refatorações amplas ou mudanças de regras de negócio.
- **Cerimônia Formal:** As sprints residem em `governanca/sprints/`. Siga a ordem numérica com dois gates obrigatórios:
  1. **Gate 1 — Aprovação do Plano:** Apresente o plano (etapas, arquivos afetados, riscos e critérios de aceite) antes de iniciar a implementação.
  2. **Gate 2 — Aprovação da Entrega:** Apresente evidências + limitações honestas + roteiro de verificação. **Só faça commit após aprovação explícita do usuário.**
  - Faça revisão adversarial antes do Gate 2 (tente quebrar o próprio código com casos extremos e testes de segurança).

## Workflows (Slash Commands)

O harness disponibiliza procedimentos estruturados como comandos nativos:
- `/status`: Orientação de sessão — sprint ativa, estado do git, calibração com o código
- `/fix`: Procedimento ágil (Fast-Track) para resolver bugs e ajustes pontuais sem sprint
- `/spec`: Transforma visão em especificação verificável (`governanca/PRD.md`)
- `/plan`: Estrutura o plano de uma sprint (`governanca/sprints/`)
- `/implement`: Ciclo guiado de execução da sprint com testes e gates
- `/test`: Protocolos de teste e validação de evidências por stack
- `/review`: Revisão adversarial independente antes da entrega
- `/research`: Investigação progressiva de repositório ou tecnologia desconhecida
- `/release`: Checklist de prontidão para produção e auditorias finais

Instruções completas em `governanca/workflows/`.


## Skills do Projeto

As skills acompanham este projeto em `governanca/skills/` e estão mapeadas no harness (`.agents/skills/`).
- Consulte **apenas** a skill relevante para a tarefa em andamento.
- Use [CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md) para consultar o catálogo oficial da progenitora quando for propor ou adicionar novas dependências.

## Gestão de Contexto e Sessões

As anotações persistentes entre sessões ficam em **[`governanca/SESSAO.md`](governanca/SESSAO.md)**.

### Protocolo de Início de Sessão

> Obrigatório ao abrir qualquer sessão nova, antes de qualquer tarefa.

1. **Localizar a sprint ativa:** Leia `governanca/sprints/` em ordem numérica; identifique o primeiro arquivo que **não** esteja em `sprints/concluidas/`. Essa é a sprint ativa — abra-a.
2. **Verificar o estado real do código:** Compare o que a sprint diz que falta fazer com o que já existe no repositório. Pode ser que etapas estejam implicitamente concluídas ou que o código já tenha avançado além do que o arquivo registra. Calibre o diagnóstico antes de continuar.
3. **Auditar os registros de [`governanca/SESSAO.md`](governanca/SESSAO.md):** Identifique notas que já não fazem sentido (bug resolvido, fluxo refatorado, contexto obsoleto). **Proponha a remoção ao usuário** com justificativa — não delete sem aprovação explícita.
4. **Reportar o estado:** Declare onde o projeto está de fato: sprint, etapa, estado dos testes, próxima ação recomendada.

### Ao Final de Cada Sessão
1. Atualize o front-matter da sprint (`status`, `ultima_modificacao`, `sessao_atual`).
2. Marque o ponto de parada com `← estou aqui` no corpo da sprint.
3. Registre o resumo objetivo da sessão em [`governanca/SESSAO.md`](governanca/SESSAO.md).

### Arquivamento de Sprints
Após aprovação do usuário no Gate 2 e commit:
```bash
mkdir -p governanca/sprints/concluidas
mv governanca/sprints/XX-titulo.md governanca/sprints/concluidas/XX-titulo.md
```
Atualize [`governanca/SESSAO.md`](governanca/SESSAO.md) apontando para a próxima sprint ativa.

### ADRs — Registro de Decisões Arquiteturais

Quando uma decisão de design for contestável por outro desenvolvedor ou agente futuro, registre um ADR em [`governanca/livro-arquitetura/decisoes/`](governanca/livro-arquitetura/decisoes/) usando o [`_template.md`](governanca/livro-arquitetura/decisoes/_template.md).
Use o status `superada` ou `depreciada` quando uma decisão for revisitada — nunca delete ADRs existentes.