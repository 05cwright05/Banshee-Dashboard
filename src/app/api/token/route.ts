import { NextResponse } from "next/server";
import { createListenerToken, livekitUrl } from "@/lib/livekit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room");

    if (!room) {
      return NextResponse.json(
        { error: "Missing room parameter" },
        { status: 400 }
      );
    }

    const identity = `listener-${Math.random().toString(36).slice(2, 8)}`;
    const token = await createListenerToken(room, identity);

    return NextResponse.json({ token, url: livekitUrl });
  } catch (error) {
    console.error("Failed to generate token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
