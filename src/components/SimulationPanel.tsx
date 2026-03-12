import { useSimulation } from '../simulation/SimulationContext';
import { STATE_EMOJI, STATE_LABEL, STATE_COLOR, SPECTRAL_LABEL, SPECTRAL_COLOR } from '../simulation/physics';
import styles from './SimulationPanel.module.css';

export function SimulationPanel() {
  const {
    sunMassSolar,
    earthOrbitAU,
    luminosity,
    earthTempK,
    habitableZone,
    planetState,
    orbitalPeriodDays,
    spectralClass,
    setSunMass,
    setEarthOrbit,
  } = useSimulation();

  const tempC = Math.round(earthTempK - 273.15);
  const tempK = Math.round(earthTempK);

  // Is Earth inside the habitable zone?
  const inHZ =
    earthOrbitAU >= habitableZone.inner && earthOrbitAU <= habitableZone.outer;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <span className={styles.titleIcon}>🔭</span>
        Universe Sandbox
      </h3>

      {/* ── Sun Mass ───────────────────────────────────────────────────────── */}
      <div className={styles.control}>
        <div className={styles.controlHeader}>
          <label className={styles.controlLabel}>☀️ Khối lượng Mặt Trời</label>
          <span className={styles.controlValue}>{sunMassSolar.toFixed(2)} M☉</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.05}
          value={sunMassSolar}
          onChange={(e) => setSunMass(+e.target.value)}
          className={styles.slider}
        />
        <div className={styles.controlFooter}>
          Độ sáng: <strong>{luminosity.toFixed(2)} L☉</strong>
        </div>
      </div>

      {/* ── Spectral Class badge ────────────────────────────────────────────── */}
      <div
        className={styles.spectralCard}
        style={{ borderColor: SPECTRAL_COLOR[spectralClass] + '88' }}
      >
        <span
          className={styles.spectralDot}
          style={{ background: SPECTRAL_COLOR[spectralClass] }}
        />
        <div className={styles.spectralInfo}>
          <span className={styles.spectralLabel} style={{ color: SPECTRAL_COLOR[spectralClass] }}>
            Lớp {spectralClass}
          </span>
          <span className={styles.spectralDesc}>{SPECTRAL_LABEL[spectralClass]}</span>
        </div>
      </div>

      {/* ── Earth Distance ─────────────────────────────────────────────────── */}
      <div className={styles.control}>
        <div className={styles.controlHeader}>
          <label className={styles.controlLabel}>🌍 Khoảng cách Trái Đất</label>
          <span className={styles.controlValue}>{earthOrbitAU.toFixed(2)} AU</span>
        </div>
        <input
          type="range"
          min={0.3}
          max={3}
          step={0.05}
          value={earthOrbitAU}
          onChange={(e) => setEarthOrbit(+e.target.value)}
          className={styles.slider}
        />
        <div className={styles.controlFooter}>
          {inHZ
            ? '✅ Trong vùng sống được'
            : earthOrbitAU < habitableZone.inner
              ? '🔴 Quá gần sao'
              : '🔵 Quá xa sao'}
          &nbsp;·&nbsp;
          Chu kỳ: <strong>{Math.round(orbitalPeriodDays)} ngày</strong>
        </div>
      </div>

      {/* ── Temperature Card ───────────────────────────────────────────────── */}
      <div
        className={styles.tempCard}
        style={{ borderColor: STATE_COLOR[planetState] }}
      >
        <span className={styles.tempEmoji}>{STATE_EMOJI[planetState]}</span>
        <div className={styles.tempInfo}>
          <span
            className={styles.tempState}
            style={{ color: STATE_COLOR[planetState] }}
          >
            {STATE_LABEL[planetState]}
          </span>
          <span className={styles.tempValue}>
            {tempK} K &nbsp;/&nbsp; {tempC}°C
          </span>
        </div>
      </div>

      {/* ── Habitable Zone Visualiser ──────────────────────────────────────── */}
      <div className={styles.hz}>
        <div className={styles.hzHeader}>
          <span>🟢 Vùng sống được</span>
          <span className={styles.hzRange}>
            {habitableZone.inner.toFixed(2)} – {habitableZone.outer.toFixed(2)} AU
          </span>
        </div>

        {/* Bar (0 → 3 AU scale) */}
        <div className={styles.hzBarWrap}>
          {/* Green HZ band */}
          <div
            className={styles.hzBand}
            style={{
              left:  `${(habitableZone.inner / 3) * 100}%`,
              width: `${((habitableZone.outer - habitableZone.inner) / 3) * 100}%`,
            }}
          />
          {/* Earth marker */}
          <div
            className={styles.earthMarker}
            style={{ left: `${Math.min((earthOrbitAU / 3) * 100, 100)}%` }}
          >
            <span className={styles.earthDot} />
          </div>
        </div>

        <div className={styles.hzTicks}>
          <span>0</span>
          <span>1 AU</span>
          <span>2 AU</span>
          <span>3 AU</span>
        </div>
      </div>

      {/* ── Hint ───────────────────────────────────────────────────────────── */}
      <p className={styles.hint}>
        Kéo slider để thay đổi khối lượng sao hoặc khoảng cách quỹ đạo.
        Dùng thanh điều khiển thời gian ở dưới cùng để tạm dừng hoặc tăng tốc.
      </p>
    </div>
  );
}
