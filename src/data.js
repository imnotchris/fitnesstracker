// ── Theme ─────────────────────────────────────────────────────
export const C = {
  bg: '#0a0b0f',
  card: '#11131a',
  card2: '#181b23',
  border: '#21242e',
  blue: '#3b82f6',
  blueDim: '#1e3a5f',
  green: '#22c55e',
  greenDim: '#14532d',
  purple: '#a855f7',
  orange: '#f97316',
  red: '#ef4444',
  text: '#f0f2f5',
  sub: '#8b92a5',
  dim: '#3a3f4f',
}

export const FONT = "'Barlow Condensed', 'Impact', 'Arial Narrow', sans-serif"

// ── Workout Plans ─────────────────────────────────────────────
// Gym days: Wed / Thu / Sat — max 3 sets per exercise (≈ 30 min lifting)
// Each gym session followed by 30 min treadmill at 15% incline, 5 km/h
export const PLANS = [
  {
    id: 'day1',
    name: 'Day 1',
    subtitle: 'Full Body A',
    day: 'Wed',
    color: '#3b82f6',
    exercises: [
      { name: 'Trap Bar Deadlift',       muscleGroup: 'Posterior Chain', sets: 3, reps: 6,  weight: 100 },
      { name: 'Barbell Bench Press',     muscleGroup: 'Chest / Triceps', sets: 3, reps: 6,  weight: 70 },
      { name: 'Lat Pulldown',            muscleGroup: 'Back / Biceps',   sets: 3, reps: 8,  weight: 65 },
      { name: 'Dumbbell Lateral Raise',  muscleGroup: 'Shoulders',       sets: 3, reps: 12, weight: 8 },
    ],
  },
  {
    id: 'day2',
    name: 'Day 2',
    subtitle: 'Full Body B',
    day: 'Thu',
    color: '#a855f7',
    exercises: [
      { name: 'Barbell Squat',          muscleGroup: 'Quads / Glutes',      sets: 3, reps: 6, weight: 80 },
      { name: 'Standing Barbell Press', muscleGroup: 'Shoulders / Triceps', sets: 3, reps: 6, weight: 40 },
      { name: 'Seated Machine Row',     muscleGroup: 'Back / Biceps',       sets: 3, reps: 8, weight: 65 },
      { name: 'Pull-ups',               muscleGroup: 'Back / Biceps',       sets: 3, reps: 6, weight: 0 },
    ],
  },
  {
    id: 'day3',
    name: 'Day 3',
    subtitle: 'Full Body C',
    day: 'Sat',
    color: '#22c55e',
    exercises: [
      { name: 'Trap Bar Deadlift',   muscleGroup: 'Posterior Chain',     sets: 3, reps: 8,  weight: 90 },
      { name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps',     sets: 3, reps: 8,  weight: 62.5 },
      { name: 'Leg Press',           muscleGroup: 'Quads / Glutes',      sets: 3, reps: 10, weight: 120 },
      { name: 'Back Extension',      muscleGroup: 'Lower Back / Glutes', sets: 3, reps: 12, weight: 0 },
    ],
  },
]

// ── Warmup / Cooldown ─────────────────────────────────────────
export const WARMUP = [
  '5 min easy treadmill walk — loosen up before lifting',
  'Leg swings — 10 each direction, each leg',
  'Hip circles — 10 each direction',
  'Arm circles — 10 forward, 10 backward',
  'Thoracic rotations — 10 reps each side',
  'Glute bridges — 15 reps bodyweight',
  'Band pull-aparts — 15 reps',
]

export const TREADMILL_NOTE = '30 min treadmill · 15% incline · 5 km/h'

export const COOLDOWN = [
  'Hip flexor stretch — 30s each side',
  'Hamstring stretch — 30s each side',
  'Pec / chest doorway stretch — 30s',
  'Lat stretch (hang or doorway) — 30s each side',
  'Pigeon pose — 45s each side',
  'Thoracic extension (foam roller) — 60s',
]

// ── Extra exercises for "Add Exercise" picker ─────────────────
export const EXTRA = [
  { name: 'Dumbbell Curl',         muscleGroup: 'Biceps' },
  { name: 'Tricep Pushdown',       muscleGroup: 'Triceps' },
  { name: 'Face Pull',             muscleGroup: 'Rear Delts' },
  { name: 'Dumbbell RDL',          muscleGroup: 'Hamstrings / Glutes' },
  { name: 'Calf Raise',            muscleGroup: 'Calves' },
  { name: 'Chest Fly Machine',     muscleGroup: 'Chest' },
  { name: 'Incline DB Press',      muscleGroup: 'Chest / Shoulders' },
  { name: 'Hammer Curl',           muscleGroup: 'Biceps / Forearms' },
  { name: 'Plank',                 muscleGroup: 'Core' },
  { name: 'Ab Wheel',              muscleGroup: 'Core' },
  { name: 'Dips',                  muscleGroup: 'Chest / Triceps' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Quads / Glutes' },
]

// ── Nutrition ─────────────────────────────────────────────────
export const DAILY_TARGETS = { kcal: 2200, protein: 155 }

// Fixed breakfast — same every day
export const BREAKFAST = {
  name: 'Protein Yoghurt Bowl',
  desc: '200g Greek yoghurt · 80g frozen mixed berries · 30g protein powder · 1 tbsp psyllium husk powder',
  tip: 'Stir protein powder through the yoghurt until smooth first, then mix in psyllium husk (it thickens fast). Drop frozen berries on top straight from the freezer.',
  kcal: 320, protein: 43, carbs: 28, fat: 6,
}

// Fixed lunch — same every day
export const LUNCH = {
  name: 'Salad + Rotisserie Chicken',
  desc: '300g leafy green salad (spinach, rocket, cucumber, tomato) · ¼ rotisserie chicken (leg piece) · olive oil & lemon dressing',
  tip: 'Weigh your greens — 300g is more than it looks once mixed. The leg quarter gives you dark meat with better flavour. Keep the skin on for the fat.',
  kcal: 450, protein: 42, carbs: 10, fat: 26,
}

// 4 rotating dinners — Asian flavours, rice-based
export const DINNERS = [
  {
    id: 'chicken',
    name: 'Soy-Honey Garlic Chicken',
    desc: '320g chicken thighs · soy + honey + garlic + ginger · 300g steamed rice · 200g broccoli',
    tip: 'Marinate thighs overnight (or minimum 30 min). Pan-fry 4–5 min per side until caramelised on the outside. Steam broccoli alongside. Works great as meal prep — scales to 2–3 days.',
    kcal: 890, protein: 68, carbs: 84, fat: 26,
  },
  {
    id: 'salmon',
    name: 'Teriyaki Salmon',
    desc: '250g salmon fillet · teriyaki glaze (soy + mirin + honey) · 300g steamed rice · bok choy',
    tip: 'Pat the fillet dry. Pan-sear skin-down on high heat for 4 min, flip for 2 min, then spoon the teriyaki glaze over in the last 90 sec. Steam bok choy in a separate pan.',
    kcal: 820, protein: 60, carbs: 80, fat: 28,
  },
  {
    id: 'thai',
    name: 'Thai Basil Chicken (Pad Kra Pao)',
    desc: '280g chicken mince · fish sauce + oyster sauce + chilli + garlic · 300g rice · 2 fried eggs on top',
    tip: 'High heat is everything here. Fry garlic and chilli for 30 sec, add mince and break it up, cook through. Season assertively with fish sauce and oyster sauce. Top with a runny fried egg.',
    kcal: 870, protein: 72, carbs: 76, fat: 22,
  },
  {
    id: 'beef',
    name: 'Korean Beef Bulgogi Bowl',
    desc: '260g lean beef strips · gochujang + soy + sesame + garlic marinade · 300g rice · cucumber & spring onion',
    tip: 'Slice beef thinly against the grain — the thinner the better. Marinate at least 30 min. Stir-fry on very high heat in batches so it sears rather than steams. Serve over rice with fresh cucumber.',
    kcal: 810, protein: 62, carbs: 82, fat: 20,
  },
]

// Which DINNERS[] index each day of the week gets (0=Sun … 6=Sat)
// Sun: Chicken, Mon: Salmon, Tue: Thai, Wed: Chicken, Thu: Salmon, Fri: Thai, Sat: Beef
export const DINNER_BY_DAY = [0, 1, 2, 0, 1, 2, 3]

// ── Seed: Personal Records ────────────────────────────────────
export const INIT_PRS = {
  'Trap Bar Deadlift':      { weight: 100,  reps: 6,  date: '2026-04-09' },
  'Barbell Bench Press':    { weight: 70,   reps: 6,  date: '2026-04-02' },
  'Barbell Squat':          { weight: 80,   reps: 6,  date: '2026-04-10' },
  'Standing Barbell Press': { weight: 40,   reps: 6,  date: '2026-04-10' },
  'Lat Pulldown':           { weight: 65,   reps: 8,  date: '2026-04-09' },
  'Seated Machine Row':     { weight: 65,   reps: 8,  date: '2026-04-10' },
  'Pull-ups':               { weight: 0,    reps: 8,  date: '2026-04-10' },
  'Leg Press':              { weight: 130,  reps: 10, date: '2026-04-12' },
}

// ── Seed: Workout History ─────────────────────────────────────
export const INIT_HISTORY = [
  {
    id: 'h9', planId: 'day3', planName: 'Day 3 — Full Body C', date: '2026-04-12',
    duration: 1920,
    exercises: [
      { name: 'Trap Bar Deadlift',   muscleGroup: 'Posterior Chain',     sets: [{ w: 90, r: 8 }, { w: 90, r: 7 }, { w: 87.5, r: 8 }] },
      { name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps',     sets: [{ w: 62.5, r: 8 }, { w: 62.5, r: 8 }, { w: 60, r: 8 }] },
      { name: 'Leg Press',           muscleGroup: 'Quads / Glutes',      sets: [{ w: 130, r: 10, isPR: true }, { w: 130, r: 9 }, { w: 120, r: 10 }] },
      { name: 'Back Extension',      muscleGroup: 'Lower Back / Glutes', sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 11 }] },
    ],
  },
  {
    id: 'h8', planId: 'day2', planName: 'Day 2 — Full Body B', date: '2026-04-10',
    duration: 1980,
    exercises: [
      { name: 'Barbell Squat',          muscleGroup: 'Quads / Glutes',      sets: [{ w: 80, r: 6, isPR: true }, { w: 80, r: 6 }, { w: 77.5, r: 6 }] },
      { name: 'Standing Barbell Press', muscleGroup: 'Shoulders / Triceps', sets: [{ w: 40, r: 6, isPR: true }, { w: 40, r: 5 }, { w: 37.5, r: 6 }] },
      { name: 'Seated Machine Row',     muscleGroup: 'Back / Biceps',       sets: [{ w: 65, r: 8, isPR: true }, { w: 65, r: 7 }, { w: 60, r: 8 }] },
      { name: 'Pull-ups',               muscleGroup: 'Back / Biceps',       sets: [{ w: 0, r: 8, isPR: true }, { w: 0, r: 7 }, { w: 0, r: 6 }] },
    ],
  },
  {
    id: 'h7', planId: 'day1', planName: 'Day 1 — Full Body A', date: '2026-04-09',
    duration: 1860,
    exercises: [
      { name: 'Trap Bar Deadlift',      muscleGroup: 'Posterior Chain', sets: [{ w: 100, r: 6, isPR: true }, { w: 100, r: 6 }, { w: 100, r: 5 }] },
      { name: 'Barbell Bench Press',    muscleGroup: 'Chest / Triceps', sets: [{ w: 70, r: 6 }, { w: 70, r: 6 }, { w: 70, r: 5 }] },
      { name: 'Lat Pulldown',           muscleGroup: 'Back / Biceps',   sets: [{ w: 65, r: 8, isPR: true }, { w: 65, r: 7 }, { w: 62.5, r: 8 }] },
      { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders',       sets: [{ w: 8, r: 12 }, { w: 8, r: 12 }, { w: 8, r: 10 }] },
    ],
  },
  {
    id: 'h5', planId: 'day3', planName: 'Day 3 — Full Body C', date: '2026-04-05',
    duration: 1800,
    exercises: [
      { name: 'Trap Bar Deadlift',   muscleGroup: 'Posterior Chain',     sets: [{ w: 87.5, r: 8 }, { w: 87.5, r: 7 }, { w: 85, r: 8 }] },
      { name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps',     sets: [{ w: 60, r: 8 }, { w: 60, r: 8 }, { w: 57.5, r: 8 }] },
      { name: 'Leg Press',           muscleGroup: 'Quads / Glutes',      sets: [{ w: 125, r: 10 }, { w: 125, r: 9 }, { w: 120, r: 10 }] },
      { name: 'Back Extension',      muscleGroup: 'Lower Back / Glutes', sets: [{ w: 0, r: 12 }, { w: 0, r: 11 }, { w: 0, r: 11 }] },
    ],
  },
  {
    id: 'h4', planId: 'day2', planName: 'Day 2 — Full Body B', date: '2026-04-03',
    duration: 1920,
    exercises: [
      { name: 'Barbell Squat',          muscleGroup: 'Quads / Glutes',      sets: [{ w: 77.5, r: 6 }, { w: 77.5, r: 6 }, { w: 75, r: 6 }] },
      { name: 'Standing Barbell Press', muscleGroup: 'Shoulders / Triceps', sets: [{ w: 40, r: 5 }, { w: 37.5, r: 6 }, { w: 37.5, r: 6 }] },
      { name: 'Seated Machine Row',     muscleGroup: 'Back / Biceps',       sets: [{ w: 62.5, r: 8 }, { w: 62.5, r: 7 }, { w: 60, r: 8 }] },
      { name: 'Pull-ups',               muscleGroup: 'Back / Biceps',       sets: [{ w: 0, r: 7 }, { w: 0, r: 6 }, { w: 0, r: 5 }] },
    ],
  },
  {
    id: 'h3', planId: 'day1', planName: 'Day 1 — Full Body A', date: '2026-04-02',
    duration: 1860,
    exercises: [
      { name: 'Trap Bar Deadlift',      muscleGroup: 'Posterior Chain', sets: [{ w: 97.5, r: 6 }, { w: 97.5, r: 6 }, { w: 95, r: 6 }] },
      { name: 'Barbell Bench Press',    muscleGroup: 'Chest / Triceps', sets: [{ w: 70, r: 6, isPR: true }, { w: 70, r: 5 }, { w: 67.5, r: 6 }] },
      { name: 'Lat Pulldown',           muscleGroup: 'Back / Biceps',   sets: [{ w: 62.5, r: 8 }, { w: 62.5, r: 7 }, { w: 60, r: 8 }] },
      { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders',       sets: [{ w: 8, r: 12 }, { w: 8, r: 11 }, { w: 8, r: 10 }] },
    ],
  },
  {
    id: 'h2', planId: 'day3', planName: 'Day 3 — Full Body C', date: '2026-03-29',
    duration: 1740,
    exercises: [
      { name: 'Trap Bar Deadlift',   muscleGroup: 'Posterior Chain',     sets: [{ w: 85, r: 8 }, { w: 85, r: 7 }, { w: 82.5, r: 8 }] },
      { name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps',     sets: [{ w: 57.5, r: 8 }, { w: 57.5, r: 7 }, { w: 55, r: 8 }] },
      { name: 'Leg Press',           muscleGroup: 'Quads / Glutes',      sets: [{ w: 120, r: 10 }, { w: 120, r: 9 }, { w: 115, r: 10 }] },
      { name: 'Back Extension',      muscleGroup: 'Lower Back / Glutes', sets: [{ w: 0, r: 12 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    ],
  },
  {
    id: 'h1', planId: 'day2', planName: 'Day 2 — Full Body B', date: '2026-03-27',
    duration: 1860,
    exercises: [
      { name: 'Barbell Squat',          muscleGroup: 'Quads / Glutes',      sets: [{ w: 75, r: 6 }, { w: 75, r: 6 }, { w: 72.5, r: 6 }] },
      { name: 'Standing Barbell Press', muscleGroup: 'Shoulders / Triceps', sets: [{ w: 37.5, r: 6 }, { w: 37.5, r: 5 }, { w: 35, r: 6 }] },
      { name: 'Seated Machine Row',     muscleGroup: 'Back / Biceps',       sets: [{ w: 60, r: 8 }, { w: 60, r: 7 }, { w: 57.5, r: 8 }] },
      { name: 'Pull-ups',               muscleGroup: 'Back / Biceps',       sets: [{ w: 0, r: 6 }, { w: 0, r: 5 }, { w: 0, r: 5 }] },
    ],
  },
]
