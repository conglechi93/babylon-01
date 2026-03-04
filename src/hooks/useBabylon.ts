import { useEffect, useRef, useCallback } from 'react';
import type { Engine, Scene } from '@babylonjs/core';
import type { HighlightManager } from '../babylon/interactions/highlight';
import type { SelectionId } from '../types/selection';
import { createEngine } from '../babylon/core/engine';
import { createScene } from '../babylon/scenes/sceneFactory';

interface UseBabylonOptions {
  onMeshSelected: (selectionId: SelectionId) => void;
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
  useEffect(() => {
    onSelectRef.current = options.onMeshSelected;
  });

  const getScene = useCallback(() => sceneRef.current, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas);
    engineRef.current = engine;

    const { scene, highlightManager } = createScene(engine, canvas, (selectionId) => {
      onSelectRef.current(selectionId);
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
