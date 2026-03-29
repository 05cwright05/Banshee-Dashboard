"use client";

import { useEffect, useState } from "react";
import { CallDetailResponse } from "@/lib/types";
import AudioPlayer from "./AudioPlayer";
import VulnerabilityGrid from "./VulnerabilityGrid";
import CompositeBadge from "./CompositeBadge";

interface CallDetailProps {
  callId: string;
}

export default function CallDetail({ callId }: CallDetailProps) {
  const [call, setCall] = useState<CallDetailResponse | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setRecordingUrl(null);

      try {
        const res = await fetch(`/api/calls/${callId}`);
        if (!res.ok) throw new Error("Not found");
        const data: CallDetailResponse = await res.json();
        if (cancelled) return;
        setCall(data);

        if (data.metadata?.call_id) {
          try {
            const recRes = await fetch(
              `/api/recording/${data.metadata.call_id}`
            );
            if (recRes.ok) {
              const recData = await recRes.json();
              if (!cancelled) setRecordingUrl(recData.url);
            }
          } catch {
            // Recording not available -- fallback is to not show player
          }
        }
      } catch (err) {
        console.error("Failed to load call:", err);
        if (!cancelled) setCall(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [callId]);

  if (loading) {
    return (
      <section className="flex-1 bg-surface p-8 overflow-y-auto h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-on-surface-variant text-sm animate-pulse">
          Loading call details...
        </div>
      </section>
    );
  }

  if (!call) {
    return (
      <section className="flex-1 bg-surface p-8 overflow-y-auto h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-on-surface-variant text-sm">Call not found.</div>
      </section>
    );
  }

  const displayId = call.metadata?.call_id || call._id.slice(-8).toUpperCase();

  return (
    <section className="flex-1 bg-surface p-8 overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold font-mono tracking-wider">
                {displayId}
              </span>
              <span
                className={
                  call.status === "pass"
                    ? "px-3 py-1 bg-tertiary text-on-tertiary rounded-full text-xs font-bold tracking-wider shadow-sm uppercase"
                    : "px-3 py-1 bg-error text-on-error rounded-full text-xs font-bold tracking-wider shadow-sm uppercase"
                }
              >
                {call.status}
              </span>
            </div>
          </div>
          {call.metadata?.additional_tags &&
            call.metadata.additional_tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {call.metadata.additional_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-surface-container text-on-surface-variant rounded-full text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Audio Player -- only rendered if recording is available */}
        {recordingUrl && <AudioPlayer recordingUrl={recordingUrl} />}

        {/* Vulnerability Grid */}
        <VulnerabilityGrid scores={call.scores} />

        {/* Composite Badge + Threat Summary */}
        <CompositeBadge
          scores={call.scores}
          compositeScore={call.compositeScore}
        />
      </div>
    </section>
  );
}
