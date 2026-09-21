import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Validasi URL database — return true hanya kalau valid & bisa dipakai.
 */
function getValidDbUrl(): string | null {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  const u = raw.trim();
  if (!u || u === "undefined" || u === "null" || u === "UNDEFINED") return null;
  if (
    u.startsWith("file:") ||
    u.startsWith("libsql:") ||
    u.startsWith("http:") ||
    u.startsWith("https:")
  ) {
    return u;
  }
  return null;
}

/**
 * Buat PrismaClient.
 *
 *  STRATEGI (urutan prioritas):
 *  1. Kalau DATABASE_URL valid (libsql://...) → remote Turso + adapter.
 *  2. Kalau invalid/kosong → fallback SQLite file lokal (auto-create folder).
 *
 *  CATATAN: production WAJIB set DATABASE_URL (Turso) + DATABASE_AUTH_TOKEN
 *  biar data persist. Tanpa itu, fallback file SQLite (ephemeral di serverless).
 */
function createPrismaClient(): PrismaClient {
  const url = getValidDbUrl();

  // === Mode 1: Remote Turso ===
  if (url && (url.startsWith("libsql:") || url.startsWith("http:") || url.startsWith("https:"))) {
    try {
      const libsql = createClient({
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      });
      const adapter = new PrismaLibSql(libsql);
      console.log("[db] Using Turso (remote):", url.replace(/:\/\/[^@]*/, "://***"));
      return new PrismaClient({ adapter });
    } catch (err) {
      console.error("[db] Turso adapter failed, falling back to SQLite:", err);
      // fall through to file SQLite
    }
  }

  // === Mode 2: Fallback SQLite file (local atau kalau Turso invalid) ===
  const dbDir = path.resolve(process.cwd(), "db");
  try {
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  } catch {
    // ignore
  }
  const filePath = `file:${path.resolve(process.cwd(), "db", "custom.db")}`;
  process.env.DATABASE_URL = filePath;
  console.warn("[db] Using local SQLite file:", filePath);
  console.warn("[db] ⚠ Data NGGAK persist di serverless! Set DATABASE_URL=libsql://... buat Turso.");
  return new PrismaClient(
    process.env.NODE_ENV !== "production" ? { log: ["query"] } : undefined
  );
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
