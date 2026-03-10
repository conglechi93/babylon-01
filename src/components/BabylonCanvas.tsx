import { useRef } from 'react';
import { useBabylon } from '../hooks/useBabylon';
import { useSelection } from '../context/useSelection';
import type { CameraMode } from '../babylon/core/camera';
import styles from './BabylonCanvas.module.css';

interface BabylonCanvasProps {
  cameraMode: CameraMode;
  onGetScene?: (getScene: () => ReturnType<typeof useBabylon>['getScene']) => void;
  onGetSetCameraMode?: (setter: (mode: CameraMode) => void) => void;
}

export function BabylonCanvas({ cameraMode, onGetScene, onGetSetCameraMode }: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setSelectionId } = useSelection();

  const { getScene, setCameraMode } = useBabylon(canvasRef, {
    onMeshSelected: setSelectionId,
  });

  // Expose getScene lên App để inspector dùng
  if (onGetScene) {
    onGetScene(() => getScene);
  }

  // Expose setCameraMode lên App để Toolbar gọi được
  if (onGetSetCameraMode) {
    onGetSetCameraMode(setCameraMode);
  }

  return (
    <div className={styles.wrapper}>
      {/* Canvas BabylonJS */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        touch-action="none"
      />

      {/* ── Quad view overlay ────────────────────────────────────────────────── */}
      {cameraMode === 'quad' && (
        <div className={styles.quadOverlay}>
          {/* Đường kẻ chia màn hình */}
          <div className={styles.crossH} />
          <div className={styles.crossV} />

          {/* Nhãn tên từng viewport — khớp với thứ tự viewport trong CameraManager */}
          <span className={`${styles.label} ${styles.topLeft}`}>Perspective</span>
          <span className={`${styles.label} ${styles.topRight}`}>Top (Y+)</span>
          <span className={`${styles.label} ${styles.bottomLeft}`}>Front (Z+)</span>
          <span className={`${styles.label} ${styles.bottomRight}`}>Side (X+)</span>
        </div>
      )}

      {/* ── PiP overlay ──────────────────────────────────────────────────────── */}
      {cameraMode === 'pip' && (
        <>
          {/* Viền + nhãn của PiP window — kích thước khớp viewport 28%×34% */}
          <div className={styles.pipBorder} />
          <span className={styles.pipLabel}>Follow Cam</span>
          <span className={styles.pipHint}>Click mesh để follow camera bám theo</span>
        </>
      )}
    </div>
  );
}
