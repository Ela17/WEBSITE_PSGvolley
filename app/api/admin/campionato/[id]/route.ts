import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Ottieni singola partita
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Partita non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json({ match: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// PUT - Modifica partita (principalmente per inserire risultati)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Campi modificabili
    if (body.data !== undefined) updateData.data = body.data;
    if (body.ora !== undefined) updateData.ora = body.ora;
    if (body.palestra !== undefined) updateData.palestra = body.palestra;
    if (body.note !== undefined) updateData.note = body.note;

    // Risultati - nomi corretti dal database
    if (body.set_a_vinti !== undefined)
      updateData.set_a_vinti = body.set_a_vinti;
    if (body.set_b_vinti !== undefined)
      updateData.set_b_vinti = body.set_b_vinti;
    if (body.punteggi_set !== undefined)
      updateData.punteggi_set = body.punteggi_set;

    const { data, error } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Errore modifica partita:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ match: data, success: true });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
