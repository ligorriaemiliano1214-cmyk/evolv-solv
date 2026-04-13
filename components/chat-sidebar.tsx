"use client";

import { Plus, MessageSquare, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { ChatRow } from "@/lib/supabase";
import { useState, useMemo } from "react";

interface ChatSidebarProps {
  chats: ChatRow[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map: Record<string, ChatRow[]> = {};
    for (const chat of chats) {
      const cat = chat.categoria || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(chat);
    }
    // Sort categories alphabetically, but "General" last
    return Object.entries(map).sort(([a], [b]) => {
      if (a === "General") return 1;
      if (b === "General") return -1;
      return a.localeCompare(b);
    });
  }, [chats]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white">
      {/* New chat button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva investigación
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {grouped.length === 0 && (
          <p className="text-xs text-zinc-500 text-center mt-8 px-4">
            No hay investigaciones guardadas. Iniciá una nueva consulta.
          </p>
        )}

        {grouped.map(([categoria, categoryChats]) => (
          <div key={categoria} className="mb-2">
            <button
              onClick={() => toggleCategory(categoria)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-300"
            >
              {collapsedCategories.has(categoria) ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {categoria}
              <span className="text-zinc-600 ml-auto">{categoryChats.length}</span>
            </button>

            {!collapsedCategories.has(categoria) && (
              <div className="space-y-0.5">
                {categoryChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      chat.id === activeChatId
                        ? "bg-zinc-700"
                        : "hover:bg-zinc-800"
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="text-xs text-zinc-300 truncate flex-1">
                      {chat.titulo}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-600 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
