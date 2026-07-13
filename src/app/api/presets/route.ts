import { NextResponse } from "next/server";
import { presetsFrontend, presetsBackend } from "@/presets";

export async function GET() {
  return NextResponse.json({ frontend: presetsFrontend, backend: presetsBackend });
}
