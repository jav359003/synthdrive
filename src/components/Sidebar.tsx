"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import ModelSelector from "./ModelSelector";
import { createClient } from "@/lib/supabase";
import type { TestSession } from "@/lib/types";

interface SidebarProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  refreshKey?: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(sessions: TestSession[]) {
  const groups: Record<string, TestSession[]> = {};
  for (const s of sessions) {
    const key = formatDate(s.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}

function scoreColor(score: number) {
  if (score >= 60) return "text-[#00ff88]";
  if (score >= 40) return "text-[#ffaa00]";
  return "text-[#ff3344]";
}

export default function Sidebar({ selectedModel, onModelChange, refreshKey }: SidebarProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<TestSession[]>([]);

  const fetchSessions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("test_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setSessions(data);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, refreshKey]);

  const grouped = groupByDate(sessions);

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-[#07070d] border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 pb-3">
        <h1
          className="font-mono text-xl font-bold tracking-tight text-white cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          SYNTH<span className="text-[#00f0ff]">DRIVE</span>
        </h1>
        <p className="text-[10px] text-gray-600 font-mono mt-0.5">AV Perception Test Suite</p>
      </div>

      {/* New Test */}
      <div className="px-3 pb-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-2.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-sm font-bold
                     hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Test
        </button>
      </div>

      {/* Session History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-3">
        <div className="text-xs font-mono text-gray-600 uppercase tracking-wider px-1">
          History
        </div>
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-600 px-1">No tests yet</p>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="text-[10px] font-mono text-gray-600 px-1 mb-1">{date}</div>
              <div className="space-y-0.5">
                {items.map((s) => {
                  const isActive = pathname === `/dashboard/test/${s.id}`;
                  return (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/dashboard/test/${s.id}`)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all group ${
                        isActive
                          ? "bg-card border border-border text-white"
                          : "text-gray-400 hover:bg-card/50 hover:text-gray-300 border border-transparent"
                      }`}
                    >
                      <div className="truncate font-sans">{s.prompt}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`font-mono text-[10px] ${scoreColor(s.avg_score)}`}>
                          {s.avg_score}/100
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {s.scenario_count} scenarios
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Model Selector */}
      <div className="px-3 py-3 border-t border-border">
        <ModelSelector value={selectedModel} onChange={onModelChange} />
      </div>

      {/* Sign Out */}
      <div className="px-3 pb-4">
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="w-full py-2 text-xs font-mono text-gray-500 hover:text-[#ff3344] transition-colors text-center rounded-lg hover:bg-[#ff3344]/5"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
