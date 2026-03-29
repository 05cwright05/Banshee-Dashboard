"use client";

import { useState } from "react";
import LiveRooms from "@/components/LiveRooms";
import LiveChat from "@/components/LiveChat";

export default function LivePage() {
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);

  return (
    <main className="pt-16 min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-on-surface tracking-tight font-headline">
            Live Call Monitor
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1 uppercase tracking-widest">
            Real-Time Audio &amp; Transcription
          </p>
        </div>

        {joinedRoom ? (
          <LiveChat
            roomName={joinedRoom}
            onLeave={() => setJoinedRoom(null)}
          />
        ) : (
          <LiveRooms onJoin={(name) => setJoinedRoom(name)} />
        )}
      </div>
    </main>
  );
}
