# PRD — RR Organizador De Arquivos

> Gerado a partir do plano inicial do projeto e atualizado conforme alinhamento com o usuário.

**Gerado em:** 2026-08-07
**Última Modificação:** 2026-08-07

---

## Resumo Executivo

O **RR Organizador de Arquivos** é um software desktop em Python (PySide6 + SQLite) para organização automatizada e segura de arquivos locais. O sistema escaneia pastas recursivamente, exibe os arquivos com ícones visuais categorizados, simula a árvore de organização de destino antes de executar qualquer movimentação física, e distribui os arquivos organizados dentro de uma **Pasta Concentradora Matriz** personalizada.

## Requisitos

| ID | Descrição | Prioridade |
|----|-----------|------------|
| **RF-01** | **Persistência em SQLite**: Todo o estado de sessões, arquivos escaneados e rotas pós-organização gravados em SQLite local (`.db` na raiz do app). | Alta |
| **RF-02** | **Escaneamento Recursivo (Scanner)**: Varredura de pastas capturando metadados leves (Nome, Extensão, Caminho Original, Tamanho) sem congelar a UI. | Alta |
| **RF-03** | **Sincronização (Re-scan)**: Re-varredura da pasta atualizando o banco com arquivos novos e removendo deletados externos. | Média |
| **RF-04** | **Dashboard de Sessões**: Tela inicial listando históricos de varredura para fácil alternância. | Alta |
| **RF-05** | **Visualização Categorizada com Ícones**: Painel com abas categorizadas (Vídeos, Áudios, Imagens, Documentos, Atípicos) exibindo ícones visuais por tipo de mídia e somatória de tamanho. | Alta |
| **RF-06** | **Seleção e Recálculo Dinâmico**: Checkbox por arquivo para inclusão/exclusão da organização, recalculando tamanhos acumulados instantaneamente. | Alta |
| **RF-07** | **Abertura pelo SO**: Duplo clique no item abre o arquivo no programa padrão do SO. | Baixa |
| **RF-08** | **Lógica C de Divisão por Tamanho (Ordenada Crescentemente)**: Ordenar arquivos do menor para o maior. Preencher pastas até o limite. Se o arquivo exceder a sobra, fecha a pasta e abre a próxima. | Alta |
| **RF-09** | **Tratamento de Arquivos Sobredimensionados**: Arquivos maiores que o limite máximo por pasta ficam de fora automaticamente e recebem **destaque visual de cor (alerta/vermelho)** na tabela. | Alta |
| **RF-10** | **Pasta Concentradora Matriz**: Todos os arquivos e novas pastas divididas são colocados dentro de uma pasta matriz raiz configurável pelo usuário. | Alta |
| **RF-11** | **Simulação Prévia (Preview do Resultado)**: Visualização da árvore simulada das pastas e arquivos antes de efetuar qualquer alteração no disco. | Alta |
| **RF-12** | **Tratamento de Colisão de Nomes**: Renomeação incremental automática caso existam arquivos com o mesmo nome na movimentação (`video (1).mp4`). | Alta |
| **RF-13** | **Limpeza de Origem**: Opção para remover pastas de origem que permanecerem vazias após a organização. | Média |
| **RF-14** | **Desfazer Operações (Undo Seguro)**: Reversão completa da movimentação usando o histórico do banco, removendo as pastas geradas criadas pelo app. | Alta |

## Critérios de Aceite Globais

- [ ] Executável e build de testes passando sem erros.
- [ ] Interface gráfica reativa (PySide6) com ícones por categoria e feedback visual.
- [ ] Destaque em cor especial na tabela para arquivos que excedem o limite individual da pasta.
- [ ] Simulação funcional (Preview em árvore) gerada antes de autorizar a movimentação física.
- [ ] Testes unitários para a nova Lógica de Divisão Crescente e para o banco SQLite.

## Fora de Escopo

- Processamento pesado de codecs de vídeo/áudio ou geração de miniaturas/thumbnails dentro dos vídeos (usar ícones vetoriais/visuais de tipo).
- Sincronização em nuvem / rede (uso estritamente local).

---

*Documento atualizado conforme direcionamento do usuário.*
