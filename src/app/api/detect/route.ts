import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image_url, expected_objects } = await req.json();

    // Download the image — try without auth first (CDN thumbnails are public),
    // fall back to Marble API key if needed
    let imgResponse = await fetch(image_url);
    if (!imgResponse.ok) {
      const marbleKey = process.env.MARBLE_API_KEY;
      if (marbleKey) {
        imgResponse = await fetch(image_url, {
          headers: { "WLT-Api-Key": marbleKey },
        });
      }
    }
    if (!imgResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download panorama image: ${imgResponse.status}` },
        { status: 500 }
      );
    }

    const imgBuffer = await imgResponse.arrayBuffer();
    const base64Image = Buffer.from(imgBuffer).toString("base64");

    // Send base64 image to Python detection server
    const detectionUrl = process.env.DETECTION_SERVER_URL || "http://localhost:8000";
    const response = await fetch(`${detectionUrl}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: base64Image,
        expected_objects: expected_objects || [],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Detection server error: ${errText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Detection proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Detection server unavailable. Make sure the Python server is running on port 8000. ${message}` },
      { status: 500 }
    );
  }
}
