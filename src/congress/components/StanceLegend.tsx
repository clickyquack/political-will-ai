import type { DisplayStance } from '../lib/types'
import { DISPLAY_STANCE_ORDER, STANCE_COLORS, STANCE_LABELS, UNCALLED_COLOR } from '../lib/types'

export function StanceLegend() {
  return (
    <ul className="legend">
      {DISPLAY_STANCE_ORDER.map((s: DisplayStance) => (
        <li key={s}>
          <span className="swatch" style={{ background: STANCE_COLORS[s] }} />
          <span>{STANCE_LABELS[s]}</span>
        </li>
      ))}
      <li>
        <span className="swatch xrisk" style={{ background: '#d7ddd8' }} />
        <span>Existential risk concern</span>
      </li>
      <li>
        <span className="swatch" style={{ background: UNCALLED_COLOR }} />
        <span>Race not called</span>
      </li>
    </ul>
  )
}
