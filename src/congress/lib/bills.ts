import type { Bill, BillCategory, LegislativeAction } from './types'
import { BILL_GROUP_ORDER } from './types'

const SUPPORT_ACTIONS = new Set(['sponsor', 'cosponsor', 'vote_yea'])

/** Same measure in House and Senate: same Congress, category, and title. */
function billPairKey(b: Bill): string {
  return `${b.congress}\u0000${b.category}\u0000${b.title}`
}

export interface BillListOption {
  /** `pair:hr…|s…` or a single bill id */
  filterValue: string
  label: string
  billIds: string[]
}

export function shortBillTitle(title: string): string {
  return title.replace(/ Act of 20\d{2}$/, '').replace(/ Act$/, '')
}

/** One row per bill or per House–Senate pair (same title/category/congress). */
export function billOptionsByGroup(bills: Bill[]): Map<BillCategory, BillListOption[]> {
  const buckets = new Map<string, { hr?: Bill; s?: Bill }>()
  for (const b of bills) {
    if (b.billType !== 'hr' && b.billType !== 's') continue
    const k = billPairKey(b)
    let bucket = buckets.get(k)
    if (!bucket) {
      bucket = {}
      buckets.set(k, bucket)
    }
    if (b.billType === 'hr') bucket.hr = b
    if (b.billType === 's') bucket.s = b
  }

  const consumed = new Set<string>()
  const byCategory = new Map<BillCategory, BillListOption[]>()
  for (const g of BILL_GROUP_ORDER) byCategory.set(g, [])

  for (const b of bills) {
    if (consumed.has(b.id)) continue
    const bucket = buckets.get(billPairKey(b))
    if (bucket?.hr && bucket?.s) {
      consumed.add(bucket.hr.id)
      consumed.add(bucket.s.id)
      const [a, z] = [bucket.hr, bucket.s].sort((x, y) => x.id.localeCompare(y.id))
      const opt: BillListOption = {
        filterValue: `pair:${a.id}|${z.id}`,
        label: b.title,
        billIds: [a.id, z.id],
      }
      byCategory.get(b.category)?.push(opt)
    } else {
      consumed.add(b.id)
      const opt: BillListOption = {
        filterValue: b.id,
        label: b.title,
        billIds: [b.id],
      }
      byCategory.get(b.category)?.push(opt)
    }
  }

  return byCategory
}

/** Maps each bill id to a shared tag key and label (pairs share one tag). */
export function billTagDisplayById(
  bills: Bill[],
): Map<string, { tagKey: string; label: string; category: BillCategory }> {
  const map = new Map<string, { tagKey: string; label: string; category: BillCategory }>()
  const buckets = new Map<string, { hr?: Bill; s?: Bill }>()
  for (const b of bills) {
    if (b.billType !== 'hr' && b.billType !== 's') continue
    const k = billPairKey(b)
    let bucket = buckets.get(k)
    if (!bucket) {
      bucket = {}
      buckets.set(k, bucket)
    }
    if (b.billType === 'hr') bucket.hr = b
    if (b.billType === 's') bucket.s = b
  }

  const consumed = new Set<string>()
  for (const b of bills) {
    if (consumed.has(b.id)) continue
    const bucket = buckets.get(billPairKey(b))
    if (bucket?.hr && bucket?.s) {
      consumed.add(bucket.hr.id)
      consumed.add(bucket.s.id)
      const [a, z] = [bucket.hr, bucket.s].sort((x, y) => x.id.localeCompare(y.id))
      const tagKey = `pair:${a.id}|${z.id}`
      const label = shortBillTitle(b.title)
      const category = b.category
      map.set(bucket.hr.id, { tagKey, label, category })
      map.set(bucket.s.id, { tagKey, label, category })
    } else {
      consumed.add(b.id)
      const label = shortBillTitle(b.title)
      map.set(b.id, { tagKey: b.id, label, category: b.category })
    }
  }

  return map
}

/** Count distinct bills for sort/filter, with House–Senate pairs counting once. */
export function uniqueSupportedBillCount(supported: Set<string>, bills: Bill[]): number {
  const tagById = billTagDisplayById(bills)
  const seen = new Set<string>()
  for (const id of supported) {
    const d = tagById.get(id)
    if (!d) continue
    seen.add(d.tagKey)
  }
  return seen.size
}

export function supportedBillIds(
  bioguideId: string,
  actions: LegislativeAction[],
): Set<string> {
  const ids = new Set<string>()
  for (const a of actions) {
    if (a.bioguideId !== bioguideId) continue
    if (!SUPPORT_ACTIONS.has(a.action)) continue
    ids.add(a.billId)
  }
  return ids
}

export function billsByGroup(bills: Bill[]): Map<BillCategory, Bill[]> {
  const map = new Map<BillCategory, Bill[]>()
  for (const g of BILL_GROUP_ORDER) map.set(g, [])
  for (const b of bills) {
    if (!map.has(b.category)) continue
    map.get(b.category)!.push(b)
  }
  return map
}

export function memberSupportsBillFilter(
  supported: Set<string>,
  bills: Bill[],
  billFilter: string,
): boolean {
  if (billFilter === 'All') return true
  if (billFilter.startsWith('group:')) {
    const group = billFilter.slice(6) as BillCategory
    return bills.some((b) => b.category === group && supported.has(b.id))
  }
  if (billFilter.startsWith('pair:')) {
    const ids = billFilter.slice(5).split('|')
    return ids.some((id) => supported.has(id))
  }
  return supported.has(billFilter)
}

export function billSupportCount(
  supported: Set<string>,
  bills: Bill[],
  billFilter: string,
): number {
  if (billFilter === 'All') return uniqueSupportedBillCount(supported, bills)
  if (billFilter.startsWith('group:')) {
    const group = billFilter.slice(6) as BillCategory
    return bills.filter((b) => b.category === group && supported.has(b.id)).length
  }
  if (billFilter.startsWith('pair:')) {
    const ids = billFilter.slice(5).split('|')
    return ids.some((id) => supported.has(id)) ? 1 : 0
  }
  return supported.has(billFilter) ? 1 : 0
}
