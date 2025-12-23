import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Ottieni singolo articolo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("gazzettino_articles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Articolo non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// PUT - Modifica articolo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Se lo slug sta cambiando, verifica che il nuovo sia univoco
    if (body.slug && body.slug !== slug) {
      const { data: existing } = await supabase
        .from("gazzettino_articles")
        .select("slug")
        .eq("slug", body.slug)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Il nuovo slug è già in uso" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("gazzettino_articles")
      .update({
        slug: body.slug || slug,
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
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      console.error("Errore modifica articolo:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: data, success: true });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// DELETE - Elimina articolo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("gazzettino_articles")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error("Errore eliminazione articolo:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Articolo eliminato" });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
