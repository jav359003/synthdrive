import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { scenario_name, scenario_description, expected_objects, detection_results } =
      await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an autonomous vehicle perception safety analyst. Given YOLO object detection results from a synthetic driving scene, produce a concise safety analysis.

Return ONLY valid JSON:
{
  "perception_score": <number 0-100, lower means harder/more dangerous for AV>,
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "analysis": "2-3 sentence analysis of what the AV perception system would struggle with in this scene",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Scoring guide:
- 80-100: Easy scene, most objects detected with high confidence
- 60-79: Moderate difficulty, some objects have low confidence
- 40-59: Challenging, multiple objects missed or low confidence
- 0-39: Critical, key safety-relevant objects missed entirely

Focus on: missed pedestrians, low-confidence detections of safety-critical objects (people, stop signs, traffic lights), and any expected objects that were not detected at all.`,
        },
        {
          role: "user",
          content: `Analyze these detection results for scenario "${scenario_name}": ${JSON.stringify(detection_results)}. The scenario description was: ${scenario_description}. Expected objects: ${JSON.stringify(expected_objects)}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: "Empty response from LLM" }, { status: 500 });
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
