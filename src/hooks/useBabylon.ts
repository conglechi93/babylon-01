import { useEffect, useRef, useCallback } from 'react';
import type { Engine, Scene } from '@babylonjs/core';
import type { HighlightManager } from '../babylon/interactions/highlight';
import type { CameraMode, CameraManager } from '../babylon/core/camera';
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
  const cameraManagerRef = useRef<CameraManager | null>(null);

  // Keep a ref to the latest callback so the scene never needs to be recreated
  // when the parent component re-renders with a new handler reference.
  const onSelectRef = useRef(options.onMeshSelected);
  useEffect(() => {
    onSelectRef.current = options.onMeshSelected;
  });

  const getScene = useCallback(() => sceneRef.current, []);

  const setCameraMode = useCallback((mode: CameraMode) => {
    cameraManagerRef.current?.setMode(mode);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine(canvas);
    engineRef.current = engine;

    const { scene, highlightManager, hoverManager, cameraManager } = createScene(
      engine,
      canvas,
      (selectionId) => onSelectRef.current(selectionId),
    );

    sceneRef.current = scene;
    highlightRef.current = highlightManager;
    cameraManagerRef.current = cameraManager;

    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      hoverManager.dispose();
      highlightManager.dispose();
      cameraManager.dispose();
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      highlightRef.current = null;
      cameraManagerRef.current = null;
    };
  }, [canvasRef]);

  return { getScene, setCameraMode };
}
