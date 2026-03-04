import { useState, useCallback } from 'react';
import type { Scene } from '@babylonjs/core/scene.js';

export function useInspector(getScene: () => Scene | null) {
  const [visible, setVisible] = useState(false);

  const toggle = useCallback(async () => {
    const scene = getScene();
    if (!scene) return;

    // Lazy-load the inspector
    await import('@babylonjs/inspector');

    if (visible) {
      scene.debugLayer.hide();
    } else {
      await scene.debugLayer.show({ overlay: true });
    }
    setVisible((v) => !v);
  }, [getScene, visible]);

  return { visible, toggle };
}
