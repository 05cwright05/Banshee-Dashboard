"use client";

import { CallListItem } from "@/lib/types";

interface CallListProps {
  calls: CallListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " \u2022 " + d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function CallList({ calls, selectedId, onSelect }: CallListProps) {
  return (
    <section className="w-full md:w-1/3 lg:w-[380px] border-r border-surface-container-high bg-surface-container-low overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="p-6 border-b border-surface-container-high bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-lg font-extrabold text-on-surface tracking-tight font-headline">
          Penetration Calls
        </h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1 uppercase tracking-widest">
          Real-Time Telephony Audit
        </p>
      </div>
      <div className="flex flex-col">
        {calls.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant text-sm">
            No calls recorded yet.
          </div>
        )}
        {calls.map((call) => {
          const isActive = call._id === selectedId;
          const displayId = call.callId || call._id.slice(-8).toUpperCase();
          return (
            <div
              key={call._id}
              onClick={() => onSelect(call._id)}
              className={
                isActive
                  ? "p-5 bg-surface-container-lowest border-l-4 border-primary transition-all cursor-pointer"
                  : "p-5 hover:bg-surface-container-high transition-all cursor-pointer border-b border-surface-container-high/50"
              }
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-on-surface font-mono">
                  {displayId}
                </span>
                <span
                  className={
                    call.status === "pass"
                      ? "px-2 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-wider"
                      : "px-2 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider"
                  }
                >
                  {call.status === "pass" ? "Pass" : "Fail"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">
                  schedule
                </span>
                <span className="text-xs font-medium">
                  {formatDate(call.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
