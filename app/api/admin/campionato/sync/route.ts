import { NextResponse } from "next/server";
import { syncFromUISP, previewSync } from "@/lib/uisp-sync";

// POST - Esegue la sincronizzazione completa
export async function POST() {
  try {
    console.log("[API Sync] Avvio sincronizzazione UISP...");

    const report = await syncFromUISP();

    console.log("[API Sync] Sincronizzazione completata:", {
      success: report.success,
      master: `${report.master.nuovi} nuovi, ${report.master.aggiornati} aggiornati`,
      open: `${report.open.nuovi} nuovi, ${report.open.aggiornati} aggiornati`,
      errori: report.errors.length,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("[API Sync] Errore critico:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Errore sconosciuto",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET - Preview senza salvare (utile per debug)
export async function GET() {
  try {
    console.log("[API Sync] Avvio preview UISP...");

    const preview = await previewSync();

    return NextResponse.json({
      success: preview.errors.length === 0,
      timestamp: new Date().toISOString(),
      master: {
        totale: preview.master.length,
        partite: preview.master.slice(0, 5), // Prime 5 per preview
      },
      open: {
        totale: preview.open.length,
        partite: preview.open.slice(0, 5), // Prime 5 per preview
      },
      errors: preview.errors,
    });
  } catch (error) {
    console.error("[API Sync] Errore preview:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Errore sconosciuto",
      },
      { status: 500 }
    );
  }
}