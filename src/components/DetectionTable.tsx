"use client";

interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

interface DetectionTableProps {
  detections: Detection[];
  missedObjects?: string[];
}

export default function DetectionTable({ detections }: DetectionTableProps) {
  if (detections.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4 text-center text-sm text-gray-500 font-mono">
        No objects detected in this scene
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0a0a1a]">
            <th className="text-left py-2 px-3 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Object
            </th>
            <th className="text-left py-2 px-3 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="text-left py-2 px-3 font-mono text-xs text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {detections.map((det, i) => (
            <tr key={i} className="hover:bg-card/50">
              <td className="py-2 px-3 font-mono text-gray-300">{det.class}</td>
              <td className="py-2 px-3 font-mono">
                <span
                  className={
                    det.confidence >= 0.7
                      ? "text-[#00ff88]"
                      : det.confidence >= 0.5
                      ? "text-[#ffaa00]"
                      : "text-[#ff3344]"
                  }
                >
                  {(det.confidence * 100).toFixed(1)}%
                </span>
              </td>
              <td className="py-2 px-3">
                {det.confidence >= 0.7 ? (
                  <span className="text-[#00ff88]">{"\u2713"} Detected</span>
                ) : det.confidence >= 0.5 ? (
                  <span className="text-[#ffaa00]">{"\u26A0"} Low Conf</span>
                ) : (
                  <span className="text-[#ff3344]">{"\u2717"} Weak</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
