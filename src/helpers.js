// ── Formatting ────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0')

export const fmtTimer = (s) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`

export const fmtDur = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}

export const fmtDate = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

export const fmtShort = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: '2-digit',
  })

// Epley 1-Rep Max estimate
export const e1RM = (w, r) => (w > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0)

// ── Stats ─────────────────────────────────────────────────────

/** Consecutive sessions with no gap > 5 days */
export const calcStreak = (history) => {
  if (!history.length) return 0
  const dates = [...new Set(history.map((h) => h.date))].sort().reverse()
  let streak = 0
  let prev = new Date()
  prev.setHours(12, 0, 0, 0)
  for (const d of dates) {
    const dt = new Date(d + 'T12:00:00')
    const gap = (prev - dt) / 86_400_000
    if (gap <= 5) { streak++; prev = dt } else break
  }
  return streak
}

/** Workouts logged since Monday of the current week */
export const thisWeekCount = (history) => {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  mon.setHours(0, 0, 0, 0)
  return history.filter((h) => new Date(h.date + 'T12:00:00') >= mon).length
}

// ── Workout helpers ───────────────────────────────────────────

/** Returns the set array from the most recent session that included this exercise */
export const getPrev = (history, exerciseName) => {
  for (const entry of [...history].sort((a, b) => b.date.localeCompare(a.date))) {
    const ex = entry.exercises.find((e) => e.name === exerciseName)
    if (ex) return ex.sets
  }
  return null
}

/**
 * Progressive overload suggestion.
 * If every set in the last session hit targetReps → recommend +2.5 kg (upper body) or +5 kg (lower).
 * Otherwise hold the same weight.
 * Returns { weight, progressed } or null for bodyweight exercises.
 */
export const suggestWeight = (history, exerciseName, targetReps, muscleGroup) => {
  const lastEntry = [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((e) => e.exercises.some((ex) => ex.name === exerciseName))
  if (!lastEntry) return null

  const lastEx = lastEntry.exercises.find((e) => e.name === exerciseName)
  if (!lastEx || !lastEx.sets.length) return null

  const weights = lastEx.sets.map((s) => s.w || 0).filter((w) => w > 0)
  if (!weights.length) return null // bodyweight — no suggestion

  const lastWeight = Math.max(...weights)
  const allHit = lastEx.sets.every((s) => s.r >= targetReps)
  const isLower = /quad|glute|posterior|hamstring|leg press|lower back/i.test(muscleGroup || '')
  const inc = isLower ? 5 : 2.5

  return { weight: allHit ? lastWeight + inc : lastWeight, progressed: allHit }
}

// ── Chart data ────────────────────────────────────────────────

/** Volume (kg × reps) grouped by primary muscle group, last 7 days */
export const getWeeklyVolume = (history) => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  cutoff.setHours(0, 0, 0, 0)

  const vols = {}
  history
    .filter((h) => new Date(h.date + 'T12:00:00') >= cutoff)
    .forEach((entry) => {
      entry.exercises.forEach((ex) => {
        const mg = ex.muscleGroup.split(' / ')[0].trim()
        const vol = ex.sets.reduce((sum, s) => sum + (s.w || 0) * (s.r || 1), 0)
        vols[mg] = (vols[mg] || 0) + vol
      })
    })

  return Object.entries(vols)
    .map(([mg, vol]) => ({ mg, vol: Math.round(vol) }))
    .sort((a, b) => b.vol - a.vol)
}

/** Max weight per session for a given exercise, sorted chronologically */
export const getSparkline = (history, exerciseName) =>
  [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((entry) => {
      const ex = entry.exercises.find((e) => e.name === exerciseName)
      if (!ex) return []
      const maxW = Math.max(...ex.sets.map((s) => s.w || 0))
      return maxW > 0 ? [{ date: entry.date.slice(5), weight: maxW }] : []
    })

// ── Colour map ────────────────────────────────────────────────
const MG_COLORS = {
  'Posterior Chain': '#3b82f6',
  'Quads':           '#a855f7',
  'Chest':           '#f97316',
  'Back':            '#22c55e',
  'Shoulders':       '#eab308',
  'Full Body':       '#06b6d4',
  'Upper Body':      '#f472b6',
  'Lower Back':      '#a16207',
  'Cardio':          '#64748b',
}

export const mgColor = (mg) => MG_COLORS[mg] || '#3b82f6'
