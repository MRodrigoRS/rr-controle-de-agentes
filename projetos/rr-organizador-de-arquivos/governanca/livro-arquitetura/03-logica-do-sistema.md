# Lógica do Sistema — RR Organizador De Arquivos

> Documenta o comportamento do sistema: regras de negócio, fórmulas, fluxos
> de dados, estados, workflows e integrações.

**Gerado em:** 2026-08-07
**Última Atualização:** 2026-08-07 (Sprint 1)

---

## Regras de Negócio

| ID | Regra | Onde | Referência |
|----|-------|------|------------|
| RN-01 | **Classificação de Categoria por Extensão**: Extensões de arquivo são mapeadas para vídeos, áudios, imagens, documentos ou atípicos. | `src/servicos/scanner.py` | `classificar_categoria()` |
| RN-02 | **Re-scan Sincronizado**: Ao forçar o re-scan de uma sessão existente, os registros antigos de arquivos no banco são purgados e recriados do SO. | `src/servicos/scanner.py` | `ServicoScanner.escanear_pasta()` |
| RN-03 | **Lógica A (Fatiamento por Qtd)**: Divide N arquivos marcados em blocos fixos de K arquivos por pasta. | `src/servicos/divisor.py` | `ServicoDivisor.dividir_por_quantidade_arquivos()` |
| RN-04 | **Lógica B (Distribuição por Qtd de Pastas)**: Distribui os arquivos marcados de forma equilibrada em K pastas (Round-Robin). | `src/servicos/divisor.py` | `ServicoDivisor.dividir_por_quantidade_pastas()` |
| RN-05 | **Lógica C (Tamanho Máximo Crescente)**: Ordena arquivos marcados do menor para o maior. Se o próximo arquivo exceder o espaço restante na pasta atual, abre uma nova pasta. | `src/servicos/divisor.py` | `ServicoDivisor.dividir_por_tamanho_maximo_crescente()` |
| RN-06 | **Tratamento de Sobredimensionados**: Arquivos cujo tamanho individual excede o limite máximo configurado para as pastas recebem `status_organizacao = 'sobredimensionado'` e são mantidos no local original. | `src/servicos/divisor.py` | `ServicoDivisor.dividir_por_tamanho_maximo_crescente()` |

## Fórmulas e Cálculos

| ID | Fórmula | Descrição | Onde |
|----|---------|-----------|------|
| F-01 | $P = \lceil N / K \rceil$ | Cálculo da quantidade de pastas para divisão por quantidade de arquivos. | `src/servicos/divisor.py` |
| F-02 | $S = \sum \text{tamanho\_bytes}$ | Tamanho total acumulado dos arquivos em uma pasta proposta. | `src/servicos/divisor.py` |

## Fluxos de Dados

```
[Sistema de Arquivos / SO]
       │ (os.walk)
       ▼
[ServicoScanner] ────── (bulk_insert) ──────► [SQLite: dados_organizador.db]
       │                                                      │
       ▼                                                      ▼
[ServicoDivisor] ◄─────────────────────────────────────────────┘
       │
       ▼
[ResultadoDivisao (Pastas Propostas + Sobredimensionados)]
```

## Máquinas de Estado

**Entidade:** `Arquivo`

```
┌───────────┐    Divisão/Validação    ┌────────────────────┐
│ pendente  │ ───────────────────────► │ sobredimensionado  │
└───────────┘                          └────────────────────┘
      │
      │ Movimentação física concluída
      ▼
┌────────────┐
│ organizado │
└────────────┘
```

| De | Para | Ação | Condição |
|----|------|------|----------|
| `pendente` | `sobredimensionado` | Executar Lógica C | Tamanho do arquivo individual > limite máximo configurado por pasta |
| `pendente` | `organizado` | Executar Movimentação | Arquivo movido com sucesso para a pasta de destino |
