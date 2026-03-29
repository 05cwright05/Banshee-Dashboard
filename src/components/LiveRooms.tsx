"use client";

import { useEffect, useState } from "react";

interface RoomInfo {
  name: string;
  numParticipants: number;
}

interface LiveRoomsProps {
  onJoin: (roomName: string) => void;
}

export default function LiveRooms({ onJoin }: LiveRoomsProps) {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    async function loadRooms() {
      try {
        const res = await fetch("/api/rooms");
        const data: RoomInfo[] = await res.json();
        setRooms(data);
      } catch (e) {
        console.error("Failed to load rooms", e);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
    timer = setInterval(loadRooms, 3000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 text-on-surface-variant text-sm animate-pulse">
        Loading rooms...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">
          phone_disabled
        </span>
        <p className="text-on-surface-variant text-sm">
          No active rooms yet.
        </p>
        <p className="text-on-surface-variant text-xs mt-1">
          Start a test call and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.name}
          className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-surface-container-high hover:border-primary/30 transition-colors"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                call
              </span>
              {room.name}
            </span>
            <span className="text-xs text-on-surface-variant">
              {room.numParticipants} participant
              {room.numParticipants !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={() => onJoin(room.name)}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}
