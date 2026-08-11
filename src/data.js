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
// Gym days: Wed / Thu / Sat — 4 exercises, 3 sets each (≈ 40–50 min)
// Push + Pull + Hinge + Squat every session, rotated A → B → C
// Followed by 15–20 min treadmill at 15% incline, 5 km/h (gym days only)
export const PLANS = [
  {
    id: 'day1',
    name: 'Session A',
    subtitle: 'Heavy Compounds',
    day: 'Wed',
    color: '#3b82f6',
    exercises: [
      { name: 'Barbell Back Squat',  muscleGroup: 'Quads / Glutes',  sets: 3, reps: 5, weight: 80  },
      { name: 'Trap Bar Deadlift',   muscleGroup: 'Posterior Chain', sets: 3, reps: 5, weight: 100 },
      { name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps', sets: 3, reps: 5, weight: 70  },
      { name: 'Lat Pulldown',        muscleGroup: 'Back / Biceps',   sets: 3, reps: 6, weight: 65, note: 'Cable stack number 13 (÷5 to get pin)' },
    ],
  },
  {
    id: 'day2',
    name: 'Session B',
    subtitle: 'Strength / Hypertrophy',
    day: 'Thu',
    color: '#a855f7',
    exercises: [
      { name: 'Barbell Bulgarian Split Squat', muscleGroup: 'Quads / Glutes',      sets: 3, reps: 8, weight: 40, note: 'Each leg — left leg first' },
      { name: 'Romanian Deadlift',             muscleGroup: 'Hamstrings / Glutes', sets: 3, reps: 8, weight: 65 },
      { name: 'Barbell Overhead Press',        muscleGroup: 'Shoulders / Triceps', sets: 3, reps: 6, weight: 40 },
      { name: 'Seated Cable Row',              muscleGroup: 'Back / Biceps',       sets: 3, reps: 8, weight: 60, note: 'Cable stack number 12 (÷5 to get pin)' },
    ],
  },
  {
    id: 'day3',
    name: 'Session C',
    subtitle: 'Volume / Unilateral',
    day: 'Sat',
    color: '#22c55e',
    exercises: [
      { name: 'Leg Press',                muscleGroup: 'Quads / Glutes',      sets: 3, reps: 12, weight: 100 },
      { name: 'Single-Leg RDL',           muscleGroup: 'Hamstrings / Glutes', sets: 3, reps: 10, weight: 30, note: 'Each leg — left leg first' },
      { name: 'Incline Barbell Bench',    muscleGroup: 'Chest / Shoulders',   sets: 3, reps: 8,  weight: 55 },
      { name: 'Barbell Bent-Over Row',    muscleGroup: 'Back / Biceps',       sets: 3, reps: 8,  weight: 60 },
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

export const TREADMILL_NOTE = '15–20 min treadmill · 15% incline · 5 km/h'

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
  // ★ Most recommended add-on — fills knee-flexion hamstring gap
  { name: 'Leg Curl',                   muscleGroup: 'Hamstrings' },
  // Lower body
  { name: 'Leg Extension',              muscleGroup: 'Quads' },
  { name: 'Hack Squat',                 muscleGroup: 'Quads / Glutes' },
  { name: 'Barbell Lunge',              muscleGroup: 'Quads / Glutes' },
  { name: 'Hip Thrust',                 muscleGroup: 'Hamstrings / Glutes' },
  { name: 'Calf Raise',                 muscleGroup: 'Calves' },
  // Upper — Push
  { name: 'Dumbbell Shoulder Press',    muscleGroup: 'Shoulders' },
  { name: 'Cable Lateral Raise',        muscleGroup: 'Shoulders' },
  { name: 'Incline Dumbbell Press',     muscleGroup: 'Chest' },
  { name: 'Cable Chest Fly',            muscleGroup: 'Chest' },
  { name: 'Dips',                       muscleGroup: 'Chest / Triceps' },
  { name: 'Tricep Pushdown',            muscleGroup: 'Triceps' },
  { name: 'Tricep Overhead Extension',  muscleGroup: 'Triceps' },
  // Upper — Pull
  { name: 'Pull-ups',                   muscleGroup: 'Back / Biceps' },
  { name: 'Chest-Supported Row',        muscleGroup: 'Back' },
  { name: 'Face Pull',                  muscleGroup: 'Rear Delts' },
  { name: 'Reverse Fly',                muscleGroup: 'Rear Delts' },
  { name: 'Dumbbell Curl',              muscleGroup: 'Biceps' },
  { name: 'Hammer Curl',                muscleGroup: 'Biceps / Forearms' },
  { name: 'Preacher Curl',              muscleGroup: 'Biceps' },
  // Core
  { name: 'Cable Crunch',               muscleGroup: 'Core' },
  { name: 'Ab Wheel',                   muscleGroup: 'Core' },
  { name: 'Plank',                      muscleGroup: 'Core' },
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
  'Barbell Back Squat':           { weight: 80,  reps: 5, date: '2026-07-27' },
  'Trap Bar Deadlift':            { weight: 100, reps: 5, date: '2026-07-27' },
  'Barbell Bench Press':          { weight: 70,  reps: 5, date: '2026-07-27' },
  'Lat Pulldown':                 { weight: 65,  reps: 6, date: '2026-07-27' },
  'Barbell Bulgarian Split Squat':{ weight: 40,  reps: 8, date: '2026-07-27' },
  'Romanian Deadlift':            { weight: 65,  reps: 8, date: '2026-07-27' },
  'Barbell Overhead Press':       { weight: 40,  reps: 6, date: '2026-07-27' },
  'Seated Cable Row':             { weight: 60,  reps: 8, date: '2026-07-27' },
  'Leg Press':                    { weight: 100, reps: 12,date: '2026-07-27' },
  'Single-Leg RDL':               { weight: 30,  reps: 10,date: '2026-07-27' },
  'Incline Barbell Bench':        { weight: 55,  reps: 8, date: '2026-07-27' },
  'Barbell Bent-Over Row':        { weight: 60,  reps: 8, date: '2026-07-27' },
}

// ── Seed: Workout History ─────────────────────────────────────
// Empty — history is persisted in localStorage and built up from real workouts
export const INIT_HISTORY = []
