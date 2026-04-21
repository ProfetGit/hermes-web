import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'hermes.db');

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  duration?: number;
}

export interface Attachment {
  filename: string;
  mimeType: string;
  path: string;
  size: number;
}

export interface Session {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking: string | null;
  tool_calls: string | null;
  attachments: string | null;
  created_at: number;
}

export interface GalleryItem {
  id: string;
  session_id: string | null;
  message_id: string | null;
  prompt: string;
  model: string;
  filename: string;
  width: number;
  height: number;
  aspect_ratio: string;
  created_at: number;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'New Chat',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      thinking TEXT,
      tool_calls TEXT,
      attachments TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
      message_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
      prompt TEXT NOT NULL,
      model TEXT NOT NULL,
      filename TEXT NOT NULL,
      width INTEGER NOT NULL DEFAULT 0,
      height INTEGER NOT NULL DEFAULT 0,
      aspect_ratio TEXT NOT NULL DEFAULT '1:1',
      created_at INTEGER NOT NULL
    );
  `);
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function createSession(title = 'New Chat'): Session {
  const db = getDb();
  const id = uuid();
  const ts = now();
  db.prepare(
    `INSERT INTO sessions (id, title, created_at, updated_at, message_count) VALUES (?, ?, ?, ?, 0)`
  ).run(id, title, ts, ts);
  return getSession(id)!;
}

export function getSessions(): Session[] {
  return getDb()
    .prepare(`SELECT * FROM sessions ORDER BY updated_at DESC`)
    .all() as Session[];
}

export function getSession(id: string): Session | null {
  return (
    (getDb()
      .prepare(`SELECT * FROM sessions WHERE id = ?`)
      .get(id) as Session) ?? null
  );
}

export function updateSessionTitle(id: string, title: string): void {
  getDb()
    .prepare(`UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?`)
    .run(title, now(), id);
}

export function deleteSession(id: string): void {
  getDb().prepare(`DELETE FROM sessions WHERE id = ?`).run(id);
}

export function addMessage(
  msg: Omit<Message, 'id' | 'created_at'>
): Message {
  const db = getDb();
  const id = uuid();
  const ts = now();
  db.prepare(
    `INSERT INTO messages (id, session_id, role, content, thinking, tool_calls, attachments, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    msg.session_id,
    msg.role,
    msg.content,
    msg.thinking ?? null,
    msg.tool_calls ?? null,
    msg.attachments ?? null,
    ts
  );
  db.prepare(
    `UPDATE sessions SET message_count = message_count + 1, updated_at = ? WHERE id = ?`
  ).run(ts, msg.session_id);
  return db.prepare(`SELECT * FROM messages WHERE id = ?`).get(id) as Message;
}

export function getMessages(session_id: string): Message[] {
  return getDb()
    .prepare(
      `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`
    )
    .all(session_id) as Message[];
}

export function addGalleryItem(
  item: Omit<GalleryItem, 'id' | 'created_at'>
): GalleryItem {
  const db = getDb();
  const id = uuid();
  const ts = now();
  db.prepare(
    `INSERT INTO gallery (id, session_id, message_id, prompt, model, filename, width, height, aspect_ratio, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    item.session_id ?? null,
    item.message_id ?? null,
    item.prompt,
    item.model,
    item.filename,
    item.width,
    item.height,
    item.aspect_ratio,
    ts
  );
  return db.prepare(`SELECT * FROM gallery WHERE id = ?`).get(id) as GalleryItem;
}

export function getGalleryItems(limit = 50, offset = 0): GalleryItem[] {
  return getDb()
    .prepare(
      `SELECT * FROM gallery ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(limit, offset) as GalleryItem[];
}

export function deleteGalleryItem(id: string): void {
  getDb().prepare(`DELETE FROM gallery WHERE id = ?`).run(id);
}
