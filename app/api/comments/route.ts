import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api2.service.order.mi.com/user_comment/get_summary";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pid = searchParams.get("pid");
  if (!pid) {
    return NextResponse.json({ error: "missing pid" }, { status: 400 });
  }

  const url = `${API_URL}?v_pid=${encodeURIComponent(pid)}&callback=__jp`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    const text = await res.text();
    const match = text.match(/__jp\d*\((.*)\)/s);
    if (!match) {
      throw new Error("Invalid response");
    }
    const data = JSON.parse(match[1]);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
