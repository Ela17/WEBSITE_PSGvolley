import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Lista tutti gli articoli
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("gazzettino_articles")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Errore fetch articoli:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// POST - Crea nuovo articolo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Validazione campi obbligatori
    if (!body.slug || !body.title || !body.date ) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: slug, title, date" },
        { status: 400 }
      );
    }

    // Verifica slug univoco
    const { data: existing } = await supabase
      .from("gazzettino_articles")
      .select("slug")
      .eq("slug", body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Slug già esistente. Scegli un altro slug." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("gazzettino_articles")
      .insert({
        slug: body.slug,
        title: body.title,
        date: body.date,
        week: body.week || null,
        season: body.season || null,
        excerpt: body.excerpt || null,
        cover_image: body.coverImage || null,
        category: body.category || null,
        author: body.author || null,
        tags: body.tags || [],
        content: body.content || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Errore creazione articolo:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: data, success: true }, { status: 201 });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
