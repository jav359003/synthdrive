import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an autonomous vehicle safety engineer. Given a short description of a driving scenario to test, generate exactly 3 scenario variations as a JSON array. Each scenario should test different perception challenges.

Return ONLY valid JSON in this exact structure:
{
  "scenarios": [
    {
      "name": "Short scenario name",
      "marble_prompt": "A highly detailed, vivid description of a driving scene for 3D world generation. Include: road type, lane markings, vehicles with specific colors and positions, pedestrians with clothing descriptions, traffic signs/signals, lighting conditions (time of day, weather, shadows), surface conditions, and surrounding buildings/vegetation. Be extremely specific and visual. Always describe it as a realistic American street/road scene.",
      "difficulty": "low" | "medium" | "high",
      "perception_challenges": ["list", "of", "specific", "challenges"],
      "expected_objects": ["car", "person", "stop sign", "traffic light", "truck", "bicycle"],
      "description": "One sentence explaining what this scenario tests for AV perception."
    }
  ]
}

Make each scenario meaningfully different — vary the time of day, weather, obstacle types, occlusion patterns, and road configurations. The marble_prompt should be 2-3 sentences of rich visual detail.`,
        },
        {
          role: "user",
          content: `Generate AV test scenarios for: ${input}`,
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
    console.error("Scenario generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
