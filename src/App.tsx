import { useRef, useCallback, useState } from 'react';
import type { Scene } from '@babylonjs/core/scene.js';
import { SimulationProvider } from './simulation/SimulationProvider';
import { SelectionProvider } from './context/SelectionProvider';
import { BabylonCanvas } from './components/BabylonCanvas';
import { SidePanel } from './components/SidePanel';
import { Toolbar } from './components/Toolbar';
import { TimeControlBar } from './components/TimeControlBar';
import { useInspector } from './hooks/useInspector';
import type { CameraMode } from './babylon/core/camera';
import './App.css';

function AppInner() {
  const getSceneRef        = useRef<() => Scene | null>(() => null);
  const setCameraModeRef   = useRef<(mode: CameraMode) => void>(() => {});
  const [cameraMode, setCameraMode] = useState<CameraMode>('single');

  const handleGetScene = useCallback(
    (getter: () => () => Scene | null) => { getSceneRef.current = getter(); },
    [],
  );

  const handleGetSetCameraMode = useCallback(
    (setter: (mode: CameraMode) => void) => { setCameraModeRef.current = setter; },
    [],
  );

  const { visible: inspectorVisible, toggle: toggleInspector } = useInspector(
    () => getSceneRef.current(),
  );

  const handleSetCameraMode = useCallback((mode: CameraMode) => {
    setCameraMode(mode);
    setCameraModeRef.current(mode);
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
        <TimeControlBar />
      </div>
      <SidePanel />
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <SelectionProvider>
        <AppInner />
      </SelectionProvider>
    </SimulationProvider>
  );
}
