# Hermes Web — Project State

## Current Milestone
Milestone 1: Foundation — started now — scaffold, auth, base UI, layout, SQLite

## Completed
- [x] PROJECT_PLAN.md written
- [x] CLAUDE.md written
- [x] PROJECT_STATE.md initialized

## In Progress
- [ ] Next.js 16 scaffold + all base files

## Blocked / Needs Decision
- What port should Next.js run on? (default 3000 assumed unless conflict)
- Hermes API local URL and key — need to confirm before wiring chat

## Backlog (approved future work)
- [ ] Chat interface + streaming — Milestone 2
- [ ] File/photo uploads — Milestone 2
- [ ] Tool/thinking/agent transparency — Milestone 2
- [ ] Image generation (Nano Banana + Imagen 4) — Milestone 3
- [ ] Gallery page — Milestone 3
- [ ] Polish + micro-animations — Milestone 4
- [ ] Cloudflared tunnel + systemd — Milestone 5

## Agent Work Log
- [init] Orchestrator: wrote PROJECT_PLAN.md, CLAUDE.md, PROJECT_STATE.md

## User Feedback Queue
(empty)

## Decisions Log
- [init] Stack: Next.js 16, SQLite, local filesystem, Cloudflared, password auth — no Supabase
- [init] Hosting: Raspberry Pi (already running Hermes)
- [init] Image gen: gemini-2.5-flash-image (Nano Banana) + imagen-4.0-generate-001 (Imagen 4)
