---
name: lapidar-skills
description: Audita e refina as skills do catálogo ou locais, eliminando ambiguidades, reduzindo verbosidade, fortalecendo exemplos e garantindo máxima adesão por modelos de IA.
---

# Skill: Lapidar Skills (Clareza, Precisão & Engenharia de Contexto)

> **Escopo:** Híbrido — Opera na Matriz (`rr-controle-de-agentes-1.1`) e nos Satélites (projetos associados).  
> **Modo de Uso:** Sob Demanda — disparado ao criar, revisar ou refatorar skills do catálogo ou skills locais.  
> **Meta-Objetivo:** Erradicar o "Prompt Rot" (apodrecimento de instruções), assegurando que cada skill seja direta, inequívoca, imperativa e de alta eficácia mesmo para modelos de IA mais compactos.

---

## 1. Quando Executar

- Ao criar uma nova skill no projeto ou na matriz.
- Quando um agente falhar, interpretar errado ou pular etapas descritas em uma skill existente.
- Antes de releases oficiais de versão da governança para garantir catálogo de classe mundial.
- Em auditorias periódicas de qualidade de prompts e manuais operacionais.
- Quando solicitado com prompts do tipo:
  - `"Lapide a skill [nome-da-skill]"`
  - `"Audite e melhore a clareza das nossas skills"`
  - `"Reduza a verbosidade e remova ambiguidades da skill X"`

---

## 2. Critérios de Excelência de uma Skill de Alto Desempenho

Uma skill bem escrita deve cumprir rigorosamente os 6 Pilares de Engenharia de Contexto:

1. **Imperatividade & Foco na Ação:**
   - Use verbos de ação diretos no modo imperativo (*"Execute"*, *"Inspecione"*, *"Valide"*, *"Gere"*).
   - Evite linguagem passiva ou sugestiva (*"Pode ser bom considerar talvez olhar..."*).
2. **Eliminação de Ambiguidade:**
   - Instruções que admitem duas interpretações devem ser reescritas com condições explícitas (`Se A, faça X; Se B, faça Y`).
   - Especifique caminhos de arquivos relativos ou absolutos exatos, flags de comando e formatos esperados.
3. **Economia de Tokens & Densidade Semântica:**
   - Remova preâmbulos filosóficos, introduções óbvias e repetições de parágrafos.
   - Cada frase deve guiar diretamente a uma decisão ou ação técnica do agente.
4. **Exemplos Canônicos (Few-Shot / Exemplos Claros):**
   - Forneça blocos de comando exatos e estruturas de saída reais (tabelas, JSONs ou trechos de código).
   - Mostre o que é uma execução correta vs. erros a evitar.
5. **Critérios de Aceite e Verificação Mecânica:**
   - Toda skill deve dizer claramente ao agente como **comprovar** que terminou a tarefa (ex: *"Execute npm test e certifique-se de zero falhas"*).
6. **Contrato do Harness (YAML Frontmatter):**
   - `name`: exato, kebab-case, coincidente com o nome do arquivo `.md`.
   - `description`: resumo imperativo em 1 a 2 linhas, destacando o gatilho e o benefício central para que o roteador de contexto ative a skill no momento correto.

---

## 3. Passo a Passo da Lapidação

### Etapa 1: Leitura Integral e Diagnóstico de Fricção
1. Abra e leia o arquivo `SKILL.md` (ou `governanca/skills/<nome>.md`) linha por linha na íntegra.
2. Identifique pontos de atrito:
   - Trechos longos que poderiam ser tabelas concisas ou listas numeradas.
   - Instruções contraditórias ou vagas.
   - Suposições de ambiente não declaradas (ex: dependências que podem não existir no SO do usuário).

### Etapa 2: Refatoração Cirúrgica do Conteúdo
1. **Refinar o Frontmatter:**
   - Garanta que a descrição contenha as palavras-chave que o usuário e os agentes usam naturalmente.
2. **Estruturar em Seções Padronizadas:**
   - `## 1. Quando Executar` (gatilhos claros e objetivos).
   - `## 2. Passo a Passo / Procedimento` (etapas numeradas e sequenciais).
   - `## 3. Exemplos Práticos & Comandos` (códigos copiáveis e executáveis).
   - `## 4. Critérios de Validação & Saída Esperada` (como provar o sucesso).
   - `## 5. Regras & O Que NÃO Fazer` (anti-padrões e restrições).
3. **Aplicar Links Markdown Estritos:**
   - Todos os apontamentos para outros manuais, scripts ou regras devem usar links Markdown válidos (ex: `[AGENTS.md](../AGENTS.md)`).

### Etapa 3: Sincronização e Validação do Harness
1. **Atualizar o Wrapper do Harness:**
   - Execute o script oficial do harness para sincronizar a skill com `.agents/skills/<nome>/SKILL.md`:
     ```bash
     node governanca/scripts/harness.mjs
     ```
2. **Executar a Suíte de Validação:**
   - Na matriz, execute `npm test` para garantir integridade referencial dos links e paridade dos wrappers.
   - No satélite, confirme que o link do wrapper resolve corretamente para a governança local.

---

## 4. O Que NÃO Fazer

- ❌ Não transforme uma skill em um tratado teórico — skills são manuais de ação operacional rápida.
- ❌ Não omita comandos do terminal quando eles forem o caminho mais confiável.
- ❌ Não use referências genéricas como *"procure na pasta de configurações"*; use caminhos explícitos.
- ❌ Não remova orientações de segurança e prevenção de bugs em prol de brevidade excessiva.
