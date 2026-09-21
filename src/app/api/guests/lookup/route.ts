import { NextRequest, NextResponse } from "next/server";
import { getClient, ensureTables } from "@/lib/migrate";

/** GET /api/guests/lookup?code=xxx → { ok, name|null }.
 *  Self-healing: kalau tabel Guest belum ada, bikin dulu lewat ensureTables.
 *  Kalau code nggak ditemukan, balikin name: null (fail gracefully biar cover
 *  page nggak crash, cuma tampil nama literal dari URL).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") ?? "").trim().toLowerCase();
    if (!code) {
      return NextResponse.json({ ok: true, name: null });
    }
    const client = getClient();
    await ensureTables(client);
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
