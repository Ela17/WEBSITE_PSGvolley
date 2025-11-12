import Image from 'next/image';
import Link from 'next/link';
import { getLatestGazzettinoPost } from '@/lib/markdown';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Home() {
  const latestPost = getLatestGazzettinoPost();
  
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/images/logos/PSG_LOGO.svg" 
              alt="Logo squadra" 
              width={120} 
              height={120}
              className="rounded-full"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">A.S.D. Patrocinio San Giuseppe</h1>
          <p className="text-xl">Campionato UISP 4+2 e 3x3 - Stagione 2025/26</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Latest News */}
        {latestPost && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Ultima dal Gazzettino</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {latestPost.image && (
                <div className="relative h-64">
                  <Image 
                    src={latestPost.image} 
                    alt={latestPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">
                  {format(new Date(latestPost.date), 'dd MMMM yyyy', { locale: it })}
                </p>
                <h3 className="text-2xl font-bold mb-3">{latestPost.title}</h3>
                <p className="text-gray-700 mb-4">{latestPost.excerpt}</p>
                <Link 
                  href={`/gazzettino/${latestPost.slug}`}
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Leggi tutto
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Prossime Partite */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Prossime Partite</h2>
          <div className="bg-blue-50 rounded-lg p-6">
            <p className="text-gray-600">Sezione in arrivo...</p>
          </div>
        </section>
      </div>
    </main>
  );
}