import { useSelection } from '../context/SelectionContext';
import styles from './SidePanel.module.css';

export function SidePanel() {
  const { selectedService } = useSelection();

  if (!selectedService) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <h2>Architecture Viewer</h2>
          <p>Click on a service in the 3D scene to view its details.</p>
        </div>
      </div>
    );
  }

  const statusClass =
    selectedService.status === 'healthy'
      ? styles.statusHealthy
      : selectedService.status === 'degraded'
        ? styles.statusDegraded
        : styles.statusDown;

  return (
    <div className={styles.panel}>
      <h2 className={styles.name}>{selectedService.name}</h2>
      <span className={`${styles.badge} ${statusClass}`}>{selectedService.status}</span>

      <div className={styles.section}>
        <label>Type</label>
        <p>{selectedService.type}</p>
      </div>

      <div className={styles.section}>
        <label>Technology</label>
        <p>{selectedService.technology}</p>
      </div>

      <div className={styles.section}>
        <label>Port</label>
        <p>{selectedService.port}</p>
      </div>

      <div className={styles.section}>
        <label>Description</label>
        <p>{selectedService.description}</p>
      </div>

      {selectedService.dependencies.length > 0 && (
        <div className={styles.section}>
          <label>Dependencies</label>
          <ul className={styles.deps}>
            {selectedService.dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
