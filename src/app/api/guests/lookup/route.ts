import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

/** GET /api/guests/lookup?code=xxx → { ok, name|null }.
 *  SELF-CONTAINED: pakai @libsql/client langsung, NGGAK import db.ts.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") ?? "").trim().toLowerCase();
    if (!code) {
      return NextResponse.json({ ok: true, name: null });
    }
    const url = process.env.DATABASE_URL;
    const token = process.env.DATABASE_AUTH_TOKEN;
    if (!url || (!url.startsWith("libsql:") && !url.startsWith("http:") && !url.startsWith("https:") && !url.startsWith("file:"))) {
      return NextResponse.json({ ok: false, error: "DATABASE_URL tidak valid" }, { status: 500 });
    }
    const client = createClient({ url, authToken: token });
    const result = await client.execute({
      sql: 'SELECT name FROM Guest WHERE code = ?',
      args: [code],
    });
    await client.close();
    const name = result.rows.length > 0 ? String(result.rows[0].name) : null;
    return NextResponse.json({ ok: true, name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
