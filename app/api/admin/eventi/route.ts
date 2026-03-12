import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Lista tutti gli eventi
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("eventi")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Errore fetch eventi:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ eventi: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// POST - Crea nuovo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Validazione campi obbligatori
    if (!body.slug || !body.title || !body.date || !body.type) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: slug, title, date, type" },
        { status: 400 }
      );
    }

    // Verifica slug univoco
    const { data: existing } = await supabase
      .from("eventi")
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
      .from("eventi")
      .insert({
        slug: body.slug,
        title: body.title,
        date: body.date,
        end_date: body.endDate || null,
        start_time: body.startTime || null,
        end_time: body.endTime || null,
        extra_dates: body.extraDates?.length ? body.extraDates : null,
        location: body.location || null,
        location_link: body.locationLink || null,
        description: body.description || null,
        cover_image: body.coverImage || null,
        type: body.type,
        category: body.category || null,
        images: body.images || [],
        images_folder: body.imagesFolder || null,
        results: body.results || null,
        registration_link: body.registrationLink || null,
        registration_deadline: body.registrationDeadline || null,
        fee: body.fee || null,
        tags: body.tags || [],
        content: body.content || "",
        locandina: body.locandina || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Errore creazione evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ evento: data, success: true }, { status: 201 });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
