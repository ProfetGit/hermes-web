'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Images, Sun, Moon, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Session } from '@/lib/db';

function formatRelativeTime(ts: number): string {
  const ms = ts > 1e12 ? ts : ts * 1000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/sessions');
    if (res.ok) setSessions(await res.json());
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions, pathname]);

  async function handleNewChat() {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const session = await res.json();
      onClose?.();
      router.push(`/chat/${session.id}`);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex h-full w-full flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles size={13} className="text-white" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Hermes</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-100">
            <X size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="px-3 mb-2">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-2 rounded-lg bg-zinc-900 dark:bg-white px-3 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors duration-150"
        >
          <Plus size={15} strokeWidth={2} />
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0 space-y-px">
        <AnimatePresence initial={false}>
          {sessions.map((session) => {
            const isActive = pathname === `/chat/${session.id}`;
            return (
              <motion.button
                key={session.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.12 }}
                onClick={() => { onClose?.(); router.push(`/chat/${session.id}`); }}
                className={cn(
                  'flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-100',
                  isActive
                    ? 'bg-zinc-200 dark:bg-zinc-700/80'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate leading-snug">
                  {session.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={10} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{session.message_count}</span>
                  <span className="text-zinc-300 dark:text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{formatRelativeTime(session.updated_at)}</span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {sessions.length === 0 && (
          <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-600">No chats yet</p>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 space-y-px">
        <button
          onClick={() => { onClose?.(); router.push('/gallery'); }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-100',
            pathname === '/gallery'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <Images size={15} strokeWidth={1.5} />
          Gallery
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-100"
          >
            {theme === 'dark' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-100"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-colors duration-100 md:hidden"
      >
        <Menu size={15} strokeWidth={1.5} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-50 h-full w-64 shadow-xl md:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
