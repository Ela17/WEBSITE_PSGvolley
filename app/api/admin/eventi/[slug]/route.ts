import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Ottieni singolo evento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("eventi")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({ evento: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// PUT - Modifica evento
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
        .from("eventi")
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
      .from("eventi")
      .update({
        slug: body.slug || slug,
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
        google_drive_link: body.googleDriveLink || null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      console.error("Errore modifica evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ evento: data, success: true });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// DELETE - Elimina evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from("eventi").delete().eq("slug", slug);

    if (error) {
      console.error("Errore eliminazione evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Evento eliminato" });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
