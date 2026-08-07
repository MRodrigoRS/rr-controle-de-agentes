---
status: concluida
ultima_modificacao: 2026-08-07
sessao_atual: 2
---

# Sprint 2: Interface PySide6, Visualização com Ícones e Simulação — RR Organizador De Arquivos

**Objetivo:** Construir a interface desktop em PySide6 com abas categorizadas, ícones visuais por extensão, destaque em cor para arquivos sobredimensionados e visualização em árvore da simulação (Preview pré-movimentação).

---

## Etapas

### Etapa 1: Janela Principal e Dashboard de Sessões

**Objetivo:** Criar o aplicativo PySide6 e o Dashboard de varreduras.

**Tarefas:**
- [x] Criar o ponto de entrada da aplicação em `src/ui/main.py`.
- [x] Criar a janela principal em `src/ui/janelas/principal.py` com suporte a tema/estilos (Fusion + QSS) em `src/recursos/`.
- [x] Implementar tela de seleção de diretório e lista de sessões recentes.

### Etapa 2: Tabela de Arquivos Categorizada com Ícones e Destaques

**Objetivo:** Exibir arquivos organizados por abas com ícones temáticos e destaque de cores.

**Tarefas:**
- [x] Implementar o componente de tabela `src/ui/componentes/tabela_arquivos.py`.
- [x] Adicionar abas por categorias (Vídeos, Áudios, Imagens, Documentos, Atípicos).
- [x] Adicionar suporte a ícones visuais por tipo de arquivo.
- [x] Implementar destaque em cor (linha/texto em vermelho/alerta) para arquivos maiores que o limite estipulado.
- [x] Implementar suporte a ordenação por colunas (padrão tamanho decrescente), duplo clique para abrir arquivo pelo SO (`os.startfile`) e checkboxes de seleção individual.

### Etapa 3: Componente de Simulação (Preview do Resultado)

**Objetivo:** Criar a visualização da árvore de pastas simulada.

**Tarefas:**
- [x] Criar modal ou aba de Simulação (`src/ui/componentes/preview_simulacao.py`).
- [x] Exibir estrutura em árvore (QTreeWidget) mostrando a Pasta Concentradora Matriz, as subpastas que serão criadas e os arquivos contidos em cada uma.
- [x] Exibir painel lateral resumindo quantos arquivos e qual o tamanho total de cada subpasta gerada.

---

## Andamento

- [x] Etapa em andamento
- [x] Testes passando
- [x] Código revisado

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-2: interface pyside6 com ícones, abas categorizadas e preview de simulação
```

---

## Aprendizados e Decisões

### Aprendizados Técnicos
- Uso de `QThread` em `WorkerScanner` para manter a UI reativa durante escaneamentos de diretórios.
- Utilização de `pytest-qt` para testes automatizados headless de widgets PySide6 (`qtbot`).

### Decisões de Design Confirmadas
- Destacamento visual em vermelho/alerta para arquivos marcados com `status_organizacao == "sobredimensionado"`.
- Implementação da `DialogPreviewSimulacao` (QTreeWidget) fornecendo visualização antes de autorizar qualquer alteração física no disco.
