import { useState } from 'react';
import { useSelection } from '../context/useSelection';
import type { ServiceMetadata } from '../types/services';
import type { CelestialMetadata } from '../types/celestial';
import styles from './SidePanel.module.css';

function ServicePanel({ service }: { service: ServiceMetadata }) {
  const statusClass =
    service.status === 'healthy'
      ? styles.statusHealthy
      : service.status === 'degraded'
        ? styles.statusDegraded
        : styles.statusDown;

  return (
    <>
      <h2 className={styles.name}>{service.name}</h2>
      <span className={`${styles.badge} ${statusClass}`}>{service.status}</span>

      <div className={styles.section}>
        <label>Type</label>
        <p>{service.type}</p>
      </div>

      <div className={styles.section}>
        <label>Technology</label>
        <p>{service.technology}</p>
      </div>

      <div className={styles.section}>
        <label>Port</label>
        <p>{service.port}</p>
      </div>

      <div className={styles.section}>
        <label>Description</label>
        <p>{service.description}</p>
      </div>

      {service.dependencies.length > 0 && (
        <div className={styles.section}>
          <label>Dependencies</label>
          <ul className={styles.deps}>
            {service.dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function CelestialPanel({ body }: { body: CelestialMetadata }) {
  return (
    <>
      <h2 className={styles.name}>{body.name}</h2>
      <span className={`${styles.badge} ${styles.badgeCelestial}`}>{body.type}</span>

      <div className={styles.section}>
        <label>Diameter</label>
        <p>{body.diameterKm.toLocaleString()} km</p>
      </div>

      {body.distanceAU > 0 && (
        <div className={styles.section}>
          <label>Distance from Sun</label>
          <p>{body.distanceAU} AU</p>
        </div>
      )}

      {body.orbitalPeriodYears > 0 && (
        <div className={styles.section}>
          <label>Orbital Period</label>
          <p>{body.orbitalPeriodYears} years</p>
        </div>
      )}

      <div className={styles.section}>
        <label>Moons</label>
        <p>{body.moons}</p>
      </div>

      <div className={styles.section}>
        <label>Description</label>
        <p>{body.description}</p>
      </div>
    </>
  );
}

export function SidePanel() {
  const { selectedEntity } = useSelection();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${styles.panel} ${collapsed ? styles.panelCollapsed : ''}`}>
      <button className={styles.collapseBtn} onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? '◀' : '▶'}
      </button>
      {!collapsed && (
        <>
          {!selectedEntity ? (
            <div className={styles.placeholder}>
              <h2>Architecture Viewer</h2>
              <p>Click on a service or celestial body in the 3D scene to view its details.</p>
            </div>
          ) : selectedEntity.kind === 'service' ? (
            <ServicePanel service={selectedEntity.data} />
          ) : (
            <CelestialPanel body={selectedEntity.data} />
          )}
        </>
      )}
    </div>
  );
}
