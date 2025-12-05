"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Calendar, Trophy, LogOut, Shield } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Admin PSG</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Benvenuto nell'Area Admin</h2>
          <p className="text-muted-foreground">
            Gestisci i contenuti del sito PSG Volley
          </p>
        </div>

        {/* Sezioni Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gazzettino */}
          <Link href="/admin/gazzettino">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Il Gazzettino</CardTitle>
                </div>
                <CardDescription>
                  Gestisci gli articoli del Gazzettino per entrambe le squadre (Master e Open)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Aggiungi nuovi articoli</li>
                  <li>• Modifica articoli esistenti</li>
                  <li>• Elimina articoli</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Eventi */}
          <Link href="/admin/eventi">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Eventi</CardTitle>
                </div>
                <CardDescription>
                  Gestisci eventi futuri e passati, tornei e amichevoli
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Crea nuovi eventi</li>
                  <li>• Modifica eventi</li>
                  <li>• Carica foto e resoconti</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Campionato */}
          <Link href="/admin/campionato">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Trophy className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle>Campionato</CardTitle>
                </div>
                <CardDescription>
                  Aggiorna risultati, date e informazioni delle partite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Inserisci risultati partite</li>
                  <li>• Modifica date e orari</li>
                  <li>• Gestisci CSV Master e Open</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Link Utili</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                Vai al Sito Pubblico →
              </Button>
            </Link>
            <a
              href="https://github.com/Ela17/WEBSITE_PSGvolley"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full justify-start">
                Repository GitHub →
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}