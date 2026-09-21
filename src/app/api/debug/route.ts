import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/debug — diagnostic endpoint buat lihat apa yang kebaca di runtime.
 * TIDAK import db.ts (soalnya db.ts sendiri yang error). Jalan mandiri.
 */
export async function GET() {
  const rawUrl = process.env.DATABASE_URL;
  const rawToken = process.env.DATABASE_AUTH_TOKEN;
  const cwd = process.cwd();

  const dbDir = path.resolve(cwd, "db");
  const dbFile = path.resolve(cwd, "db", "custom.db");

  return NextResponse.json({
    // Environment vars (raw, biar keliatan kalau "undefined" string)
    env: {
      DATABASE_URL_raw: rawUrl === undefined ? "<undefined>" : `"${rawUrl}"`,
      DATABASE_URL_type: typeof rawUrl,
      DATABASE_URL_length: rawUrl ? rawUrl.length : 0,
      DATABASE_URL_starts_with: rawUrl ? rawUrl.slice(0, 15) : "",
      DATABASE_AUTH_TOKEN_set: rawToken ? "yes" : "no",
      DATABASE_AUTH_TOKEN_length: rawToken ? rawToken.length : 0,
      NODE_ENV: process.env.NODE_ENV,
    },
    // Filesystem info
    fs: {
      cwd,
      dbDir_exists: fs.existsSync(dbDir),
      dbDir_writable: (() => {
        try {
          if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
          fs.accessSync(dbDir, fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      })(),
      dbFile_exists: fs.existsSync(dbFile),
      dbFile_path: dbFile,
    },
    // Diagnosis
    diagnosis: (() => {
      if (!rawUrl) return "DATABASE_URL kosong. Pakai fallback SQLite file.";
      if (rawUrl === "undefined" || rawUrl === "null") return `DATABASE_URL = literal string "${rawUrl}". Env var belum di-set dengan benar.`;
      if (rawUrl.startsWith("libsql:") || rawUrl.startsWith("http:") || rawUrl.startsWith("https:")) return `DATABASE_URL valid (remote). Pakai Turso adapter.`;
      if (rawUrl.startsWith("file:")) return `DATABASE_URL = file (local SQLite).`;
      return `DATABASE_URL format nggak dikenal: "${rawUrl.slice(0, 30)}..."`;
    })(),
  });
}
