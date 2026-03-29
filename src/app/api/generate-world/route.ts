import { NextRequest, NextResponse } from "next/server";

const MARBLE_BASE = "https://api.worldlabs.ai";

export const maxDuration = 120; // Allow up to 2 min for world generation polling

export async function POST(req: NextRequest) {
  try {
    const { name, prompt } = await req.json();
    const apiKey = process.env.MARBLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "MARBLE_API_KEY not set" }, { status: 500 });
    }

    // Step 1: Start world generation
    const genResponse = await fetch(`${MARBLE_BASE}/marble/v1/worlds:generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "WLT-Api-Key": apiKey,
      },
      body: JSON.stringify({
        display_name: name,
        world_prompt: {
          type: "text",
          text_prompt: prompt,
        },
        model: "Marble 0.1-mini",
      }),
    });

    if (!genResponse.ok) {
      const errText = await genResponse.text();
      console.error("Marble generate error:", genResponse.status, errText);
      return NextResponse.json(
        { error: `Marble API error: ${genResponse.status} - ${errText}` },
        { status: 500 }
      );
    }

    const genData = await genResponse.json();
    const operationId = genData.name || genData.operation_id;

    if (!operationId) {
      console.error("No operation ID in response:", genData);
      return NextResponse.json(
        { error: "No operation ID returned from Marble" },
        { status: 500 }
      );
    }

    // Step 2: Poll until done
    let result = null;
    for (let i = 0; i < 30; i++) {
      // Up to ~150 seconds
      await new Promise((r) => setTimeout(r, 5000));

      const pollResponse = await fetch(
        `${MARBLE_BASE}/marble/v1/operations/${operationId}`,
        {
          headers: { "WLT-Api-Key": apiKey },
        }
      );

      if (!pollResponse.ok) {
        console.error("Poll error:", pollResponse.status);
        continue;
      }

      const pollData = await pollResponse.json();

      if (pollData.done) {
        result = pollData.response;
        break;
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "World generation timed out" },
        { status: 504 }
      );
    }

    // Extract the data we need
    // Note: pano_url is often null with Marble 0.1-mini, so fall back to thumbnail_url
    const imageUrl =
      result.assets?.imagery?.pano_url ||
      result.assets?.thumbnail_url ||
      null;

    return NextResponse.json({
      world_id: result.world_id || result.id,
      world_url: result.world_marble_url,
      pano_url: imageUrl,
      thumbnail_url: result.assets?.thumbnail_url || null,
      spz_urls: result.assets?.splats?.spz_urls || null,
      collider_mesh_url: result.assets?.mesh?.collider_mesh_url || null,
      caption: result.assets?.caption || null,
    });
  } catch (error: unknown) {
    console.error("World generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
