import path from "path";
import {
  readCampionatoCSV,
  calculateRanking,
  getAllCalendarEvents,
} from "@/lib/campionato";
import { getCategoriaLabel } from "@/lib/campionato-types";
import CalendarView from "@/components/CalendarView";
import RankingTable from "@/components/RankingTable";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function CampionatoPage() {
  // Leggi dati Master
  const masterPath = path.join(process.cwd(), "content/campionati/master.csv");
  const masterMatches = readCampionatoCSV(masterPath);
  const masterRanking = calculateRanking(masterMatches);

  // Leggi dati Open
  const openPath = path.join(process.cwd(), "content/campionati/open.csv");
  const openMatches = readCampionatoCSV(openPath);
  const openRanking = calculateRanking(openMatches);

  // Eventi calendario
  const allEvents = getAllCalendarEvents();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Campionato UISP</h1>
          <p className="text-blue-100 text-lg">
            Classifiche e calendario partite
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* SEZIONE 1: CLASSIFICHE */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Classifiche</h2>
          </div>

          {/* Grid 2 colonne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classifica Master */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Classifica Master (4+2)
                </h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/1Qv6MMun296lM_X_Bm3g9U8uy9zsjly3C/edit?gid=1144088727#gid=1144088727"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Classifica ufficiale UISP
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <RankingTable
                ranking={masterRanking}
                title=""
                categoria="master"
              />
            </div>

            {/* Classifica Open */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Classifica Open (3×3)</h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/17hDPCNtiHUIJ-zQ4FyDCoJFfjy9j5U8g/edit?gid=792185880#gid=792185880"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Classifica ufficiale UISP
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <RankingTable ranking={openRanking} title="" categoria="open" />
            </div>
          </div>
        </section>

        {/* SEZIONE 2: CALENDARIO */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Calendario Partite PSG</h2>
            <p className="text-muted-foreground">
              Tutte le partite di ASD Patrocinio San Giuseppe da entrambi i
              campionati
            </p>
          </div>
          <CalendarView events={allEvents} />
        </section>

        {/* SEZIONE 3: LINK UTILI */}
        <section className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">Link Utili</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://docs.google.com/spreadsheets/d/1Qv6MMun296lM_X_Bm3g9U8uy9zsjly3C/edit?gid=1144088727#gid=1144088727"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 transition-colors"
            >
              <span className="text-sm font-medium">
                Campionato Master 4+2 UISP
              </span>
              <ExternalLink className="h-4 w-4 ml-auto shrink-0" />
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/17hDPCNtiHUIJ-zQ4FyDCoJFfjy9j5U8g/edit?gid=792185880#gid=792185880"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:hover:bg-green-900 transition-colors"
            >
              <span className="text-sm font-medium">Campionato Open 3x3 girone B UISP</span>
              <ExternalLink className="h-4 w-4 ml-auto shrink-0" />
            </a>
            <a
              href="https://drive.google.com/file/d/1_zQf3mQY1dar7TGuZYIciQUxlvBofdoH/view"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-medium">Regolamento Volley UISP</span>
              <ExternalLink className="h-4 w-4 ml-auto shrink-0" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
