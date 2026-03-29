import { NextResponse } from "next/server";
import { getRoomService } from "@/lib/livekit";

export async function GET() {
  try {
    const svc = getRoomService();
    const rooms = await svc.listRooms();

    const result = rooms.map((r) => ({
      name: r.name,
      numParticipants: r.numParticipants,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list rooms:", error);
    return NextResponse.json(
      { error: "Failed to list rooms" },
      { status: 500 }
    );
  }
}
