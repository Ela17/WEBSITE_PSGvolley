import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// GET - Lista tutte le partite
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");

    let query = supabase
      .from("matches")
      .select("*")
      .order("data", { ascending: true });

    // Filtra per categoria se specificata
    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Errore fetch partite:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches: data });
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
