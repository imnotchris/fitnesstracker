import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, ResponsiveContainer,
} from 'recharts'

import { C, FONT, PLANS, WARMUP, TREADMILL_NOTE, COOLDOWN, EXTRA, INIT_PRS, INIT_HISTORY, BREAKFAST, LUNCH, DINNERS, DINNER_BY_DAY, DAILY_TARGETS } from './data.js'
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
  const [history,       setHistory]       = useState(INIT_HISTORY)
  const [prs,           setPrs]           = useState(INIT_PRS)
  const [aw,            setAw]            = useState(null)     // active workout
  const [elapsed,       setElapsed]       = useState(0)
  const [warmup,        setWarmup]        = useState([])
  const [cooldown,      setCooldown]      = useState([])
  const [showPicker,    setShowPicker]    = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)     // id pending delete
  const [mealsLogged,  setMealsLogged]   = useState({ breakfast: false, lunch: false, dinner: false })
  const timerRef = useRef(null)

  /* ── timer ── */
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

  /* ── workout actions ── */
  const startWorkout = (plan) => {
    setAw({
      planId:    plan.id,
      planName:  `${plan.name} — ${plan.subtitle}`,
      planColor: plan.color,
      startTime: Date.now(),
      exercises: plan.exercises.map((ex) => ({
        name:        ex.name,
        muscleGroup: ex.muscleGroup,
        note:        ex.note || null,
        targetReps:  ex.reps,
        sets: Array.from({ length: ex.sets }, () => ({
          weight: String(ex.weight),
          reps:   String(ex.reps),
          completed: false,
        })),
      })),
    })
    setWarmup(Array(WARMUP.length).fill(false))
    setCooldown(Array(COOLDOWN.length).fill(false))
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

  const toggleComplete = (ei, si) =>
    setAw((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i !== ei ? ex : {
          ...ex,
          sets: ex.sets.map((s, j) => j !== si ? s : { ...s, completed: !s.completed }),
        },
      ),
    }))

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
    setScreen('history')
  }

  const discard = () => { setAw(null); setElapsed(0); setScreen('dashboard') }

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => startWorkout(plan)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${plan.color}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: FONT }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.card2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = C.card)}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 2 }}>
                      {plan.name} <span style={{ color: plan.color }}>·</span> {plan.subtitle}
                    </div>
                    <div style={{ fontSize: 12, color: C.sub }}>
                      {plan.day} · {plan.exercises.length} exercises · {plan.exercises.reduce((s, e) => s + e.sets, 0)} sets
                    </div>
                  </div>
                  <div style={{ color: plan.color, fontSize: 20, fontWeight: 900 }}>▶</div>
                </button>
              ))}
            </div>
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={finishWorkout}
              style={{ flex: 1, background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, letterSpacing: 1 }}>
              ✓ FINISH
            </button>
            <button onClick={discard}
              style={{ background: C.card2, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
              DISCARD
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          {/* Warmup */}
          <Section title="WARMUP" icon="🔥">
            {WARMUP.map((step, i) => (
              <CheckRow key={i} checked={warmup[i]} label={step} color={C.orange}
                onToggle={() => setWarmup((p) => p.map((v, j) => j === i ? !v : v))} />
            ))}
          </Section>

          {/* Exercise cards */}
          {aw.exercises.map((ex, ei) => {
            const prevSets   = getPrev(history, ex.name)
            const suggestion = suggestWeight(history, ex.name, ex.targetReps, ex.muscleGroup)
            return (
              <div key={ei} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 14px 8px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>{ex.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.blue, background: C.blueDim, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                      {ex.muscleGroup}
                    </span>
                    {ex.note && <span style={{ fontSize: 11, color: C.sub }}>{ex.note}</span>}
                    {suggestion && (
                      <span style={{
                        fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 4, letterSpacing: 0.5,
                        color:      suggestion.progressed ? C.green : C.sub,
                        background: suggestion.progressed ? C.greenDim : C.card2,
                        border:     `1px solid ${suggestion.progressed ? C.green : C.border}`,
                      }}>
                        {suggestion.progressed ? '↑ ' : '→ '}{suggestion.weight}kg suggested
                        {suggestion.progressed && ' · new weight'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sets table */}
                <div>
                  {/* Column labels */}
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px 34px', gap: 4, padding: '5px 12px 2px' }}>
                    {['SET', 'PREV', 'KG', 'REPS', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1, textAlign: i >= 2 ? 'center' : 'left' }}>{h}</div>
                    ))}
                  </div>

                  {ex.sets.map((s, si) => {
                    const prev = prevSets?.[si]
                    const done = s.completed
                    return (
                      <div key={si} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 70px 34px', gap: 4, padding: '5px 12px', background: done ? 'rgba(34,197,94,0.08)' : 'transparent', alignItems: 'center', borderTop: `1px solid ${C.border}` }}>
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
                          style={{ background: C.card2, border: `1px solid ${done ? C.green : C.border}`, borderRadius: 6, color: C.text, fontSize: 16, fontWeight: 700, fontFamily: FONT, padding: '6px 4px', textAlign: 'center', width: '100%' }}
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
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
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

          {/* Incline walk */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.orange}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🚶</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Incline Walk</div>
              <div style={{ fontSize: 13, color: C.orange }}>{TREADMILL_NOTE}</div>
            </div>
          </div>

          {/* Cooldown */}
          <Section title="COOLDOWN" icon="🧊">
            {COOLDOWN.map((step, i) => (
              <CheckRow key={i} checked={cooldown[i]} label={step} color={C.blue}
                onToggle={() => setCooldown((p) => p.map((v, j) => j === i ? !v : v))} />
            ))}
          </Section>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════════════
     HISTORY
  ══════════════════════════════════════════════════════════ */
  const renderHistory = () => (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 14 }}>Workout History</div>

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
    </div>
  )

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
        {screen === 'dashboard' && renderDashboard()}
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
            onClick={() => setScreen(tab.id)}
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
