"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "@/components/DashboardContext";
import { createClient } from "@/lib/supabase";
import PresetButtons from "@/components/PresetButtons";
import ProgressSteps from "@/components/ProgressSteps";
import ScenarioCard from "@/components/ScenarioCard";
import type { PipelineStatus } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedModel, triggerRefresh } = useDashboard();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);

  async function saveToSupabase(prompt: string, combined: any[], avgScore: number, highRiskCount: number) {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: session } = await supabase
        .from("test_sessions")
        .insert({
          user_id: user.id,
          prompt,
          model_used: selectedModel,
          avg_score: avgScore,
          high_risk_count: highRiskCount,
          scenario_count: combined.length,
        })
        .select()
        .single();

      if (!session) return;

      const rows = combined.map((r: any) => ({
        session_id: session.id,
        name: r.name,
        description: r.description,
        difficulty: r.difficulty,
        perception_challenges: r.perception_challenges,
        world_id: r.world?.world_id,
        world_url: r.world?.world_url,
        pano_url: r.world?.pano_url,
        thumbnail_url: r.world?.pano_url,
        spz_urls: r.world?.spz_urls,
        caption: r.world?.caption,
        detections: r.detections?.detections || [],
        detection_summary: r.detections?.summary || {},
        annotated_image_base64: r.detections?.annotated_image_base64 || "",
        original_image_base64: r.detections?.original_image_base64 || "",
        analysis: r.analysis,
      }));

      await supabase.from("scenarios").insert(rows);
      triggerRefresh();
    } catch (err) {
      console.error("Failed to save to Supabase:", err);
    }
  }

  async function runPipeline(userInput: string) {
    setStatus("planning");
    setError("");
    setResults([]);

    try {
      // Step 1: Generate scenarios
      const scenarioRes = await fetch("/api/generate-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput }),
      });
      if (!scenarioRes.ok) {
        const err = await scenarioRes.json();
        throw new Error(err.error || "Failed to generate scenarios");
      }
      const { scenarios } = await scenarioRes.json();

      // Step 2: Generate 3D worlds in parallel
      setStatus("generating");
      const worldPromises = scenarios.map((scenario: any) =>
        fetch("/api/generate-world", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: scenario.name, prompt: scenario.marble_prompt }),
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json();
            throw new Error(err.error || "World generation failed");
          }
          return r.json();
        })
      );
      const worlds = await Promise.allSettled(worldPromises);

      // Step 3: Run YOLO detection in parallel
      setStatus("detecting");
      const detectionPromises = worlds.map((worldResult: any, i: number) => {
        if (worldResult.status === "rejected" || !worldResult.value?.pano_url) {
          return Promise.resolve({ error: "No panorama available" });
        }
        return fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: worldResult.value.pano_url,
            expected_objects: scenarios[i].expected_objects,
          }),
        })
          .then(async (r) => {
            if (!r.ok) {
              const err = await r.json();
              throw new Error(err.error || "Detection failed");
            }
            return r.json();
          })
          .catch((e) => ({ error: e.message }));
      });
      const detections = await Promise.all(detectionPromises);

      // Step 4: AI analysis in parallel
      setStatus("analyzing");
      const analysisPromises = detections.map((det: any, i: number) => {
        if (det.error) {
          return Promise.resolve({
            perception_score: 0,
            risk_level: "CRITICAL" as const,
            analysis: "Could not analyze — detection failed.",
            key_findings: ["Detection server was unavailable or panorama missing"],
            recommendations: ["Ensure Python detection server is running on port 8000"],
          });
        }
        return fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario_name: scenarios[i].name,
            scenario_description: scenarios[i].description,
            expected_objects: scenarios[i].expected_objects,
            detection_results: det,
          }),
        })
          .then(async (r) => {
            if (!r.ok) {
              const err = await r.json();
              throw new Error(err.error || "Analysis failed");
            }
            return r.json();
          })
          .catch(() => ({
            perception_score: 50,
            risk_level: "MEDIUM" as const,
            analysis: "Analysis could not be completed.",
            key_findings: [],
            recommendations: [],
          }));
      });
      const analyses = await Promise.all(analysisPromises);

      // Combine
      const combined = scenarios
        .map((scenario: any, i: number) => {
          const worldResult = worlds[i];
          if (worldResult.status === "rejected") return null;
          return {
            ...scenario,
            world: worldResult.value,
            detections: detections[i].error
              ? {
                  detections: [],
                  annotated_image_base64: "",
                  original_image_base64: "",
                  summary: {
                    total_objects: 0,
                    high_confidence: 0,
                    low_confidence: 0,
                    detected_classes: [],
                    missed_expected: scenario.expected_objects,
                  },
                }
              : detections[i],
            analysis: analyses[i],
          };
        })
        .filter(Boolean);

      setResults(combined);
      setStatus("complete");

      // Save to DB in background
      const avg = Math.round(combined.reduce((sum: number, r: any) => sum + r.analysis.perception_score, 0) / combined.length);
      const highRisk = combined.filter((r: any) => r.analysis.risk_level === "HIGH" || r.analysis.risk_level === "CRITICAL").length;
      saveToSupabase(userInput, combined, avg, highRisk);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setStatus("error");
    }
  }

  function handleSubmit() {
    if (!input.trim()) return;
    runPipeline(input.trim());
  }

  function handlePreset(value: string) {
    setInput(value);
    runPipeline(value);
  }

  function clearResults() {
    setResults([]);
    setStatus("idle");
    setError("");
    setInput("");
  }

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum: number, r: any) => sum + r.analysis.perception_score, 0) / results.length)
      : 0;
  const highRiskCount = results.filter(
    (r: any) => r.analysis.risk_level === "HIGH" || r.analysis.risk_level === "CRITICAL"
  ).length;

  const isRunning = status !== "idle" && status !== "complete" && status !== "error";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Input Section */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Describe a driving scenario to test..."
            disabled={isRunning}
            className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-white font-sans
                       placeholder:text-gray-600 focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/30
                       disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={isRunning || !input.trim()}
            className="px-6 py-3 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-mono font-bold
                       hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed glow-cyan whitespace-nowrap"
          >
            {isRunning ? "Running..." : "Generate Test Suite"}
          </button>
        </div>

        <PresetButtons onSelect={handlePreset} disabled={isRunning} />
      </div>

      {/* Progress */}
      <ProgressSteps status={status} error={error} />

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Summary bar */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-6 font-mono text-sm relative">
            <button
              onClick={clearResults}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-[#00f0ff] transition-colors px-2 py-1 rounded border border-transparent hover:border-[#00f0ff]/30"
              title="Clear results and start over"
            >
              New Test {"\u2715"}
            </button>
            <span className="text-gray-400">
              <span className="text-white font-bold">{results.length}</span> scenarios generated
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">
              Avg perception score:{" "}
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
      )}

      {/* Empty state */}
      {status === "idle" && results.length === 0 && (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border mb-4">
            <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            Describe a scenario or choose a preset to begin testing
          </p>
        </div>
      )}
    </div>
  );
}
