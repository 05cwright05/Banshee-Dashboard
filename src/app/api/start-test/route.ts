import { NextResponse } from "next/server";

export async function POST() {
  const testCallUrl = process.env.TEST_CALL_URL || "http://localhost:9000/call";

  try {
    const response = await fetch(testCallUrl, { method: "POST" });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "Test call failed", detail: text },
        { status: response.status }
      );
    }

    let body;
    try {
      body = await response.json();
    } catch {
      body = { message: "Call initiated" };
    }

    return NextResponse.json(body);
  } catch (error) {
    console.error("Failed to start test call:", error);
    return NextResponse.json(
      { error: "Failed to reach test server. Is it running?" },
      { status: 502 }
    );
  }
}
