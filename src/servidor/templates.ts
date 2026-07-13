import fs from "fs";
import path from "path";

const templatesDir = path.resolve(process.cwd(), "src/templates");

const cache = new Map<string, string>();

function carregarTemplate(nome: string): string {
  if (cache.has(nome)) return cache.get(nome)!;
  const caminho = path.join(templatesDir, nome);
  const conteudo = fs.readFileSync(caminho, "utf-8");
  cache.set(nome, conteudo);
  return conteudo;
}

/**
 * Processa um template substituindo variáveis {{variavel}}.
 * Suporta condicionais simples: {{#if var}}...{{/if}}
 * Não usa dependências externas — processamento próprio mínimo.
 */
export function processarTemplate(nome: string, ctx: Record<string, unknown>): string {
  let conteudo = carregarTemplate(nome);

  // {{#if var}}...{{else}}...{{/if}} — processa blocos mais internos primeiro
  const ifRegex = /\{\{#if ([\w.-]+)\}\}((?:[^{]|\{(?!\{#if))*?)(?:\{\{else\}\}((?:[^{]|\{(?!\{#if))*?))?\{\{\/if\}\}/g;
  let anterior: string;
  do {
    anterior = conteudo;
    conteudo = conteudo.replace(ifRegex, (_, varName, trueBlock, falseBlock) => {
      return ctx[varName] ? trueBlock : (falseBlock || "");
    });
  } while (conteudo !== anterior);

  // {{variavel}}
  conteudo = conteudo.replace(/\{\{([\w.-]+)\}\}/g, (_, varName) => {
    const val = ctx[varName];
    return val !== undefined ? String(val) : `{{${varName}}}`;
  });

  return conteudo;
}
