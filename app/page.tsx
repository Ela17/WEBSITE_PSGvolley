import Image from "next/image";
import Link from "next/link";
import path from "path";
import { getLatestGazzettinoPostBySquadra } from "@/lib/markdown";
import { readCampionatoCSV, getNextMatch } from "@/lib/campionato";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getCategoriaLabel } from "@/lib/campionato-types";
import NextMatchCard from "@/components/NextMatchCard";

export default function Home() {
  const latestMasterPost = getLatestGazzettinoPostBySquadra("MASTER 4+2");
  const latestOpenPost = getLatestGazzettinoPostBySquadra("OPEN 3×3");

  const masterPath = path.join(process.cwd(), "content/campionati/master.csv");
  const openPath = path.join(process.cwd(), "content/campionati/open.csv");

  const masterMatches = readCampionatoCSV(masterPath);
  const openMatches = readCampionatoCSV(openPath);

  const nextMasterMatch = getNextMatch(masterMatches, "ASD Patr. San Giuseppe");
  const nextOpenMatch = getNextMatch(openMatches, "ASD Patr. San Giuseppe");

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logos/PSG_LOGO.svg"
              alt="Logo squadra"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">Patrocinio San Giuseppe</h1>
          <h2 className="text-3xl font-bold mb-4">
            Associazione Sportiva Dilettantistica
          </h2>
          <p className="text-xl">Campionato UISP Volley Misto 4+2 e 3x3</p>
          <p className="text-xl">Stagione 2025/26</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Latest News */}
        {/* Sezione Gazzettino */}
        {(latestMasterPost || latestOpenPost) && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Ultime dal Gazzettino</h2>
            <div
              className={`grid gap-6 ${
                latestMasterPost && latestOpenPost
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {/* MASTER 4+2 */}
              {latestMasterPost && (
                <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={"master"}>
                        {getCategoriaLabel("master")}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(latestMasterPost.date),
                          "dd MMMM yyyy",
                          {
                            locale: it,
                          }
                        )}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      {latestMasterPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {latestMasterPost.excerpt}
                    </p>
                    <Link
                      href={`/gazzettino/master/${latestMasterPost.slug}`}
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Leggi tutto
                    </Link>
                  </div>
                </div>
              )}

              {/* OPEN 3×3 */}
              {latestOpenPost && (
                <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={"open"}>
                        {getCategoriaLabel("open")}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(latestOpenPost.date), "dd MMMM yyyy", {
                          locale: it,
                        })}
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      {latestOpenPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {latestOpenPost.excerpt}
                    </p>
                    <Link
                      href={`/gazzettino/open/${latestOpenPost.slug}`}
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Leggi tutto
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Prossime Partite */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Prossime Partite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </section>
      </div>
    </main>
  );
}
