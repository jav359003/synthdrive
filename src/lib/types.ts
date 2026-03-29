export type PipelineStatus = "idle" | "planning" | "generating" | "detecting" | "analyzing" | "complete" | "error";

export interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

export interface DetectionResult {
  detections: Detection[];
  annotated_image_base64: string;
  original_image_base64: string;
  summary: {
    total_objects: number;
    high_confidence: number;
    low_confidence: number;
    detected_classes: string[];
    missed_expected: string[];
  };
}

export interface AnalysisResult {
  perception_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  analysis: string;
  key_findings: string[];
  recommendations: string[];
}

export interface WorldResult {
  world_id: string;
  world_url: string;
  pano_url: string | null;
  thumbnail_url: string | null;
  spz_urls: Record<string, string> | null;
  collider_mesh_url: string | null;
  caption: string | null;
}

export interface ScenarioResult {
  name: string;
  description: string;
  difficulty: "low" | "medium" | "high";
  perception_challenges: string[];
  expected_objects: string[];
  marble_prompt: string;
  world: WorldResult;
  detections: DetectionResult;
  analysis: AnalysisResult;
}

export interface TestSession {
  id: string;
  user_id: string;
  prompt: string;
  model_used: string;
  avg_score: number;
  high_risk_count: number;
  scenario_count: number;
  created_at: string;
}

export interface DBScenario {
  id: string;
  session_id: string;
  name: string;
  description: string;
  difficulty: string;
  perception_challenges: string[];
  world_id: string;
  world_url: string;
  pano_url: string;
  thumbnail_url: string;
  spz_urls: Record<string, string> | null;
  caption: string;
  detections: Detection[];
  detection_summary: DetectionResult["summary"];
  annotated_image_base64: string;
  original_image_base64: string;
  analysis: AnalysisResult;
  created_at: string;
}
