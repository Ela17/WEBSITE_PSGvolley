import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// Configurazione
const BUCKET_NAME = "psg-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null; // es: "gazzettino/slug-articolo"

    // Validazione file
    if (!file) {
      return NextResponse.json(
        { error: "Nessun file fornito" },
        { status: 400 }
      );
    }

    // Validazione tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo file non supportato. Formati accettati: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validazione dimensione
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File troppo grande. Massimo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Genera nome file univoco
    const timestamp = Date.now();
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\.[^/.]+$/, "") // Rimuovi estensione
      .replace(/[^a-zA-Z0-9-_]/g, "-") // Sanitizza
      .substring(0, 50); // Limita lunghezza

    const fileName = `${safeName}-${timestamp}.${extension}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Converti file in ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload su Supabase Storage
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Non sovrascrivere se esiste
      });

    if (error) {
      console.error("Errore upload Supabase:", error);
      return NextResponse.json(
        { error: `Errore upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Genera URL pubblico
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    console.log(`✅ Immagine caricata: ${data.path}`);

    return NextResponse.json({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Errore server upload:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// DELETE - Elimina immagine
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path immagine mancante" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Errore delete Supabase:", error);
      return NextResponse.json(
        { error: `Errore eliminazione: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`🗑️ Immagine eliminata: ${path}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore server delete:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
