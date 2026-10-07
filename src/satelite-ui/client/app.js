let arquivoAbertoAtual = "";

    async function carregarDados() {
      try {
        const res = await fetch("/api/info");
        const data = await res.json();

        document.getElementById("proj-nome").textContent = data.nome;
        document.getElementById("proj-desc").textContent = data.descricao || "Projeto sob a Governança Oficial RR Tech Studio";
        document.getElementById("meta-caminho").textContent = data.caminho;

        if (data.git) {
          document.getElementById("badge-branch").textContent = "branch: " + data.git.branch;
          if (data.git.hash) {
            document.getElementById("meta-commit").innerHTML =
              '<span style="color: var(--accent-green); font-weight: 500;">' + data.git.relativo + '</span> ' +
              '<span style="color: var(--accent-blue); font-family: monospace;">[' + data.git.hash + ']</span> — ' +
              (data.git.mensagem || "");
          } else {
            document.getElementById("meta-commit").textContent = "Sem commits recentes";
          }
        }

        if (data.metricas) {
          const m = data.metricas;
          document.getElementById("badge-lines").textContent = m.totalLinhas.toLocaleString("pt-BR") + " linhas";
          document.getElementById("meta-volume").innerHTML =
            '<span style="color: var(--accent-blue); font-weight: 600;">' + m.totalLinhas.toLocaleString("pt-BR") + ' linhas</span> ' +
            '(' + m.totalCaracteres.toLocaleString("pt-BR") + ' carac. • ' +
            '<span style="color: #a5d6ff; font-weight: 500;" title="~3.8 caracteres por token">' + m.tokensEstimados + '</span>) ' +
            'em ' + m.totalArquivos + ' arquivos';
        } else {
          document.getElementById("meta-volume").textContent = "Métricas indisponíveis";
        }

        if (data.matriz) {
          document.getElementById("meta-matriz").textContent =
            (data.matriz.repositorio || "Matriz Oficial") + " (" + (data.matriz.branch || "master") + ")";
          let presetsHtml = "";
          if (data.matriz.presetFrontend || data.matriz.presetBackend) {
            presetsHtml += '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">';
            if (data.matriz.presetFrontend) {
              presetsHtml += '<span class="badge" style="background:#21262d; border:1px solid #30363d; color: var(--accent-blue);">Frontend: ' + data.matriz.presetFrontend + '</span>';
            }
            if (data.matriz.presetBackend) {
              presetsHtml += '<span class="badge" style="background:#21262d; border:1px solid #30363d; color: var(--accent-green);">Backend: ' + data.matriz.presetBackend + '</span>';
            }
            presetsHtml += '</div>';
          }
          presetsHtml += '<p style="font-size: 0.8rem; color: var(--text-dim);">Última sincronização: ' + (data.matriz.atualizadoEm ? new Date(data.matriz.atualizadoEm).toLocaleString("pt-BR") : "N/D") + '</p>';
          document.getElementById("stack-content").innerHTML = presetsHtml;
        } else {
          document.getElementById("stack-content").innerHTML = '<p class="empty-msg">Nenhum preset registrado em .matriz.json.</p>';
        }

        // Commits
        const commitsList = document.getElementById("commits-list");
        if (data.historico && data.historico.length > 0) {
          document.getElementById("commits-count").textContent = data.historico.length;
          commitsList.innerHTML = data.historico.map(c =>
            '<li class="commit-row">' +
              '<span class="commit-hash">' + c.hash + '</span>' +
              '<span class="commit-msg" title="' + c.mensagem + '">' + c.mensagem + '</span>' +
              '<span style="font-size: 0.75rem; color: var(--text-dim);">' + c.relativo + '</span>' +
            '</li>'
          ).join("");
        } else {
          commitsList.innerHTML = '<li class="empty-msg">Nenhum histórico disponível.</li>';
        }

        // Preenche listas de arquivos
        renderizarListaArquivos("padroes", data.arquivos.padroes, "padroes/");
        renderizarListaArquivos("workflows", data.arquivos.workflows, "workflows/");
        renderizarListaArquivos("skills", data.arquivos.skills, "skills/");
        renderizarListaArquivos("arquitetura", data.arquivos.arquitetura, "livro-arquitetura/");

        // Sprints e Avulsos juntos
        const sprintsAvulsos = [
          ...(data.arquivos.avulsos || []),
          ...(data.arquivos.sprints || []).map(s => "sprints/" + s)
        ];
        renderizarListaArquivos("sprints", sprintsAvulsos, "");
        // Gráfico de evolução de linhas
        if (data.historicoLinhas && data.historicoLinhas.pontos) {
          pontosGrafico = data.historicoLinhas.pontos;
          totalCommitsGrafico = data.historicoLinhas.totalCommits;
          temMaisGrafico = data.historicoLinhas.temMais;
          renderizarGrafico(pontosGrafico);
        }
      } catch (err) {
        console.error("Falha ao carregar dados:", err);
      }
    }

    let pontosGrafico = [];
    let totalCommitsGrafico = 0;
    let temMaisGrafico = false;

    function renderizarGrafico(pontos) {
      if (!pontos || pontos.length < 2) {
        document.getElementById("card-grafico").style.display = "none";
        return;
      }
      document.getElementById("card-grafico").style.display = "flex";

      const primeiroPonto = pontos[0];
      const ultimoPonto = pontos[pontos.length - 1];
      const variacaoPeriodo = ultimoPonto.linhasTotais - primeiroPonto.linhasTotais;

      document.getElementById("grafico-badge-commits").textContent = pontos.length + " de " + totalCommitsGrafico + " commits";
      const elVariacao = document.getElementById("grafico-variacao");
      elVariacao.textContent = (variacaoPeriodo > 0 ? "+" : "") + variacaoPeriodo.toLocaleString("pt-BR") + " linhas";
      elVariacao.style.color = variacaoPeriodo > 0 ? "var(--accent-green)" : (variacaoPeriodo < 0 ? "var(--accent-red)" : "var(--text-muted)");

      const btnMais = document.getElementById("btn-carregar-mais-commits");
      btnMais.style.display = temMaisGrafico ? "inline-flex" : "none";

      const dim = {
        largura: 850,
        altura: 240,
        paddingLeft: 65,
        paddingRight: 35,
        paddingTop: 30,
        paddingBottom: 45
      };

      const valores = pontos.map(p => p.linhasTotais);
      const minVal = Math.min(...valores);
      const maxVal = Math.max(...valores);
      const margem = Math.max(10, Math.ceil((maxVal - minVal) * 0.15));
      const yMin = Math.max(0, minVal - margem);
      const yMax = maxVal + margem;
      const alcanceY = Math.max(1, yMax - yMin);
      const wUtil = dim.largura - dim.paddingLeft - dim.paddingRight;
      const hUtil = dim.altura - dim.paddingTop - dim.paddingBottom;

      const coords = pontos.map((p, idx) => {
        const x = pontos.length === 1
          ? dim.paddingLeft + wUtil / 2
          : dim.paddingLeft + (idx / (pontos.length - 1)) * wUtil;
        const y = dim.altura - dim.paddingBottom - ((p.linhasTotais - yMin) / alcanceY) * hUtil;
        return { x, y, p };
      });

      const dLinha = coords.reduce(function(acc, c, idx) {
        const pt = c.x.toFixed(1) + " " + c.y.toFixed(1);
        return idx === 0 ? "M " + pt : acc + " L " + pt;
      }, "");

      const chaoY = dim.altura - dim.paddingBottom;
      const dArea = coords.length > 0
        ? dLinha + " L " + coords[coords.length - 1].x.toFixed(1) + " " + chaoY + " L " + coords[0].x.toFixed(1) + " " + chaoY + " Z"
        : "";

      const svg = document.getElementById("svg-grafico");

      let svgHtml = '<defs>' +
        '<linearGradient id="gradienteAzul" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#58a6ff" stop-opacity="0.28" />' +
          '<stop offset="100%" stop-color="#58a6ff" stop-opacity="0.0" />' +
        '</linearGradient>' +
      '</defs>';

      // Linhas de Grade Horizontais
      [0, 0.5, 1].forEach(function(pct) {
        const y = dim.paddingTop + (dim.altura - dim.paddingTop - dim.paddingBottom) * (1 - pct);
        const valorLinha = Math.round(yMin + (yMax - yMin) * pct);
        svgHtml += '<line x1="' + dim.paddingLeft + '" y1="' + y + '" x2="' + (dim.largura - dim.paddingRight) + '" y2="' + y + '" stroke="#21262d" stroke-dasharray="3 3" stroke-width="1" />' +
          '<text x="' + (dim.paddingLeft - 10) + '" y="' + (y + 4) + '" fill="#7d8590" font-size="11" text-anchor="end" font-family="monospace">' + valorLinha.toLocaleString("pt-BR") + '</text>';
      });

      // Linha do chão
      svgHtml += '<line x1="' + dim.paddingLeft + '" y1="' + chaoY + '" x2="' + (dim.largura - dim.paddingRight) + '" y2="' + chaoY + '" stroke="#30363d" stroke-width="1" />';

      // Área e Linha
      if (dArea) svgHtml += '<path d="' + dArea + '" fill="url(#gradienteAzul)" />';
      if (dLinha) svgHtml += '<path d="' + dLinha + '" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />';

      // Pontos nos commits
      coords.forEach(function(c, idx) {
        svgHtml += '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" fill="#58a6ff" stroke="#0d1117" stroke-width="2" style="cursor: pointer;" data-idx="' + idx + '" class="grafico-ponto" />' +
          '<text x="' + c.x.toFixed(1) + '" y="' + (chaoY + 18) + '" fill="#7d8590" font-size="10" text-anchor="middle" font-family="monospace">' + c.p.hash + '</text>';
      });

      svg.innerHTML = svgHtml;

      // Adiciona eventos de hover
      const tooltip = document.getElementById("grafico-tooltip");
      svg.querySelectorAll(".grafico-ponto").forEach(function(el) {
        el.addEventListener("mouseenter", function(e) {
          const idx = parseInt(e.target.getAttribute("data-idx"), 10);
          const c = coords[idx];
          if (!c) return;

          const p = c.p;
          tooltip.innerHTML =
            '<div style="font-weight: 600; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between;">' +
              '<span style="color: var(--accent-blue); font-family: monospace;">[' + p.hash + ']</span>' +
              '<span style="color: var(--text-muted); font-size: 0.75rem;">' + p.data + '</span>' +
            '</div>' +
            '<div style="color: var(--text-main); margin-bottom: 6px; font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escaparHtml(p.mensagem) + '</div>' +
            '<div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 0.75rem; border-top: 1px solid var(--card-border); padding-top: 4px;">' +
              '<span style="color: #fff;">' + p.linhasTotais.toLocaleString("pt-BR") + ' linhas</span>' +
              '<span>' +
                '<span style="color: var(--accent-green);">+' + p.insercoes + '</span> / ' +
                '<span style="color: var(--accent-red);">-' + p.delecoes + '</span>' +
              '</span>' +
            '</div>';
          tooltip.style.display = "block";
          
          const rect = svg.getBoundingClientRect();
          const pontoX = (c.x / dim.largura) * rect.width;
          const pontoY = (c.y / dim.altura) * rect.height;

          let left = pontoX + 15;
          if (left + 260 > rect.width) left = pontoX - 270;
          let top = Math.max(10, pontoY - 40);

          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        });

        el.addEventListener("mouseleave", function() {
          tooltip.style.display = "none";
        });
      });
    }

    async function carregarMaisCommits() {
      const btn = document.getElementById("btn-carregar-mais-commits");
      btn.textContent = "Carregando...";
      btn.disabled = true;
      try {
        const novoLimite = pontosGrafico.length + 10;
        const res = await fetch("/api/historico-linhas?limit=" + novoLimite + "&offset=0");
        const data = await res.json();
        if (data.pontos) {
          pontosGrafico = data.pontos;
          totalCommitsGrafico = data.totalCommits;
          temMaisGrafico = data.temMais;
          renderizarGrafico(pontosGrafico);
        }
      } catch (e) {
        console.error("Falha ao carregar mais commits:", e);
      } finally {
        btn.textContent = "+ Carregar mais";
        btn.disabled = false;
      }
    }

    function renderizarListaArquivos(tipo, lista, prefixo) {
      const elCount = document.getElementById("count-" + tipo);
      const elList = document.getElementById("list-" + tipo);
      if (!elList) return;

      elCount.textContent = (lista || []).length;
      if (!lista || lista.length === 0) {
        elList.innerHTML = '<li class="empty-msg">Nenhum arquivo encontrado.</li>';
        return;
      }

      elList.innerHTML = lista.map(item => {
        const caminhoCompleto = prefixo + item;
        return '<li class="file-item" onclick="abrirArquivo(\'' + caminhoCompleto + '\')">' +
          '<span><span class="file-icon">📄</span>' + item + '</span>' +
          '<span style="font-size: 0.75rem; color: var(--text-dim);">&rarr;</span>' +
        '</li>';
      }).join("");
    }

    async function abrirArquivo(caminhoRelativo) {
      arquivoAbertoAtual = caminhoRelativo;
      document.getElementById("modal-arquivo-titulo").textContent = caminhoRelativo;
      const body = document.getElementById("modal-arquivo-body");
      body.innerHTML = "<p>Carregando conteúdo...</p>";
      document.getElementById("markdown-modal").classList.add("active");

      try {
        const res = await fetch("/api/arquivo?path=" + encodeURIComponent(caminhoRelativo));
        const json = await res.json();
        if (json.erro) {
          body.innerHTML = '<p style="color: var(--accent-red);">Erro: ' + json.erro + '</p>';
          return;
        }

        if (window.marked) {
          body.innerHTML = marked.parse(json.conteudo);
        } else {
          // Fallback caso marked.js não carregue via CDN
          body.innerHTML = '<pre><code>' + escaparHtml(json.conteudo) + '</code></pre>';
        }
      } catch (err) {
        body.innerHTML = '<p style="color: var(--accent-red);">Falha ao carregar arquivo.</p>';
      }
    }

    function fecharModal() {
      document.getElementById("markdown-modal").classList.remove("active");
    }

    function fecharModalSeFora(e) {
      if (e.target.id === "markdown-modal") fecharModal();
    }

    function fecharActionModal() {
      document.getElementById("action-modal").classList.remove("active");
    }

    async function abrirNoEditor(caminho = "") {
      try {
        await fetch("/api/abrir-editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caminho })
        });
      } catch {
        alert("Não foi possível acionar o editor de código.");
      }
    }

    function abrirArquivoNoEditor() {
      if (arquivoAbertoAtual) {
        abrirNoEditor("governanca/" + arquivoAbertoAtual);
      }
    }

    async function executarSincronizacao(modo) {
      if (modo === "total") {
        const confirmacao = prompt("⚠️ ATENÇÃO: Regeneração Total irá sobrescrever arquivos.\nDigite 'REGENERAR TUDO' para confirmar:");
        if (confirmacao !== "REGENERAR TUDO") {
          alert("Operação cancelada.");
          return;
        }
      }

      const modal = document.getElementById("action-modal");
      const titulo = document.getElementById("action-modal-titulo");
      const terminal = document.getElementById("action-terminal-output");

      titulo.textContent = modo === "total" ? "Regeneração Total da Governança..." : "Sincronização Essencial da Governança...";
      terminal.textContent = "⏳ Conectando e sincronizando com a matriz da RR Tech Studio...\nAguarde...\n";
      modal.classList.add("active");

      try {
        const res = await fetch("/api/sincronizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modo })
        });
        const data = await res.json();
        terminal.textContent = data.output || "Concluído!";
        if (data.sucesso) {
          carregarDados();
        }
      } catch (err) {
        terminal.textContent = "❌ Erro ao disparar sincronização: " + err.message;
      }
    }

    async function executarHarness() {
      const modal = document.getElementById("action-modal");
      const titulo = document.getElementById("action-modal-titulo");
      const terminal = document.getElementById("action-terminal-output");

      titulo.textContent = "Re-sincronizando Harness (.agents/)...";
      terminal.textContent = "⏳ Executando harness.mjs...\nAguarde...\n";
      modal.classList.add("active");

      try {
        const res = await fetch("/api/harness", { method: "POST" });
        const data = await res.json();
        terminal.textContent = data.output || "Concluído!";
      } catch (err) {
        terminal.textContent = "❌ Erro ao executar harness: " + err.message;
      }
    }

    function escaparHtml(text) {
      return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    // Inicialização
    carregarDados();
