"use client";

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

const MODELS = [
  { value: "yolov8n", label: "YOLOv8n (Nano)", available: true },
  { value: "yolov8s", label: "YOLOv8s (Small)", available: false },
  { value: "yolov8m", label: "YOLOv8m (Medium)", available: false },
  { value: "yolov11", label: "YOLOv11", available: false },
  { value: "custom", label: "Custom Upload", available: false },
];

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div>
      <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 px-1">
        Detection Model
      </div>
      <div className="space-y-1">
        {MODELS.map((model) => (
          <button
            key={model.value}
            onClick={() => model.available && onChange(model.value)}
            disabled={!model.available}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-all flex items-center justify-between ${
              value === model.value
                ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30"
                : model.available
                ? "text-gray-400 hover:bg-card hover:text-gray-300 border border-transparent"
                : "text-gray-600 cursor-not-allowed border border-transparent"
            }`}
          >
            <span>{model.label}</span>
            {!model.available && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-gray-500">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
