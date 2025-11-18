import Image from 'next/image';
import Link from 'next/link';
import { getAllGazzettinoPostsPreview } from '@/lib/markdown';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Tag } from 'lucide-react';

export default function GazzettinoPage() {
  const posts = getAllGazzettinoPostsPreview();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Il Gazzettino del PSG</h1>
            <p className="text-xl text-blue-100">
              La (Dis)Informazione Ufficiale del Patrocinio San Giuseppe
            </p>
          </div>
        </div>
      </section>

      {/* Contenuto */}
      <div className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Nessun articolo pubblicato. Il primo numero è in arrivo!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                {/* Immagine */}
                {post.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Contenuto Card */}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.date}>
                      {format(new Date(post.date), 'dd MMMM yyyy', { locale: it })}
                    </time>
                  </div>
                  
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    {post.title}
                  </CardTitle>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      Settimana {post.week}
                    </Badge>
                    {post.category && (
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardContent>

                {/* Footer con tags e bottone */}
                <CardFooter className="flex flex-col gap-3 pt-0">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap w-full">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Link href={`/gazzettino/${post.slug}`} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Leggi il numero completo
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}