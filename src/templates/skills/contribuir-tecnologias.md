# Skill: Contribuir Tecnologias

> Instrui o agente a identificar novas tecnologias utilizadas no projeto e
> registrá-las no catálogo da progenitora (RR Controle de Agentes).

## Catálogo de Tecnologias

Consulte `CATALOGO_TECNOLOGIAS.md` neste mesmo diretório para ver a lista
completa de tecnologias já catalogadas, com suas categorias e rankings.

## Como contribuir

1. Identifique uma tecnologia usada neste projeto que **não** consta no catálogo
2. Adicione-a ao arquivo da progenitora:
   ```
   {{caminhoRR}}src\servidor\dados\tecnologias.json
   ```
3. Siga exatamente o formato JSON abaixo:

```json
{
  "nome": "NomeDaTecnologia",
  "categoria": "{{categoriasLista}}",
  "ranking": 1,
  "aplicabilidade": "Breve descrição do caso de uso",
  "descricao": "Descrição completa explicando o que é e para que serve"
}
```

## Regras

- **nome:** Nome oficial da tecnologia (Ex: "Redis", "GraphQL", "Kafka")
- **categoria:** Deve ser uma das categorias existentes (veja `CATALOGO_TECNOLOGIAS.md`)
- **ranking:** Número inteiro. 1 = maior recomendação. Avalie onde a nova tecnologia
  se posiciona no ranking existente da categoria
- **aplicabilidade:** Frase curta explicando quando usar (máx. 80 caracteres)
- **descricao:** Parágrafo explicando o que é, para que serve e em que contexto
  é mais indicado

## Commitar as Alterações

Após adicionar a tecnologia ao `tecnologias.json`, faça o commit no
repositório da progenitora:

```bash
cd {{caminhoRR}}
git add src/servidor/dados/tecnologias.json
git commit -m "tecnologias novas incluídas: <nome da tecnologia>"
```

> O caminho `{{caminhoRR}}` é o diretório da progenitora neste mesmo
> computador. Se o comando acima falhar, navegue manualmente até o diretório
> da progenitora e execute o commit lá.

## Nota

A progenitora é um projeto Next.js. Você pode editar o `tecnologias.json`
diretamente — ele é um arquivo estático sem banco de dados.
