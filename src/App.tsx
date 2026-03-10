import { useRef, useCallback, useState } from 'react';
import type { Scene } from '@babylonjs/core/scene.js';
import { SelectionProvider } from './context/SelectionProvider';
import { BabylonCanvas } from './components/BabylonCanvas';
import { SidePanel } from './components/SidePanel';
import { Toolbar } from './components/Toolbar';
import { useInspector } from './hooks/useInspector';
import type { CameraMode } from './babylon/core/multiCamera';
import './App.css';

function AppInner() {
  const getSceneRef = useRef<() => Scene | null>(() => null);
  const setCameraModeRef = useRef<(mode: CameraMode) => void>(() => {});

  // cameraMode là React state để Toolbar biết button nào đang active
  const [cameraMode, setCameraMode] = useState<CameraMode>('single');

  const handleGetScene = useCallback(
    (getter: () => () => Scene | null) => {
      getSceneRef.current = getter();
    },
    [],
  );

  // BabylonCanvas expose hàm setCameraMode của useBabylon lên đây
  const handleGetSetCameraMode = useCallback(
    (setter: (mode: CameraMode) => void) => {
      setCameraModeRef.current = setter;
    },
    [],
  );

  const { visible: inspectorVisible, toggle: toggleInspector } = useInspector(
    () => getSceneRef.current(),
  );

  // Đây là handler duy nhất cho camera mode — sync cả React state lẫn Babylon
  const handleSetCameraMode = useCallback((mode: CameraMode) => {
    setCameraMode(mode);           // React re-render → Toolbar + overlay cập nhật
    setCameraModeRef.current(mode); // Babylon bên trong canvas thực sự chuyển camera
  }, []);

  return (
    <div className="app-layout">
      <div className="viewport">
        <Toolbar
          onToggleInspector={toggleInspector}
          inspectorVisible={inspectorVisible}
          cameraMode={cameraMode}
          onSetCameraMode={handleSetCameraMode}
        />
        <BabylonCanvas
          cameraMode={cameraMode}
          onGetScene={handleGetScene}
          onGetSetCameraMode={handleGetSetCameraMode}
        />
      </div>
      <SidePanel />
    </div>
  );
}

export default function App() {
  return (
    <SelectionProvider>
      <AppInner />
    </SelectionProvider>
  );
}
