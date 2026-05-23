import type { ReactNode } from 'react'
import { STORE_URL } from '../lib/fas'

export type Tab = 'wall' | 'snap'

interface ShellProps {
  children: ReactNode
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  count: number
}

export function Shell({ children, activeTab, onTabChange, count }: ShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--paper)]">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="display-font text-xl text-[var(--ink)]">faces</h1>
          <p className="text-[0.6rem] tracking-wide text-[var(--muted)]">of the world</p>
        </div>
        {count > 0 && (
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
            {count.toLocaleString()}
          </span>
        )}
      </header>

      <main className="flex min-h-0 flex-1 flex-col pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-[1100] border-t border-[var(--line)] bg-[var(--dock)]/95 backdrop-blur-2xl">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block max-w-md px-4 py-0.5 text-center text-[0.5rem] tracking-wider text-[var(--muted)]/40 hover:text-[var(--accent)]"
        >
          freeappstore.online
        </a>
        <div className="mx-auto grid max-w-md grid-cols-2 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => onTabChange('wall')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-widest ${
              activeTab === 'wall' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'wall' ? 2.2 : 1.5}>
              <circle cx="7" cy="7" r="4" /><circle cx="17" cy="7" r="4" />
              <circle cx="7" cy="17" r="4" /><circle cx="17" cy="17" r="4" />
            </svg>
            Wall
          </button>
          <button
            onClick={() => onTabChange('snap')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-widest ${
              activeTab === 'snap' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'snap' ? 2.2 : 1.5}>
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 3 2 6 4 8h8c2-2 4-5 4-8a8 8 0 0 0-8-8z" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
            Snap
          </button>
        </div>
      </nav>
    </div>
  )
}
