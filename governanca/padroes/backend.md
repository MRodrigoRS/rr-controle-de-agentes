# Padrões de Desenvolvimento Backend e Segurança — rr-controle-de-agentes-1.1

> Manual oficial de arquitetura backend, regras de negócio e segurança da RR Tech Studio.
> Todo código de servidor, API, banco de dados ou integração deve seguir rigorosamente estas diretrizes.

**Gerado em:** 2026-10-06

---

## 1. Autoridade Única e Zero-Trust no Cliente (Anti-F12)

- **O Cliente é Hostil:** O frontend (web, mobile ou desktop) é uma camada de apresentação descartável e 100% manipulável pelo usuário via DevTools/F12, extensões ou ferramentas de requisição (cURL, Postman).
- **Proibição de Valores Calculados pelo Cliente:**
  - Nunca aceite valores finais, preços, taxas, descontos ou totais enviados prontos no payload da requisição.
  - O frontend deve enviar apenas os identificadores dos itens e as ações desejadas (ex: `{ produtoId: 10, quantidade: 2 }`).
  - O backend **deve obrigatoriamente** buscar os preços e regras no banco de dados e calcular os totais no servidor.
- **Validação de Papéis e Permissões (RBAC Real):**
  - Não confie na visibilidade de botões ou rotas protegidas do frontend.
  - Toda rota de API ou Server Action deve validar o token de autenticação, o tenant/organização e as permissões do usuário antes de executar qualquer consulta ou mutação.

---

## 2. Sanitização e Validação de Entrada

- **Schemas Estritos:** Toda entrada de dados (body, query params, headers de rota) deve ser validada contra um schema estrito (ex: Zod, Pydantic, etc.) logo na borda do controller/handler, rejeitando payloads com campos extras ou formatos inválidos.
- **Queries Parametrizadas (Sem SQL Injection):**
  - É expressamente proibida a concatenação ou interpolação de strings em comandos SQL (`"SELECT * FROM users WHERE id = '" + id + "'"`).
  - Utilize sempre parâmetros vinculados do driver/ORM (ex: `$1`, `?` ou queries preparadas pelo Drizzle/Prisma/SQLAlchemy).

---

## 3. Integridade de Dados e Transações Atômicas (ACID)

- **Operações Multi-Tabela:** Sempre que uma operação de negócio envolver alteração em mais de uma tabela ou registro dependente (ex: criar pedido + reservar estoque + debitar créditos):
  - É **obrigatório** encapsular todo o bloco dentro de uma transação atômica do banco de dados (`BEGIN / COMMIT / ROLLBACK`).
- **Persistência em Google Sheets / Google Apps Script (Single-Row Update):**
  - Em bancos de dados baseados em planilhas, é terminantemente proibido o uso de `clearContents()` seguido de reescrita da aba inteira para atualizar um ou poucos registros pontuais.
  - Toda mutação de registro existente deve ser pontual (**Single-Row Range Update**): localiza-se o índice da linha física lendo apenas o vetor de identificadores em memória e aplica-se `range.setValues([linhaAtualizada])` estritamente nas células daquele registro.
  - Toda gravação na planilha deve ser protegida por `LockService` com liberação obrigatória em bloco `finally`.
- **Idempotência em Ações Críticas:**
  - Webhooks de pagamento (Stripe, Mercado Pago, etc.) e endpoints de transações financeiras devem validar chaves de idempotência ou registrar o ID do evento para impedir processamentos repetidos em caso de retry de rede.

---

## 4. Tratamento Seguro de Erros e Respostas HTTP

- **Zero Vazamento de Detalhes Internos:**
  - As respostas de erro retornadas ao cliente (JSON/HTTP 4xx/5xx) devem conter apenas mensagens de negócio seguras e genéricas.
  - **Nunca vaze:** stack traces de exceções, consultas SQL, versões de bibliotecas, nomes de colunas ou chaves de banco de dados para o cliente.
- **Status HTTP Semânticos:**
  - `200 OK` / `201 Created` para sucessos.
  - `400 Bad Request` para erros de validação de schema.
  - `401 Unauthorized` para ausência ou expiração de credenciais.
  - `403 Forbidden` quando o usuário está autenticado mas não tem permissão para aquele recurso.
  - `404 Not Found` para recursos inexistentes.
  - `409 Conflict` para violação de regras de unicidade ou concorrência.
  - `500 Internal Server Error` apenas para falhas inesperadas do servidor (registradas no log interno).

---

## 5. Logging Seguro e Auditoria

- **Sem Dados Sensíveis (PII):** É terminantemente proibido registrar em logs (console, Pino, Winston, etc.) senhas em texto plano, números de cartão de crédito, tokens de sessão completos, chaves de API ou dados pessoais identificáveis.
- **Logs Estruturados:** Prefira logs estruturados em formato JSON com timestamp, nível (`info`, `warn`, `error`), contexto da rota e ID da requisição para facilitar observabilidade e depuração.

---

## 6. Gestão de Segredos e Configurações

- **Variáveis de Ambiente:** Nenhuma chave secreta, senha de banco, salt criptográfico ou token de terceiro pode residir hardcoded no código-fonte.
- **Versionamento:** Mantenha sempre um `.env.example` atualizado no repositório listando todas as variáveis necessárias com valores fictícios de exemplo, garantindo que o `.env` real permaneça no `.gitignore`.

---

## 7. Peculiaridades de Plataforma (Google Apps Script / Serverless)

- **Backend em Google Apps Script (GAS):** Quando a aplicação utilizar Google Apps Script (com Google Sheets, HtmlService, DriveApp, etc.), a camada de servidor possui restrições estritas de latência RPC (200–500ms por chamada), cotas de execução e concorrência:
  - É **obrigatório** consultar e seguir o manual em [desenvolver-e-auditar-gas.md](../skills/desenvolver-e-auditar-gas.md).
  - Proibido ler/escrever na planilha dentro de laços (`getValue`/`appendRow` em loops); utilize sempre Batch Insert e Request Scope Cache.
  - Toda escrita concorrente deve utilizar `LockService` com timeout e liberação obrigatória no `finally`.
  - Segredos devem residir exclusivamente em `PropertiesService.getScriptProperties()`.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
