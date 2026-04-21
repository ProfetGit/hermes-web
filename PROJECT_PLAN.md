# Hermes Web — Project Plan

## 1. Overview

A personal AI chat web app that gives the user a full-featured browser interface to talk to Hermes (Claude) from any device in the world. Think of it as a private, self-hosted ChatGPT — with file/photo uploads, real-time streaming responses, full transparency into reasoning/tools/agents, image generation via Google's Nano Banana (Gemini 2.5 Flash Image) and Imagen 4, a gallery of all generated images, and persistent chat history. Runs entirely on the Raspberry Pi, accessed globally via a Cloudflared HTTPS tunnel.

**Core value proposition:** Full Hermes power in a beautiful, mobile-first web UI — accessible anywhere, zero monthly cost, zero data leaving the Pi.

**Target user:** Profet (single user, personal use)

---

## 2. Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router, React Server Components)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** SQLite via `better-sqlite3` (chat sessions, messages, gallery metadata)
- **File storage:** Local filesystem (`/data/uploads/`, `/data/gallery/`)
- **AI chat backend:** Hermes API (running locally on Pi, OpenAI-compatible)
- **Image generation:** Google Generative AI SDK — `gemini-2.5-flash-image` (Nano Banana) + `imagen-4.0-generate-001` (Imagen 4)
- **Auth:** Password middleware — single `SITE_PASSWORD` env var, cookie-based session
- **Tunnel:** Cloudflared (global HTTPS, no port forwarding)
- **Hosting:** Raspberry Pi (no cloud cost)

---

## 3. User Types & Permissions

- **Owner (Profet):** Full access to everything after password entry
- **Unauthenticated:** Redirected to `/login` — no access to any content

---

## 4. Feature List (v1)

### F1: Password Auth
- User story: As Profet, I want a single password to protect the app so no one else can use it
- Acceptance criteria:
  - `/login` page with password input
  - Correct password sets `auth_token` cookie (httpOnly, 30-day expiry)
  - All routes except `/login` check cookie via Next.js middleware
  - Wrong password shows error, correct password redirects to `/`
  - Logout clears cookie

### F2: Chat Interface
- User story: As Profet, I want to type messages and get streaming responses from Hermes with a great mobile experience
- Acceptance criteria:
  - Text input with send button + Enter to send
  - Messages stream in real-time (token by token)
  - My messages on right, Hermes on left with avatar
  - Markdown rendering in responses (code blocks, bold, lists, etc.)
  - Auto-scroll to latest message
  - Loading/typing indicator while streaming
  - Mobile keyboard doesn't break layout
  - Timestamps on messages

### F3: Chat Sessions & History
- User story: As Profet, I want each conversation to be a separate session I can revisit
- Acceptance criteria:
  - Sidebar shows all past sessions, newest first
  - Session title auto-generated from first message (first ~50 chars)
  - Click session to restore full conversation
  - New chat button starts fresh session
  - Delete session with confirmation
  - Session count shown
  - Sidebar collapsible on mobile

### F4: File & Photo Uploads
- User story: As Profet, I want to attach files and photos to my messages so Hermes can analyze them
- Acceptance criteria:
  - Paperclip button opens file picker
  - Drag-and-drop onto chat area
  - Supported: images (jpg, png, gif, webp), PDFs, text files, code files
  - Max 20MB per file
  - Image preview shown in message before sending
  - File name + size shown for non-image files
  - Files sent as multipart to API, included in Hermes context
  - Upload progress indicator

### F5: Thinking / Tool / Agent Transparency
- User story: As Profet, I want to see Hermes's reasoning, every tool call, and every agent it deploys in real-time
- Acceptance criteria:
  - Collapsible "Thinking" block shows extended reasoning (if model supports it)
  - Each tool call shown as an expandable card: tool name, inputs, outputs, duration
  - Tool cards have icons per tool type (🔍 search, 💻 terminal, 🌐 browser, 🤖 agent, etc.)
  - Agent deployments shown as nested expandable blocks
  - All of this streams in real-time as it happens
  - Collapsed by default, expand on click
  - Visual distinction between: thinking (purple tint) / tool (blue tint) / agent (orange tint)

### F6: Image Generation
- User story: As Profet, I want to generate images by asking Hermes, using Nano Banana or Imagen 4
- Acceptance criteria:
  - Hermes detects image generation requests and calls the appropriate model
  - Model selector: Nano Banana (conversational, fast) vs Imagen 4 (high quality)
  - Generated images shown inline in chat
  - Image saved to gallery automatically
  - Download button on each generated image
  - Aspect ratio options: 1:1, 16:9, 9:16, 4:3
  - Error handling if generation fails

### F7: Gallery
- User story: As Profet, I want a gallery of all images I've generated so I can browse and download them
- Acceptance criteria:
  - `/gallery` route — full-page masonry/grid view
  - Each image shows: thumbnail, prompt used, model, date, session link
  - Click to open full-size lightbox
  - Download from lightbox
  - Delete image (with confirmation)
  - Filter by model (Nano Banana / Imagen 4)
  - Sorted newest first
  - Infinite scroll or pagination

### F8: Dark Mode
- User story: As Profet, I want to toggle between light and dark themes
- Acceptance criteria:
  - Toggle in top-right corner
  - Preference saved to localStorage
  - System preference respected on first visit
  - Smooth transition between modes (no flash)
  - All components properly themed in both modes

---

## 5. User Flows

### First Visit
1. Navigate to tunnel URL → middleware detects no cookie → redirect to `/login`
2. Enter password → POST `/api/auth/login` → set cookie → redirect to `/`
3. See empty chat with "New Chat" ready

### Chat Flow
1. Type message (optionally attach file) → hit Send
2. Message appears on right
3. Thinking block appears (collapsed) if model reasons
4. Tool call cards appear as tools fire
5. Response streams in token by token
6. Response complete — session title auto-set if first message

### Image Generation Flow
1. Type "generate an image of X" or "create a photo of Y"
2. Hermes detects intent, calls image generation API
3. Tool card shows "🎨 Image Generation — Nano Banana" with prompt
4. Generated image appears inline in chat
5. Image auto-saved to gallery with metadata

### Gallery Flow
1. Click Gallery in sidebar
2. Grid of all generated images
3. Click image → lightbox with prompt, model, date, download button
4. Can delete from lightbox

---

## 6. Database Schema (SQLite)

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| title | TEXT | Auto-generated from first message |
| created_at | INTEGER | Unix timestamp |
| updated_at | INTEGER | Unix timestamp |
| message_count | INTEGER | Denormalized for sidebar perf |

### `messages`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| session_id | TEXT FK | → sessions.id |
| role | TEXT | 'user' \| 'assistant' |
| content | TEXT | Full message content (JSON for complex) |
| thinking | TEXT | Extended reasoning (nullable) |
| tool_calls | TEXT | JSON array of tool call records |
| attachments | TEXT | JSON array of file metadata |
| created_at | INTEGER | Unix timestamp |

### `gallery`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| session_id | TEXT FK | nullable — which session generated it |
| message_id | TEXT FK | nullable — which message |
| prompt | TEXT | The generation prompt |
| model | TEXT | 'nano-banana' \| 'imagen-4' |
| filename | TEXT | File on disk in /data/gallery/ |
| width | INTEGER | |
| height | INTEGER | |
| aspect_ratio | TEXT | '1:1', '16:9', etc. |
| created_at | INTEGER | Unix timestamp |

---

## 7. API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/login` | POST | Verify password, set cookie |
| `/api/auth/logout` | POST | Clear cookie |
| `/api/chat` | POST | Send message, stream response (SSE) |
| `/api/sessions` | GET | List all sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/[id]` | GET | Get session + messages |
| `/api/sessions/[id]` | DELETE | Delete session |
| `/api/upload` | POST | Upload file, return path + metadata |
| `/api/generate-image` | POST | Generate image via Nano Banana or Imagen 4 |
| `/api/gallery` | GET | List gallery items (paginated) |
| `/api/gallery/[id]` | DELETE | Delete gallery item |
| `/data/gallery/[filename]` | GET | Serve gallery images (static) |
| `/data/uploads/[filename]` | GET | Serve uploaded files (static) |

---

## 8. UI Screens / Pages

| Route | Purpose | Auth |
|---|---|---|
| `/login` | Password entry | No |
| `/` | Main chat (new session or last active) | Yes |
| `/chat/[id]` | Specific session | Yes |
| `/gallery` | Image gallery | Yes |

### Layout
- **Sidebar (left):** Logo/name, New Chat button, session list, Gallery link, dark mode toggle, logout
- **Main area:** Chat messages + input bar at bottom
- **Mobile:** Sidebar hidden behind hamburger, slides in as drawer

---

## 9. Third-party Integrations

| Service | Purpose | Key |
|---|---|---|
| Google Generative AI | Nano Banana + Imagen 4 image generation | `GOOGLE_AI_API_KEY` |
| Hermes API | AI chat backend | Local — `http://localhost:PORT` or API server |

---

## 10. Design System

### Brand & Personality
Clean, minimal, and precise. Like a premium developer tool — lots of whitespace, sharp hierarchy, nothing decorative unless it earns its place. Inspired by Linear and Vercel's dashboard: confident restraint. Both light and dark modes are first-class.

### Color Palette

**Light mode:**
- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Surface Alt: `#F4F4F5`
- Border: `#E4E4E7`
- Text Primary: `#09090B`
- Text Muted: `#71717A`
- Primary (CTA): `#18181B`
- Primary Foreground: `#FAFAFA`
- Accent: `#6366F1` (indigo — tool cards, highlights)
- Thinking: `#7C3AED` (purple)
- Tool: `#2563EB` (blue)
- Agent: `#D97706` (amber)
- Error: `#DC2626`
- Success: `#16A34A`

**Dark mode:**
- Background: `#09090B`
- Surface: `#18181B`
- Surface Alt: `#27272A`
- Border: `#3F3F46`
- Text Primary: `#FAFAFA`
- Text Muted: `#A1A1AA`
- Primary (CTA): `#FAFAFA`
- Primary Foreground: `#09090B`
- Accent: `#818CF8` (indigo lighter)
- Thinking: `#A78BFA` (purple lighter)
- Tool: `#60A5FA` (blue lighter)
- Agent: `#FCD34D` (amber lighter)

All as CSS variables in `globals.css`, exposed as Tailwind v4 theme tokens.

### Typography
- Font: **Inter** (Google Fonts)
- Weights: 400, 500, 600 only
- Scale:
  - `display`: 2rem / 1.2 / -0.02em
  - `h1`: 1.5rem / 1.3 / -0.015em
  - `h2`: 1.25rem / 1.4 / -0.01em
  - `h3`: 1.125rem / 1.4 / -0.005em
  - `body`: 0.9375rem / 1.6 / 0
  - `small`: 0.8125rem / 1.5 / 0
  - `label`: 0.75rem / 1 / 0.05em (uppercase)
  - `code`: 0.875rem / 1.6 / 0 — font: `JetBrains Mono`
- Rule: never arbitrary font sizes

### Spacing & Sizing
- Base unit: 4px
- Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48 (Tailwind units)

### Shape & Borders
- `radius-sm`: 4px — tags, badges, small chips
- `radius-md`: 6px — buttons, inputs
- `radius-lg`: 10px — cards, panels
- `radius-xl`: 16px — modals, drawers
- `radius-full`: 9999px — avatars, pills
- Border width: 1px only
- Border style: solid always

### Shadows & Depth
- `shadow-none`: flat elements on background
- `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)` — cards in light mode
- `shadow-md`: `0 4px 6px rgba(0,0,0,0.07)` — modals, dropdowns
- Dark mode: borders instead of shadows (background too dark for drop shadows)

### Motion & Micro-animations
- Duration scale:
  - `instant`: 80ms
  - `fast`: 150ms
  - `normal`: 250ms
  - `slow`: 400ms
- Easing:
  - `default`: `cubic-bezier(0.4, 0, 0.2, 1)`
  - `spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - `exit`: `cubic-bezier(0.4, 0, 1, 1)`
- Required animations:
  - Button: `scale(0.97)` on press + background transition
  - Input focus: border color + shadow transition
  - Sidebar: slide in/out (mobile drawer)
  - Message: fade + Y translate on appear
  - Tool card: expand/collapse with height animation
  - Thinking block: shimmer while streaming, fade in when done
  - Gallery image: fade in on load, scale on hover
  - Dark mode toggle: rotate + fade transition
  - Lightbox: scale + fade entry
- Framer Motion throughout
- `transition-all` banned — specify exact properties

### Component Patterns
- **Buttons:** primary (filled), secondary (outlined), ghost (no border), destructive (red)
- **Inputs:** border on idle, accent border on focus, subtle shadow on focus
- **Cards:** `surface` bg, `border` outline, `shadow-sm`, `radius-lg`
- **Sidebar:** `surface-alt` bg, sticky, scrollable session list
- **Tool cards:** left-border accent in role color, expandable, monospace for I/O
- **Code blocks:** dark surface always (even in light mode), JetBrains Mono, copy button
- **Modals:** backdrop blur, spring entry, focus trap
- **Toast:** bottom-right, slide up, auto-dismiss 4s

### Iconography
- **Lucide React** — all icons
- Sizes: sm 16px / md 20px / lg 24px
- Stroke: 1.5px always
- No mixing

### Images & Media
- Generated images: `radius-lg`, `object-cover`
- Gallery grid: 1:1 thumbnails, aspect-ratio preserved in lightbox
- Uploaded image previews: `radius-md`, max 200px height in message

### Dark Mode
- Both modes first-class — not an afterthought
- `next-themes` for theme management
- No color inversion — custom surface shifts
- Shadows → borders in dark mode

### Anti-patterns (NEVER do these)
- No default blue links
- No `transition-all`
- No `any` in TypeScript
- No hardcoded hex colors — always CSS variables
- No full-width buttons on desktop
- No layout shift on load
- No unstyled focus rings
- No Tailwind arbitrary values if a token exists
- No mixing icon libraries

---

## 11. Milestones

### Milestone 1: Foundation ✅
- Repo scaffolded (Next.js 16, TS, Tailwind v4, Framer Motion)
- CLAUDE.md written
- PROJECT_PLAN.md approved
- SQLite schema initialized + migrations
- Password auth middleware working
- Base UI components: Button, Input, Card, Modal, Skeleton, Toast
- globals.css with all CSS variables
- motion.ts with animation constants
- Layout: sidebar + main area, mobile-responsive
- Dark mode toggle working

### Milestone 2: Chat Core
- Chat interface with streaming responses
- File + photo upload
- Markdown rendering
- Session creation + history in sidebar
- Tool/thinking/agent transparency panel

### Milestone 3: Image Generation + Gallery
- Nano Banana + Imagen 4 integration
- Inline image display in chat
- Gallery page with masonry grid
- Lightbox + download + delete

### Milestone 4: Polish
- All empty states
- All error states
- Micro-animations on all interactive elements
- Mobile QA on real phone
- Performance pass

### Milestone 5: Deployment
- Cloudflared tunnel configured
- Auto-start on Pi boot (systemd)
- README with setup instructions

---

## 12. Environment Variables

```
# Auth
SITE_PASSWORD=your-chosen-password

# Google AI (image generation)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Hermes API (local)
HERMES_API_URL=http://localhost:8000
HERMES_API_KEY=your-hermes-api-key

# App
NEXT_PUBLIC_APP_NAME=Hermes
DATA_DIR=/home/emppu/projects/hermes-web/data
AUTH_SECRET=random-32-char-secret-for-cookie-signing
```

---

## 13. Testing Plan
- Manual testing for all user flows (personal app, no CI needed)
- TypeScript strict mode catches most issues at compile time
- Test on mobile browser before each milestone

---

## 14. Open Questions
- What port should the Next.js server run on? (default 3000, or another to avoid conflicts)
- Hermes API — what's the exact local URL and port? Does it need an API key for local calls?
