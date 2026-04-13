"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export function MarkdownText({ content, className = "" }: MarkdownTextProps) {
  return (
    <div className={`prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-zinc-900 mt-3 mb-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-zinc-900 mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-zinc-900 mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-700 mb-2 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-600">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-zinc-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 text-sm text-zinc-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-sm">{children}</li>,
          hr: () => <hr className="my-3 border-zinc-200" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-amber-400 pl-3 my-2 text-sm text-zinc-600 italic">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded text-xs">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
