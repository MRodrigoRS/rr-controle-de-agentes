import { NextResponse } from "next/server";
import { presetsFrontend, presetsBackend, presetsFullstack } from "@/presets";

export async function GET() {
  return NextResponse.json({ frontend: presetsFrontend, backend: presetsBackend, fullstacks: presetsFullstack });
}
