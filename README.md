# SynthDrive

**AI-Powered Autonomous Vehicle Perception Test Suite**

Generate synthetic 3D driving environments from natural language, then automatically evaluate how well an AV perception system handles each scenario using a multi-layer AI pipeline.

## How It Works

SynthDrive chains four AI systems together in a single pipeline:

1. **LLM Scenario Generation** (GPT-4o) — Takes a short description like "test pedestrian detection at night" and generates 3 detailed scenario variations targeting different perception challenges
2. **3D World Generation** (World Labs Marble API) — Creates persistent, navigable 3D worlds from those text prompts with panoramic imagery and Gaussian splat assets
3. **Object Detection** (YOLOv8) — Runs real-time object detection on the generated scenes, producing bounding boxes with confidence scores
4. **Safety Analysis** (GPT-4o) — Analyzes detection results and produces a Perception Difficulty Score (0-100) with risk assessment and recommendations

## Features

- **Natural language input** — Describe any driving scenario or use preset buttons
- **Parallel 3D world generation** — 3 scenarios generated simultaneously (~45 sec)
- **Side-by-side detection overlay** — Toggle between raw scene and annotated detection view
- **Perception scoring** — 0-100 score with LOW/MEDIUM/HIGH/CRITICAL risk levels
- **AI safety analysis** — Key findings and recommendations for each scenario
- **Test history** — All tests saved to Supabase with full results, accessible from the sidebar
- **Model selector** — Architecture supports swapping detection models (YOLOv8n default)
- **Auth system** — Email/password sign-in with Supabase Auth
- **Dark mission-control UI** — Industrial aesthetic with cyan accents

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes (TypeScript) |
| CV Microservice | FastAPI + YOLOv8 (Python) |
| LLM | OpenAI GPT-4o |
| 3D Generation | World Labs Marble API |
| Auth & Database | Supabase (Auth + PostgreSQL) |

## Architecture

```
User Input
    |
    v
+--------------+     +--------------+     +--------------+     +--------------+
|  GPT-4o      |---->|  Marble API  |---->|  YOLOv8      |---->|  GPT-4o      |
|  Scenarios   |     |  3D Worlds   |     |  Detection   |     |  Analysis    |
+--------------+     +--------------+     +--------------+     +--------------+
                                                                       |
                                                                       v
                                                              Perception Score
                                                              + Risk Report
```

## Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- OpenAI API key
- World Labs Marble API key
- Supabase project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/jav359003/synthdrive.git
cd synthdrive
npm install
pip install fastapi uvicorn ultralytics requests pillow opencv-python-headless
```

### 2. Configure environment

Create `.env.local` in the project root:

```
OPENAI_API_KEY=your_openai_key
MARBLE_API_KEY=your_marble_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Supabase

Create a Supabase project, then run this SQL in the SQL Editor:

```sql
create table test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  prompt text not null,
  model_used text default 'yolov8n',
  avg_score integer,
  high_risk_count integer,
  scenario_count integer default 3,
  created_at timestamptz default now()
);

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references test_sessions(id) on delete cascade,
  name text, description text, difficulty text,
  perception_challenges jsonb, world_id text, world_url text,
  pano_url text, thumbnail_url text, spz_urls jsonb, caption text,
  detections jsonb, detection_summary jsonb,
  annotated_image_base64 text, original_image_base64 text,
  analysis jsonb, created_at timestamptz default now()
);

alter table test_sessions enable row level security;
alter table scenarios enable row level security;
create policy "Users own sessions" on test_sessions for all using (auth.uid() = user_id);
create policy "Users own scenarios" on scenarios for all using (
  session_id in (select id from test_sessions where user_id = auth.uid())
);
```

### 4. Run

```bash
# Terminal 1 - Python detection server
uvicorn detection_server:app --host 0.0.0.0 --port 8000

# Terminal 2 - Next.js app
npm run dev
```

Open **http://localhost:3000**

## Project Structure

```
synthdrive/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login + signup pages
│   │   ├── dashboard/           # Main app (auth-protected)
│   │   │   ├── page.tsx         # Test interface + pipeline
│   │   │   ├── test/[id]/       # Historical test view
│   │   │   └── welcome/         # Onboarding flow
│   │   └── api/
│   │       ├── generate-scenarios/  # GPT-4o scenario generation
│   │       ├── generate-world/      # Marble API world generation
│   │       ├── detect/              # Proxy to Python YOLO server
│   │       └── analyze/             # GPT-4o safety analysis
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation + history
│   │   ├── ScenarioCard.tsx     # Result card with detection overlay
│   │   ├── PerceptionGauge.tsx  # Circular score visualization
│   │   ├── ProgressSteps.tsx    # Pipeline progress with SVG icons
│   │   ├── ModelSelector.tsx    # Detection model picker
│   │   └── ...
│   └── lib/
│       ├── supabase.ts          # Supabase client
│       └── types.ts             # Shared TypeScript types
├── detection_server.py          # FastAPI + YOLOv8 microservice
└── requirements.txt             # Python dependencies
```

## License

MIT
