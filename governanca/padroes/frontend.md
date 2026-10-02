# Padrões de Desenvolvimento Frontend (UI/UX) — rr-controle-de-agentes-1.1

> Manual oficial de padrões de engenharia de interface da RR Tech Studio.
> Todo código de frontend (Web, Desktop ou Mobile) deve seguir rigorosamente estas diretrizes.

**Gerado em:** 2026-10-02

---

## 1. Consistência Visual e Componentização

- **Componentes Compartilhados:** Utilize sempre componentes da pasta compartilhada do projeto (`src/componentes/ui/` ou similar). É proibido criar elementos básicos soltos com estilos arbitrários (ex: `<button className="bg-blue-600...">` inline) quando existir um `<Button>` padronizado.
- **Uniformidade de Design System:** Mantenha coerência estrita em:
  - Espaçamentos e grid (escala padrão do Tailwind ou tokens de layout).
  - Raios de borda (border-radius consistentes em cartões, botões e modais).
  - Tipografia e hierarquia de títulos (H1, H2, H3).
  - Contraste e paleta de cores oficial da aplicação.

---

## 2. Feedback Visual, Loading States e Toasts

- **Loading States Locais:**
  - Toda operação assíncrona deve exibir feedback imediato no elemento afetado (ex: botão desabilitado exibindo spinner ou texto *"Salvando..."*).
  - É proibido travar a tela inteira com loading global quando a operação for local de um formulário ou botão.
- **Skeletons e Shimmers:**
  - Carregamento de tabelas, cartões e listagens deve exibir esqueletos visuais (*skeletons/shimmers*) com a estrutura aproximada do conteúdo. Evite telas em branco repentinas ou layouts que "pulam" ao carregar (*layout shift*).
- **Toast Notifications:**
  - Toda mutação relevante (criar, atualizar, excluir) deve disparar um toast informativo.
  - **Duração:** Automática de ~4 segundos.
  - **Linguagem de Negócio:** Mensagens claras para o usuário final, sem jargão técnico (ex: *"Registro salvo com sucesso."* / *"Não foi possível salvar o registro. Tente novamente mais tarde."*). Proibido exibir códigos HTTP (500, 404), stacktraces ou nomes de tabelas nos toasts.

---

## 3. Atualização Atômica e Reatividade

- **Sem Recarregar a Página:** Após salvar, editar ou excluir um registro, a interface deve refletir o novo estado de forma reativa.
- **Proibição Expressa:** É terminantemente proibido utilizar `location.reload()`, `window.location.href = window.location.href` ou recarregar a página inteira como atalho para atualizar dados.
- **Mecanismos Aprovados:** Utilize revalidação reativa da stack (ex: invalidação de cache do React Query/SWR, Server Actions com `revalidatePath`, atualização otimista ou atualização de estado no store local).

---

## 4. Navegação Previsível e Formulários

- **Permanência no Fluxo:** Após salvar uma alteração em formulários de edição ou configurações, mantenha o usuário na mesma tela exibindo o toast de confirmação.
- **Exceções Legítimas:** Apenas navegue para outra rota se o usuário escolheu explicitamente (clique em *"Voltar"*, *"Cancelar"*) ou se for um fluxo linear estrito (como assistente/wizard de cadastro por etapas ou checkout concluído).
- **Prevenção de Duplo Clique:** Desabilite botões de submissão enquanto a requisição estiver pendente para impedir disparos duplicados acidentais.
- **Debounce em Buscas:** Campos de filtro em tempo real e pesquisa devem implementar *debounce* (ex: 300ms a 500ms) para não bombardear o backend a cada tecla digitada.
- **Empty States:** Listagens e tabelas sem registros devem exibir mensagens e ilustrações claras de estado vazio (*empty states*), com instrução de como cadastrar o primeiro item.

---

## 5. Validação de Entrada e Formulários

- **Validação no Cliente:** Valide formulários antes do envio utilizando os schemas compartilhados (ex: Zod, React Hook Form) para dar feedback instantâneo de erros nos campos.
- **Lembre-se:** A validação no frontend existe estritamente para usabilidade do cliente; a autoridade final e regras de segurança pertencem obrigatoriamente ao backend.

---

## 6. Tratamento de Erros e Autenticação

- **Sessão Expirada (401/403):** Se uma requisição retornar 401 (não autorizado), o frontend deve limpar a sessão local e redirecionar suavemente para o login, preservando a rota atual via parâmetro (ex: `/login?returnUrl=...`) para que o usuário não perca seu trabalho após reautenticar.
- **Erros de Conexão:** Exiba avisos compreensíveis (*"Sem conexão com o servidor. Verifique sua internet."*).

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
