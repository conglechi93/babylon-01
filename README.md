# 3D Interactive System Architecture Viewer

A 3D visualization of a microservices architecture built with React, TypeScript, and BabylonJS. Click on 3D mesh representations of services to see details in a side panel.

## Tech Stack

- **Vite 7** + **React 19** + **TypeScript 5.9**
- **@babylonjs/core** + **@babylonjs/inspector** (lazy-loaded)
- CSS Modules

## Prerequisites

- Node.js >= 22 (see `.nvmrc`)

## Getting Started

```bash
nvm use          # switch to Node 22
npm install
npm run dev      # start dev server at http://localhost:5173
```

## Build

```bash
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

## Project Structure

```
src/
├── types/services.ts              # ServiceType, ServiceMetadata, ServiceDefinition
├── data/serviceDefinitions.ts     # 6 static service definitions
├── babylon/                       # BabylonJS layer (pure functions, no React)
│   ├── engine.ts                  # Engine with stencil: true
│   ├── sceneFactory.ts            # Orchestrates scene setup
│   ├── camera.ts                  # ArcRotateCamera (zoom 5–30)
│   ├── lighting.ts                # HemisphericLight
│   ├── meshCreators/
│   │   ├── ground.ts              # Non-pickable ground plane
│   │   ├── serviceBox.ts          # Box → Microservice
│   │   ├── databaseCylinder.ts    # Cylinder → Database
│   │   └── messageQueueTorus.ts   # Torus → Message Queue
│   ├── interactions/
│   │   ├── highlight.ts           # HighlightLayer glow on selection
│   │   └── rayPicking.ts          # Click handlers via ActionManager
│   └── animations/
│       └── rotation.ts            # Slow Y-axis idle spin
├── hooks/
│   ├── useBabylon.ts              # Engine/scene lifecycle + ref-forwarding
│   └── useInspector.ts            # Lazy-load BabylonJS Inspector
├── context/
│   └── SelectionContext.tsx        # Selected service state
├── components/
│   ├── BabylonCanvas.tsx           # <canvas> + useBabylon
│   ├── SidePanel.tsx               # Service details panel
│   └── Toolbar.tsx                 # Inspector toggle
├── App.tsx                         # Layout: viewport + side panel
├── main.tsx                        # Entry point
├── index.css                       # Global reset
└── App.css                         # Layout styles
```

## Services

| Service            | Shape    | Color  | Status  |
|--------------------|----------|--------|---------|
| API Gateway        | Box      | Blue   | Healthy |
| Auth Service       | Box      | Green  | Healthy |
| User Service       | Box      | Orange | Healthy |
| Order Service      | Box      | Red    | Degraded|
| PostgreSQL DB      | Cylinder | Purple | Healthy |
| RabbitMQ Event Bus | Torus    | Pink   | Healthy |

## Usage

- **Orbit**: drag with mouse
- **Zoom**: scroll (limited 5–30 units)
- **Select service**: click a mesh → white glow + details in side panel
- **Deselect**: click empty space
- **Inspector**: click "Show Inspector" button (top-left)
