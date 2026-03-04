import { useRef } from 'react';
import { useBabylon } from '../hooks/useBabylon';
import { useSelection } from '../context/SelectionContext';

interface BabylonCanvasProps {
  onGetScene?: (getScene: () => ReturnType<typeof useBabylon>['getScene']) => void;
}

export function BabylonCanvas({ onGetScene }: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setSelectionId } = useSelection();

  const { getScene } = useBabylon(canvasRef, {
    onMeshSelected: setSelectionId,
  });

  // Expose getScene to parent for inspector toggle
  if (onGetScene) {
    onGetScene(() => getScene);
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      touch-action="none"
    />
  );
}
