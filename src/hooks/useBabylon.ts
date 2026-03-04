import { useEffect, useRef, useCallback } from 'react';
import type { Engine } from '@babylonjs/core/Engines/engine.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { HighlightManager } from '../babylon/interactions/highlight';
import { createEngine } from '../babylon/engine';
import { createScene } from '../babylon/sceneFactory';

interface UseBabylonOptions {
  onMeshSelected: (serviceId: string | null) => void;
}

export function useBabylon(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseBabylonOptions,
) {
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const highlightRef = useRef<HighlightManager | null>(null);

  // Ref-forwarding: always use the latest callback without re-creating the scene
  const onSelectRef = useRef(options.onMeshSelected);
  onSelectRef.current = options.onMeshSelected;

  const getScene = useCallback(() => sceneRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas);
    engineRef.current = engine;

    const { scene, highlightManager } = createScene(engine, canvas, (serviceId) => {
      onSelectRef.current(serviceId);
    });
    sceneRef.current = scene;
    highlightRef.current = highlightManager;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      highlightManager.dispose();
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      highlightRef.current = null;
    };
  }, [canvasRef]);

  return { getScene };
}
