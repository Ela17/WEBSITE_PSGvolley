import Image from "next/image";
import Link from "next/link";
import { getAllGazzettinoPostsPreview } from "@/lib/markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartCrack, Calendar, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GazzettinoPage() {
  const allPosts = getAllGazzettinoPostsPreview();
  const postsMaster = allPosts.filter((p) => p.squadra === "MASTER 4+2");
  const postsOpen = allPosts.filter((p) => p.squadra === "OPEN 3×3");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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
        <Tabs defaultValue="master" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-12">
            <TabsTrigger value="master" className="text-lg font-semibold">
              MASTER 4+2
            </TabsTrigger>
            <TabsTrigger value="open" className="text-lg font-semibold">
              OPEN 3×3
            </TabsTrigger>
          </TabsList>

          {/* MASTER 4+2 */}
          <TabsContent value="master">
            {postsMaster.length === 0 ? (
              <div className="text-center py-20">
                <HeartCrack className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nessun articolo pubblicato. Il primo numero è in arrivo!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {postsMaster.map((post) => (
                  <Card
                    key={post.slug}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
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
                          {new Date(post.date).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </div>

                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {post.title}
                      </CardTitle>

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          Giornata {post.week}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col">
                      <CardDescription className="line-clamp-3 flex-grow mb-4">
                        {post.excerpt}
                      </CardDescription>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/gazzettino/master/${post.slug}`}
                        className="w-full"
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Leggi il numero completo
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* OPEN 3×3 */}
          <TabsContent value="open">
            {postsOpen.length === 0 ? (
              <div className="text-center py-20">
                <HeartCrack className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nessun articolo pubblicato. Il primo numero è in arrivo!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {postsOpen.map((post) => (
                  <Card
                    key={post.slug}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
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
                          {new Date(post.date).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </div>

                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {post.title}
                      </CardTitle>

                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          Giornata {post.week}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col">
                      <CardDescription className="line-clamp-3 flex-grow mb-4">
                        {post.excerpt}
                      </CardDescription>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        href={`/gazzettino/open/${post.slug}`}
                        className="w-full"
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Leggi il numero completo
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
