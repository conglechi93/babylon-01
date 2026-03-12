import { useRef, useEffect } from 'react';
import { useBabylon } from '../hooks/useBabylon';
import { useSelection } from '../context/useSelection';
import { useSimulation } from '../simulation/SimulationContext';
import type { CameraMode } from '../babylon/core/camera';
import styles from './BabylonCanvas.module.css';
interface BabylonCanvasProps {
  cameraMode: CameraMode;
  onGetScene?: (getScene: () => ReturnType<typeof useBabylon>['getScene']) => void;
  onGetSetCameraMode?: (setter: (mode: CameraMode) => void) => void;
}

export function BabylonCanvas({ cameraMode, onGetScene, onGetSetCameraMode }: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setSelectionId, selectedEntity } = useSelection();

  const { getScene, setCameraMode, getSolarSystemApi } = useBabylon(canvasRef, {
    onMeshSelected: setSelectionId,
  });

  if (onGetScene)         onGetScene(() => getScene);
  if (onGetSetCameraMode) onGetSetCameraMode(setCameraMode);

  // ── Bridge: simulation state → Babylon ───────────────────────────────────
  const {
    earthOrbitAU,
    luminosity,
    planetState,
    timeScale,
    paused,
    sunMassSolar,
  } = useSimulation();

  useEffect(() => {
    const apply = () => {
      const api = getSolarSystemApi();
      if (!api) return false;
      api.setEarthOrbitAU(earthOrbitAU);
      api.setHabitableZoneScale(Math.sqrt(luminosity));
      api.setEarthTemperatureState(planetState);
      api.setTimeScale(timeScale);
      api.setPaused(paused);
      api.setSunMass(sunMassSolar);
      return true;
    };

    // Try immediately; if Babylon isn't ready yet, poll until it is
    if (!apply()) {
      const id = setInterval(() => { if (apply()) clearInterval(id); }, 80);
      return () => clearInterval(id);
    }
  }, [earthOrbitAU, luminosity, planetState, timeScale, paused, sunMassSolar, getSolarSystemApi]);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} touch-action="none" />

      {cameraMode === 'single' && selectedEntity && (
        <>
          <div className={styles.followBorder} />
          <span className={styles.followLabel}>Follow Cam</span>
        </>
      )}

      {cameraMode === 'quad' && (
        <div className={styles.quadOverlay}>
          <div className={styles.crossH} />
          <div className={styles.crossV} />
          <span className={`${styles.label} ${styles.topLeft}`}>Perspective</span>
          <span className={`${styles.label} ${styles.topRight}`}>Top (Y+)</span>
          <span className={`${styles.label} ${styles.bottomLeft}`}>Front (Z+)</span>
          <span className={`${styles.label} ${styles.bottomRight}`}>Side (X+)</span>
        </div>
      )}

    </div>
  );
}
