import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGazzettinoPostBySlug, getAllGazzettinoSlugs } from "@/lib/markdown";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Tag as TagIcon } from "lucide-react";

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
      {/* Header con meta informazioni */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Bottone torna indietro */}
          <Link href="/gazzettino">
            <Button variant="ghost" className="mb-6 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al Gazzettino
            </Button>
          </Link>

          {/* Meta informazioni */}
          <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {format(new Date(post.date), "dd MMMM yyyy", { locale: it })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Giornata {post.week}
            </Badge>
            {post.category && (
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                {post.category}
              </Badge>
            )}
          </div>

          {/* Titolo */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Immagine hero full-width con aspect ratio 16:9 */}
      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] bg-gray-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Contenuto articolo */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6 md:p-8 lg:p-12">
              <article
                className="prose prose-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* Azioni finali */}
          <div className="flex justify-center gap-4">
            <Link href="/gazzettino">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tutti gli articoli
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
