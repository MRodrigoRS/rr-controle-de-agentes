import { NextResponse } from "next/server";
import {
  presetsFrontend,
  presetsBackend,
  presetsFullstack,
  obterTecnologiasDoPreset,
  obterFrontend,
  obterBackend,
} from "@/presets";
import type { TecnologiaRegistro } from "@/servidor/db";

export async function GET() {
  const feComTecs = presetsFrontend.map((p) => {
    const tecs = obterTecnologiasDoPreset(p);
    return {
      ...p,
      stack: tecs.length > 0 ? tecs.map((t) => t.nome) : p.stack,
      tecnologias: tecs,
    };
  });

  const beComTecs = presetsBackend.map((p) => {
    const tecs = obterTecnologiasDoPreset(p);
    return {
      ...p,
      stack: tecs.length > 0 ? tecs.map((t) => t.nome) : p.stack,
      tecnologias: tecs,
    };
  });

  const fullstacksComTecs = presetsFullstack.map((c) => {
    const fe = obterFrontend(c.frontend);
    const be = obterBackend(c.backend);
    const feTecs = fe ? obterTecnologiasDoPreset(fe) : [];
    const beTecs = be ? obterTecnologiasDoPreset(be) : [];

    // Combina e deduplica pelo ID ou nome
    const mapa = new Map<string, TecnologiaRegistro>();
    for (const t of [...feTecs, ...beTecs]) {
      mapa.set(t.nome.toLowerCase(), t);
    }
    const tecsCombinadas = Array.from(mapa.values());

    return {
      ...c,
      tecnologias: tecsCombinadas,
      stack: tecsCombinadas.map((t) => t.nome),
    };
  });

  return NextResponse.json({
    frontend: feComTecs,
    backend: beComTecs,
    fullstacks: fullstacksComTecs,
  });
}
