import { CalendarEvent } from '@/lib/campionato';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NextMatchCardProps {
  match: CalendarEvent | null;
  title: string;
  categoria: 'master' | 'open';
}

export default function NextMatchCard({ match, title, categoria }: NextMatchCardProps) {
  if (!match) {
    return (
      <Card className="border-l-4 border-muted">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nessuna partita in programma</p>
        </CardContent>
      </Card>
    );
  }

  const borderColor = categoria === 'master' ? 'border-l-blue-500' : 'border-l-orange-500';
  
  // ✅ FIX: Assicura che badgeVariant sia 'master' | 'open'
  const badgeVariant: 'master' | 'open' = match.categoria === 'master' ? 'master' : 'open';

  return (
    <Card className={cn("border-l-4 hover:shadow-lg transition-shadow", borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={badgeVariant}>
            {match.categoriaOriginale || badgeVariant.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Squadre */}
        <div className="text-center py-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center gap-3">
            <span className="font-bold text-base">{match.squadraA}</span>
            <span className="text-xl font-light text-muted-foreground">vs</span>
            <span className="font-bold text-base">{match.squadraB}</span>
          </div>
        </div>

        {/* Info partita */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{match.data}</span>
          </div>
          
          {match.ora && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{match.ora}</span>
            </div>
          )}
          
          {match.palestra && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{match.palestra}</span>
            </div>
          )}
        </div>
        
        {match.note && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs">
              <strong className="text-yellow-900 dark:text-yellow-100">Note:</strong>{' '}
              <span className="text-yellow-800 dark:text-yellow-200">{match.note}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}