"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessageBubble } from "@/components/chat-message";
import { ChatMessage } from "@/lib/types";
import { HardHat, Send, Loader2, Trash2 } from "lucide-react";

const SUGERENCIAS = [
  "Terraza con filtraciones de agua",
  "Humedad ascendente en paredes",
  "Fisuras en mampostería de ladrillo",
  "Reparación de piso de hormigón",
  "Aislación térmica de techo de chapa",
  "Impermeabilización de sótano",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

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

      if (!res.ok) {
        throw new Error("Error en la consulta");
      }

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
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Hubo un error al procesar tu consulta. Asegurate de tener Claude Code corriendo y volvé a intentar.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingText("");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingText("");
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-zinc-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
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
                Contame qué problema constructivo tenés y te presento múltiples
                soluciones con diferentes costos, métodos y terminaciones.
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
                <p className="text-sm text-zinc-800 whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse" />
                </p>
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
  );
}
