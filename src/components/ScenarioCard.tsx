"use client";

import PerceptionGauge from "./PerceptionGauge";
import ImageComparison from "./ImageComparison";
import DetectionTable from "./DetectionTable";

interface ScenarioResult {
  name: string;
  description: string;
  difficulty: "low" | "medium" | "high";
  perception_challenges: string[];
  expected_objects: string[];
  world: {
    world_id: string;
    world_url: string;
    pano_url: string | null;
    spz_urls: Record<string, string> | null;
    collider_mesh_url: string | null;
    caption: string | null;
  };
  detections: {
    detections: { class: string; confidence: number; bbox: number[] }[];
    annotated_image_base64: string;
    original_image_base64: string;
    summary: {
      total_objects: number;
      high_confidence: number;
      low_confidence: number;
      detected_classes: string[];
      missed_expected: string[];
    };
  };
  analysis: {
    perception_score: number;
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    analysis: string;
    key_findings: string[];
    recommendations: string[];
  };
}

interface ScenarioCardProps {
  result: ScenarioResult;
}

const difficultyColors = {
  low: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
  medium: "bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]/30",
  high: "bg-[#ff3344]/10 text-[#ff3344] border-[#ff3344]/30",
};

const riskColors = {
  LOW: "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30",
  MEDIUM: "bg-[#ffaa00]/10 text-[#ffaa00] border-[#ffaa00]/30",
  HIGH: "bg-[#ff3344]/10 text-[#ff3344] border-[#ff3344]/30",
  CRITICAL: "bg-[#ff3344]/20 text-[#ff3344] border-[#ff3344]/50",
};

export default function ScenarioCard({ result }: ScenarioCardProps) {
  const { world, detections, analysis } = result;

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-mono text-lg font-bold text-white">{result.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{result.description}</p>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${difficultyColors[result.difficulty]}`}>
              {result.difficulty.toUpperCase()}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${riskColors[analysis.risk_level]}`}>
              {analysis.risk_level} RISK
            </span>
          </div>
        </div>
        <PerceptionGauge score={analysis.perception_score} />
      </div>

      {/* Scene View with Detection Overlay */}
      {detections.original_image_base64 && detections.annotated_image_base64 && (
        <ImageComparison
          originalBase64={detections.original_image_base64}
          annotatedBase64={detections.annotated_image_base64}
        />
      )}

      {/* Detection Table */}
      <div>
        <div className="text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider">
          Detection Results ({detections.summary.total_objects} objects)
        </div>
        <DetectionTable detections={detections.detections} />
      </div>

      {/* AI Analysis */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          AI Safety Analysis
        </div>
        <p className="text-sm text-gray-300">{analysis.analysis}</p>

        {analysis.key_findings.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[#ffaa00] mb-1">Key Findings</div>
            <ul className="space-y-1">
              {analysis.key_findings.map((f, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-[#ffaa00]">&bull;</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.recommendations.length > 0 && (
          <div>
            <div className="text-xs font-mono text-[#00f0ff] mb-1">Recommendations</div>
            <ul className="space-y-1">
              {analysis.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-[#00f0ff]">&bull;</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Perception Challenges */}
      <div className="flex flex-wrap gap-1.5">
        {result.perception_challenges.map((c) => (
          <span
            key={c}
            className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00f0ff]/5 text-[#00f0ff]/70 border border-[#00f0ff]/20"
          >
            {c}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        {world.world_url && (
          <a
            href={world.world_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded border border-[#00f0ff]/40 text-[#00f0ff] bg-[#00f0ff]/5 hover:bg-[#00f0ff]/15 transition-colors"
          >
            Explore 3D World {"\u2197"}
          </a>
        )}
        {world.pano_url && (
          <a
            href={world.pano_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded border border-border text-gray-400 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
          >
            Download Panorama
          </a>
        )}
        {world.spz_urls && Object.values(world.spz_urls)[0] && (
          <a
            href={Object.values(world.spz_urls)[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded border border-border text-gray-400 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
          >
            Download SPZ
          </a>
        )}
        {world.collider_mesh_url && (
          <a
            href={world.collider_mesh_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded border border-border text-gray-400 hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
          >
            Download GLB
          </a>
        )}
      </div>
    </div>
  );
}
