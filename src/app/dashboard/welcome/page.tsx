"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Welcome to SynthDrive",
    content:
      "Generate synthetic 3D driving environments from natural language, then automatically evaluate how well an AV perception system handles each scenario.",
    visual: "logo",
  },
  {
    title: "How It Works",
    content:
      "Our four-stage AI pipeline combines language models, 3D world generation, computer vision, and safety analysis — all from a single text prompt.",
    visual: "pipeline",
  },
  {
    title: "Ready to Test",
    content:
      "Describe any driving scenario — foggy night, school zone, construction site — and SynthDrive generates, detects, and analyzes in under a minute.",
    visual: "go",
  },
];

function PipelineVisual() {
  const stages = [
    { icon: "LLM", label: "Scenario Gen", color: "#00f0ff" },
    { icon: "3D", label: "World Gen", color: "#00f0ff" },
    { icon: "CV", label: "Detection", color: "#ffaa00" },
    { icon: "AI", label: "Analysis", color: "#00ff88" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {stages.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-xs font-bold"
              style={{ borderColor: s.color + "50", color: s.color, background: s.color + "10" }}
            >
              {s.icon}
            </div>
            <span className="text-[10px] font-mono text-gray-500">{s.label}</span>
          </div>
          {i < stages.length - 1 && (
            <svg className="w-6 h-4 text-gray-600 mb-5" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 8h16m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  function complete() {
    localStorage.setItem("synthdrive_onboarded", "true");
    router.replace("/dashboard");
  }

  const current = STEPS[step];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {/* Logo on first step */}
        {current.visual === "logo" && (
          <div className="mb-6">
            <h1 className="font-mono text-4xl font-bold tracking-tight text-white">
              SYNTH<span className="text-[#00f0ff]">DRIVE</span>
            </h1>
          </div>
        )}

        {/* Pipeline visual on second step */}
        {current.visual === "pipeline" && <PipelineVisual />}

        {/* Rocket on last step */}
        {current.visual === "go" && (
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30">
            <svg className="w-8 h-8 text-[#00f0ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}

        <h2 className="text-xl font-bold text-white font-sans mb-2">{current.title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{current.content}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-[#00f0ff] w-6" : i < step ? "bg-[#00ff88]" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-lg border border-border text-gray-400 font-mono text-sm hover:text-white hover:border-gray-500 transition-all"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-sm font-bold
                         hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={complete}
              className="flex-1 py-2.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-sm font-bold
                         hover:bg-[#00f0ff]/20 hover:border-[#00f0ff] transition-all glow-cyan"
            >
              Get Started
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={complete}
          className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
