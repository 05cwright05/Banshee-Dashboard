import { NextResponse } from "next/server";
import twilioClient from "@/lib/twilio";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ callSid: string }> }
) {
  try {
    const { callSid } = await params;
    const { searchParams } = new URL(request.url);
    const stream = searchParams.get("stream") === "1";

    if (!callSid) {
      return NextResponse.json(
        { error: "Missing callSid" },
        { status: 400 }
      );
    }

    const recordings = await twilioClient.recordings.list({
      callSid,
      limit: 1,
    });

    if (recordings.length === 0) {
      return NextResponse.json(
        { error: "No recording found" },
        { status: 404 }
      );
    }

    const recording = recordings[0];
    const mediaUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Recordings/${recording.sid}.mp3`;

    if (stream) {
      const creds = Buffer.from(
        `${process.env.TWILIO_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const audioRes = await fetch(mediaUrl, {
        headers: { Authorization: `Basic ${creds}` },
      });

      if (!audioRes.ok || !audioRes.body) {
        return NextResponse.json(
          { error: "Failed to stream recording" },
          { status: 502 }
        );
      }

      return new NextResponse(audioRes.body, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioRes.headers.get("Content-Length") || "",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return NextResponse.json({
      url: `/api/recording/${callSid}?stream=1`,
      duration: recording.duration,
      sid: recording.sid,
    });
  } catch (error) {
    console.error("Failed to fetch recording:", error);
    return NextResponse.json(
      { error: "Failed to fetch recording" },
      { status: 404 }
    );
  }
}
