import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";

/**
 * SELF-CONTAINED guests API — bikin koneksi sendiri pakai @libsql/client.
 * NGGAK import db.ts (Prisma), jadi tetap jalan walau Prisma build cache rusak.
 */
function getClient(): Client {
  const url = process.env.DATABASE_URL;
  const token = process.env.DATABASE_AUTH_TOKEN;
  if (!url || (!url.startsWith("libsql:") && !url.startsWith("http:") && !url.startsWith("https:") && !url.startsWith("file:"))) {
    throw new Error("DATABASE_URL tidak valid");
  }
  return createClient({ url, authToken: token });
}

function genId(): string {
  // cuid-like: timestamp + random
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

/** GET /api/guests — list all guests. */
export async function GET() {
  try {
    const client = getClient();
    const result = await client.execute(
      "SELECT id, code, name, createdAt FROM Guest ORDER BY createdAt DESC"
    );
    await client.close();
    const rows = result.rows.map((r) => ({
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      createdAt: String(r.createdAt),
    }));
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Jalankan /api/setup dulu untuk bikin tabel." },
      { status: 500 }
    );
  }
}

/** POST /api/guests — create guest(s).
 *  • { code, name } → single
 *  • { guests: [{code, name}] } → bulk
 *  Code kosong = auto-generate dari nama. Code tabrakan = append angka.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = getClient();

    // Bulk mode
    if (Array.isArray(body?.guests)) {
      const added: { id: string; code: string; name: string }[] = [];
      const errors: string[] = [];
      const takenCodes = new Set<string>();

      for (let i = 0; i < body.guests.length; i++) {
        const g = body.guests[i];
        const name = typeof g?.name === "string" ? g.name.trim() : "";
        if (!name) {
          errors.push(`Baris ${i + 1}: nama kosong`);
          continue;
        }
        let code = typeof g?.code === "string" ? g.code.trim().toLowerCase() : "";
        if (!code) code = name.toLowerCase().replace(/\s+/g, "");

        // Check tabrakan di DB + batch ini
        let finalCode = code;
        let attempt = 1;
        // check batch
        while (takenCodes.has(finalCode)) {
          attempt++;
          finalCode = `${code}${attempt}`;
        }
        // check DB
        const existing = await client.execute({
          sql: 'SELECT 1 FROM Guest WHERE code = ?',
          args: [finalCode],
        });
        while (existing.rows.length > 0) {
          attempt++;
          finalCode = `${code}${attempt}`;
          const re = await client.execute({
            sql: 'SELECT 1 FROM Guest WHERE code = ?',
            args: [finalCode],
          });
          if (re.rows.length === 0) break;
        }
        takenCodes.add(finalCode);

        const id = genId();
        await client.execute({
          sql: 'INSERT INTO Guest (id, code, name, createdAt) VALUES (?, ?, ?, ?)',
          args: [id, finalCode, name, new Date().toISOString()],
        });
        added.push({ id, code: finalCode, name });
      }

      await client.close();
      return NextResponse.json({
        ok: true,
        added: added.length,
        errors,
        guests: added,
      });
    }

    // Single mode
    const code = typeof body?.code === "string" ? body.code.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      await client.close();
      return NextResponse.json(
        { ok: false, error: "Nama wajib diisi." },
        { status: 400 }
      );
    }
    const baseCode = code || name.toLowerCase().replace(/\s+/g, "");
    let finalCode = baseCode;
    let attempt = 1;
    let existing = await client.execute({
      sql: 'SELECT 1 FROM Guest WHERE code = ?',
      args: [finalCode],
    });
    while (existing.rows.length > 0) {
      attempt++;
      finalCode = `${baseCode}${attempt}`;
      existing = await client.execute({
        sql: 'SELECT 1 FROM Guest WHERE code = ?',
        args: [finalCode],
      });
    }
    const id = genId();
    await client.execute({
      sql: 'INSERT INTO Guest (id, code, name, createdAt) VALUES (?, ?, ?, ?)',
      args: [id, finalCode, name, new Date().toISOString()],
    });
    await client.close();
    return NextResponse.json({ ok: true, guest: { id, code: finalCode, name } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Jalankan /api/setup dulu." },
      { status: 500 }
    );
  }
}

/** PUT /api/guests?id=xxx — update guest name (and optionally code). */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID wajib diisi." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const newCode =
      typeof body?.code === "string" ? body.code.trim().toLowerCase() : "";

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nama wajib diisi." },
        { status: 400 }
      );
    }

    const client = getClient();

    // Cek tamu yang mau di-edit ada atau nggak
    const existing = await client.execute({
      sql: "SELECT id, code FROM Guest WHERE id = ?",
      args: [id],
    });
    if (existing.rows.length === 0) {
      await client.close();
      return NextResponse.json(
        { ok: false, error: "Tamu tidak ditemukan." },
        { status: 404 }
      );
    }

    // Kalau code dikirim & beda dari code lama, cek duplikat
    if (newCode) {
      const oldCode = String(existing.rows[0].code);
      if (newCode !== oldCode) {
        const dup = await client.execute({
          sql: "SELECT 1 FROM Guest WHERE code = ? AND id != ?",
          args: [newCode, id],
        });
        if (dup.rows.length > 0) {
          await client.close();
          return NextResponse.json(
            {
              ok: false,
              error: `Code "${newCode}" sudah dipakai tamu lain.`,
            },
            { status: 409 }
          );
        }
        await client.execute({
          sql: "UPDATE Guest SET name = ?, code = ? WHERE id = ?",
          args: [name, newCode, id],
        });
        await client.close();
        return NextResponse.json({
          ok: true,
          guest: { id, name, code: newCode },
        });
      }
    }

    // Update nama doang
    await client.execute({
      sql: "UPDATE Guest SET name = ? WHERE id = ?",
      args: [name, id],
    });
    await client.close();
    return NextResponse.json({ ok: true, guest: { id, name } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** DELETE /api/guests?id=xxx */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID wajib diisi." },
        { status: 400 }
      );
    }
    const client = getClient();
    await client.execute({ sql: 'DELETE FROM Guest WHERE id = ?', args: [id] });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
