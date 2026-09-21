import { NextRequest, NextResponse } from "next/server";
import { getClient, genId, ensureTables } from "@/lib/migrate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const attendanceRaw = typeof body?.attendance === "string" ? body.attendance : "";
    const count =
      typeof body?.count === "number" && Number.isFinite(body.count)
        ? Math.max(1, Math.min(20, Math.floor(body.count)))
        : 1;
    const message =
      typeof body?.message === "string" ? body.message.trim().slice(0, 500) : null;

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nama wajib diisi." },
        { status: 400 }
      );
    }
    const allowed = ["hadir", "tidak", "ragu"];
    const attendance = allowed.includes(attendanceRaw) ? attendanceRaw : "ragu";

    const client = getClient();
    await ensureTables(client);
    const id = genId();
    await client.execute({
      sql: 'INSERT INTO Rsvp (id, name, attendance, count, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, name, attendance, count, message, new Date().toISOString()],
    });
    await client.close();
    return NextResponse.json({
      ok: true,
      rsvp: { id, name, attendance, count, message },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Jalankan /api/setup dulu." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = getClient();
    await ensureTables(client);
    const result = await client.execute(
      "SELECT id, name, attendance, count, message, createdAt FROM Rsvp ORDER BY createdAt DESC LIMIT 100"
    );
    await client.close();
    const rows = result.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      attendance: String(r.attendance),
      count: Number(r.count),
      message: r.message === null ? null : String(r.message),
      createdAt: String(r.createdAt),
    }));
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Jalankan /api/setup dulu." },
      { status: 500 }
    );
  }
}
