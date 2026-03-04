import { useRef, useCallback } from 'react';
import type { Scene } from '@babylonjs/core/scene.js';
import { SelectionProvider } from './context/SelectionProvider';
import { BabylonCanvas } from './components/BabylonCanvas';
import { SidePanel } from './components/SidePanel';
import { Toolbar } from './components/Toolbar';
import { useInspector } from './hooks/useInspector';
import './App.css';

function AppInner() {
  const getSceneRef = useRef<() => Scene | null>(() => null);

  const handleGetScene = useCallback(
    (getter: () => () => Scene | null) => {
      getSceneRef.current = getter();
    },
    [],
  );

  const { visible: inspectorVisible, toggle: toggleInspector } = useInspector(
    () => getSceneRef.current(),
  );

  return (
    <div className="app-layout">
      <div className="viewport">
        <Toolbar onToggleInspector={toggleInspector} inspectorVisible={inspectorVisible} />
        <BabylonCanvas onGetScene={handleGetScene} />
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
