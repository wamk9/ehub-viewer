const CAT_CONFIG = {
  simracing:          { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  racingcars:         { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  rally:              { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  'esports-fps':      { grad: ['#e23b3b', '#ff8a3b'], icon: 'crosshairs' },
  'esports-moba':     { grad: ['#7C3AED', '#b06bff'], icon: 'dragon' },
  'esports-fighting': { grad: ['#d6336c', '#ff6b9d'], icon: 'hand-fist' },
  'esports-strategy': { grad: ['#1a6e4f', '#51cf66'], icon: 'chess-pawn' },
  'esports-sports':   { grad: ['#2563eb', '#60a5fa'], icon: 'futbol' },
  motorsport:         { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  motorbike:          { grad: ['#dc4f00', '#ff8a3b'], icon: 'motorcycle' },
  cycling:            { grad: ['#1971c2', '#4dabf7'], icon: 'bicycle' },
  running:            { grad: ['#1f8a5b', '#51cf66'], icon: 'person-running' },
  swimming:           { grad: ['#0284c7', '#38bdf8'], icon: 'person-swimming' },
  triathlon:          { grad: ['#7C3AED', '#c084fc'], icon: 'trophy' },
  hiking:             { grad: ['#4d7c0f', '#a3e635'], icon: 'mountain-sun' },
  crossfit:           { grad: ['#9a3412', '#fb923c'], icon: 'dumbbell' },
  rowing:             { grad: ['#1d4ed8', '#93c5fd'], icon: 'water' },
  archery:            { grad: ['#92400e', '#fbbf24'], icon: 'bullseye' },
  chess:              { grad: ['#495057', '#868e96'], icon: 'chess-knight' },
  'drone-racing':     { grad: ['#0e7490', '#22d3ee'], icon: 'helicopter' },
  // Ball, racket and combat sports
  football:           { grad: ['#15803d', '#4ade80'], icon: 'futbol' },
  futsal:             { grad: ['#166534', '#22c55e'], icon: 'futbol' },
  volleyball:         { grad: ['#ca8a04', '#fde047'], icon: 'volleyball' },
  'beach-volleyball': { grad: ['#d97706', '#fcd34d'], icon: 'volleyball' },
  basketball:         { grad: ['#c2410c', '#fb923c'], icon: 'basketball' },
  handball:           { grad: ['#0369a1', '#7dd3fc'], icon: 'hand' },
  tennis:             { grad: ['#65a30d', '#bef264'], icon: 'baseball' },
  'beach-tennis':     { grad: ['#ea580c', '#fdba74'], icon: 'table-tennis-paddle-ball' },
  padel:              { grad: ['#0f766e', '#5eead4'], icon: 'table-tennis-paddle-ball' },
  'table-tennis':     { grad: ['#be123c', '#fda4af'], icon: 'table-tennis-paddle-ball' },
  'martial-arts':     { grad: ['#7f1d1d', '#f87171'], icon: 'hand-fist' },
  surf:               { grad: ['#0369a1', '#67e8f9'], icon: 'water' },
  skateboarding:      { grad: ['#3f3f46', '#a1a1aa'], icon: 'person-skating' },
  'other-sports':     { grad: ['#0098D8', '#00d4ff'], icon: 'medal' },
}

const DEFAULT_CONFIG = { grad: ['#0098D8', '#00d4ff'], icon: 'trophy' }

// Cover-picker swatches (wizard). Saved events keep the swatch *index*, so this list
// is frozen to the original categories: new categories must not shift it.
const SWATCH_CATEGORIES = ['simracing', 'racingcars', 'rally', 'esports-fps', 'esports-moba', 'esports-fighting',
  'esports-strategy', 'esports-sports', 'motorsport', 'motorbike', 'cycling', 'running', 'swimming', 'triathlon',
  'hiking', 'crossfit', 'rowing', 'archery', 'chess', 'drone-racing']
const GRADIENT_SWATCHES = SWATCH_CATEGORIES
  .map(k => CAT_CONFIG[k].grad)
  .filter((grad, i, arr) => arr.findIndex(g => g[0] === grad[0] && g[1] === grad[1]) === i)

export function categoryConfig(categoryRoute) {
  return CAT_CONFIG[categoryRoute] ?? DEFAULT_CONFIG
}

export function categoryIcon(categoryRoute) {
  return categoryConfig(categoryRoute).icon
}

export function categoryGradient(categoryRoute) {
  const [from, to] = categoryConfig(categoryRoute).grad
  return `linear-gradient(135deg, ${from}, ${to})`
}

export function gradientByIndex(index) {
  const grad = GRADIENT_SWATCHES[index] ?? GRADIENT_SWATCHES[0]
  return `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`
}

export { CAT_CONFIG, GRADIENT_SWATCHES }
