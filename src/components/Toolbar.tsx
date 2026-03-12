import type { CameraMode } from '../babylon/core/camera';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onToggleInspector: () => void;
  inspectorVisible: boolean;
  cameraMode: CameraMode;
  onSetCameraMode: (mode: CameraMode) => void;
}

const CAMERA_MODES: { mode: CameraMode; label: string; title: string }[] = [
  { mode: 'single', label: '⬜ Single',  title: '1 camera — toàn màn hình' },
  { mode: 'quad',   label: '⊞ Quad',    title: '4 camera — Perspective / Top / Front / Side' },
];

export function Toolbar({
  onToggleInspector,
  inspectorVisible,
  cameraMode,
  onSetCameraMode,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {/* Camera mode switcher */}
      <div className={styles.group}>
        {CAMERA_MODES.map(({ mode, label, title }) => (
          <button
            key={mode}
            className={`${styles.button} ${cameraMode === mode ? styles.active : ''}`}
            onClick={() => onSetCameraMode(mode)}
            title={title}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Inspector toggle */}
      <button className={styles.button} onClick={onToggleInspector}>
        {inspectorVisible ? 'Hide Inspector' : 'Show Inspector'}
      </button>
    </div>
  );
}
