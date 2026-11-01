// Mock data for screens not yet backed by the database (Progress, Classes, Profile extras, quotes).

export const user = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  initials: 'AR',
  handle: '@alexlifts',
  membership: 'Elite',
  memberSince: 'March 2024',
  homeGym: 'PulseFit Downtown',
  level: 14,
  xp: 7420,
  xpNext: 9000,
  streak: 12,
  bestStreak: 21,
  totals: { workouts: 186, hours: 142, prs: 23 },
  // Mon..Sun of the current week: true = trained
  weekDone: [true, true, false, true, true, false, false],
}

export const strengthHistory = [
  { week: 'W1', bench: 72.5, squat: 100, deadlift: 130 },
  { week: 'W2', bench: 75, squat: 102.5, deadlift: 135 },
  { week: 'W3', bench: 75, squat: 105, deadlift: 137.5 },
  { week: 'W4', bench: 77.5, squat: 107.5, deadlift: 140 },
  { week: 'W5', bench: 77.5, squat: 110, deadlift: 145 },
  { week: 'W6', bench: 80, squat: 112.5, deadlift: 147.5 },
  { week: 'W7', bench: 80, squat: 115, deadlift: 150 },
  { week: 'W8', bench: 82.5, squat: 117.5, deadlift: 155 },
  { week: 'W9', bench: 82.5, squat: 120, deadlift: 157.5 },
  { week: 'W10', bench: 85, squat: 122.5, deadlift: 160 },
  { week: 'W11', bench: 87.5, squat: 125, deadlift: 165 },
  { week: 'W12', bench: 90, squat: 130, deadlift: 170 },
]

export const lifts = [
  { key: 'bench', label: 'Bench Press', color: '#C8FF2E' },
  { key: 'squat', label: 'Back Squat', color: '#22E4F2' },
  { key: 'deadlift', label: 'Deadlift', color: '#FF7A2F' },
]

export const personalRecords = [
  { lift: 'Deadlift', value: 170, unit: 'kg', date: 'Oct 22', delta: '+5 kg', isNew: true, tier: 'gold' },
  { lift: 'Back Squat', value: 130, unit: 'kg', date: 'Oct 20', delta: '+5 kg', isNew: true, tier: 'gold' },
  { lift: 'Bench Press', value: 90, unit: 'kg', date: 'Oct 18', delta: '+2.5 kg', isNew: false, tier: 'silver' },
  { lift: '5K Run', value: '22:41', unit: '', date: 'Sep 30', delta: '−48 s', isNew: false, tier: 'silver' },
  { lift: 'Pull-Ups', value: 18, unit: 'reps', date: 'Sep 14', delta: '+3 reps', isNew: false, tier: 'bronze' },
  { lift: 'Plank', value: '3:30', unit: '', date: 'Aug 29', delta: '+40 s', isNew: false, tier: 'bronze' },
]

export const progressSummary = [
  { label: 'Total volume', value: 48.6, decimals: 1, suffix: 't' },
  { label: 'Workouts', value: 38, suffix: '' },
  { label: 'Avg session', value: 52, suffix: ' min' },
  { label: 'PRs this month', value: 3, suffix: '' },
]

export const classTypes = ['Yoga', 'HIIT', 'Spin', 'Boxing']

const coaches = {
  Yoga: ['Maya Chen', 'Leo Okafor'],
  HIIT: ['Jordan Blake', 'Sam Ortiz'],
  Spin: ['Priya Nair', 'Kai Mendes'],
  Boxing: ['Dre Walker', 'Nina Petrov'],
}

const classTemplates = [
  { name: 'Sunrise Flow', type: 'Yoga', time: '06:30', duration: 50, intensity: 'Low', room: 'Studio Zen' },
  { name: 'Burn 45', type: 'HIIT', time: '07:15', duration: 45, intensity: 'High', room: 'Floor A' },
  { name: 'Rhythm Ride', type: 'Spin', time: '12:00', duration: 45, intensity: 'Medium', room: 'Cycle Lab' },
  { name: 'Fight Club', type: 'Boxing', time: '17:30', duration: 60, intensity: 'High', room: 'The Ring' },
  { name: 'Power Vinyasa', type: 'Yoga', time: '18:30', duration: 60, intensity: 'Medium', room: 'Studio Zen' },
  { name: 'Climb & Sprint', type: 'Spin', time: '19:15', duration: 40, intensity: 'High', room: 'Cycle Lab' },
  { name: 'Tabata Torch', type: 'HIIT', time: '20:00', duration: 30, intensity: 'High', room: 'Floor A' },
]

// Deterministic pseudo-random so the schedule looks the same on every reload
const seeded = (n) => {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classSchedule = weekDays.flatMap((day, d) =>
  classTemplates
    // Weekends are lighter: skip a few sessions
    .filter((_, i) => !(d >= 5 && (i === 2 || i === 6)) && !(d === 6 && i === 3))
    .map((c, i) => {
      const capacity = c.type === 'Spin' ? 24 : 20
      const r = seeded(d * 10 + i)
      const spotsLeft = r < 0.12 ? 0 : Math.max(1, Math.round(r * capacity * 0.8))
      return {
        id: `${day}-${i}`,
        day,
        ...c,
        coach: coaches[c.type][(d + i) % 2],
        capacity,
        spotsLeft,
      }
    })
)

export const achievements = [
  { id: 'first', name: 'First Rep', desc: 'Complete your first workout', icon: 'Dumbbell', unlocked: true, color: '#C8FF2E' },
  { id: 'streak7', name: 'On Fire', desc: '7-day training streak', icon: 'Flame', unlocked: true, color: '#FF7A2F' },
  { id: 'early', name: 'Early Bird', desc: '10 workouts before 7 AM', icon: 'Sunrise', unlocked: true, color: '#FFD23F' },
  { id: 'pr', name: 'Record Breaker', desc: 'Set 20 personal records', icon: 'Trophy', unlocked: true, color: '#22E4F2' },
  { id: 'classes', name: 'Class Act', desc: 'Attend 25 group classes', icon: 'Users', unlocked: true, color: '#B48CFF' },
  { id: 'century', name: 'Centurion', desc: 'Log 100 workouts', icon: 'Medal', unlocked: true, color: '#C8FF2E' },
  { id: 'streak30', name: 'Unstoppable', desc: '30-day training streak', icon: 'Zap', unlocked: false, progress: 12, goal: 30, color: '#FF7A2F' },
  { id: 'ton', name: 'Iron Ton', desc: 'Lift 100 tonnes total', icon: 'Weight', unlocked: false, progress: 48.6, goal: 100, color: '#22E4F2' },
  { id: 'marathon', name: 'Cardio King', desc: '1,000 cardio minutes', icon: 'HeartPulse', unlocked: false, progress: 640, goal: 1000, color: '#FF4F8B' },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Augusta F. Kantra' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'Success usually comes to those who are too busy to be looking for it.', author: 'Henry David Thoreau' },
  { text: 'It never gets easier, you just get stronger.', author: 'Unknown' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
]

export function quoteOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  return quotes[dayOfYear % quotes.length]
}
