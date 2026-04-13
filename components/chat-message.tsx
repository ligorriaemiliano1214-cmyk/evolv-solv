"use client";

import { HardHat, User } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { parseSoluciones, hasSoluciones } from "@/lib/parse-soluciones";
import { SolucionCard } from "./solucion-card";
import { MarkdownText } from "./markdown-text";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%] bg-amber-500 text-white rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <User className="w-4 h-4 text-amber-700" />
        </div>
      </div>
    );
  }

  // Assistant message - check for structured solutions
  if (hasSoluciones(message.content)) {
    const { antes, soluciones, despues } = parseSoluciones(message.content);

    return (
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
          <HardHat className="w-4 h-4 text-amber-400" />
        </div>
        <div className="max-w-[90%] space-y-3">
          {antes && (
            <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3">
              <MarkdownText content={antes} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {soluciones.map((sol, i) => (
              <SolucionCard key={i} solucion={sol} index={i} />
            ))}
          </div>

          {despues && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
              <MarkdownText content={despues} className="text-amber-800" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular text response — render with markdown
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
        <HardHat className="w-4 h-4 text-amber-400" />
      </div>
      <div className="max-w-[80%] bg-zinc-100 rounded-2xl rounded-bl-md px-4 py-3">
        <MarkdownText content={message.content} />
      </div>
    </div>
  );
}
