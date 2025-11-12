import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function ChiSiamoPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-white border-b-4 border-blue-600">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">Chi Siamo</h1>
          
          {/* Due loghi affiancati */}
          <div className="flex items-center justify-center gap-12">
            <Image 
              src="/images/logos/P.svg" 
              alt="Logo Polisportiva" 
              width={280}
              height={140}
              className="object-contain"
            />
            <div className="w-px h-32 bg-white/50"></div>
            <Image 
              src="/images/logos/PSG_LOGO.svg" 
              alt="Logo 40 anni" 
              width={160}
              height={160}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        
        {/* Contenuto principale */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Chi siamo */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">La Nostra Identità</h2>
              <p className="text-gray-700 leading-relaxed">
                L'associazione sportiva dilettantistica <strong>"PATROCINIO SAN GIUSEPPE"</strong> è caratterizzata 
                dai colori sociali bianco, blu e rosso e si definisce ente libero, apolitico e senza fini di lucro.
              </p>
            </CardContent>
          </Card>

          {/* Finalità */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">Le Nostre Finalità</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                La sua finalità specifica e primaria è la promozione e la diffusione dello sviluppo della pratica 
                delle discipline sportive a livello dilettantistico, includendo anche le attività ricreative a 
                queste strettamente connesse.
              </p>
              <p className="text-gray-700 leading-relaxed">
                L'obiettivo non è solo agonistico, ma anche <strong>formativo</strong>: l'associazione mira a 
                creare una struttura, anche logistica, che consenta ai suoi membri un processo di 
                "maturazione e apprendimento atletico sportivo rapido ed equilibrato".
              </p>
            </CardContent>
          </Card>

          {/* Valori */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">I Nostri Valori</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Attraverso l'esperienza del gioco e dello sport, l'ASD persegue l'obiettivo di far vivere ai 
                partecipanti momenti di educazione, maturazione e impegno. Questo progetto si fonda su una 
                visione della vita specificamente <strong>"ispirata alla concezione evangelica dell'uomo e della 
                realtà"</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Un aspetto centrale del progetto associativo è la promozione attiva del <strong>volontariato</strong> nel 
                servizio educativo sportivo, curandone la professionalità, lo stile educativo dell'animazione e 
                la spiritualità giovanile, in sintonia con il sistema educativo di Don Bosco.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Viene inoltre sottolineata l'importanza del coinvolgimento dei genitori dei minori tesserati 
                nel percorso di collaborazione educativa.
              </p>
            </CardContent>
          </Card>

          {/* Attività */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-blue-600">Le Nostre Attività</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Per raggiungere questi scopi, l'associazione si occupa di:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Organizzazione e promozione dello sport a vari livelli (agonistico, dilettantistico e formativo)</li>
                <li>Gestione di corsi di attività motoria</li>
                <li>Formazione sportiva</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                L'associazione è <strong>aperta a tutti</strong> coloro che siano interessati alle sue finalità 
                e ne condividano lo spirito e gli ideali.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Vuoi far parte della nostra squadra?</h3>
          <p className="text-gray-600 mb-6">Contattaci per maggiori informazioni!</p>
          <a 
            href="https://www.instagram.com/tua_pagina_ig" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Seguici su Instagram
          </a>
        </div>
        
      </div>
    </main>
  );
}