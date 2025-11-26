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
            <div className="flex gap-2">
              <Badge variant="master">{getCategoriaLabel("master")}</Badge>
              <Badge variant="open">{getCategoriaLabel("open")}</Badge>
            </div>
          </div>

          {/* Grid 2 colonne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingTable
              ranking={masterRanking}
              title="Classifica Master (4+2)"
              categoria="master"
            />
            <RankingTable
              ranking={openRanking}
              title="Classifica Open (3×3)"
              categoria="open"
            />
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
      </div>
    </div>
  );
}
