import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGazzettinoPostBySlug, getAllGazzettinoSlugs } from '@/lib/markdown';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, Tag as TagIcon } from 'lucide-react';

// Genera i path statici per tutti gli articoli
export async function generateStaticParams() {
  const slugs = getAllGazzettinoSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function GazzettinoArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getGazzettinoPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con immagine hero */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Link href="/gazzettino">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Gazzettino
            </Button>
          </Link>

          {/* Meta informazioni */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), 'dd MMMM yyyy', { locale: it })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <Badge variant="secondary">Settimana {post.week}</Badge>
            {post.category && <Badge variant="outline">{post.category}</Badge>}
          </div>

          {/* Titolo */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Immagine hero full-width */}
      {post.coverImage && (
        <div className="relative w-full h-96 bg-gray-200">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contenuto articolo */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <article
                className="prose prose-lg max-w-none
                  prose-headings:text-blue-600 
                  prose-headings:font-bold
                  prose-h2:text-3xl 
                  prose-h2:mt-8 
                  prose-h2:mb-4
                  prose-h3:text-2xl
                  prose-h3:mt-6
                  prose-h3:mb-3
                  prose-p:text-gray-700 
                  prose-p:leading-relaxed
                  prose-strong:text-blue-600
                  prose-strong:font-bold
                  prose-a:text-blue-600
                  prose-a:no-underline
                  hover:prose-a:underline
                  prose-img:rounded-lg
                  prose-img:shadow-md
                  prose-img:my-6
                  prose-img:mx-auto
                  prose-img:max-w-full
                  prose-img:h-auto
                  prose-table:border-collapse
                  prose-table:w-full
                  prose-th:bg-blue-600
                  prose-th:text-white
                  prose-th:p-3
                  prose-th:text-left
                  prose-td:border
                  prose-td:border-gray-300
                  prose-td:p-3
                  prose-ul:list-disc
                  prose-ul:pl-6
                  prose-li:mb-2
                  prose-figcaption:text-center
                  prose-figcaption:text-sm
                  prose-figcaption:text-gray-500
                  prose-figcaption:mt-2
                  prose-figcaption:italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Azioni finali */}
          <div className="flex justify-center">
            <Link href="/gazzettino">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tutti gli articoli del Gazzettino
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}