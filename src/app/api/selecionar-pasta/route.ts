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

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;
public class ModernFolderPicker {
    [ComImport, Guid("DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7")]
    private class FileOpenDialog {}

    [ComImport, Guid("42F85136-DB7E-49C1-8C4A-0CF96F3F8D6E"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IFileOpenDialog {
        void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string title);
        void SetOptions(uint options);
        int Show(IntPtr parent);
        void GetResult([MarshalAs(UnmanagedType.Interface)] out object item);
    }

    [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IShellItem {
        int GetDisplayName(uint sigdnName, out IntPtr ppszName);
    }

    public static string Pick() {
        try {
            var dialog = (IFileOpenDialog)new FileOpenDialog();
            dialog.SetTitle("Selecione a pasta do projeto");
            dialog.SetOptions(0x00000020);
            if (dialog.Show(IntPtr.Zero) == 0) {
                dialog.GetResult(out var item);
                var shell = (IShellItem)item;
                shell.GetDisplayName(0x80028000, out IntPtr pszPath);
                string p = Marshal.PtrToStringUni(pszPath);
                Marshal.FreeCoTaskMem(pszPath);
                return p;
            }
        } catch {}
        return null;
    }
}
'@ -ReferencedAssemblies "System.Windows.Forms"

$dir = [ModernFolderPicker]::Pick()
if ($dir) { Write-Output $dir } else { exit 1 }
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
