import { Minus, Plus, Contrast, ZoomIn } from 'lucide-react'

const TEXT_SCALES = [100, 125, 150, 200] // percent

/**
 * AccessibilityBar
 * The core control panel for LOW-VISION users (as opposed to no-vision):
 * these users read the screen, just need it bigger/higher-contrast/magnified.
 * All controls are always visible with text labels -- never icon-only.
 */
export default function AccessibilityBar({
  fontScale,
  onFontScaleChange,
  highContrast,
  onToggleContrast,
  zoom,
  onZoomChange,
}) {
  const scaleIndex = TEXT_SCALES.indexOf(fontScale)

  function decreaseText() {
    onFontScaleChange(TEXT_SCALES[Math.max(0, scaleIndex - 1)])
  }
  function increaseText() {
    onFontScaleChange(TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, scaleIndex + 1)])
  }

  return (
    <div
      role="region"
      aria-label="Accessibility controls"
      className="card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-sm) var(--space-md)',
        marginBottom: 'var(--space-md)',
      }}
    >
      {/* Text size */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span className="sr-only">Text size, currently {fontScale}%</span>
        <button
          onClick={decreaseText}
          disabled={scaleIndex === 0}
          aria-label="Decrease text size"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)' }}
        >
          <Minus size={18} color="var(--text-primary)" aria-hidden="true" />
        </button>
        <span aria-hidden="true" style={{ minWidth: '3.5em', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          {fontScale}%
        </span>
        <button
          onClick={increaseText}
          disabled={scaleIndex === TEXT_SCALES.length - 1}
          aria-label="Increase text size"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={18} color="var(--text-primary)" aria-hidden="true" />
        </button>
      </div>

      {/* High contrast toggle */}
      <button
        onClick={() => onToggleContrast(!highContrast)}
        aria-pressed={highContrast}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 var(--space-sm)',
          border: `2px solid ${highContrast ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--surface-raised)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Contrast size={18} aria-hidden="true" />
        High contrast: {highContrast ? 'On' : 'Off'}
      </button>

      {/* Camera magnifier */}
      <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <ZoomIn size={18} aria-hidden="true" />
        <span>Magnify: {zoom.toFixed(1)}×</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          aria-label="Camera magnification level"
          style={{ accentColor: 'var(--accent)' }}
        />
      </label>
    </div>
  )
}