# 3D Solar System Viewer

A 3D interactive solar system built with React, TypeScript, and BabylonJS. Supports clicking to select celestial bodies and primitive meshes, with hover highlighting and a side panel for details.

## Tech Stack

- **Vite** + **React 19** + **TypeScript**
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
├── types/
│   ├── celestial.ts           # CelestialType, CelestialMetadata
│   ├── mesh.ts                # MeshShape, MeshMetadata
│   └── selection.ts           # SelectionId, SelectedEntity
├── data/
│   ├── celestialDefinitions.ts  # Sun, planets, moons definitions
│   └── meshDefinitions.ts       # Primitive mesh definitions
├── babylon/                   # BabylonJS layer (pure, no React)
│   ├── core/
│   │   ├── engine.ts          # Engine (stencil: true)
│   │   ├── camera.ts          # ArcRotateCamera
│   │   └── lighting.ts        # HemisphericLight
│   ├── scenes/
│   │   └── sceneFactory.ts    # Orchestrates full scene setup
│   ├── meshCreators/
│   │   ├── ground.ts          # Non-pickable ground plane
│   │   ├── primitiveMesh.ts   # Generic primitive mesh factory
│   │   ├── sun.ts             # Sun mesh + PointLight
│   │   ├── planet.ts          # Planet mesh + optional ring
│   │   ├── solarSystem.ts     # Assembles solar system
│   │   └── solarGround.ts     # Solar system ground
│   ├── interactions/
│   │   ├── highlight.ts       # HighlightManager — select (white) + hover (cyan)
│   │   ├── hover.ts           # HoverManager — POINTERMOVE detection
│   │   └── rayPicking.ts      # Click selection via onPointerObservable
│   └── animations/
│       ├── rotation.ts        # Self-rotation (X/Y/Z) + vertical bob — áp dụng cho primitive meshes
│       └── orbit.ts           # Orbital revolution qua parent pivot — planets quay quanh sun
├── hooks/
│   ├── useBabylon.ts          # Engine/scene lifecycle + ref-forwarding
│   └── useInspector.ts        # Lazy-load BabylonJS Inspector
├── context/
│   ├── SelectionContext.ts    # React context for selection state
│   └── useSelection.ts        # Hook to consume SelectionContext
├── App.tsx                    # Layout: canvas + side panel
└── main.tsx                   # Entry point
```

## Interactions

| Action | Result |
|---|---|
| **Drag** mouse | Orbit camera |
| **Scroll** | Zoom in / out |
| **Hover** mesh | Cyan glow highlight |
| **Click** mesh | White glow + details in side panel |
| **Click** empty space | Deselect |
| **"Show Inspector"** button | Toggle BabylonJS Inspector |

## Architecture Notes

### Interaction System

- **`rayPicking.ts`** — handles `POINTERDOWN` + `POINTERUP` for click-to-select. Babylon auto-populates `pickInfo` for these events.
- **`hover.ts`** — handles `POINTERMOVE`. Babylon does **not** auto-pick on move, so `scene.pick()` is called manually. Fires `onHoverEnter` / `onHoverLeave` callbacks and delegates visual feedback to `HighlightManager`.
- **`highlight.ts`** — manages a single `HighlightLayer` with two independent states: `select` (white glow) and `hover` (cyan glow).

### Animation System

Có 2 loại chuyển động độc lập:

**`rotation.ts` — self-rotation + bob** (primitive meshes)
Mỗi mesh quay quanh trục của chính nó và/hoặc nhún lên xuống theo sóng sin. Config được lấy từ `MeshMetadata.animation`:
```ts
mesh.rotation.y += anim.rotationY * delta;  // tự quay theo trục Y
mesh.position.y = baseY + sin(t) * bobY;    // nhún lên xuống
```

**`orbit.ts` — orbital revolution** (planets/moons)
Planet được gắn vào một `TransformNode` (pivot) vô hình đặt tại tâm orbit. Khi pivot xoay, planet di chuyển theo đường tròn xung quanh sun:
```ts
pivot.rotation.y += speed * delta;  // quay pivot → planet orbit theo
```

### Mesh Metadata

Every pickable mesh carries a `metadata` object used to identify it:

```ts
mesh.metadata = { meshId: 'box-1' };       // primitive mesh
mesh.metadata = { celestialId: 'earth' };  // celestial body
```

`SelectionId` resolves to `{ kind: 'mesh' | 'celestial', id: string } | null`.
