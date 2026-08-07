# Plano — RR Organizador De Arquivos

**Gerado em:** 2026-08-07
**Última Atualização:** 2026-08-07

## Descrição

# Plano de Implementação: Organizador Inteligente de Arquivos (Atualizado)

## 1. Visão Geral do Sistema
Um software desktop em Python (PySide6) voltado para a organização automatizada de arquivos físicos. O programa escaneia pastas recursivamente, exibe arquivos com ícones representativos por tipo de mídia, permite simular a árvore de pastas antes da gravação final, e distribui os itens em uma **Pasta Concentradora Matriz** de destino com base em regras de quantidade, tamanho ou número de diretórios. Todo o histórico é mantido em um banco de dados **SQLite** local na raiz do programa.

---

## 2. Arquitetura de Dados (Centralizada)
Banco **SQLite** localizado em `dados_organizador.db` exclusivamente na raiz do app.

### Estrutura Relacional Básica
*   **Tabela `Sessoes`**: Gerencia projetos de organização (`id`, `caminho_raiz`, `pasta_matriz_destino`, `data_scan`, `configuracoes`).
*   **Tabela `Arquivos`**: Armazena o mapeamento (`id`, `sessao_id`, `nome_arquivo`, `caminho_original`, `caminho_novo`, `extensao`, `tamanho_bytes`, `marcado`, `status_organizacao`).

---

## 3. Novas Regras de Negócio e Recursos Solicitados

### 1. Lógica C de Tamanho Máximo (Ordenada do Menor para o Maior)
*   Os arquivos selecionados são ordenados de forma **crescente** por tamanho (`tamanho_bytes`).
*   A pasta atual vai recebendo os arquivos sequencialmente. Quando o próximo arquivo exceder o espaço restante na pasta, aquela pasta fecha e abre-se a próxima (ex: `Parte 1`, `Parte 2`).
*   **Tratamento de Arquivos Sobredimensionados**: Se um arquivo individual for maior que o próprio limite máximo configurado para as pastas, ele **não é movido** (é mantido no local original) e a tabela na UI exibe o item com **destaque em cor (alerta/vermelho)** avisando o usuário.

### 2. Pasta Concentradora Matriz
*   O usuário define o nome e caminho da **Pasta Concentradora Matriz** de destino (ex: `E:\Organizados_2026`).
*   Todas as subpastas criadas pela divisão (ex: `Vídeos - Parte 1`, `Fotos - Parte 2`) serão geradas **dentro** desta pasta matriz.

### 3. Simulação / Preview do Resultado (Árvore Prevista)
*   Antes de executar a movimentação física de arquivos no disco, a interface oferece um botão de **"Simular Organização"**.
*   É exibida uma visualização em árvore (Tree View) mostrando como ficará a estrutura de diretórios e quais arquivos irão para cada pasta, além dos arquivos destacados que ficarão de fora.

### 4. Apresentação Visual e Ícones
*   A interface gráfica exibirá ícones temáticos para categorias e extensões de arquivos (Vídeos, Áudios, Imagens, Documentos, Compactados e Outros), tornando o painel visualmente rico e fácil de navegar.

---

## 4. Histórico e Reversão (Undo)
*   **Movimentação:** `shutil.move` para dentro da Pasta Concentradora Matriz com tratamento de nomes homônimos (`video (1).mp4`).
*   **Desfazer:** Reverte os arquivos do `caminho_novo` para o `caminho_original` e deleta as pastas vazias geradas dentro da pasta matriz.

---

*Template gerado e atualizado pelo RR Controle de Agentes.*
