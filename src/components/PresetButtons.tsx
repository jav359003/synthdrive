"use client";

const PRESETS = [
  { label: "School Zone", value: "test pedestrian detection in a school zone with children crossing" },
  { label: "Highway Merge", value: "test vehicle detection during highway merge with fast traffic" },
  { label: "Night Driving", value: "test object detection at night with headlight glare" },
  { label: "Construction Zone", value: "test detection in a construction zone with cones and workers" },
  { label: "Parking Lot", value: "test pedestrian and vehicle detection in a busy parking lot" },
  { label: "Rainy Intersection", value: "test detection at a rainy intersection with reflections" },
];

interface PresetButtonsProps {
  onSelect: (value: string) => void;
  disabled: boolean;
}

export default function PresetButtons({ onSelect, disabled }: PresetButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onSelect(preset.value)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-mono rounded-lg border border-border
                     bg-card/50 text-gray-300 hover:text-[#00f0ff] hover:border-[#00f0ff]/50
                     transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
