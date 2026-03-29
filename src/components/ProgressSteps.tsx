"use client";

type PipelineStatus = "idle" | "planning" | "generating" | "detecting" | "analyzing" | "complete" | "error";

interface ProgressStepsProps {
  status: PipelineStatus;
  error?: string;
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a6 6 0 0 1 6 6c0 1.66-.68 3.16-1.76 4.24L12 16.48l-4.24-4.24A6 6 0 0 1 12 2z" />
      <path d="M12 2C9.24 2 7 4.24 7 7c0 1.1.36 2.12.96 2.94" />
      <path d="M12 2c2.76 0 5 2.24 5 5 0 1.1-.36 2.12-.96 2.94" />
      <path d="M9 10.5c-.5.5-1.5 1-1.5 2.5 0 1 .5 2 1.5 2.5" />
      <path d="M15 10.5c.5.5 1.5 1 1.5 2.5 0 1-.5 2-1.5 2.5" />
      <line x1="12" y1="16" x2="12" y2="22" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M4.5 7h15M4.5 17h15" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" />
    </svg>
  );
}

const STEPS = [
  { key: "planning", Icon: BrainIcon, label: "AI planning scenarios..." },
  { key: "generating", Icon: GlobeIcon, label: "Generating 3D worlds..." },
  { key: "detecting", Icon: EyeIcon, label: "Running perception analysis..." },
  { key: "analyzing", Icon: ChartIcon, label: "Computing risk scores..." },
];

function getStepState(stepKey: string, currentStatus: PipelineStatus) {
  const order = ["planning", "generating", "detecting", "analyzing", "complete"];
  const stepIdx = order.indexOf(stepKey);
  const currentIdx = order.indexOf(currentStatus);

  if (currentStatus === "error") return "error";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function ProgressSteps({ status, error }: ProgressStepsProps) {
  if (status === "idle" || status === "complete") return null;

  return (
    <div className="glass-card p-6 mt-6 max-w-2xl mx-auto">
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const state = getStepState(step.key, status);
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.key} className="flex gap-3">
              {/* Icon column with connecting line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    state === "done"
                      ? "border-[#00ff88]/50 bg-[#00ff88]/10 check-pop"
                      : state === "active"
                      ? "border-[#00f0ff]/50 bg-[#00f0ff]/10 animate-pulse-glow"
                      : "border-border bg-card"
                  }`}
                >
                  {state === "done" ? (
                    <CheckIcon className="w-5 h-5 text-[#00ff88]" />
                  ) : (
                    <step.Icon
                      className={`w-4.5 h-4.5 ${
                        state === "active" ? "text-[#00f0ff]" : "text-gray-600"
                      }`}
                    />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-px h-6 transition-colors duration-500 ${
                      state === "done" ? "bg-[#00ff88]/40" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="flex items-center gap-3 pt-2 pb-2">
                <span
                  className={`font-mono text-sm transition-colors duration-300 ${
                    state === "active"
                      ? "text-[#00f0ff]"
                      : state === "done"
                      ? "text-[#00ff88]"
                      : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
                {state === "active" && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {status === "error" && error && (
        <div className="mt-4 p-3 bg-[#ff3344]/10 border border-[#ff3344]/30 rounded-lg text-[#ff3344] text-sm font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
