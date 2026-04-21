'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? '');
    const code = String(children).replace(/\n$/, '');
    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            borderRadius: 6,
            fontSize: '0.8125rem',
            margin: '0.5rem 0',
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="rounded px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 font-mono text-[0.8125rem] text-zinc-800 dark:text-zinc-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0 leading-relaxed text-zinc-900 dark:text-zinc-100">{children}</p>;
  },
  ul({ children }) {
    return <ul className="mb-3 list-disc pl-5 space-y-1 text-zinc-900 dark:text-zinc-100">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="mb-3 list-decimal pl-5 space-y-1 text-zinc-900 dark:text-zinc-100">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="text-xl font-semibold mb-3 mt-4 first:mt-0">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 text-zinc-500 dark:text-zinc-400 my-3">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="border-zinc-200 dark:border-zinc-700 my-4" />;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:opacity-80 transition-opacity duration-100"
      >
        {children}
      </a>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
