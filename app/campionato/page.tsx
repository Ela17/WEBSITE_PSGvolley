import path from 'path';
import { 
  readCampionatoCSV, 
  calculateRanking, 
  getNextMatch,
  getAllCalendarEvents,
} from '@/lib/campionato';
import CalendarView from '@/components/CalendarView';
import NextMatchCard from '@/components/NextMatchCard';
import RankingTable from '@/components/RankingTable';
import { Badge } from '@/components/ui/badge';

export default function CampionatoPage() {
  const masterPath = path.join(process.cwd(), 'content/campionati/master.csv');
  const openPath = path.join(process.cwd(), 'content/campionati/open.csv');

  const masterMatches = readCampionatoCSV(masterPath);
  const openMatches = readCampionatoCSV(openPath);

  const masterRanking = calculateRanking(masterMatches);
  const openRanking = calculateRanking(openMatches);

  const nextMasterMatch = getNextMatch(masterMatches);
  const nextOpenMatch = getNextMatch(openMatches);

  const allEvents = getAllCalendarEvents();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Campionato UISP</h1>
          <p className="text-blue-100 text-lg">Calendario, risultati e classifiche</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Panoramica */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Panoramica</h2>
            <div className="flex gap-2">
              <Badge variant="master">MASTER 4+2</Badge>
              <Badge variant="open">OPEN 3x3</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prossime Partite */}
            <div className="space-y-6">
              <NextMatchCard 
                match={nextMasterMatch} 
                title="Prossima Partita Master"
                categoria="master"
              />
              <NextMatchCard 
                match={nextOpenMatch} 
                title="Prossima Partita Open"
                categoria="open"
              />
            </div>

            {/* Classifiche */}
            <div className="lg:col-span-2 space-y-6">
              <RankingTable 
                ranking={masterRanking} 
                title="Classifica Master (4+2)"
                categoria="master"
              />
              <RankingTable 
                ranking={openRanking} 
                title="Classifica Open"
                categoria="open"
              />
            </div>
          </div>
        </section>

        {/* Calendario */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Calendario Mensile</h2>
          <CalendarView events={allEvents} />
        </section>
      </div>
    </div>
  );
}