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
// Gym days: Mon / Wed / Fri — hypertrophy focus
// effort: '1short' | 'failure' | 'pastfailure' | null
// effortNote: optional context e.g. 'last set only' | 'set 1 only'
// restSec: rest between working sets in seconds
// warmupSets: array of { pct, label, lo, hi } — first lift only
// instructions: coaching cues shown on demand during workout
// Progression: when every working set hits the TOP of the rep range → add inc kg
export const PLANS = [
  {
    id: 'day1',
    name: 'Lift A',
    subtitle: 'Heavy',
    day: 'Mon',
    color: '#3b82f6',
    duration: 57,
    warmupNote: 'First lift: 3 sets — 40%×6–10, 65%×4–8, 75%×2–4. Other compounds: 1 set at ~60%.',
    exercises: [
      {
        name: 'Romanian Deadlift', muscleGroup: 'Hamstrings / Glutes',
        sets: 3, repsMin: 5, reps: 8, weight: 90,
        effort: '1short', restSec: 180, inc: 2.5,
        warmupSets: [
          { pct: 0.40, label: '40%', lo: 6, hi: 10 },
          { pct: 0.65, label: '65%', lo: 4, hi: 8  },
          { pct: 0.75, label: '75%', lo: 2, hi: 4  },
        ],
        instructions: 'Push your hips back with knees soft and the bar sliding down your thighs. Lower until your hamstrings are at full stretch — usually around mid-shin. End the set if your lower back starts to round.',
      },
      {
        name: 'Barbell Bench Press', muscleGroup: 'Chest / Triceps',
        sets: 3, repsMin: 5, reps: 8, weight: 75,
        effort: '1short', restSec: 180, inc: 2.5,
        note: 'Use safety pins',
        warmupSets: [
          { pct: 0.40, label: '40%', lo: 6, hi: 10 },
          { pct: 0.65, label: '65%', lo: 4, hi: 8  },
          { pct: 0.75, label: '75%', lo: 2, hi: 4  },
        ],
        instructions: 'Pull your shoulder blades back and down, plant your feet, and lower the bar to your lower chest under control.',
      },
      {
        name: 'Iso Lat Pulldown', muscleGroup: 'Back / Biceps',
        sets: 3, repsMin: 8, reps: 10, weight: 35,
        effort: 'failure', effortNote: 'last set only', restSec: 120, inc: 5,
        note: '35kg per side',
        instructions: 'Let your arms stretch fully at the top. Drive your elbows down and back toward your hips — no swinging.',
      },
      {
        name: 'Leg Press', muscleGroup: 'Quads / Glutes',
        sets: 2, repsMin: 10, reps: 12, weight: 105,
        effort: 'failure', restSec: 120, inc: 5,
        instructions: "Go as deep as you can without your lower back lifting off the pad. Don't lock your knees at the top.",
      },
      {
        name: 'Cable Lateral Raise', muscleGroup: 'Shoulders',
        sets: 2, repsMin: 12, reps: 15, weight: 5,
        effort: 'pastfailure', effortNote: 'set 1 only', restSec: 90, inc: 1,
        note: '~5kg per arm — calibrate',
        instructions: 'Set the cable low and pull across the front of your body. Lead with your elbow, raise to shoulder height, and lower slowly.',
      },
      {
        name: 'Bayesian Curl', muscleGroup: 'Biceps',
        sets: 2, repsMin: 10, reps: 12, weight: 0,
        effort: 'failure', restSec: 90, inc: 1,
        note: 'Calibrate weight — face away from cable',
        instructions: 'Stand facing away from the cable with your arm trailing behind you. Keep your elbow back throughout to maintain the full stretch on the bicep.',
      },
      {
        name: 'Cable Overhead Tricep Extension', muscleGroup: 'Triceps',
        sets: 2, repsMin: 10, reps: 12, weight: 0,
        effort: 'failure', restSec: 90, inc: 1,
        note: 'Calibrate weight — face away from cable',
        instructions: 'Face away from the cable with your elbows beside your head. Let your hands drop fully behind your head before extending — full stretch at the bottom.',
      },
    ],
  },
  {
    id: 'day2',
    name: 'Lift B',
    subtitle: 'Medium',
    day: 'Wed',
    color: '#a855f7',
    duration: 55,
    warmupNote: 'First lift: 2 sets — 40%×6–10, 65%×4–8. Other compounds: 1 set at ~60%.',
    exercises: [
      {
        name: 'Barbell Bulgarian Split Squat', muscleGroup: 'Quads / Glutes',
        sets: 3, repsMin: 8, reps: 10, weight: 50,
        effort: '1short', restSec: 165, inc: 2.5,
        note: 'Each leg — start with weaker leg',
        warmupSets: [
          { pct: 0.40, label: '40%', lo: 6, hi: 10 },
          { pct: 0.65, label: '65%', lo: 4, hi: 8  },
        ],
        instructions: 'Lean slightly forward and lower your back knee almost to the floor. Drive back up through the front heel.',
      },
      {
        name: 'Seated Cable Row', muscleGroup: 'Back / Biceps',
        sets: 3, repsMin: 8, reps: 12, weight: 55,
        effort: 'failure', effortNote: 'last set only', restSec: 120, inc: 5,
        note: 'Pin 11 (55kg)',
        instructions: 'Let your shoulders reach forward for the stretch, then pull your elbows back past your ribs. Keep your chest up and never lean back.',
      },
      {
        name: 'Cable Fly', muscleGroup: 'Chest',
        sets: 3, repsMin: 10, reps: 15, weight: 10,
        effort: 'failure', restSec: 90, inc: 1,
        note: '10kg per side — pin 2',
        instructions: 'Keep a fixed, slight bend in your elbows. Get a deep stretch at the bottom, then bring your hands together in an arc as if hugging a tree.',
      },
      {
        name: 'Seated Leg Curl', muscleGroup: 'Hamstrings',
        sets: 3, repsMin: 10, reps: 15, weight: 40,
        effort: 'pastfailure', effortNote: 'set 1 only', restSec: 90, inc: 2.5,
        instructions: 'Lean your torso slightly forward to stretch the hamstrings more. Control the weight on the way back up — no jerking.',
      },
      {
        name: 'Cable Lateral Raise', muscleGroup: 'Shoulders',
        sets: 3, repsMin: 12, reps: 15, weight: 5,
        effort: 'pastfailure', effortNote: 'set 1 only', restSec: 90, inc: 1,
        note: 'Same weight as Monday',
        instructions: 'Set the cable low and pull across the front of your body. Lead with your elbow, raise to shoulder height, and lower slowly.',
      },
      {
        name: 'Cable Crunch', muscleGroup: 'Core',
        sets: 3, repsMin: 10, reps: 15, weight: 25,
        effort: 'failure', restSec: 90, inc: 2.5,
        note: 'Pin 5 (25kg) — rope beside head',
        instructions: 'Keep your hips completely still. Hold the rope beside your head and curl your ribs down toward your pelvis — this is a spinal flexion, not a hip hinge.',
      },
    ],
  },
  {
    id: 'day3',
    name: 'Lift C',
    subtitle: 'Higher Reps',
    day: 'Fri',
    color: '#22c55e',
    duration: 56,
    warmupNote: 'First lift: 2 sets — 40%×6–10, 65%×4–8. Other compounds: 1 set at ~60%.',
    exercises: [
      {
        name: 'Incline Barbell Bench', muscleGroup: 'Chest / Shoulders',
        sets: 3, repsMin: 8, reps: 10, weight: 57.5,
        effort: '1short', restSec: 180, inc: 2.5,
        note: 'Use safety pins',
        warmupSets: [
          { pct: 0.40, label: '40%', lo: 6, hi: 10 },
          { pct: 0.65, label: '65%', lo: 4, hi: 8  },
        ],
        instructions: 'Lower the bar to your upper chest — not your neck. Safety pins set just below chest height.',
      },
      {
        name: 'Assisted Pull-up', muscleGroup: 'Back / Biceps',
        sets: 3, repsMin: 8, reps: 12, weight: 0,
        effort: 'failure', effortNote: 'last set only', restSec: 150, inc: 0,
        note: 'Log assistance level — reduce 1 step when you hit 3×12',
        instructions: 'Hang with arms fully straight at the bottom and pull your chest toward the bar. Full hang at the bottom every rep.',
      },
      {
        name: 'Hack Squat', muscleGroup: 'Quads / Glutes',
        sets: 3, repsMin: 10, reps: 15, weight: 60,
        effort: 'failure', effortNote: 'last set only', restSec: 165, inc: 5,
        note: '~60kg plates (not including sled)',
        instructions: 'Feet shoulder-width in the middle of the platform. Go as deep as you can with your back flat on the pad.',
      },
      {
        name: 'Seated Leg Curl', muscleGroup: 'Hamstrings',
        sets: 2, repsMin: 10, reps: 15, weight: 40,
        effort: 'pastfailure', effortNote: 'set 1 only', restSec: 90, inc: 2.5,
        note: 'Same weight as Wednesday',
        instructions: 'Lean your torso slightly forward to stretch the hamstrings more. Control the weight on the way back up.',
      },
      {
        name: 'Face Pull', muscleGroup: 'Rear Delts',
        sets: 2, repsMin: 12, reps: 15, weight: 20,
        effort: 'failure', restSec: 90, inc: 1,
        note: '~20kg — calibrate',
        instructions: 'Set the rope at face height. Pull toward your forehead with your elbows high and wide, rotating your hands back at the end of the movement.',
      },
      {
        name: 'Cable Lateral Raise', muscleGroup: 'Shoulders',
        sets: 2, repsMin: 12, reps: 15, weight: 5,
        effort: 'failure', restSec: 90, inc: 1,
        note: 'Same weight as Monday',
        instructions: 'Set the cable low and pull across the front of your body. Lead with your elbow, raise to shoulder height, and lower slowly.',
      },
      {
        name: 'Hanging Leg Raise', muscleGroup: 'Core',
        sets: 3, repsMin: null, reps: null, weight: 0,
        effort: null, restSec: 90, inc: 0,
        note: 'Max reps — bodyweight',
        instructions: 'Curl your pelvis up at the top — no swinging. Progress: bent knees → straight legs (L-sit) → hanging pike. Move up when you hit 3×12.',
      },
    ],
  },
]

// ── Warmup — Huberman Protocol 2 (p.164) ─────────────────────
// 5-min whole-body activation before the first warm-up set.
// Goal: raise core temp, prime adrenaline/norepinephrine circuits.
export const WARMUP_ACTIVATION = [
  { id: 'bike',    label: '🚴 Stationary bike',         sub: 'Easy pace — preferred by Huberman' },
  { id: 'tread',   label: '🚶 Treadmill brisk walk',     sub: 'Incline optional — easy to do in the gym' },
  { id: 'starrett',label: '🏃 Starrett bodyweight circuit', sub: '25 air squats → 5 lunges/side → jog 1 min · repeat' },
  { id: 'other',   label: '⚡ Jumping jacks / elliptical / stair climber', sub: 'Any full-body movement that builds a sweat' },
]

// Exercise-specific warm-up sets (Huberman p.165).
// These percentages are of your FIRST WORK SET weight — not 1RM.
// Already encoded per-exercise via warmupSets[] in PLANS above.
// Shown here as a reference note used in the UI header.
export const WARMUP_SETS_NOTE =
  'Warm-up sets: 40%×6–10 → 65%×4–8 → (heavy only) 75%×2–4. Rest 1–2 min between warm-up sets.'

// ── Cooldown — Huberman Protocol 4 (p.202–208) ───────────────
// 4 targeted mobility moves, ~10 min total, 2–4× per week.
// Targets: hips, thoracic spine, shoulders, posterior chain.
export const MOBILITY_MOVES = [
  {
    id: 'sumo-twist',
    name: 'Deep Sumo Squat + Torso Twist',
    duration: '~2 min',
    desc: 'Hips · inner thighs · thoracic spine · neck. Reveals left/right asymmetries.',
    steps: [
      'Feet slightly wider than shoulders — squat as deep as you can',
      'Elbows on inside of knees, palms together in prayer — push knees out for hip stretch',
      'Raise one arm overhead, index finger pointing straight up — let your gaze follow it and twist your torso',
      'Hold 3–10 s · inhale and exhale · switch sides',
      '3 reps each side — stand to reset between reps if needed',
    ],
    sets: '3× each side',
    hold: '3–10 s',
  },
  {
    id: 'hip-flexor',
    name: 'Hip Flexor Lunge Stretch',
    duration: '~3 min',
    desc: 'Counteracts constant hip flexion from sitting and lifting. "Get your knee behind your glutes."',
    steps: [
      'Standing: one foot forward, rear leg straight — lean back slightly until you feel the rear hip flexor stretch',
      '3× each side · hold 10–30 s',
      'Kneeling: front knee up, rear shin on floor sole-up — push hips forward gently',
      '3–4× each side · hold 10–30 s',
      'Reach overhead while holding to deepen the stretch',
    ],
    sets: '3–4× each side',
    hold: '10–30 s',
  },
  {
    id: 'rev-tabletop',
    name: 'Reverse Tabletop + Shoulder Extension',
    duration: '~2 min',
    desc: 'Shoulder extension range and wrist mobility. Great counter to bench press tightness.',
    steps: [
      'Sit on floor, knees bent, hands beside hips fingers pointing away — push pelvis up until legs and torso are parallel to floor',
      'Hold 10 s · 3 sets',
      'Progress: hands behind hips fingers pointing backward, same tabletop position',
      'Advanced: legs straight, scoot glutes forward until you feel stretch in biceps and front of shoulders',
      'Work through progressions over weeks — do not rush the advanced variation',
    ],
    sets: '3 sets',
    hold: '10 s',
  },
  {
    id: 'founder',
    name: 'Founder Pose',
    duration: '~2 min',
    desc: 'Posterior chain integrator — hamstrings, glutes, lower back, thoracic spine. Decompresses spine. (Eric Goodman via Huberman)',
    steps: [
      'Feet slightly wider than shoulders, toes slightly out — stand as tall as possible, heels pressing down',
      'Hinge hips back and slightly down (about ⅓ of a squat) — feel stretch in hamstrings and lower back',
      'Raise chest, thumbs rotated outward (external rotation), arms at sides',
      'Slowly lift arms with thumbs still out until you feel more lower-back stretch',
      'Hold 5 s — stand up straight · repeat 1–2 times',
    ],
    sets: '1–2 reps',
    hold: '5 s at top',
  },
]

// ── Cardio sessions (for day-detail view) ────────────────────
export const CARDIO_SESSIONS = {
  'cardio-zone2': {
    label: 'Zone 2 Cardio',
    day: 'Tuesday',
    icon: '🚶',
    meta: '45–75 min · Low intensity · Long duration',
    color: '#60a5fa',
    details: [
      'Duration: 45–75 min at an easy conversational pace — you should be able to speak full sentences',
      'Target: ~60–70% max HR (Zone 2)',
      'Options: treadmill walk (incline), outdoor walk/jog, stationary bike, elliptical, swim',
      'Huberman tip: walking after meals counts toward daily 7,000+ step target',
      'Done the day after Lift A — legs are still fresh enough for low-intensity work',
    ],
  },
  'cardio-hiit': {
    label: 'HIIT / Sprint Session',
    day: 'Saturday',
    icon: '🏃',
    meta: '20–25 min total · High intensity · Brief',
    color: '#f87171',
    details: [
      'Warm up: 5–10 min easy pace before ramping up',
      'Work intervals: 30 s all-out effort → 60 s rest/easy · 6–12 rounds',
      'Target: 90–95% max HR during work periods',
      'Options: assault bike, sprint track, rowing machine, pool',
      'Huberman note: produces large adrenaline/norepinephrine surge — expect to feel energised 5–10 min after finishing',
      'Total work time: 6–17 min (brief but effective for VO2 max)',
    ],
  },
  'cardio-mod': {
    label: 'Moderate Cardio',
    day: 'Sunday',
    icon: '🚴',
    meta: '25–30 min work · 75–85% max HR',
    color: '#a78bfa',
    details: [
      'Warm up: 5 min easy movement before the main effort',
      'Main effort: 25–30 min sustaining 75–85% max HR (Zone 3–4)',
      'Not a sprint — breathing hard but able to hold the pace throughout',
      'Options: bike, treadmill, swim, row — mix of high and low within the HR range is fine',
      'Leaves you energised and focused for many hours afterward',
    ],
  },
}

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
// Phase 1 — Build (19 Aug 2026 → 15 Feb 2027): 2650–2750 kcal · 165–170g protein
// Phase 2 — Cut  (15 Feb 2027 → 1 May 2027):   2300 kcal · 230g protein
export const DAILY_TARGETS = { kcal: 2700, protein: 168 }

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
  // ── Active plan exercises ──────────────────────────────────────
  'Romanian Deadlift':               { weight: 90,   reps: 8,  date: '2026-09-30' },
  'Barbell Bench Press':             { weight: 75,   reps: 8,  date: '2026-10-02' },
  'Iso Lat Pulldown':                { weight: 35,   reps: 10, date: '2026-09-30' },
  'Leg Press':                       { weight: 105,  reps: 12, date: '2026-10-02' },
  'Cable Lateral Raise':             { weight: 5,    reps: 15, date: '2026-09-30' },
  'Bayesian Curl':                   { weight: 0,    reps: 12, date: '2026-10-02' },
  'Cable Overhead Tricep Extension': { weight: 0,    reps: 12, date: '2026-10-02' },
  'Barbell Bulgarian Split Squat':   { weight: 50,   reps: 10, date: '2026-09-30' },
  'Seated Cable Row':                { weight: 55,   reps: 12, date: '2026-09-30' },
  'Cable Fly':                       { weight: 10,   reps: 15, date: '2026-09-30' },
  'Seated Leg Curl':                 { weight: 40,   reps: 15, date: '2026-09-30' },
  'Cable Crunch':                    { weight: 25,   reps: 15, date: '2026-09-30' },
  'Incline Barbell Bench':           { weight: 57.5, reps: 10, date: '2026-09-30' },
  'Assisted Pull-up':                { weight: 0,    reps: 12, date: '2026-09-30' },
  'Hack Squat':                      { weight: 60,   reps: 12, date: '2026-09-30' },
  'Face Pull':                       { weight: 20,   reps: 15, date: '2026-10-02' },
  'Hanging Leg Raise':               { weight: 0,    reps: 15, date: '2026-09-30' },
  // ── Historical PRs (not in current plan) ──────────────────────
  'Barbell Back Squat':           { weight: 95,   reps: 5,  date: '2026-08-19' },
  'Trap Bar Deadlift':            { weight: 108,  reps: 5,  date: '2026-08-19' },
  'Barbell Overhead Press':       { weight: 40,   reps: 6,  date: '2026-08-19' },
  'Single-Leg RDL':               { weight: 20,   reps: 10, date: '2026-08-19' },
  'Barbell Bent-Over Row':        { weight: 60,   reps: 8,  date: '2026-08-19' },
  'Dumbbell Curl':                { weight: 10,   reps: 8,  date: '2026-08-19' },
  'Hammer Curl':                  { weight: 15,   reps: 12, date: '2026-08-19' },
  'Dumbbell Shoulder Press':      { weight: 24,   reps: 8,  date: '2026-08-19' },
  'Incline Dumbbell Press':       { weight: 32,   reps: 8,  date: '2026-08-19' },
  'T-Bar Row':                    { weight: 25,   reps: 8,  date: '2026-08-19' },
}

// ── Seed: Workout History ─────────────────────────────────────
// Empty — history is persisted in localStorage and built up from real workouts
export const INIT_HISTORY = []
