"use client";

import { useEffect, useState } from "react";
import { CallListItem } from "@/lib/types";
import CallList from "@/components/CallList";
import CallDetail from "@/components/CallDetail";

export default function DashboardPage() {
  const [calls, setCalls] = useState<CallListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalls() {
      try {
        const res = await fetch("/api/calls");
        const data: CallListItem[] = await res.json();
        setCalls(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch calls:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalls();
  }, []);

  return (
    <main className="pt-16 min-h-screen flex">
      <CallList
        calls={calls}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {loading ? (
        <section className="flex-1 bg-surface p-8 overflow-y-auto h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-on-surface-variant text-sm animate-pulse">
            Loading...
          </div>
        </section>
      ) : selectedId ? (
        <CallDetail callId={selectedId} />
      ) : (
        <section className="flex-1 bg-surface p-8 overflow-y-auto h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
              security
            </span>
            <p className="text-sm">
              Select a call from the list to view details.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
