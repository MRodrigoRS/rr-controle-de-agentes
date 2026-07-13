# Skill: Comparar Stack do Preset com a Stack do Plano

> Instrui o agente a comparar a stack técnica do preset (embarcada na
> governança) com a stack descrita no plano/PRD do usuário, e agir de acordo.

## Quando Usar

Sempre que o usuário apresentar um plano, PRD ou descrição que contenha
um esboço de stack técnica (tecnologias, frameworks, bibliotecas, serviços,
padrões, convenções).

## Fluxo

### 1. Investigação Bidirecional

Compare **cada item** das duas stacks nos dois sentidos:

```
Stack do Preset (governança)  ←→  Stack do Plano (usuário)
```

Para cada tecnologia/padrão/convenção, determine:

| Direção | Pergunta |
|---------|----------|
| Preset → Plano | O que o preset tem que o plano **não** tem? Isso é melhor? |
| Plano → Preset | O que o plano tem que o preset **não** tem? Isso agrega? |

Classifique cada gap como:
- **Superior** — substitui ou é estritamente melhor que o equivalente
- **Agrega** — adiciona algo que não existe no outro lado
- **Irrelevante** — não faz diferença prática (ex: ferramenta de lint que não se aplica ao runtime)

### 2. Apresente ao Usuário

Mostre a comparação de forma clara, em duas tabelas:

1. O que o preset tem de melhor que o plano
2. O que o plano tem que o preset não cobre

Pergunte: *"Com a visão completa do plano, posso reescrevê-lo aplicando a stack mais completa e evoluída?"*

### 3. Decisão

| Cenário | Ação |
|---------|------|
| **Preset é superior** em todos os aspectos relevantes | Reescreva o plano/PRD para refletir a stack do preset. Explique as substituições. |
| **Plano agrega** tecnologias/padrões que o preset não tem | **Não reescreva o plano ainda.** Primeiro atualize os presets na progenitora para incorporar o que o plano traz de melhor, depois use a skill `contribuir-tecnologias.md` para registrar tecnologias inéditas no catálogo. Só então gere uma nova governança com os presets atualizados. |
| **Misto** — cada lado tem vantagens | Siga os dois caminhos: (1) atualize os presets com o que o plano agrega, (2) reescreva o plano aplicando o que o preset tem de melhor. |

### 4. Como Atualizar os Presets

Se o plano agregou tecnologias ou padrões que merecem entrar nos presets:

1. Edite `src/servidor/dados/presets.json` na progenitora
2. Para cada preset afetado:
   - Adicione tecnologias faltantes no array `stack`
   - Se aplicável, adicione pastas novas em `pastas`
   - Atualize os campos em `arquitetura` se necessário
   - Ajuste a `descricao` e `destaque` para refletir o escopo ampliado
3. Após editar os presets, execute a skill `contribuir-tecnologias.md` para
   registrar no catálogo qualquer tecnologia que ainda não conste
4. Faça commit das alterações nos presets com a mensagem:
   `"preset(s) <id1>, <id2> melhorado(s): <sumário do que foi adicionado>"`
5. Se houver tecnologias novas no catálogo, faça um commit separado:
   `"tecnologias novas incluídas: <lista das tecnologias>"`

> **Importante:** São dois commits separados — um para os presets, outro para
> as tecnologias — para manter o histórico limpo na progenitora.

### 5. Exemplo Prático

**Cenário:** Plano menciona `GmailApp`, `DocumentApp`, `UrlFetchApp`, `ScriptApp`
que o preset `gas-sheets` não inclui.

**Ação:**
1. Adicionar ao `stack` do `gas-sheets`: `"GmailApp"`, `"DocumentApp"`,
   `"UrlFetchApp"`, `"ScriptApp"`
2. Adicionar `"OAuth2"` se aplicável
3. Rodar `contribuir-tecnologias.md` para registrar qualquer tecnologia
   inédita no `tecnologias.json`
4. Informar o usuário que os presets foram atualizados e oferecer regenerar
   a governança ou seguir com a atualizada

## Regras

- A stack do preset é a **base** — o plano pode **agregar** mas não deve
  **ignorar** o que o preset já define, a menos que haja justificativa clara
- Tecnologias do plano que são **inferiores** ao equivalente do preset devem
  ser substituídas sem discussão (ex: lint desatualizado vs Biome/ESLint)
- Tecnologias do plano que **não agregam** valor ao preset (ex: específicas
  demais do domínio) podem ficar só no plano, sem entrar no preset
- **Nunca remova** tecnologias do preset baseadas apenas no plano — o preset
  é a stack padrão para todos os projetos futuros
