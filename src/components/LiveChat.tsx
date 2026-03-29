"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room,
  RoomEvent,
  RemoteTrack,
  RemoteParticipant,
  TranscriptionSegment,
  Participant,
  RemoteTrackPublication,
} from "livekit-client";

interface LiveChatProps {
  roomName: string;
  onLeave: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  isAgent: boolean;
  text: string;
  isFinal: boolean;
}

export default function LiveChat({ roomName, onLeave }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [audioTrackCount, setAudioTrackCount] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const res = await fetch(
          `/api/token?room=${encodeURIComponent(roomName)}`
        );
        const { token, url } = await res.json();

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(
          RoomEvent.TrackSubscribed,
          (track: RemoteTrack, _pub: RemoteTrackPublication, _participant: RemoteParticipant) => {
            if (track.kind === "audio") {
              const el = track.attach();
              (el as HTMLAudioElement).volume = 1.0;
              audioContainerRef.current?.appendChild(el);
              setAudioTrackCount((c) => c + 1);
            }
          }
        );

        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach((el) => el.remove());
          setAudioTrackCount((c) => Math.max(0, c - 1));
        });

        room.on(
          RoomEvent.TranscriptionReceived,
          (segments: TranscriptionSegment[], participant?: Participant) => {
            for (const seg of segments) {
              const identity = participant?.identity || "unknown";
              const isAgent =
                !identity.startsWith("+") && !/^\d{10,}$/.test(identity);

              setMessages((prev) => {
                const existing = prev.findIndex((m) => m.id === seg.id);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = {
                    ...updated[existing],
                    text: seg.text,
                    isFinal: seg.final,
                  };
                  return updated;
                }
                return [
                  ...prev,
                  {
                    id: seg.id,
                    sender: isAgent ? "AI Agent" : identity,
                    isAgent,
                    text: seg.text,
                    isFinal: seg.final,
                  },
                ];
              });
            }
          }
        );

        room.on(RoomEvent.ParticipantConnected, () => updateParticipants(room));
        room.on(RoomEvent.ParticipantDisconnected, () =>
          updateParticipants(room)
        );

        room.on(RoomEvent.Disconnected, () => {
          if (!cancelled) setStatus("disconnected");
        });

        await room.connect(url, token);
        if (!cancelled) {
          setStatus("connected");
          updateParticipants(room);
        }
      } catch (e) {
        console.error("Join failed", e);
        if (!cancelled) setStatus("disconnected");
      }
    }

    function updateParticipants(room: Room) {
      const parts = [
        room.localParticipant,
        ...room.remoteParticipants.values(),
      ];
      setParticipants(
        parts.map((p) => {
          const id = p.identity || "unknown";
          return id.startsWith("listener-") ? "You (listener)" : id;
        })
      );
    }

    connect();

    return () => {
      cancelled = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomName]);

  function handleLeave() {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    onLeave();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleLeave}
          className="px-3 py-1.5 border border-surface-container-high rounded-lg text-sm text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
        >
          &larr; Back
        </button>
        <span className="text-sm font-medium text-on-surface flex-1">
          {roomName}
        </span>
        <span
          className={
            status === "connected"
              ? "px-3 py-1 rounded-full text-[11px] font-medium bg-tertiary/10 text-tertiary"
              : status === "connecting"
                ? "px-3 py-1 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant"
                : "px-3 py-1 rounded-full text-[11px] font-medium bg-error/10 text-error"
          }
        >
          {status === "connected"
            ? "\u25cf LIVE"
            : status === "connecting"
              ? "Connecting..."
              : "\u25cf ENDED"}
        </span>
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {participants.map((p, i) => (
            <span
              key={i}
              className="bg-surface-container border border-surface-container-high px-3 py-1 rounded-full text-xs text-on-surface-variant flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.length === 0 && status === "connected" && (
          <div className="text-center py-12 text-on-surface-variant text-sm opacity-60">
            Waiting for transcription...
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.isAgent
                ? "ml-auto bg-primary/10 border border-primary/20 rounded-br-sm"
                : "mr-auto bg-surface-container border border-surface-container-high rounded-bl-sm"
            } ${!msg.isFinal ? "opacity-60 italic" : ""}`}
          >
            <div
              className={`text-[11px] font-semibold mb-1 uppercase tracking-wide ${
                msg.isAgent ? "text-primary" : "text-tertiary"
              }`}
            >
              {msg.isAgent ? "\uD83E\uDD16 " : "\uD83D\uDCDE "}
              {msg.sender}
            </div>
            <div className="text-on-surface">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Audio Bar */}
      <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-surface-container-high text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">
          volume_up
        </span>
        <span>Audio playing through speakers</span>
        <span className="ml-auto text-xs">
          {audioTrackCount} track{audioTrackCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Hidden audio container */}
      <div ref={audioContainerRef} className="hidden" />
    </div>
  );
}
