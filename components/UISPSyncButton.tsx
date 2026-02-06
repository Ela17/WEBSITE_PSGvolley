"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Tipi dal modulo uisp-sync
interface SyncChange {
  numero_gara: string;
  categoria: "master" | "open";
  partita: string;
  tipo: "nuovo" | "aggiornato" | "invariato";
  modifiche?: string[];
}

interface SyncReport {
  success: boolean;
  timestamp: string;
  master: {
    totale: number;
    nuovi: number;
    aggiornati: number;
    invariati: number;
    errori: number;
  };
  open: {
    totale: number;
    nuovi: number;
    aggiornati: number;
    invariati: number;
    errori: number;
  };
  changes: SyncChange[];
  errors: string[];
}

interface UISPSyncButtonProps {
  onSyncComplete?: () => void; // Callback per refresh dei dati
}

export function UISPSyncButton({ onSyncComplete }: UISPSyncButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<
    "idle" | "loading" | "preview" | "syncing" | "done"
  >("idle");
  const [report, setReport] = useState<SyncReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<
    "master" | "open" | null
  >(null);

  // Apre dialog e carica preview
  const handleOpenDialog = async () => {
    setDialogOpen(true);
    setStep("loading");
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/admin/campionato/sync");
      if (!res.ok) {
        throw new Error(`Errore HTTP: ${res.status}`);
      }
      const data = await res.json();

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // La preview restituisce un formato leggermente diverso
      // Costruiamo un report parziale per la preview
      setReport({
        success: true,
        timestamp: data.timestamp,
        master: {
          totale: data.master?.totale || 0,
          nuovi: 0,
          aggiornati: 0,
          invariati: 0,
          errori: 0,
        },
        open: {
          totale: data.open?.totale || 0,
          nuovi: 0,
          aggiornati: 0,
          invariati: 0,
          errori: 0,
        },
        changes: [],
        errors: data.errors || [],
      });
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setStep("idle");
    }
  };

  // Esegue la sincronizzazione
  const handleSync = async () => {
    setStep("syncing");
    setError(null);

    try {
      const res = await fetch("/api/admin/campionato/sync", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`Errore HTTP: ${res.status}`);
      }

      const data: SyncReport = await res.json();

      if (!data.success && data.errors?.length > 0) {
        // Sync parzialmente fallito ma con risultati
        setReport(data);
        setStep("done");
      } else {
        setReport(data);
        setStep("done");
        // Notifica il parent per refresh
        onSyncComplete?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setStep("preview"); // Torna alla preview per riprovare
    }
  };

  // Chiude e resetta
  const handleClose = () => {
    setDialogOpen(false);
    // Reset dopo animazione chiusura
    setTimeout(() => {
      setStep("idle");
      setReport(null);
      setError(null);
      setExpandedCategory(null);
    }, 200);
  };

  // Filtra changes per categoria
  const getChangesForCategory = (categoria: "master" | "open") => {
    if (!report?.changes) return { nuovi: [], aggiornati: [] };
    return {
      nuovi: report.changes.filter(
        (c) => c.categoria === categoria && c.tipo === "nuovo",
      ),
      aggiornati: report.changes.filter(
        (c) => c.categoria === categoria && c.tipo === "aggiornato",
      ),
    };
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpenDialog} className="gap-2">
        <RefreshCw className="size-4" />
        Sincronizza da UISP
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5" />
              Sincronizzazione UISP
            </DialogTitle>
            <DialogDescription>
              {step === "loading" && "Connessione ai calendari UISP..."}
              {step === "preview" &&
                "Pronto per sincronizzare i dati dai calendari ufficiali UISP"}
              {step === "syncing" && "Sincronizzazione in corso..."}
              {step === "done" && "Sincronizzazione completata"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Loading */}
            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Download calendari in corso...
                </p>
              </div>
            )}

            {/* Syncing */}
            {step === "syncing" && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="size-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Aggiornamento database in corso...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Errore</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {step === "preview" && report && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    I dati verranno scaricati dai calendari ufficiali UISP e
                    sincronizzati con il database del sito. Le partite esistenti
                    verranno aggiornate, quelle nuove verranno inserite.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Master */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      Master 4+2
                    </h4>
                    <p className="text-2xl font-bold text-amber-700">
                      {report.master.totale}
                    </p>
                    <p className="text-sm text-amber-600">partite trovate</p>
                  </div>

                  {/* Open */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-900 mb-2">
                      Open 3×3
                    </h4>
                    <p className="text-2xl font-bold text-emerald-700">
                      {report.open.totale}
                    </p>
                    <p className="text-sm text-emerald-600">partite trovate</p>
                  </div>
                </div>

                {report.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-800 mb-2">
                      Attenzione ({report.errors.length} avvisi)
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {report.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Done - Report finale */}
            {step === "done" && report && (
              <div className="space-y-4">
                {/* Riepilogo */}
                <div
                  className={`rounded-lg p-4 ${
                    report.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {report.success ? (
                      <CheckCircle2 className="size-5 text-green-600" />
                    ) : (
                      <AlertCircle className="size-5 text-yellow-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        report.success ? "text-green-800" : "text-yellow-800"
                      }`}
                    >
                      {report.success
                        ? "Sincronizzazione completata"
                        : "Sincronizzazione completata con errori"}
                    </span>
                  </div>
                </div>

                {/* Statistiche per categoria */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Master */}
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === "master" ? null : "master",
                        )
                      }
                      className="w-full bg-amber-50 p-4 flex items-center justify-between hover:bg-amber-100 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-amber-900">
                          Master 4+2
                        </h4>
                        <div className="flex gap-2 mt-1">
                          {report.master.nuovi > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              +{report.master.nuovi} nuove
                            </Badge>
                          )}
                          {report.master.aggiornati > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800"
                            >
                              {report.master.aggiornati} agg.
                            </Badge>
                          )}
                          {report.master.nuovi === 0 &&
                            report.master.aggiornati === 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600"
                              >
                                Nessuna modifica
                              </Badge>
                            )}
                        </div>
                      </div>
                      {expandedCategory === "master" ? (
                        <ChevronUp className="size-5 text-amber-600" />
                      ) : (
                        <ChevronDown className="size-5 text-amber-600" />
                      )}
                    </button>

                    {expandedCategory === "master" && (
                      <div className="p-4 border-t bg-white max-h-60 overflow-y-auto">
                        <CategoryChanges
                          changes={getChangesForCategory("master")}
                        />
                      </div>
                    )}
                  </div>

                  {/* Open */}
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === "open" ? null : "open",
                        )
                      }
                      className="w-full bg-emerald-50 p-4 flex items-center justify-between hover:bg-emerald-100 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-emerald-900">
                          Open 3×3
                        </h4>
                        <div className="flex gap-2 mt-1">
                          {report.open.nuovi > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              +{report.open.nuovi} nuove
                            </Badge>
                          )}
                          {report.open.aggiornati > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800"
                            >
                              {report.open.aggiornati} agg.
                            </Badge>
                          )}
                          {report.open.nuovi === 0 &&
                            report.open.aggiornati === 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-600"
                              >
                                Nessuna modifica
                              </Badge>
                            )}
                        </div>
                      </div>
                      {expandedCategory === "open" ? (
                        <ChevronUp className="size-5 text-emerald-600" />
                      ) : (
                        <ChevronDown className="size-5 text-emerald-600" />
                      )}
                    </button>

                    {expandedCategory === "open" && (
                      <div className="p-4 border-t bg-white max-h-60 overflow-y-auto">
                        <CategoryChanges
                          changes={getChangesForCategory("open")}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Errori */}
                {report.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium text-red-800 mb-2">
                      Errori ({report.errors.length})
                    </p>
                    <ul className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                      {report.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Timestamp:{" "}
                  {new Date(report.timestamp).toLocaleString("it-IT")}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            {step === "preview" && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Annulla
                </Button>
                <Button onClick={handleSync} className="gap-2">
                  <RefreshCw className="size-4" />
                  Sincronizza ora
                </Button>
              </>
            )}

            {step === "done" && <Button onClick={handleClose}>Chiudi</Button>}

            {(step === "loading" || step === "syncing") && (
              <Button variant="outline" disabled>
                <Loader2 className="size-4 animate-spin mr-2" />
                Attendere...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente per mostrare le modifiche di una categoria
function CategoryChanges({
  changes,
}: {
  changes: { nuovi: SyncChange[]; aggiornati: SyncChange[] };
}) {
  const { nuovi, aggiornati } = changes;

  if (nuovi.length === 0 && aggiornati.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nessuna modifica per questa categoria
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Nuove partite */}
      {nuovi.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-blue-700 mb-2">
            Nuove partite ({nuovi.length})
          </h5>
          <ul className="space-y-1">
            {nuovi.map((c) => (
              <li
                key={c.numero_gara}
                className="text-sm flex items-center gap-2"
              >
                <Badge variant="outline" className="text-xs">
                  #{c.numero_gara}
                </Badge>
                <span>{c.partita}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Partite aggiornate */}
      {aggiornati.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-amber-700 mb-2">
            Partite aggiornate ({aggiornati.length})
          </h5>
          <ul className="space-y-2">
            {aggiornati.map((c) => (
              <li key={c.numero_gara} className="text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{c.numero_gara}
                  </Badge>
                  <span className="font-medium">{c.partita}</span>
                </div>
                {c.modifiche && c.modifiche.length > 0 && (
                  <ul className="ml-14 mt-1 space-y-0.5">
                    {c.modifiche.map((mod, i) => (
                      <li
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <ArrowRight className="size-3" />
                        {mod}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
