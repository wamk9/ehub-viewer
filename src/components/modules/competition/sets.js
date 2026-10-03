// Set sports (volleyball, tennis, padel…): the "Partidas em" field of the event
// ('sets-to-win': '1' single set, '2' best of 3, '3' best of 5) turns score
// inputs into a set-by-set dialog. 0 = the sport isn't played in sets.
const MAX = { 1: 1, 2: 3, 3: 5 }

export function maxSetsOf(event) {
  return MAX[event?.event_data?.['sets-to-win']] || 0
}

// [[25, 21], [19, 25]] → { a: 1, b: 1 }
export function setsWon(sets) {
  const won = { a: 0, b: 0 }
  ;(sets || []).forEach(([x, y]) => {
    if (x !== y) won[x > y ? 'a' : 'b']++
  })
  return won
}
