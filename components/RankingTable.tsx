import { Ranking, getCategoriaLabel } from "@/lib/campionato-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  ranking: Ranking[];
  title: string;
  highlightTeam?: string;
  categoria: "master" | "open";
}

export default function RankingTable({
  ranking,
  title,
  highlightTeam = "ASD Patr. San Giuseppe",
  categoria,
}: RankingTableProps) {
  const badgeVariant: "master" | "open" =
    categoria === "master" ? "master" : "open";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant={badgeVariant}>{getCategoriaLabel(categoria)}</Badge>
        </div>
        <CardDescription>
          Classifica aggiornata con punti, partite giocate e statistiche set
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Squadra</TableHead>
              <TableHead className="text-center">Pt</TableHead>
              <TableHead className="text-center">PG</TableHead>
              <TableHead className="text-center">SV</TableHead>
              <TableHead className="text-center">SP</TableHead>
              <TableHead className="text-center">QS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Nessun dato disponibile
                </TableCell>
              </TableRow>
            ) : (
              ranking.map((team, index) => {
                const isHighlighted = team.squadra.includes(highlightTeam);

                return (
                  <TableRow
                    key={team.squadra}
                    className={cn(
                      isHighlighted &&
                        "bg-blue-50 dark:bg-blue-950/30 font-medium"
                    )}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {team.squadra}
                      {isHighlighted && (
                        <Badge className="ml-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-white">
                          PSG
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {team.punti}
                    </TableCell>
                    <TableCell className="text-center">
                      {team.partiteGiocate}
                    </TableCell>
                    <TableCell className="text-center">
                      {team.setVinti}
                    </TableCell>
                    <TableCell className="text-center">
                      {team.setPersi}
                    </TableCell>
                    <TableCell className="text-center">
                      {team.quozienteSet.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableCaption>
            <div className="text-xs text-left space-y-1">
              <p className="font-semibold">Legenda:</p>
              <p>
                Pt = Punti, PG = Partite Giocate, SV = Set Vinti, SP = Set
                Persi, QS = Quoziente Set
              </p>
            </div>
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
