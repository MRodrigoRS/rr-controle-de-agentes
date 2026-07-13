import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET() {
  const tempFile = path.join(os.tmpdir(), `rr-pasta-${Date.now()}.ps1`);
  try {
    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$f = New-Object System.Windows.Forms.FolderBrowserDialog
$f.Description = "Selecione a pasta do projeto"
$f.ShowNewFolderButton = $true
$result = $f.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  Write-Output $f.SelectedPath
} else {
  exit 1
}
`;
    fs.writeFileSync(tempFile, psScript, "utf-8");

    const caminho = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`,
      { encoding: "utf-8", timeout: 30000 }
    ).trim();

    if (!caminho) {
      return NextResponse.json({ caminho: null });
    }

    return NextResponse.json({ caminho });
  } catch {
    return NextResponse.json({ caminho: null });
  } finally {
    try { fs.unlinkSync(tempFile); } catch { /* ignore */ }
  }
}
