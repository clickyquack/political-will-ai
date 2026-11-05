import type { Bill, Classification, DisplayStance, Evidence, LegislativeAction, Stance } from './types'
import { DISPLAY_STANCE_ORDER } from './types'

const RANK: Record<DisplayStance, number> = {
  strong_risk_reg: 4,
  opposes_domestic: 3,
  mundane_risk: 2,
  unknown: 1,
}

function stanceFromAction(
  action: LegislativeAction,
  bill: Bill | undefined,
): Stance | null {
  if (!bill || bill.category === 'other' || bill.category === 'chip_security' || bill.category === 'international') {
    return null
  }
  if (action.action === 'vote_nay') {
    if (bill.category === 'strong_risk' || bill.category === 'ethics') {
      return 'opposes_domestic'
    }
    return null
  }
  if (
    action.action === 'sponsor' ||
    action.action === 'cosponsor' ||
    action.action === 'vote_yea'
  ) {
    if (bill.supportStance) return bill.supportStance
    if (bill.category === 'strong_risk') return 'strong_risk_reg'
    if (bill.category === 'ethics') return 'mundane_risk'
  }
  return null
}

function applySignal(
  state: Classification,
  implied: Stance,
  /** Sponsoring or voting for a bill coded as x-risk is also support for stronger-risk regulation. */
  promoteBan: boolean,
) {
  if (implied === 'unknown') return
  if (implied === 'xrisk_concern') {
    state.xrisk = true
    if (promoteBan && RANK.strong_risk_reg > RANK[state.stance]) state.stance = 'strong_risk_reg'
    return
  }
  if (RANK[implied] > RANK[state.stance]) state.stance = implied
}

/**
 * Existential-risk concern is stripes plus, by default, support for stronger-risk regulation.
 * A sourced reason they would not support that regulation, such as prioritizing a race with China,
 * stays on top of the default. Sponsoring an x-risk bill still counts as stronger-risk support.
 */
function applyXriskDefault(state: Classification) {
  if (!state.xrisk || state.stance === 'opposes_domestic') return
  if (RANK.strong_risk_reg > RANK[state.stance]) state.stance = 'strong_risk_reg'
}

/** Regulation color follows sourced signals. Existential-risk concern is also recorded as `xrisk`. */
export function classifyMember(
  bioguideId: string,
  evidence: Evidence[],
  actions: LegislativeAction[],
  bills: Bill[],
): Classification {
  const billById = new Map(bills.map((b) => [b.id, b]))
  const state: Classification = { stance: 'unknown', xrisk: false }

  for (const e of evidence) {
    if (e.bioguideId !== bioguideId) continue
    applySignal(state, e.stanceImplied, false)
  }

  for (const a of actions) {
    if (a.bioguideId !== bioguideId) continue
    const implied = stanceFromAction(a, billById.get(a.billId))
    if (!implied) continue
    applySignal(state, implied, implied === 'xrisk_concern')
  }

  applyXriskDefault(state)
  return state
}

export function classifyAll(
  memberIds: string[],
  evidence: Evidence[],
  actions: LegislativeAction[],
  bills: Bill[],
): Map<string, Classification> {
  const map = new Map<string, Classification>()
  for (const id of memberIds) {
    map.set(id, classifyMember(id, evidence, actions, bills))
  }
  return map
}

export function stanceRank(s: DisplayStance): number {
  return DISPLAY_STANCE_ORDER.indexOf(s)
}
