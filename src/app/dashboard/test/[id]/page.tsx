"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ScenarioCard from "@/components/ScenarioCard";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TestDetailPage() {
  const params = useParams();
  const [session, setSession] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: sess } = await supabase
        .from("test_sessions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!sess) {
        setLoading(false);
        return;
      }
      setSession(sess);

      const { data: scenarios } = await supabase
        .from("scenarios")
        .select("*")
        .eq("session_id", sess.id)
        .order("created_at", { ascending: true });

      if (scenarios) {
        // Reconstruct the shape ScenarioCard expects
        const mapped = scenarios.map((s: any) => ({
          name: s.name,
          description: s.description,
          difficulty: s.difficulty,
          perception_challenges: s.perception_challenges || [],
          expected_objects: [],
          world: {
            world_id: s.world_id,
            world_url: s.world_url,
            pano_url: s.pano_url,
            spz_urls: s.spz_urls,
            collider_mesh_url: null,
            caption: s.caption,
          },
          detections: {
            detections: s.detections || [],
            annotated_image_base64: s.annotated_image_base64 || "",
            original_image_base64: s.original_image_base64 || "",
            summary: s.detection_summary || {
              total_objects: 0,
              high_confidence: 0,
              low_confidence: 0,
              detected_classes: [],
              missed_expected: [],
            },
          },
          analysis: s.analysis || {
            perception_score: 0,
            risk_level: "CRITICAL",
            analysis: "No analysis available",
            key_findings: [],
            recommendations: [],
          },
        }));
        setResults(mapped);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-500 font-mono">Test not found</p>
        <a href="/dashboard" className="text-[#00f0ff] text-sm hover:underline">
          Back to dashboard
        </a>
      </div>
    );
  }

  const avgScore = session.avg_score || 0;
  const highRiskCount = session.high_risk_count || 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-mono text-gray-600 mb-1">
          {new Date(session.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <h2 className="text-lg font-sans text-white">{session.prompt}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-card border border-border text-gray-400">
            {session.model_used}
          </span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-6 font-mono text-sm mb-6">
        <span className="text-gray-400">
          <span className="text-white font-bold">{results.length}</span> scenarios
        </span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">
          Avg score:{" "}
          <span className={`font-bold ${avgScore >= 60 ? "text-[#00ff88]" : avgScore >= 40 ? "text-[#ffaa00]" : "text-[#ff3344]"}`}>
            {avgScore}/100
          </span>
        </span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-400">
          <span className={`font-bold ${highRiskCount > 0 ? "text-[#ff3344]" : "text-[#00ff88]"}`}>
            {highRiskCount}
          </span>{" "}
          HIGH RISK
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-6">
        {results.map((result: any, i: number) => (
          <ScenarioCard key={i} result={result} />
        ))}
      </div>
    </div>
  );
}
