"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessageBubble } from "@/components/chat-message";
import { ChatSidebar } from "@/components/chat-sidebar";
import { HelpPanel } from "@/components/help-panel";
import { MarkdownText } from "@/components/markdown-text";
import { ChatMessage } from "@/lib/types";
import { supabase, ChatRow } from "@/lib/supabase";
import {
  HardHat,
  Send,
  Loader2,
  FileText,
  MessageSquareWarning,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
} from "lucide-react";

const SUGERENCIAS = [
  "Terraza con filtraciones de agua",
  "Humedad ascendente en paredes",
  "Fisuras en mampostería de ladrillo",
  "Reparación de piso de hormigón",
  "Aislación térmica de techo de chapa",
  "Impermeabilización de sótano",
];

const CATEGORIAS = [
  "Impermeabilización",
  "Humedad",
  "Estructura",
  "Pisos",
  "Instalaciones",
  "Fachada",
  "Techos",
  "Reformas",
  "General",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [pendingFirstMessage, setPendingFirstMessage] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const { data } = await supabase
      .from("solv_chats")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setChats(data);
  };

  const loadChatMessages = useCallback(async (chatId: string) => {
    const { data } = await supabase
      .from("solv_mensajes")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    }
  }, []);

  const selectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
      loadChatMessages(chatId);
      setStreamingText("");
    },
    [loadChatMessages]
  );

  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setStreamingText("");
    inputRef.current?.focus();
  };

  const deleteChat = async (chatId: string) => {
    await supabase.from("solv_chats").delete().eq("id", chatId);
    if (activeChatId === chatId) {
      newChat();
    }
    loadChats();
  };

  const createChat = async (titulo: string, categoria: string) => {
    const { data } = await supabase
      .from("solv_chats")
      .insert({ titulo, categoria })
      .select()
      .single();
    if (data) {
      setActiveChatId(data.id);
      await loadChats();
      return data.id;
    }
    return null;
  };

  const saveMessage = async (
    chatId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    await supabase.from("solv_mensajes").insert({
      chat_id: chatId,
      role,
      content,
    });
    await supabase
      .from("solv_chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatId);
  };

  const sendMessage = async (text: string, chatId?: string | null) => {
    if (!text.trim() || loading) return;

    // If no active chat, show category picker for new chat
    const currentChatId = chatId || activeChatId;
    if (!currentChatId) {
      setPendingFirstMessage(text.trim());
      setShowCategoryPicker(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingText("");

    // Save user message
    await saveMessage(currentChatId, "user", text.trim());

    try {
      const historial = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/investigar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: text.trim(),
          historial,
        }),
      });

      if (!res.ok) throw new Error("Error en la consulta");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingText("");

      // Save assistant message
      await saveMessage(currentChatId, "assistant", fullText);
      await loadChats();
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Hubo un error al procesar tu consulta. Revisá la configuración y volvé a intentar.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingText("");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleCategorySelect = async (categoria: string) => {
    setShowCategoryPicker(false);
    if (!pendingFirstMessage) return;

    const titulo =
      pendingFirstMessage.length > 60
        ? pendingFirstMessage.substring(0, 57) + "..."
        : pendingFirstMessage;

    const chatId = await createChat(titulo, categoria);
    if (chatId) {
      await sendMessage(pendingFirstMessage, chatId);
    }
    setPendingFirstMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSecondOpinion = () => {
    const text =
      "Necesito una segunda opinión: revisá todas las soluciones que me diste, criticá cada una con honestidad, identificá riesgos que no hayas mencionado, errores comunes en la ejecución, y decime cuál elegirías vos si fuera tu propia casa. Sé brutalmente honesto.";
    setInput("");
    sendMessage(text, activeChatId);
  };

  const handleExportPDF = async () => {
    const { generateReport } = await import("@/lib/generate-pdf");
    const chat = chats.find((c) => c.id === activeChatId);
    const titulo = chat?.titulo || "Investigación";
    generateReport(titulo, messages);
  };

  const isEmpty = messages.length === 0 && !loading;
  const hasAssistantMessages = messages.some((m) => m.role === "assistant");

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Help panel */}
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Category picker modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Nueva investigación
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Elegí una categoría para organizar esta consulta:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-3 py-2.5 text-sm text-left bg-zinc-50 hover:bg-amber-50 border border-zinc-200 hover:border-amber-300 rounded-xl transition-colors text-zinc-700 hover:text-amber-700"
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowCategoryPicker(false);
                setPendingFirstMessage(null);
              }}
              className="w-full mt-3 py-2 text-xs text-zinc-500 hover:text-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 flex-shrink-0 border-r border-zinc-800">
          <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={selectChat}
            onNewChat={newChat}
            onDeleteChat={deleteChat}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-zinc-200 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4 text-zinc-500" />
                ) : (
                  <PanelLeft className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <div className="p-1.5 bg-zinc-900 rounded-lg">
                <HardHat className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-900 tracking-tight leading-tight">
                  EVOLV Solv
                </h1>
                <p className="text-[11px] text-zinc-400">
                  Agente de soluciones constructivas
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {hasAssistantMessages && activeChatId && (
                <>
                  <button
                    onClick={handleSecondOpinion}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <MessageSquareWarning className="w-3.5 h-3.5" />
                    Segunda opinión
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Exportar PDF
                  </button>
                </>
              )}
              <button
                onClick={() => setHelpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Qué puedo hacer
              </button>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center pt-20">
                <div className="p-4 bg-zinc-900 rounded-2xl mb-5">
                  <HardHat className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-1">
                  Hola, soy EVOLV Solv
                </h2>
                <p className="text-sm text-zinc-500 text-center max-w-md mb-8">
                  Contame qué problema constructivo tenés y te presento
                  múltiples soluciones con precios, marcas, mano de obra y
                  detalles técnicos.
                </p>

                <div className="w-full max-w-lg">
                  <p className="text-xs text-zinc-400 mb-2 text-center">
                    Probá con alguno de estos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGERENCIAS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-2.5 text-xs text-left bg-white hover:bg-amber-50 border border-zinc-200 hover:border-amber-300 rounded-xl transition-colors text-zinc-700 hover:text-amber-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming indicator */}
            {loading && streamingText && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                  <HardHat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="max-w-[80%] bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <MarkdownText content={streamingText} />
                  <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {/* Loading dots */}
            {loading && !streamingText && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                  <HardHat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 bg-white border-t border-zinc-200">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto px-4 py-3 flex gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describí el problema constructivo..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-colors disabled:opacity-50 placeholder:text-zinc-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
