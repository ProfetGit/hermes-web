'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const PROMPTS = [
  { label: 'Generate an image', example: 'Generate an image of a serene mountain lake at sunset' },
  { label: 'Help me write', example: 'Help me write a professional email to request a meeting' },
  { label: 'Explain something', example: 'Explain how transformers work in machine learning' },
  { label: 'Write code', example: 'Write a Python script to rename files by date' },
  { label: 'Analyze data', example: 'Help me analyze a CSV file and find patterns' },
  { label: 'Creative writing', example: 'Write a short story about a robot learning to feel emotions' },
];

export default function HomePage() {
  const router = useRouter();

  async function handlePrompt(text: string) {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) return;
    const session = await res.json();
    router.push(`/chat/${session.id}?prompt=${encodeURIComponent(text)}`);
  }

  return (
    <div className="flex h-full items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Sparkles size={22} className="text-indigo-500" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            What can I help with?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ask anything, or pick a prompt to get started.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPTS.map((p, i) => (
            <motion.button
              key={p.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePrompt(p.example)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4 text-left hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
            >
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{p.example}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
