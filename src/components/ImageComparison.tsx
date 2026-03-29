"use client";

import { useState } from "react";

interface ImageComparisonProps {
  originalBase64: string;
  annotatedBase64: string;
}

export default function ImageComparison({ originalBase64, annotatedBase64 }: ImageComparisonProps) {
  const [showAnnotated, setShowAnnotated] = useState(true);

  return (
    <div className="space-y-2">
      {/* Toggle buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAnnotated(false)}
          className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
            !showAnnotated
              ? "bg-gray-700/50 text-white border-gray-500"
              : "text-gray-500 border-border hover:text-gray-300"
          }`}
        >
          Raw Scene
        </button>
        <button
          onClick={() => setShowAnnotated(true)}
          className={`text-xs font-mono px-3 py-1.5 rounded border transition-all ${
            showAnnotated
              ? "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/40"
              : "text-gray-500 border-border hover:text-gray-300"
          }`}
        >
          AV Detection Overlay
        </button>
      </div>

      {/* Image */}
      <div className={`rounded-lg overflow-hidden border ${
        showAnnotated ? "border-[#00f0ff]/30" : "border-border"
      }`}>
        <img
          src={`data:image/jpeg;base64,${showAnnotated ? annotatedBase64 : originalBase64}`}
          alt={showAnnotated ? "YOLO annotated scene" : "Original scene"}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
