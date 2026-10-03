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
  // Sports catalog (generated from sports_catalog.py)
  "football": { grad: ['#15803d', '#4ade80'], icon: 'futbol' },
  "futsal": { grad: ['#166534', '#22c55e'], icon: 'futbol' },
  "volleyball": { grad: ['#ca8a04', '#fde047'], icon: 'volleyball' },
  "beach-volleyball": { grad: ['#d97706', '#fcd34d'], icon: 'volleyball' },
  "basketball": { grad: ['#c2410c', '#fb923c'], icon: 'basketball' },
  "handball": { grad: ['#0369a1', '#7dd3fc'], icon: 'hand' },
  "tennis": { grad: ['#65a30d', '#bef264'], icon: 'baseball' },
  "beach-tennis": { grad: ['#ea580c', '#fdba74'], icon: 'table-tennis-paddle-ball' },
  "padel": { grad: ['#0f766e', '#5eead4'], icon: 'table-tennis-paddle-ball' },
  "table-tennis": { grad: ['#be123c', '#fda4af'], icon: 'table-tennis-paddle-ball' },
  "martial-arts": { grad: ['#7f1d1d', '#f87171'], icon: 'hand-fist' },
  "surf": { grad: ['#0369a1', '#67e8f9'], icon: 'water' },
  "skateboarding": { grad: ['#3f3f46', '#a1a1aa'], icon: 'person-skating' },
  "other-sports": { grad: ['#0098D8', '#00d4ff'], icon: 'medal' },
  "rugby": { grad: ['#14532d', '#86efac'], icon: 'football' },
  "american-football": { grad: ['#7c2d12', '#fdba74'], icon: 'football' },
  "baseball": { grad: ['#1e3a8a', '#93c5fd'], icon: 'baseball-bat-ball' },
  "softball": { grad: ['#9d174d', '#f9a8d4'], icon: 'baseball-bat-ball' },
  "cricket": { grad: ['#365314', '#bef264'], icon: 'baseball-bat-ball' },
  "field-hockey": { grad: ['#047857', '#6ee7b7'], icon: 'hockey-puck' },
  "ice-hockey": { grad: ['#0c4a6e', '#bae6fd'], icon: 'hockey-puck' },
  "roller-hockey": { grad: ['#4338ca', '#a5b4fc'], icon: 'hockey-puck' },
  "water-polo": { grad: ['#0e7490', '#67e8f9'], icon: 'person-swimming' },
  "footvolley": { grad: ['#b45309', '#fcd34d'], icon: 'volleyball' },
  "beach-soccer": { grad: ['#c2410c', '#fde68a'], icon: 'futbol' },
  "ultimate-frisbee": { grad: ['#6d28d9', '#c4b5fd'], icon: 'compact-disc' },
  "dodgeball": { grad: ['#b91c1c', '#fca5a5'], icon: 'circle' },
  "netball": { grad: ['#a21caf', '#f0abfc'], icon: 'basketball' },
  "badminton": { grad: ['#0891b2', '#a5f3fc'], icon: 'table-tennis-paddle-ball' },
  "squash": { grad: ['#4d7c0f', '#d9f99d'], icon: 'table-tennis-paddle-ball' },
  "pickleball": { grad: ['#15803d', '#bbf7d0'], icon: 'table-tennis-paddle-ball' },
  "golf": { grad: ['#166534', '#86efac'], icon: 'golf-ball-tee' },
  "bowling": { grad: ['#1e293b', '#94a3b8'], icon: 'bowling-ball' },
  "billiards": { grad: ['#065f46', '#34d399'], icon: 'circle-dot' },
  "darts": { grad: ['#991b1b', '#fca5a5'], icon: 'bullseye' },
  "bocce": { grad: ['#92400e', '#fcd34d'], icon: 'circle' },
  "shooting": { grad: ['#374151', '#9ca3af'], icon: 'crosshairs' },
  "fishing": { grad: ['#075985', '#7dd3fc'], icon: 'fish' },
  "fencing": { grad: ['#334155', '#cbd5e1'], icon: 'khanda' },
  "athletics": { grad: ['#b91c1c', '#fda4af'], icon: 'person-running' },
  "canoeing": { grad: ['#0369a1', '#38bdf8'], icon: 'water' },
  "sailing": { grad: ['#1d4ed8', '#bfdbfe'], icon: 'sailboat' },
  "climbing": { grad: ['#78350f', '#fcd34d'], icon: 'mountain' },
  "orienteering": { grad: ['#15803d', '#fde047'], icon: 'compass' },
  "adventure-racing": { grad: ['#9a3412', '#fdba74'], icon: 'mountain-sun' },
  "obstacle-racing": { grad: ['#7c2d12', '#fb923c'], icon: 'person-running' },
  "equestrian": { grad: ['#78350f', '#d6a77a'], icon: 'horse' },
  "weightlifting": { grad: ['#3f3f46', '#d4d4d8'], icon: 'dumbbell' },
  "gymnastics": { grad: ['#be185d', '#fbcfe8'], icon: 'person-walking' },
  "calisthenics": { grad: ['#1f2937', '#9ca3af'], icon: 'person' },
  "bodybuilding": { grad: ['#7c2d12', '#fdba74'], icon: 'dumbbell' },
  "roller-skating": { grad: ['#7e22ce', '#e9d5ff'], icon: 'person-skating' },
  "dance-sport": { grad: ['#c026d3', '#f5d0fe'], icon: 'music' },
  "airsoft-paintball": { grad: ['#3f6212', '#bef264'], icon: 'crosshairs' },
  "checkers": { grad: ['#7f1d1d', '#fecaca'], icon: 'chess-board' },
  "poker": { grad: ['#14532d', '#4ade80'], icon: 'diamond' },
  "card-games": { grad: ['#9a3412', '#fed7aa'], icon: 'diamond' },
  "tcg": { grad: ['#5b21b6', '#ddd6fe'], icon: 'layer-group' },
  "board-games": { grad: ['#0f766e', '#99f6e4'], icon: 'dice' },
  "speedcubing": { grad: ['#dc2626', '#fde047'], icon: 'cube' },
  "esports-battle-royale": { grad: ['#b45309', '#fde047'], icon: 'parachute-box' },
  "esports-card": { grad: ['#7c3aed', '#c4b5fd'], icon: 'layer-group' },
  "other-esports": { grad: ['#2563eb', '#93c5fd'], icon: 'gamepad' },
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
