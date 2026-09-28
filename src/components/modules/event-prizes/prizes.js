// Prize distribution stored in event_data.prizes:
//   [{ label: string, percent: number|null, product: string }]
// An empty label means "Nth place" by position. Older events only have
// event_data.prize_split (percent per place), which is read as a fallback.

export function normalizePrizes(eventData) {
  const data = eventData || {}
  if (Array.isArray(data.prizes)) {
    return data.prizes.map((p) => ({
      label: p?.label || '',
      percent: p?.percent === '' || p?.percent == null ? null : Number(p.percent),
      product: p?.product || '',
    }))
  }
  if (Array.isArray(data.prize_split)) {
    return data.prize_split.map((p) => ({ label: '', percent: Number(p) || 0, product: '' }))
  }
  return []
}

// Rows with nothing to award are dropped before saving.
export function cleanPrizes(prizes) {
  return (prizes || [])
    .map((p) => ({
      label: String(p.label || '').trim(),
      percent: p.percent === '' || p.percent == null || Number.isNaN(Number(p.percent)) ? null : Number(p.percent),
      product: String(p.product || '').trim(),
    }))
    .filter((p) => p.percent || p.product || p.label)
}

// Legacy percent list kept in sync for older readers.
export function prizeSplit(prizes) {
  return (prizes || []).map((p) => Number(p.percent) || 0)
}

export function percentSum(prizes) {
  return (prizes || []).reduce((s, p) => s + (Number(p.percent) || 0), 0)
}
