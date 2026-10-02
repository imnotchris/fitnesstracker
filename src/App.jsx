import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, ResponsiveContainer,
} from 'recharts'

import { C, FONT, PLANS, WARMUP_ACTIVATION, WARMUP_SETS_NOTE, MOBILITY_MOVES, CARDIO_SESSIONS, EXTRA, INIT_PRS, INIT_HISTORY, BREAKFAST, LUNCH, DINNERS, DINNER_BY_DAY, DAILY_TARGETS } from './data.js'
import {
  fmtTimer, fmtDur, fmtDate, fmtShort,
  e1RM, calcStreak, thisWeekCount,
  getPrev, suggestWeight, getWeeklyVolume, getSparkline, mgColor,
} from './helpers.js'
import Section  from './components/Section.jsx'
import CheckRow from './components/CheckRow.jsx'

/* ── App shell ───────────────────────────────────────────────── */
export default function App() {
  const [screen,        setScreen]        = useState('dashboard')
  const [history,       setHistory]       = useState(() => {
    try { const s = localStorage.getItem('ft_history'); return s ? JSON.parse(s) : INIT_HISTORY } catch { return INIT_HISTORY }
  })
  const [prs,           setPrs]           = useState(() => {
    try { const s = localStorage.getItem('ft_prs'); return s ? JSON.parse(s) : INIT_PRS } catch { return INIT_PRS }
  })
  const [aw,            setAw]            = useState(null)     // active workout
  const [elapsed,       setElapsed]       = useState(0)
  const [warmupOpt,     setWarmupOpt]     = useState('bike')  // selected activation option
  const [mobDone,       setMobDone]       = useState([])      // bool[] for mobility moves
  const [openMob,       setOpenMob]       = useState({})      // { [i]: bool } expanded state
  const [dayDetail,     setDayDetail]     = useState(null)    // key for day detail view
  const [showPicker,    setShowPicker]    = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(null)     // id pending delete
  const [confirmDiscard, setConfirmDiscard] = useState(false)   // discard active workout
  const [historyTab,     setHistoryTab]     = useState('log')   // 'log' | 'pbs'
  const [restTimer,      setRestTimer]      = useState(null)    // { endsAt, total } | null
  const [openCues,       setOpenCues]       = useState({})      // { [ei]: bool }
  const [customForm,   setCustomForm]    = useState(null)     // null | { name, exercises[] }
  const [customExInp,  setCustomExInp]   = useState({ name: '', mg: '', sets: 3, reps: 8, weight: 0 })
  const [freeExInp,    setFreeExInp]     = useState({ name: '', mg: '' })
  const [mealsLogged,  setMealsLogged]   = useState(() => {
    try {
      const s = localStorage.getItem('ft_meals')
      if (s) { const p = JSON.parse(s); if (p.date === new Date().toISOString().slice(0, 10)) return p.meals }
    } catch {}
    return { breakfast: false, lunch: false, dinner: false }
  })
  const timerRef    = useRef(null)
  const restRef     = useRef(null)
  const [restTick,  setRestTick] = useState(0)   // forces re-render for countdown

  /* ── elapsed workout timer ── */
  useEffect(() => {
    if (aw) {
      timerRef.current = setInterval(
        () => setElapsed(Math.floor((Date.now() - aw.startTime) / 1000)),
        1000,
      )
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [aw?.startTime])

  /* ── rest countdown ticker ── */
  useEffect(() => {
    restRef.current = setInterval(() => setRestTick((t) => t + 1), 1000)
    return () => clearInterval(restRef.current)
  }, [])

  /* ── persistence ── */
  useEffect(() => { localStorage.setItem('ft_history', JSON.stringify(history)) }, [history])
  useEffect(() => { localStorage.setItem('ft_prs',     JSON.stringify(prs))     }, [prs])
  useEffect(() => {
    localStorage.setItem('ft_meals', JSON.stringify({
      date:  new Date().toISOString().slice(0, 10),
      meals: mealsLogged,
    }))
  }, [mealsLogged])

  /* ── workout actions ── */
  const startWorkout = (plan) => {
    setAw({
      planId:      plan.id,
      planName:    `${plan.name} — ${plan.subtitle}`,
      planColor:   plan.color,
      warmupNote:  plan.warmupNote || null,
      startTime:   Date.now(),
      exercises: plan.exercises.map((ex) => ({
        name:         ex.name,
        muscleGroup:  ex.muscleGroup,
        note:         ex.note || null,
        targetReps:   ex.reps,
        repsMin:      ex.repsMin ?? null,
        inc:          ex.inc ?? null,
        effort:       ex.effort || null,
        effortNote:   ex.effortNote || null,
        restSec:      ex.restSec || 90,
        warmupSets:   ex.warmupSets || null,
        instructions: ex.instructions || null,
        sets: Array.from({ length: ex.sets }, () => ({
          weight:    ex.weight > 0 ? String(ex.weight) : '',
          reps:      ex.repsMin ? String(ex.repsMin) : ex.reps ? String(ex.reps) : '',
          completed: false,
        })),
      })),
    })
    setWarmupOpt('bike')
    setMobDone(Array(MOBILITY_MOVES.length).fill(false))
    setOpenMob({ 0: true })   // first mobility move open by default
    setElapsed(0)
    setScreen('workout')
  }

  const updateSet = (ei, si, field, val) =>
    setAw((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : {
          ...ex,
          sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }),
        },
      ),
    }))

  const toggleComplete = (ei, si) => {
    setAw((prev) => {
      const ex  = prev.exercises[ei]
      const set = ex.sets[si]
      // start rest timer only when marking complete (not uncomplete)
      if (!set.completed && ex.restSec) {
        setRestTimer({ endsAt: Date.now() + ex.restSec * 1000, total: ex.restSec })
      }
      return {
        ...prev,
        exercises: prev.exercises.map((e, i) =>
          i !== ei ? e : {
            ...e,
            sets: e.sets.map((s, j) => j !== si ? s : { ...s, completed: !s.completed }),
          },
        ),
      }
    })
  }

  const addSet = (ei) =>
    setAw((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => {
        if (i !== ei) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { weight: last?.weight || '0', reps: last?.reps || '8', completed: false }],
        }
      }),
    }))

  const addExercise = (ex) => {
    setAw((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: ex.name, muscleGroup: ex.muscleGroup, note: null, targetReps: 8,
          sets: [{ weight: '0', reps: '8', completed: false }] },
      ],
    }))
    setShowPicker(false)
  }

  const finishWorkout = () => {
    if (!aw) return
    const newPrs = { ...prs }
    const today  = new Date().toISOString().slice(0, 10)
    const entry  = {
      id:       `h${Date.now()}`,
      planId:   aw.planId,
      planName: aw.planName,
      date:     today,
      duration: elapsed,
      exercises: aw.exercises.map((ex) => ({
        name:        ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.filter((s) => s.completed).map((s) => {
          const w   = parseFloat(s.weight) || 0
          const r   = parseInt(s.reps)     || 0
          const pr  = newPrs[ex.name]
          const isPR = e1RM(w, r) > (pr ? e1RM(pr.weight, pr.reps) : 0)
          if (isPR) newPrs[ex.name] = { weight: w, reps: r, date: today }
          return { w, r, isPR }
        }),
      })).filter((ex) => ex.sets.length > 0),
    }
    setPrs(newPrs)
    setHistory((prev) => [entry, ...prev])
    setAw(null)
    setElapsed(0)
    setRestTimer(null)
    setOpenCues({})
    setMobDone([])
    setScreen('history')
  }

  const discard = () => { setAw(null); setElapsed(0); setRestTimer(null); setOpenCues({}); setMobDone([]); setConfirmDiscard(false); setScreen('dashboard') }

  const addCustomExercise = () => {
    if (!customExInp.name.trim()) return
    setCustomForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, {
        name:        customExInp.name.trim(),
        muscleGroup: customExInp.mg.trim() || 'Other',
        sets:        Number(customExInp.sets) || 3,
        reps:        Number(customExInp.reps) || 8,
        weight:      Number(customExInp.weight) || 0,
      }],
    }))
    setCustomExInp({ name: '', mg: '', sets: 3, reps: 8, weight: 0 })
  }

  const startCustomWorkout = () => {
    if (!customForm?.name?.trim() || !customForm.exercises.length) return
    startWorkout({
      id:        `custom_${Date.now()}`,
      name:      customForm.name.trim(),
      subtitle:  'Custom',
      day:       new Date().toLocaleDateString('en-AU', { weekday: 'short' }),
      color:     C.orange,
      exercises: customForm.exercises,
    })
    setCustomForm(null)
  }

  const addFreeExercise = () => {
    if (!freeExInp.name.trim()) return
    addExercise({ name: freeExInp.name.trim(), muscleGroup: freeExInp.mg.trim() || 'Other' })
    setFreeExInp({ name: '', mg: '' })
  }

  const deleteWorkout = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id))
    setConfirmDelete(null)
  }

  /* ══════════════════════════════════════════════════════════
     DASHBOARD
  ══════════════════════════════════════════════════════════ */
  const renderDashboard = () => {
    const streak    = calcStreak(history)
    const weekCount = thisWeekCount(history)
    const topPRs    = Object.entries(prs)
      .filter(([, v]) => v.weight > 0)
      .sort(([, a], [, b]) => e1RM(b.weight, b.reps) - e1RM(a.weight, a.reps))
      .slice(0, 3)

    return (
      <div>
        {/* Goal banner */}
        <div style={{ background: 'linear-gradient(135deg,#0f1729 0%,#0a0b0f 100%)', borderBottom: `1px solid ${C.border}`, padding: '20px 16px 16px' }}>
          <div style={{ color: C.sub, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            12-Month Body Recomposition
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                95<span style={{ fontSize: 16 }}>kg</span>
              </div>
              <div style={{ fontSize: 10, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' }}>Now</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ height: 2, width: '100%', background: `linear-gradient(90deg,${C.blue},${C.green})`, borderRadius: 2 }} />
              <div style={{ fontSize: 10, color: C.sub, letterSpacing: 1 }}>APR 2026 → APR 2027</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.green, lineHeight: 1 }}>
                87<span style={{ fontSize: 16 }}>kg</span>
              </div>
              <div style={{ fontSize: 10, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' }}>Goal</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 16px 24px' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Streak',    value: streak,          unit: 'sessions' },
              { label: 'This Week', value: weekCount,        unit: 'workouts' },
              { label: 'Total',     value: history.length,   unit: 'sessions' },
            ].map((s) => (
              <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.blue, lineHeight: 1, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' }}>{s.unit}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick launch */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Weekly Schedule
            </div>
            {(() => {
              const todayShort = new Date().toLocaleDateString('en-AU', { weekday: 'short' })
              const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
              const DAY_KEYS = { Tue: 'cardio-zone2', Thu: 'rest', Sat: 'cardio-hiit', Sun: 'cardio-mod' }
              const DAY_LABELS = { Tue: '🚶 Zone 2 Cardio', Thu: '😴 Rest', Sat: '🏃 HIIT / Sprint', Sun: '🚴 Moderate Cardio' }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ALL_DAYS.map((day) => {
                    const plan    = PLANS.find((p) => p.day === day)
                    const isToday = day === todayShort
                    if (plan) {
                      return (
                        <button key={day} onClick={() => setDayDetail({ type: 'lift', plan })}
                          style={{ background: isToday ? '#0a1525' : C.card, border: `1px solid ${isToday ? plan.color : C.border}`, borderLeft: `3px solid ${plan.color}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.card2)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isToday ? '#0a1525' : C.card)}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <div style={{ fontSize: 19, fontWeight: 800, color: isToday ? plan.color : C.text, lineHeight: 1 }}>
                                {plan.name} <span style={{ color: plan.color }}>·</span> {plan.subtitle}
                              </div>
                              {isToday && <span style={{ fontSize: 10, color: plan.color, background: `${plan.color}22`, border: `1px solid ${plan.color}55`, padding: '1px 7px', borderRadius: 4, fontWeight: 800, letterSpacing: 1 }}>TODAY</span>}
                            </div>
                            <div style={{ fontSize: 12, color: C.sub }}>
                              {day} · {plan.exercises.length} exercises · {plan.exercises.reduce((s, e) => s + e.sets, 0)} sets
                            </div>
                          </div>
                          <div style={{ color: plan.color, fontSize: 20, fontWeight: 900 }}>▶</div>
                        </button>
                      )
                    }
                    const key   = DAY_KEYS[day]
                    const label = DAY_LABELS[day]
                    const accent = day === 'Thu' ? C.dim : '#06b6d4'
                    return (
                      <button key={day} onClick={() => setDayDetail({ type: key })}
                        style={{ background: isToday ? '#0a1520' : C.card, border: `1px solid ${isToday ? accent : C.border}`, borderLeft: `3px solid ${isToday ? accent : C.dim}`, borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.card2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isToday ? '#0a1520' : C.card)}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? accent : C.sub }}>{label}</div>
                            {isToday && <span style={{ fontSize: 10, color: accent, background: '#0c2a30', border: `1px solid ${accent}55`, padding: '1px 7px', borderRadius: 4, fontWeight: 800, letterSpacing: 1 }}>TODAY</span>}
                          </div>
                          <div style={{ fontSize: 12, color: C.dim }}>{day}</div>
                        </div>
                        <div style={{ color: C.dim, fontSize: 16 }}>›</div>
                      </button>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* Top PRs */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Top Personal Records
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topPRs.map(([name, pr], idx) => (
                <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, width: 24, color: idx === 0 ? '#eab308' : idx === 1 ? C.sub : '#cd7f32' }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{name}</div>
                      <div style={{ fontSize: 12, color: C.sub }}>{fmtShort(pr.date)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.blue }}>{pr.weight > 0 ? `${pr.weight}kg` : 'BW'}</div>
                    <div style={{ fontSize: 12, color: C.sub }}>{pr.reps} reps</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     DAY DETAIL
  ══════════════════════════════════════════════════════════ */
  const renderDayDetail = () => {
    if (!dayDetail) return null
    const { type, plan } = dayDetail
    const EFFORT_CFG = {
      '1short':      { label: '1 SHORT',      color: '#f59e0b', bg: '#3f2a05' },
      'failure':     { label: 'TO FAILURE',   color: '#ef4444', bg: '#3f0f0f' },
      'pastfailure': { label: 'PAST FAILURE', color: '#a855f7', bg: '#2d1554' },
    }

    const todayShort = new Date().toLocaleDateString('en-AU', { weekday: 'short' })

    return (
      <div style={{ paddingBottom: 80 }}>
        {/* Back header */}
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setDayDetail(null)}
            style={{ background: 'none', border: 'none', color: C.blue, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, padding: '4px 0' }}>
            ← Back
          </button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.text, textAlign: 'center' }}>
            {type === 'lift' ? `${plan.name} — ${plan.subtitle}` : type === 'rest' ? 'Rest Day' : CARDIO_SESSIONS[type]?.label}
          </div>
          <div style={{ width: 48 }} />
        </div>

        <div style={{ padding: '16px' }}>
          {/* LIFT day */}
          {type === 'lift' && (() => {
            const isToday = plan.day === todayShort
            return (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                    {plan.day}{isToday ? <span style={{ color: plan.color }}> · TODAY</span> : ''}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: plan.color, marginBottom: 2 }}>🏋️ {plan.name} — {plan.subtitle}</div>
                  <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>
                    {plan.exercises.length} exercises · ~{plan.duration} min · {plan.exercises.reduce((s, e) => s + e.sets, 0)} working sets
                  </div>
                  <button onClick={() => { setDayDetail(null); startWorkout(plan) }}
                    disabled={!isToday}
                    style={{ width: '100%', background: isToday ? plan.color : C.card2, color: isToday ? '#000' : C.dim, border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 800, cursor: isToday ? 'pointer' : 'default', fontFamily: FONT, letterSpacing: 0.3, marginBottom: isToday ? 0 : 4 }}>
                    {isToday ? '▶ START WORKOUT' : '✓ Completed or Upcoming'}
                  </button>
                  {!isToday && <div style={{ fontSize: 11, color: C.dim, textAlign: 'center', paddingTop: 4 }}>Only available on {plan.day}</div>}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Exercises</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  {plan.exercises.map((ex, i) => {
                    const ec = ex.effort ? EFFORT_CFG[ex.effort] : null
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: i < plan.exercises.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ec ? ec.color : C.dim, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ex.name}</div>
                          <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>
                            {ex.sets}×{ex.repsMin ? `${ex.repsMin}–${ex.reps}` : ex.reps ?? 'max'} · {ex.weight > 0 ? `${ex.weight}kg` : 'BW'} · {ex.muscleGroup}
                          </div>
                        </div>
                        {ec && (
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', color: ec.color, background: ec.bg, border: `1px solid ${ec.color}44`, flexShrink: 0 }}>
                            {ec.label}{ex.effortNote ? ` (${ex.effortNote})` : ''}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}

          {/* REST day */}
          {type === 'rest' && (
            <>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.sub, marginBottom: 4 }}>😴 Rest Day</div>
              <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>Recovery · Let adaptations happen</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, marginBottom: 12 }}>Recovery Protocols (Huberman p.181)</div>
                {[
                  'Real gains happen in the 2–4 days after training, mostly during sleep — protect tonight\'s sleep',
                  'Walk 7,000+ steps today — low-intensity movement accelerates recovery without adding fatigue',
                  'Hit your protein target (168g) even on rest days — amino acids are building your muscles right now',
                  'If feeling tight or sore: do the 10-min Huberman mobility protocol (hip flexors + Founder pose)',
                  'If sleep has been poor (2+ nights): prioritise rest over any extra training this week',
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sub, padding: '7px 0 7px 14px', position: 'relative', lineHeight: 1.6, borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ position: 'absolute', left: 2, color: C.dim }}>·</span>{tip}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CARDIO day */}
          {type !== 'lift' && type !== 'rest' && (() => {
            const session = CARDIO_SESSIONS[type]
            if (!session) return null
            return (
              <>
                <div style={{ fontSize: 22, fontWeight: 900, color: session.color, marginBottom: 4 }}>
                  {session.icon} {session.label}
                </div>
                <div style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>{session.day} · {session.meta}</div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: session.color, marginBottom: 12 }}>Session Details (Huberman Protocol 3)</div>
                  {session.details.map((d, i) => (
                    <div key={i} style={{ fontSize: 13, color: C.sub, padding: '7px 0 7px 14px', position: 'relative', lineHeight: 1.6, borderBottom: i < session.details.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ position: 'absolute', left: 2, color: C.dim }}>·</span>{d}
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     WORKOUT
  ══════════════════════════════════════════════════════════ */
  const renderWorkout = () => {
    if (!aw) {
      return (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 6 }}>Start a Workout</div>
          <div style={{ fontSize: 14, color: C.sub, marginBottom: 20 }}>
            Tap a session to begin. Weights are auto-suggested for progressive overload.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => startWorkout(plan)}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${plan.color}`, borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.card2)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.card)}
              >
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{plan.name} — {plan.subtitle}</div>
                  <div style={{ fontSize: 13, color: C.sub }}>{plan.day} · {plan.exercises.length} exercises</div>
                </div>
                <span style={{ color: plan.color, fontSize: 22 }}>▶</span>
              </button>
            ))}
          </div>

          {/* Custom workout */}
          {!customForm ? (
            <button
              onClick={() => setCustomForm({ name: '', exercises: [] })}
              style={{ marginTop: 12, width: '100%', background: 'none', border: `1px dashed ${C.orange}`, borderRadius: 10, color: C.orange, padding: '13px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, letterSpacing: 1 }}>
              + CUSTOM WORKOUT
            </button>
          ) : (
            <div style={{ marginTop: 12, background: C.card, border: `1px solid ${C.orange}`, borderRadius: 12, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.orange }}>Custom Workout</div>
                <button onClick={() => setCustomForm(null)} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>

              <div style={{ padding: '14px' }}>
                {/* Workout name */}
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Workout Name</div>
                <input
                  placeholder="e.g. Push Day, Legs, Hyrox Prep…"
                  value={customForm.name}
                  onChange={(e) => setCustomForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: FONT, padding: '9px 12px', marginBottom: 16, boxSizing: 'border-box' }}
                />

                {/* Exercise builder */}
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Add Exercise</div>
                <input
                  placeholder="Exercise name"
                  value={customExInp.name}
                  onChange={(e) => setCustomExInp((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomExercise()}
                  style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, fontFamily: FONT, padding: '8px 10px', marginBottom: 6, boxSizing: 'border-box' }}
                />
                <input
                  list="mg-options"
                  placeholder="Muscle group (optional)"
                  value={customExInp.mg}
                  onChange={(e) => setCustomExInp((p) => ({ ...p, mg: e.target.value }))}
                  style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, fontFamily: FONT, padding: '8px 10px', marginBottom: 6, boxSizing: 'border-box' }}
                />
                <datalist id="mg-options">
                  {['Quads / Glutes','Hamstrings / Glutes','Posterior Chain','Back / Biceps','Chest / Triceps','Shoulders / Triceps','Core','Full Body','Cardio'].map((g) => <option key={g} value={g} />)}
                </datalist>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6, marginBottom: 10 }}>
                  {[['Sets', 'sets'], ['Reps', 'reps'], ['kg', 'weight']].map(([label, field]) => (
                    <div key={field}>
                      <div style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1, textAlign: 'center', marginBottom: 3 }}>{label}</div>
                      <input
                        type="number"
                        value={customExInp[field]}
                        onChange={(e) => setCustomExInp((p) => ({ ...p, [field]: e.target.value }))}
                        style={{ width: '100%', background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 15, fontWeight: 700, fontFamily: FONT, padding: '7px 4px', textAlign: 'center', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={addCustomExercise}
                      style={{ background: C.blue, border: 'none', borderRadius: 8, color: '#fff', padding: '7px 12px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', height: 36 }}>
                      + ADD
                    </button>
                  </div>
                </div>

                {/* Exercise list */}
                {customForm.exercises.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {customForm.exercises.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ex.name}</div>
                          <div style={{ fontSize: 11, color: C.sub }}>{ex.muscleGroup} · {ex.sets}×{ex.reps} @ {ex.weight}kg</div>
                        </div>
                        <button
                          onClick={() => setCustomForm((p) => ({ ...p, exercises: p.exercises.filter((_, j) => j !== i) }))}
                          style={{ background: 'none', border: 'none', color: C.dim, fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={startCustomWorkout}
                  disabled={!customForm.name.trim() || !customForm.exercises.length}
                  style={{ width: '100%', background: customForm.name.trim() && customForm.exercises.length ? C.orange : C.card2, border: 'none', borderRadius: 8, color: customForm.name.trim() && customForm.exercises.length ? '#fff' : C.dim, padding: '12px', fontSize: 16, fontWeight: 800, cursor: customForm.name.trim() && customForm.exercises.length ? 'pointer' : 'default', fontFamily: FONT, letterSpacing: 1 }}>
                  ▶ START WORKOUT
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    const totalSets = aw.exercises.reduce((s, ex) => s + ex.sets.length, 0)
    const doneSets  = aw.exercises.reduce((s, ex) => s + ex.sets.filter((st) => st.completed).length, 0)

    return (
      <div style={{ paddingBottom: 120 }}>
        {/* Sticky header */}
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: aw.planColor }}>{aw.planName}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(new Date().toISOString().slice(0, 10))}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.blue, fontVariantNumeric: 'tabular-nums' }}>{fmtTimer(elapsed)}</div>
              <div style={{ fontSize: 11, color: C.sub }}>{doneSets} / {totalSets} sets done</div>
            </div>
          </div>
          {!confirmDiscard ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={finishWorkout}
                style={{ flex: 1, background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, letterSpacing: 1 }}>
                ✓ FINISH
              </button>
              <button onClick={() => setConfirmDiscard(true)}
                style={{ background: C.card2, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                DISCARD
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${C.red}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: C.red, fontWeight: 700 }}>Discard this workout?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmDiscard(false)}
                  style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.sub, padding: '5px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                  Cancel
                </button>
                <button onClick={discard}
                  style={{ background: C.red, border: 'none', borderRadius: 6, color: '#fff', padding: '5px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
                  Yes, Discard
                </button>
              </div>
            </div>
          )}
          {/* Rest timer — restTick forces re-render each second */}
          {restTimer && (() => {
            void restTick
            const rem  = Math.max(0, Math.ceil((restTimer.endsAt - Date.now()) / 1000))
            const pct  = rem / restTimer.total
            const done = rem === 0
            const pad  = (n) => String(n).padStart(2, '0')
            const fmt  = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
            return (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: done ? '#0d1a0d' : '#0d1626', borderRadius: 8, border: `1px solid ${done ? C.green : C.blue}` }}>
                <svg width={44} height={44} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                  <circle cx={22} cy={22} r={18} fill="none" stroke={C.dim} strokeWidth={3} />
                  <circle cx={22} cy={22} r={18} fill="none" stroke={done ? C.green : C.blue} strokeWidth={3}
                    strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - pct)}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: done ? C.green : C.blue, lineHeight: 1 }}>{fmt(rem)}</div>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>{done ? '✓ REST DONE — GO!' : 'REST'}</div>
                </div>
                <button onClick={() => setRestTimer(null)}
                  style={{ background: 'none', border: 'none', color: C.dim, fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
              </div>
            )
          })()}
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          {/* Warmup — Huberman 5-min activation */}
          <Section title="WARM-UP" icon="🔥">
            <div style={{ fontSize: 11, color: '#a3c76a', marginBottom: 10, lineHeight: 1.5 }}>
              <strong style={{ color: '#c8e898' }}>Step 1</strong> — 5-min whole-body activation (Huberman p.164).<br />
              Raise core temp, prime adrenaline circuits. Pick one:
            </div>
            {WARMUP_ACTIVATION.map((opt) => {
              const sel = warmupOpt === opt.id
              return (
                <div key={opt.id} onClick={() => setWarmupOpt(opt.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 8, marginBottom: 5, cursor: 'pointer',
                    background: sel ? '#1a2e12' : C.card2, border: `1.5px solid ${sel ? '#4ade80' : C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? '#4ade80' : C.dim, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, color: sel ? C.text : C.sub, fontWeight: sel ? 600 : 400 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>{opt.sub}</div>
                  </div>
                </div>
              )
            })}
            <div style={{ marginTop: 10, fontSize: 11, color: '#a3c76a', background: '#111a0a', border: '1px solid #3a4a20', borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>
              <strong style={{ color: '#c8e898' }}>Step 2</strong> — Exercise warm-up sets per lift.<br />
              {WARMUP_SETS_NOTE}
            </div>
          </Section>

          {/* ── Effort tag legend ── */}
          {(() => {
            const EFFORT_CFG = {
              '1short':      { label: '1 SHORT',      desc: '1 rep left in tank',     color: '#f59e0b', bg: '#3f2a05' },
              'failure':     { label: 'TO FAILURE',   desc: 'until form breaks',      color: '#ef4444', bg: '#3f0f0f' },
              'pastfailure': { label: 'PAST FAILURE', desc: 'hold 3–5s after last rep', color: '#a855f7', bg: '#2d1554' },
            }
            const used = [...new Set(aw.exercises.map((e) => e.effort).filter(Boolean))]
            if (!used.length) return null
            return (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {used.map((key) => {
                  const t = EFFORT_CFG[key]; if (!t) return null
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: t.bg, border: `1px solid ${t.color}44`, borderRadius: 6, padding: '4px 9px' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: t.color, letterSpacing: 0.5 }}>{t.label}</span>
                      <span style={{ fontSize: 10, color: '#8b92a5' }}>= {t.desc}</span>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Exercise cards */}
          {aw.exercises.map((ex, ei) => {
            const EFFORT_CFG = {
              '1short':      { label: '1 SHORT',      color: '#f59e0b', bg: '#3f2a05' },
              'failure':     { label: 'TO FAILURE',   color: '#ef4444', bg: '#3f0f0f' },
              'pastfailure': { label: 'PAST FAILURE', color: '#a855f7', bg: '#2d1554' },
            }
            const effortCfg  = ex.effort ? EFFORT_CFG[ex.effort] : null
            const prevSets   = getPrev(history, ex.name)
            const suggestion = ex.targetReps ? suggestWeight(history, ex.name, ex.targetReps, ex.muscleGroup, ex.inc) : null
            const allDone    = ex.sets.length > 0 && ex.sets.every((s) => s.completed)
            const cueOpen    = openCues[ei] || false

            // Progression callout: all sets completed AND every rep count hit top of range
            const readyProgress = allDone && ex.targetReps && suggestion?.progressed && ex.inc > 0

            return (
              <div key={ei} style={{ background: C.card, border: `1px solid ${allDone ? C.green : C.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{ex.name}</div>
                    {effortCfg && (
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
                        color: effortCfg.color, background: effortCfg.bg, border: `1px solid ${effortCfg.color}44` }}>
                        {effortCfg.label}{ex.effortNote ? ` (${ex.effortNote})` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.blue, background: C.blueDim, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      {ex.muscleGroup}
                    </span>
                    {(ex.repsMin || ex.targetReps) && (
                      <span style={{ fontSize: 11, color: C.sub }}>
                        {ex.repsMin && ex.targetReps ? `${ex.repsMin}–${ex.targetReps}` : ex.targetReps ? ex.targetReps : 'max'} reps
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: C.sub }}>
                      · rest {ex.restSec < 120 ? `${ex.restSec}s` : ex.restSec === 120 ? '2 min' : ex.restSec === 150 ? '2.5 min' : ex.restSec === 165 ? '2.5–3 min' : '3 min'}
                    </span>
                    {ex.note && <span style={{ fontSize: 11, color: C.sub }}>· {ex.note}</span>}
                    {suggestion && (
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: 0.3,
                        color:      suggestion.progressed ? C.green : C.sub,
                        background: suggestion.progressed ? C.greenDim : C.card2,
                        border:     `1px solid ${suggestion.progressed ? C.green : C.border}`,
                      }}>
                        {suggestion.progressed ? '↑ ' : '→ '}{suggestion.weight}kg
                      </span>
                    )}
                  </div>
                  {/* Instructions toggle */}
                  {ex.instructions && (
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => setOpenCues((p) => ({ ...p, [ei]: !cueOpen }))}
                        style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, color: C.sub, fontSize: 11, fontWeight: 700, padding: '3px 10px', cursor: 'pointer', fontFamily: FONT, letterSpacing: 0.5 }}>
                        {cueOpen ? '▲ HIDE CUES' : '▼ SHOW CUES'}
                      </button>
                      {cueOpen && (
                        <div style={{ marginTop: 8, fontSize: 13, color: C.sub, lineHeight: 1.6, padding: '9px 12px', background: C.card2, borderRadius: 8, border: `1px solid ${C.border}` }}>
                          {ex.instructions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Warm-up sets */}
                {ex.warmupSets && (
                  <div style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}`, background: '#111a0a' }}>
                    <div style={{ fontSize: 10, color: '#a3c76a', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>WARM-UP SETS</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ex.warmupSets.map((w, wi) => {
                        const baseKg = parseFloat(ex.sets[0]?.weight) || 0
                        const wkg    = baseKg > 0 ? Math.round(baseKg * w.pct / 2.5) * 2.5 : 0
                        return (
                          <div key={wi} style={{ background: C.card, border: '1px solid #3a4a20', borderRadius: 6, padding: '4px 10px', fontSize: 11 }}>
                            <span style={{ color: '#a3c76a', fontWeight: 800 }}>{w.label}</span>
                            <span style={{ color: C.sub }}> · {wkg}kg × {w.lo}–{w.hi}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sets table */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px 34px', gap: 4, padding: '5px 12px 2px' }}>
                    {['SET', 'PREV', 'KG', 'REPS', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1, textAlign: i >= 2 ? 'center' : 'left' }}>{h}</div>
                    ))}
                  </div>

                  {ex.sets.map((s, si) => {
                    const prev = prevSets?.[si]
                    const done = s.completed
                    const hitTop = done && ex.targetReps && parseInt(s.reps) >= ex.targetReps
                    return (
                      <div key={si} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px 34px', gap: 4, padding: '5px 12px', background: done ? 'rgba(34,197,94,0.07)' : 'transparent', alignItems: 'center', borderTop: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: done ? C.green : C.sub }}>{si + 1}</div>
                        <div style={{ fontSize: 12, color: C.dim }}>
                          {prev ? `${prev.w > 0 ? prev.w + 'kg' : 'BW'}×${prev.r}` : '—'}
                        </div>
                        <input
                          type="number"
                          value={s.weight}
                          onChange={(e) => updateSet(ei, si, 'weight', e.target.value)}
                          style={{ background: C.card2, border: `1px solid ${done ? C.green : C.border}`, borderRadius: 6, color: C.text, fontSize: 16, fontWeight: 700, fontFamily: FONT, padding: '6px 4px', textAlign: 'center', width: '100%' }}
                        />
                        <input
                          type="number"
                          value={s.reps}
                          onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                          style={{ background: C.card2, border: `1px solid ${hitTop ? C.green : done ? C.green : C.border}`, borderRadius: 6, color: hitTop ? C.green : C.text, fontSize: 16, fontWeight: 700, fontFamily: FONT, padding: '6px 4px', textAlign: 'center', width: '100%' }}
                        />
                        <button
                          onClick={() => toggleComplete(ei, si)}
                          style={{ background: done ? C.green : C.card2, border: `1px solid ${done ? C.green : C.border}`, borderRadius: 6, color: done ? '#fff' : C.dim, width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}>
                          {done ? '✓' : '○'}
                        </button>
                      </div>
                    )
                  })}

                  <div style={{ padding: '8px 12px 10px' }}>
                    <button onClick={() => addSet(ei)}
                      style={{ background: 'none', border: `1px dashed ${C.dim}`, borderRadius: 6, color: C.sub, padding: '5px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                      + ADD SET
                    </button>
                  </div>

                  {/* Per-exercise progression callout */}
                  {readyProgress && (
                    <div style={{ margin: '0 12px 10px', background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>🎯</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: C.green }}>READY TO PROGRESS</div>
                        <div style={{ fontSize: 11, color: C.sub }}>Add {ex.inc}kg next session → {suggestion.weight}kg</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add exercise */}
          <button onClick={() => setShowPicker((p) => !p)}
            style={{ width: '100%', background: 'none', border: `1px dashed ${C.blue}`, borderRadius: 10, color: C.blue, padding: '12px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, letterSpacing: 1, marginBottom: 12 }}>
            + ADD EXERCISE
          </button>

          {showPicker && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Pick Exercise</div>
                <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>
              {/* Free-text custom exercise */}
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.card2 }}>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Custom</div>
                <input
                  placeholder="Exercise name"
                  value={freeExInp.name}
                  onChange={(e) => setFreeExInp((p) => ({ ...p, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addFreeExercise()}
                  style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: FONT, padding: '7px 10px', marginBottom: 5, boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    list="mg-options-picker"
                    placeholder="Muscle group (optional)"
                    value={freeExInp.mg}
                    onChange={(e) => setFreeExInp((p) => ({ ...p, mg: e.target.value }))}
                    style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: FONT, padding: '7px 10px' }}
                  />
                  <datalist id="mg-options-picker">
                    {['Quads / Glutes','Hamstrings / Glutes','Posterior Chain','Back / Biceps','Chest / Triceps','Shoulders / Triceps','Core','Full Body','Cardio'].map((g) => <option key={g} value={g} />)}
                  </datalist>
                  <button
                    onClick={addFreeExercise}
                    style={{ background: C.blue, border: 'none', borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
                    + ADD
                  </button>
                </div>
              </div>

              {/* Preset list */}
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {EXTRA.map((ex) => (
                  <button key={ex.name} onClick={() => addExercise(ex)}
                    style={{ width: '100%', background: 'none', border: 'none', borderBottom: `1px solid ${C.border}`, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: FONT }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.card2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{ex.name}</span>
                    <span style={{ fontSize: 11, color: C.blue, background: C.blueDim, padding: '2px 8px', borderRadius: 4 }}>{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown — Huberman Mobility Protocol 4 */}
          <Section title="COOL-DOWN · MOBILITY" icon="🧘">
            <div style={{ fontSize: 11, color: '#93c5fd', marginBottom: 10, lineHeight: 1.5 }}>
              Huberman Protocol 4 (p.202–208) · ~10 min · 2–4× per week.<br />
              Targets: hips · thoracic · shoulders · posterior chain.
            </div>
            {MOBILITY_MOVES.map((move, mi) => {
              const isOpen = openMob[mi] || false
              const done   = mobDone[mi] || false
              return (
                <div key={move.id} style={{ background: done ? '#0d1f1a' : C.card2, border: `1px solid ${done ? '#166534' : C.border}`, borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                  {/* Accordion header */}
                  <div onClick={() => setOpenMob((p) => ({ ...p, [mi]: !isOpen }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', cursor: 'pointer' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#14532d' : '#1e2a3a', color: done ? '#4ade80' : '#60a5fa', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done ? '✓' : mi + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: done ? '#4ade80' : C.text }}>{move.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{move.duration} · {move.sets} · {move.hold}</div>
                    </div>
                    <span style={{ color: C.dim, fontSize: 12, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>▶</span>
                  </div>
                  {/* Expandable body */}
                  {isOpen && (
                    <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, margin: '10px 0 8px' }}>{move.desc}</div>
                      {move.steps.map((step, si) => (
                        <div key={si} style={{ fontSize: 12, color: '#aaa', padding: '3px 0 3px 14px', position: 'relative', lineHeight: 1.5 }}>
                          <span style={{ position: 'absolute', left: 4, color: C.dim }}>·</span>{step}
                        </div>
                      ))}
                      <button onClick={() => setMobDone((p) => p.map((v, j) => j === mi ? !v : v))}
                        style={{ marginTop: 10, width: '100%', background: done ? '#14532d' : C.card, border: `1px solid ${done ? '#22c55e' : C.border}`, borderRadius: 8, color: done ? '#4ade80' : C.sub, padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, letterSpacing: 0.5 }}>
                        {done ? '✓ Done — tap to undo' : 'Mark Done ✓'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {mobDone.every(Boolean) && mobDone.length > 0 && (
              <div style={{ background: '#0d1f0d', border: `1px solid ${C.green}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>Mobility complete!</div>
                  <div style={{ fontSize: 12, color: C.sub }}>10 min well spent. Recovery locked in.</div>
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     HISTORY
  ══════════════════════════════════════════════════════════ */
  const renderHistory = () => {
    const sortedPRs = Object.entries(prs)
      .sort(([, a], [, b]) => e1RM(b.weight, b.reps) - e1RM(a.weight, a.reps))

    return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 12 }}>History & Personal Bests</div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3, marginBottom: 16, gap: 3 }}>
        {[['log', '📋 Workout Log'], ['pbs', '🏆 Personal Bests']].map(([id, label]) => (
          <button key={id} onClick={() => setHistoryTab(id)}
            style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', fontFamily: FONT, fontSize: 13, fontWeight: 800, letterSpacing: 0.5, cursor: 'pointer',
              background: historyTab === id ? C.blue : 'none',
              color: historyTab === id ? '#fff' : C.sub }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Personal Bests tab ── */}
      {historyTab === 'pbs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedPRs.length === 0 && (
            <div style={{ color: C.sub, fontSize: 15, textAlign: 'center', padding: '48px 0' }}>No PRs recorded yet.</div>
          )}
          {sortedPRs.map(([name, pr], idx) => {
            const onePR = e1RM(pr.weight, pr.reps)
            const isActive = PLANS.some((p) => p.exercises.some((e) => e.name === name))
            return (
              <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 900, width: 28, color: idx === 0 ? '#eab308' : idx === 1 ? C.sub : idx === 2 ? '#cd7f32' : C.dim, flexShrink: 0, textAlign: 'center' }}>
                  {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx+1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{name}</div>
                    {isActive && <span style={{ fontSize: 10, color: C.green, background: C.greenDim, padding: '1px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>ACTIVE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub }}>{fmtShort(pr.date)} · {pr.reps} reps · e1RM {onePR}kg</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: C.blue, lineHeight: 1 }}>{pr.weight > 0 ? `${pr.weight}kg` : 'BW'}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{pr.reps} reps</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Workout Log tab ── */}
      {historyTab === 'log' && <>
      {history.length === 0 && (
        <div style={{ color: C.sub, fontSize: 15, textAlign: 'center', padding: '48px 0' }}>
          No workouts logged yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.map((entry) => {
          const plan      = PLANS.find((p) => p.id === entry.planId) || {}
          const totalSets = entry.exercises.reduce((s, ex) => s + ex.sets.length, 0)
          const hasPR     = entry.exercises.some((ex) => ex.sets.some((s) => s.isPR))
          const isPending = confirmDelete === entry.id

          return (
            <div key={entry.id} style={{ background: C.card, border: `1px solid ${isPending ? C.red : C.border}`, borderLeft: `3px solid ${plan.color || C.blue}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.planName}
                      </div>
                      {hasPR && <span style={{ fontSize: 15, flexShrink: 0 }}>🏆</span>}
                    </div>
                    <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(entry.date)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>{fmtDur(entry.duration)}</div>
                      <div style={{ fontSize: 11, color: C.sub }}>{totalSets} sets</div>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(isPending ? null : entry.id)}
                      title="Delete workout"
                      style={{ background: isPending ? C.red : C.card2, border: `1px solid ${isPending ? C.red : C.border}`, borderRadius: 8, color: isPending ? '#fff' : C.sub, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🗑
                    </button>
                  </div>
                </div>

                {/* Exercise pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {entry.exercises.map((ex) => {
                    const exPR = ex.sets.some((s) => s.isPR)
                    return (
                      <span key={ex.name} style={{ fontSize: 12, fontWeight: 600, background: exPR ? 'rgba(59,130,246,0.15)' : C.card2, border: `1px solid ${exPR ? C.blue : C.border}`, color: exPR ? C.blue : C.sub, borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {exPR && <span style={{ fontSize: 11 }}>🏆</span>}{ex.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Confirm-delete strip */}
              {isPending && (
                <div style={{ background: 'rgba(239,68,68,0.1)', borderTop: `1px solid ${C.red}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>Delete this workout?</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmDelete(null)}
                      style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.sub, padding: '5px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                      Cancel
                    </button>
                    <button onClick={() => deleteWorkout(entry.id)}
                      style={{ background: C.red, border: 'none', borderRadius: 6, color: '#fff', padding: '5px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      </>}
    </div>
  )
  }

  /* ══════════════════════════════════════════════════════════
     PROGRESS
  ══════════════════════════════════════════════════════════ */
  const renderProgress = () => {
    const volData   = getWeeklyVolume(history)
    const trackedEx = Object.keys(prs).filter((n) => prs[n].weight > 0)

    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 14 }}>Progress</div>

        {/* Weekly volume chart */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Last 7 Days — Volume by Muscle Group
          </div>
          {volData.length === 0 ? (
            <div style={{ color: C.dim, fontSize: 14, padding: '20px 0', textAlign: 'center' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={volData.length * 44 + 10}>
              <BarChart layout="vertical" data={volData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="mg" width={120} tick={{ fill: C.sub, fontSize: 12, fontFamily: FONT, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT }}
                  labelStyle={{ color: C.text, fontWeight: 700 }}
                  itemStyle={{ color: C.blue }}
                  formatter={(v) => [`${v.toLocaleString()} kg·reps`, 'Volume']}
                />
                <Bar dataKey="vol" radius={[0, 6, 6, 0]}>
                  {volData.map((entry, i) => <Cell key={i} fill={mgColor(entry.mg)} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Exercise sparklines */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          Exercise Trends
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trackedEx.map((name) => {
            const spark      = getSparkline(history, name)
            const pr         = prs[name]
            const suggestion = suggestWeight(history, name, pr.reps, '')
            return (
              <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{name}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{pr.reps} reps · PR set {fmtShort(pr.date)}</div>
                    {suggestion && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: suggestion.progressed ? C.green : C.sub, marginTop: 4 }}>
                        {suggestion.progressed ? '↑' : '→'} Next session: {suggestion.weight}kg
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.blue, lineHeight: 1 }}>{pr.weight}kg</div>
                    <div style={{ fontSize: 10, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>Current PR</div>
                  </div>
                </div>
                {spark.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={spark} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                      <Line type="monotone" dataKey="weight" stroke={C.blue} strokeWidth={2} dot={{ r: 3, fill: C.blue }} />
                      <Tooltip
                        contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: FONT, fontSize: 12 }}
                        labelStyle={{ color: C.sub }}
                        itemStyle={{ color: C.blue }}
                        formatter={(v) => [`${v}kg`, 'Max weight']}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ fontSize: 12, color: C.dim, paddingTop: 4 }}>Log 2+ sessions to see trend</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     NUTRITION
  ══════════════════════════════════════════════════════════ */
  const renderNutrition = () => {
    const DAY_NAMES  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const DAY_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const dayOfWeek  = new Date().getDay()
    const todayName  = DAY_NAMES[dayOfWeek]
    const todayDinner = DINNERS[DINNER_BY_DAY[dayOfWeek]]

    const loggedKcal    = (mealsLogged.breakfast ? BREAKFAST.kcal    : 0)
                        + (mealsLogged.lunch     ? LUNCH.kcal        : 0)
                        + (mealsLogged.dinner    ? todayDinner.kcal  : 0)
    const loggedProtein = (mealsLogged.breakfast ? BREAKFAST.protein : 0)
                        + (mealsLogged.lunch     ? LUNCH.protein     : 0)
                        + (mealsLogged.dinner    ? todayDinner.protein : 0)

    const pctP = Math.min(loggedProtein / DAILY_TARGETS.protein * 100, 100)
    const pctK = Math.min(loggedKcal    / DAILY_TARGETS.kcal    * 100, 100)

    const MEAL_SLOTS = [
      { key: 'breakfast', label: 'Breakfast', meal: BREAKFAST },
      { key: 'lunch',     label: 'Lunch',     meal: LUNCH },
      { key: 'dinner',    label: 'Dinner',    meal: todayDinner },
    ]

    return (
      <div style={{ padding: 16, paddingBottom: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{todayName}'s Nutrition</div>
          <div style={{ fontSize: 13, color: C.sub }}>Targets: {DAILY_TARGETS.protein}g protein · {DAILY_TARGETS.kcal} kcal</div>
        </div>

        {/* Macro progress */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Today's Progress
          </div>
          {[
            { label: 'Protein', current: loggedProtein, target: DAILY_TARGETS.protein, unit: 'g', color: loggedProtein >= DAILY_TARGETS.protein ? C.green : C.blue, pct: pctP },
            { label: 'Calories', current: loggedKcal, target: DAILY_TARGETS.kcal, unit: ' kcal', color: C.orange, pct: pctK },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>
                  {m.current}{m.unit} <span style={{ color: C.sub, fontWeight: 400, fontSize: 12 }}>/ {m.target}{m.unit}</span>
                </span>
              </div>
              <div style={{ height: 8, background: C.dim, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 4, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
          {/* Macro grid summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 4 }}>
            {[
              { label: 'Protein', value: `${loggedProtein}g`, color: C.blue },
              { label: 'Carbs',   value: `${(mealsLogged.breakfast ? BREAKFAST.carbs : 0) + (mealsLogged.lunch ? LUNCH.carbs : 0) + (mealsLogged.dinner ? todayDinner.carbs : 0)}g`, color: C.purple },
              { label: 'Fat',     value: `${(mealsLogged.breakfast ? BREAKFAST.fat : 0) + (mealsLogged.lunch ? LUNCH.fat : 0) + (mealsLogged.dinner ? todayDinner.fat : 0)}g`, color: C.green },
              { label: 'kcal',    value: `${loggedKcal}`, color: C.orange },
            ].map((m) => (
              <div key={m.label} style={{ background: C.card2, borderRadius: 6, padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal cards */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          Today's Meals
        </div>
        {MEAL_SLOTS.map(({ key, label, meal }) => {
          const logged = mealsLogged[key]
          return (
            <div key={key} style={{ background: C.card, border: `1px solid ${logged ? C.green : C.border}`, borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: logged ? C.green : C.sub, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{meal.name}</div>
                </div>
                <button
                  onClick={() => setMealsLogged((p) => ({ ...p, [key]: !p[key] }))}
                  style={{ background: logged ? C.green : C.card2, border: `1px solid ${logged ? C.green : C.border}`, borderRadius: 8, color: logged ? '#fff' : C.sub, padding: '7px 12px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, flexShrink: 0, letterSpacing: 0.5 }}>
                  {logged ? '✓ DONE' : 'LOG'}
                </button>
              </div>
              {/* Card body */}
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 10 }}>{meal.desc}</div>
                {/* Macros */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[
                    { label: 'kcal',    value: meal.kcal,            color: C.orange },
                    { label: 'protein', value: `${meal.protein}g`,   color: C.blue },
                    { label: 'carbs',   value: `${meal.carbs}g`,     color: C.purple },
                    { label: 'fat',     value: `${meal.fat}g`,       color: C.green },
                  ].map((m) => (
                    <div key={m.label} style={{ background: C.card2, borderRadius: 6, padding: '6px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {/* Tip */}
                <div style={{ background: C.card2, borderRadius: 6, padding: '8px 10px', borderLeft: `2px solid ${C.blue}` }}>
                  <span style={{ fontSize: 11, color: C.sub, fontStyle: 'italic' }}>💡 {meal.tip}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Weekly dinner rotation */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, marginTop: 6 }}>
          Dinner Rotation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DAY_SHORT.map((day, idx) => {
            const dinner  = DINNERS[DINNER_BY_DAY[idx]]
            const isToday = idx === dayOfWeek
            return (
              <div key={day} style={{ background: isToday ? C.card2 : C.card, border: `1px solid ${isToday ? C.blue : C.border}`, borderLeft: `3px solid ${isToday ? C.blue : C.dim}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: isToday ? C.blue : C.dim, width: 32, flexShrink: 0 }}>{day}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isToday ? C.text : C.sub }}>{dinner.name}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{dinner.kcal} kcal · {dinner.protein}g protein</div>
                </div>
                {isToday && (
                  <span style={{ fontSize: 11, color: C.blue, fontWeight: 700, background: C.blueDim, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>TODAY</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     SHELL — nav + screen router
  ══════════════════════════════════════════════════════════ */
  const TABS = [
    { id: 'dashboard', label: 'Home',      icon: '⚡' },
    { id: 'workout',   label: 'Workout',   icon: '🏋️' },
    { id: 'history',   label: 'History',   icon: '📋' },
    { id: 'progress',  label: 'Progress',  icon: '📈' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  ]

  return (
    <div style={{ fontFamily: FONT, background: C.bg, height: '100dvh', color: C.text, maxWidth: 520, margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {screen === 'dashboard' && !dayDetail && renderDashboard()}
        {screen === 'dashboard' && dayDetail  && renderDayDetail()}
        {screen === 'workout'   && renderWorkout()}
        {screen === 'history'   && renderHistory()}
        {screen === 'progress'  && renderProgress()}
        {screen === 'nutrition' && renderNutrition()}
      </div>

      {/* Bottom nav */}
      <nav style={{ background: '#0c0e15', borderTop: `1px solid ${C.border}`, display: 'flex', flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setScreen(tab.id); setDayDetail(null) }}
            style={{ flex: 1, padding: '10px 0 6px', background: 'none', border: 'none', color: screen === tab.id ? C.blue : C.dim, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontFamily: FONT }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: screen === tab.id ? 800 : 500, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {tab.label}
            </span>
            {screen === tab.id && (
              <span style={{ display: 'block', width: 20, height: 2, background: C.blue, borderRadius: 1 }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
