// 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const SCHEDULE = {
  0: 'rest',
  1: 'push',   // Monday  + cardio
  2: 'pull',   // Tuesday
  3: 'legs',   // Wednesday
  4: 'push',   // Thursday
  5: 'pull',   // Friday  + cardio
  6: 'legs',   // Saturday
};

export const CARDIO_DAYS = new Set([1, 5]);

export const WORKOUT_LABEL = {
  push: 'Push Day',
  pull: 'Pull Day',
  legs: 'Legs Day',
  rest: 'Rest Day',
};

// Compound lifts that get +5 lbs progressive overload prompt
export const COMPOUND_LIFTS = new Set([
  'Barbell Bench Press',
  'Barbell Back Squat',
  'Pullups',
]);

export const WORKOUTS = {
  push: [
    {
      muscle: 'Chest',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '5', tip: 'Drive feet into floor. Control the descent.' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10', tip: 'Slight arch, elbows ~75° from torso.' },
        { name: 'Cable Chest Fly', sets: 3, reps: '12', tip: 'Squeeze at the peak contraction, slow eccentric.' },
      ],
    },
    {
      muscle: 'Shoulders',
      exercises: [
        { name: 'Overhead Press', sets: 3, reps: '8', tip: 'Brace hard. Press in a slight arc, not straight up.' },
        { name: 'Cable Lateral Raise', sets: 3, reps: '15', tip: 'Lead with elbow, not hand. Pause at top.' },
        { name: 'Front Raise', sets: 2, reps: '15', tip: 'Slight bend in elbow, controlled descent.' },
      ],
    },
    {
      muscle: 'Triceps',
      exercises: [
        { name: 'Tricep Rope Pushdown', sets: 3, reps: '12', tip: 'Spread rope at bottom. Lock out fully.' },
        { name: 'Overhead Tricep Extension', sets: 3, reps: '12', tip: 'Keep elbows narrow. Full ROM overhead.' },
      ],
    },
  ],
  pull: [
    {
      muscle: 'Back',
      exercises: [
        { name: 'Pullups', sets: 4, reps: 'Failure', tip: 'Dead hang start. Pull elbows to hips. Add belt weight when bodyweight is easy.' },
        { name: 'Cable Lat Pulldown', sets: 3, reps: '10', tip: 'Lean back slightly. Elbows to pockets.' },
        { name: 'Barbell Row', sets: 4, reps: '8', tip: 'Hinge at 45°. Drive elbows back, not up.' },
        { name: 'Cable Row (Close Grip)', sets: 3, reps: '12', tip: 'Sit tall. Full stretch, squeeze at row.' },
        { name: 'Face Pulls', sets: 3, reps: '15', tip: 'Pull to face, hands by ears. Targets rear delts.' },
      ],
    },
    {
      muscle: 'Biceps',
      exercises: [
        { name: 'Barbell Curl', sets: 3, reps: '10', tip: 'No momentum. Squeeze at the top.' },
        { name: 'Hammer Curl', sets: 3, reps: '12', tip: 'Neutral grip targets brachialis. Control the drop.' },
      ],
    },
  ],
  legs: [
    {
      muscle: 'Quads',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: '5', tip: 'Break at hips and knees simultaneously. Chest up.' },
        { name: 'Goblet Squat', sets: 3, reps: '15', tip: 'Elbows in, knees tracking toes. Ass to grass.' },
        { name: 'Dumbbell Lunges', sets: 3, reps: '12 each', tip: 'Long stride, knee doesn\'t pass toes.' },
      ],
    },
    {
      muscle: 'Hamstrings',
      exercises: [
        { name: 'Romanian Deadlift', sets: 3, reps: '10', tip: 'Hinge, don\'t squat. Feel the stretch in hamstrings.' },
        { name: 'Nordic Hamstring Curl', sets: 3, reps: '10', tip: 'Lower slowly. Use hands to assist if needed.' },
      ],
    },
    {
      muscle: 'Calves',
      exercises: [
        { name: 'Calf Raises', sets: 4, reps: '15', tip: 'Full ROM — stretch at bottom, full contraction at top.' },
      ],
    },
    {
      muscle: 'Abs',
      exercises: [
        { name: 'Ab Circuit', sets: 3, reps: '15 knee raises + 20 bicycle + 30s plank', isCircuit: true, tip: 'Minimize rest between movements. Brace your core.' },
      ],
    },
  ],
};

export const CARDIO_FINISHER = {
  primary: {
    label: '10 Rounds: Jump Rope / High Knees',
    detail: '40 sec on / 20 sec rest × 10 rounds (~10 min)',
  },
  alt: {
    label: '8 Rounds: Sprint / Walk',
    detail: '30 sec sprint / 60 sec walk × 8 rounds (~12 min)',
  },
};

export const REST_TIPS = [
  "Eat your protein and sleep 8+ hours — this is when the gains happen.",
  "Light walk, stretch, or foam roll. Active recovery beats the couch.",
  "Hydrate extra today. Your joints and muscles will thank you tomorrow.",
  "Plan tomorrow's meals now. Prep wins the week.",
  "Spend 10 minutes on mobility work — hips, shoulders, ankles.",
  "Your body grows on rest days. Don't skip, don't add junk volume.",
  "Visualize your next session. Mental reps count.",
];
