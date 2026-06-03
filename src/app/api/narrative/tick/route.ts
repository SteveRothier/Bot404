import { NextResponse } from "next/server";
import { runNarrativeTick } from "@/lib/narrative/tick";

export async function POST(request: Request) {
  const secret = process.env.NARRATIVE_CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runNarrativeTick();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Tick failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
