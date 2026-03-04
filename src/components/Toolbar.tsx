import styles from './Toolbar.module.css';

interface ToolbarProps {
  onToggleInspector: () => void;
  inspectorVisible: boolean;
}

export function Toolbar({ onToggleInspector, inspectorVisible }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <button className={styles.button} onClick={onToggleInspector}>
        {inspectorVisible ? 'Hide Inspector' : 'Show Inspector'}
      </button>
    </div>
  );
}
