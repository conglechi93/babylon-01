import { useSimulation } from '../simulation/SimulationContext';
import styles from './TimeControlBar.module.css';

const SPEED_PRESETS = [
  { label: '0.1×', value: 0.1 },
  { label: '1×',   value: 1   },
  { label: '5×',   value: 5   },
  { label: '10×',  value: 10  },
  { label: '50×',  value: 50  },
] as const;

export function TimeControlBar() {
  const { paused, timeScale, setPaused, setTimeScale, orbitalPeriodDays } = useSimulation();

  return (
    <div className={styles.bar}>
      {/* ── Play / Pause ──────────────────────────────────────────────── */}
      <button
        className={`${styles.btn} ${styles.playBtn} ${paused ? styles.playActive : ''}`}
        onClick={() => setPaused(!paused)}
        title={paused ? 'Tiếp tục' : 'Dừng'}
      >
        {paused ? '▶' : '⏸'}
      </button>

      {/* ── Speed presets ─────────────────────────────────────────────── */}
      <div className={styles.presets}>
        {SPEED_PRESETS.map(({ label, value }) => (
          <button
            key={value}
            className={`${styles.btn} ${styles.speedBtn} ${!paused && timeScale === value ? styles.speedActive : ''}`}
            onClick={() => { setTimeScale(value); setPaused(false); }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className={styles.divider} />

      {/* ── Orbital period ────────────────────────────────────────────── */}
      <div className={styles.period}>
        <span className={styles.periodLabel}>Chu kỳ quỹ đạo</span>
        <span className={styles.periodValue}>
          {Math.round(orbitalPeriodDays).toLocaleString()} ngày
          <span className={styles.periodYears}>
            &nbsp;({(orbitalPeriodDays / 365.25).toFixed(2)} năm)
          </span>
        </span>
      </div>

      {/* ── Speed display ────────────────────────────────────────────── */}
      <div className={styles.speedDisplay}>
        {paused
          ? <span className={styles.pausedLabel}>⏸ Dừng</span>
          : <span className={styles.speedLabel}>{timeScale}× tốc độ</span>
        }
      </div>
    </div>
  );
}
