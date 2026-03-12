import { useState } from 'react';
import { useSelection } from '../context/useSelection';
import type { MeshMetadata } from '../types/mesh';
import type { CelestialMetadata } from '../types/celestial';
import { SimulationPanel } from './SimulationPanel';
import styles from './SidePanel.module.css';

function MeshPanel({ mesh }: { mesh: MeshMetadata }) {
  return (
    <>
      <h2 className={styles.name}>{mesh.name}</h2>
      <span className={`${styles.badge} ${styles.badgeMesh}`}>{mesh.shape}</span>

      <div className={styles.section}>
        <label>Color</label>
        <p>
          <span className={styles.colorSwatch} style={{ background: mesh.color }} />
          {mesh.color}
        </p>
      </div>

      <div className={styles.section}>
        <label>Dimensions</label>
        {Object.entries(mesh.dimensions).map(([key, val]) => (
          <p key={key}>{key}: {val}</p>
        ))}
      </div>

      <div className={styles.section}>
        <label>Position</label>
        <p>x: {mesh.position.x}, y: {mesh.position.y}, z: {mesh.position.z}</p>
      </div>
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
          {/* ── Selected entity info ─────────────────────────────────────── */}
          {!selectedEntity ? (
            <div className={styles.placeholder}>
              <h2>Scene Viewer</h2>
              <p>Click on a mesh or celestial body to view its details.</p>
            </div>
          ) : selectedEntity.kind === 'mesh' ? (
            <MeshPanel mesh={selectedEntity.data} />
          ) : (
            <CelestialPanel body={selectedEntity.data} />
          )}

          {/* ── Universe Sandbox: chỉ hiện khi chọn Sun hoặc Earth ─────── */}
          {selectedEntity?.kind === 'celestial' &&
            (selectedEntity.data.id === 'sun' || selectedEntity.data.id === 'earth') && (
              <SimulationPanel />
            )}
        </>
      )}
    </div>
  );
}
