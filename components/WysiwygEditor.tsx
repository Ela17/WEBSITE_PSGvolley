"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { CharacterCount } from "@tiptap/extensions";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TableKit } from "@tiptap/extension-table";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Smile,
  Table as TableIcon,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { useState, useEffect, useCallback } from "react";
import { EMOJI_LIST } from "@/lib/emoji-list";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string; // Nuova prop per altezza massima
}

export default function WysiwygEditor({
  content,
  onChange,
  placeholder = "Scrivi qui...",
  minHeight = "300px",
  maxHeight = "500px", // Default 500px per area editor scrollabile
}: WysiwygEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
      }),
      TableKit.configure({
        table: {
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse w-full",
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none",
          "focus:outline-none",
          "px-4 py-3"
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  });

  // Sincronizza contenuto esterno
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handler per link
  const handleSetLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const handleUnsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  // Handler per immagine
  const handleAddImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setImageOpen(false);
  }, [editor, imageUrl]);

  // Handler per inserire emoji
  const insertEmoji = useCallback(
    (emoji: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(emoji).run();
      setEmojiOpen(false);
    },
    [editor]
  );

  // Handler per inserire tabella
  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 4, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="border rounded-lg bg-gray-50 animate-pulse"
        style={{ minHeight }}
      />
    );
  }

  const isInTable = editor.isActive("table");

  return (
    <div className="border rounded-lg overflow-hidden bg-background flex flex-col">
      {/* Toolbar - sempre visibile, non scrollabile */}
      <div className="border-b bg-muted/30 p-1 flex flex-wrap gap-0.5 flex-shrink-0">
        {/* Undo/Redo */}
        <div className="flex gap-0.5 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annulla"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Ripeti"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Heading */}
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              editor.isActive("heading", { level: 2 }) && "bg-muted"
            )}
            title="Titolo H2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              editor.isActive("heading", { level: 3 }) && "bg-muted"
            )}
            title="Titolo H3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            className={cn(
              editor.isActive("heading", { level: 4 }) && "bg-muted"
            )}
            title="Titolo H4"
          >
            <Heading4 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Formattazione testo */}
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive("bold") && "bg-muted")}
            title="Grassetto"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive("italic") && "bg-muted")}
            title="Corsivo"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(editor.isActive("underline") && "bg-muted")}
            title="Sottolineato"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Allineamento */}
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={cn(editor.isActive({ textAlign: "left" }) && "bg-muted")}
            title="Allinea a sinistra"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={cn(
              editor.isActive({ textAlign: "center" }) && "bg-muted"
            )}
            title="Allinea al centro"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={cn(
              editor.isActive({ textAlign: "right" }) && "bg-muted"
            )}
            title="Allinea a destra"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Liste */}
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive("bulletList") && "bg-muted")}
            title="Elenco puntato"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive("orderedList") && "bg-muted")}
            title="Elenco numerato"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Horizontal rule */}
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linea orizzontale"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Link, Immagine, HR */}
        <div className="flex gap-0.5">
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(editor.isActive("link") && "bg-muted")}
                title="Inserisci link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <Label htmlFor="link-url">URL del link</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://esempio.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSetLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSetLink}
                    disabled={!linkUrl}
                  >
                    Applica
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setLinkOpen(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUnsetLink}
              title="Rimuovi link"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}

          {/* Image */}
          <Popover open={imageOpen} onOpenChange={setImageOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Inserisci immagine"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-3">
                <Label htmlFor="image-url">URL dell'immagine</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://esempio.com/immagine.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Usa il percorso /images/... per immagini già nel sito
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddImage}
                    disabled={!imageUrl}
                  >
                    Inserisci
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setImageOpen(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Tabella */}
        <div className="flex gap-0.5">
          {!isInTable ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertTable}
              title="Inserisci tabella"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  title="Opzioni tabella"
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Colonna prima
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Colonna dopo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina colonna
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Riga sopra
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Riga sotto
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina riga
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                >
                  Toggle intestazione
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina tabella
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 self-center mx-1" />

        {/* Emoji Picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Inserisci emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="grid grid-cols-10 gap-0.5">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="p-1.5 hover:bg-muted rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Tip: scrivi :) per 😊 o &lt;3 per ❤️
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor - area scrollabile con altezza massima */}
      <div className="overflow-y-auto flex-1" style={{ maxHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer con conteggio - sempre visibile */}
      <div className="border-t bg-gray-50 px-4 py-2 text-xs text-muted-foreground flex justify-between flex-shrink-0">
        <span>{editor.storage.characterCount.characters()} caratteri</span>
        <span>{editor.storage.characterCount.words()} parole</span>
      </div>
    </div>
  );
}
