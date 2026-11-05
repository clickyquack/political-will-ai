import type {
  Bill,
  Evidence,
  LegislativeAction,
  DisplayStance,
  Member,
} from '../lib/types'
import { STANCE_COLORS, STANCE_LABELS, UNCALLED_COLOR } from '../lib/types'
import { stateName } from '../lib/geo'

interface Props {
  member: Member | null
  stance: DisplayStance
  xrisk: boolean
  evidence: Evidence[]
  actions: LegislativeAction[]
  bills: Bill[]
  onClose: () => void
}

const ACTION_LABEL: Record<string, string> = {
  sponsor: 'Sponsor',
  cosponsor: 'Cosponsor',
  vote_yea: 'Voted Yea',
  vote_nay: 'Voted Nay',
  vote_present: 'Voted Present',
}

export function MemberPanel({
  member,
  stance,
  xrisk,
  evidence,
  actions,
  bills,
  onClose,
}: Props) {
  if (!member) return null

  const billById = new Map(bills.map((b) => [b.id, b]))
  const seat =
    member.chamber === 'senate'
      ? `${member.senateRank || ''} senator`.trim()
      : member.district === 0
        ? 'At-large'
        : `District ${member.district}`

  return (
    <aside className="panel" aria-label="Member details">
      <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <header className="panel-header">
        <h2>{member.called === false ? 'Race not called' : member.name}</h2>
        <p className="panel-meta">
          {member.called === false
            ? `${member.chamber === 'senate' ? 'Senate' : 'House'} · ${stateName(member.state)} · ${seat}`
            : `${member.party}-${member.state} · ${member.chamber === 'senate' ? 'Senate' : 'House'} · ${stateName(member.state)} · ${seat}`}
        </p>
        {member.called === false ? (
          <p className="panel-stance">
            <span className="swatch" style={{ background: UNCALLED_COLOR }} />
            This 2026 race has not been called. No member is listed until a winner is projected.
          </p>
        ) : (
          <p className="panel-stance">
            <span
              className={xrisk ? 'swatch xrisk' : 'swatch'}
              style={{ background: STANCE_COLORS[stance] }}
            />
            {STANCE_LABELS[stance]}
            {xrisk ? ' · Existential risk concern' : ''}
          </p>
        )}
      </header>

      {member.called === false ? null : (
        <>
      <section>
        <h3>Evidence</h3>
        {evidence.length === 0 ? (
          <p className="muted">No sourced quotes yet for this member.</p>
        ) : (
          <ul className="evidence-list">
            {evidence.map((e) => (
              <li key={e.id}>
                <blockquote>{e.quote}</blockquote>
                <div className="evidence-meta">
                  <time dateTime={e.date}>{e.date}</time>
                  {' · '}
                  <a href={e.sourceUrl} target="_blank" rel="noreferrer">
                    {e.sourceLabel || 'Source'}
                  </a>
                  {e.notes ? <div className="notes">{e.notes}</div> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Legislative actions</h3>
        {actions.length === 0 ? (
          <p className="muted">No tracked bill actions yet for this member.</p>
        ) : (
          <ul className="actions-list">
            {actions.map((a, i) => {
              const bill = billById.get(a.billId)
              const href = a.sourceUrl || bill?.congressGovUrl
              return (
                <li key={`${a.billId}-${a.action}-${i}`}>
                  <strong>{ACTION_LABEL[a.action] || a.action}</strong>
                  {': '}
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer">
                      {bill?.title || a.billId}
                    </a>
                  ) : (
                    bill?.title || a.billId
                  )}
                  {bill?.category === 'chip_security' || bill?.category === 'international' ? (
                    <span className="tag">tracked — does not move stance</span>
                  ) : null}
                  {a.date ? <span className="muted"> ({a.date})</span> : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>
        </>
      )}
    </aside>
  )
}
