"""
SynthDrive YOLO Detection Microservice
Run with: uvicorn detection_server:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import requests
from PIL import Image
from io import BytesIO
import base64
import cv2
import numpy as np
from typing import Optional

app = FastAPI(title="SynthDrive Detection Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 nano model once at startup
model = YOLO("yolov8n.pt")


class DetectionRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    expected_objects: list[str] = []


@app.post("/detect")
async def detect(req: DetectionRequest):
    # Load image from base64 (preferred) or URL fallback
    if req.image_base64:
        img_bytes = base64.b64decode(req.image_base64)
        img = Image.open(BytesIO(img_bytes))
    elif req.image_url:
        response = requests.get(req.image_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
    else:
        return {"error": "No image_base64 or image_url provided"}

    img_array = np.array(img.convert("RGB"))

    # Run YOLO detection
    results = model(img_array, conf=0.25)

    # Extract detections
    detections = []
    for box in results[0].boxes:
        detections.append(
            {
                "class": model.names[int(box.cls[0])],
                "confidence": round(float(box.conf[0]), 3),
                "bbox": box.xyxy[0].tolist(),
            }
        )

    # Create annotated image
    annotated = results[0].plot()  # numpy array with boxes drawn
    annotated_rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(annotated_rgb)
    buffer = BytesIO()
    pil_img.save(buffer, format="JPEG", quality=85)
    annotated_base64 = base64.b64encode(buffer.getvalue()).decode()

    # Original image as base64 for side-by-side comparison
    orig_buffer = BytesIO()
    img.save(orig_buffer, format="JPEG", quality=85)
    original_base64 = base64.b64encode(orig_buffer.getvalue()).decode()

    # Compute summary stats
    low_conf = [d for d in detections if d["confidence"] < 0.5]
    detected_classes = set(d["class"] for d in detections)
    missed = [obj for obj in req.expected_objects if obj not in detected_classes]

    return {
        "detections": detections,
        "annotated_image_base64": annotated_base64,
        "original_image_base64": original_base64,
        "summary": {
            "total_objects": len(detections),
            "high_confidence": len(
                [d for d in detections if d["confidence"] >= 0.7]
            ),
            "low_confidence": len(low_conf),
            "low_confidence_details": low_conf,
            "detected_classes": list(detected_classes),
            "missed_expected": missed,
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok", "model": "yolov8n"}
