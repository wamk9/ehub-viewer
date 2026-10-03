// Names and states shared by the bracket, the group games and the public stage cards.

/** Bracket round name counted from the end: Final, Semifinal, Quartas… */
export function bracketRoundName(t, round, totalRounds) {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return t('competition.bracket.final');
  if (fromEnd === 1) return t('competition.bracket.semi');
  if (fromEnd === 2) return t('competition.bracket.quarter');
  if (fromEnd === 3) return t('competition.bracket.r16');
  return t('competition.bracket.round', { n: round });
}

/** Number of bracket rounds in a list of matches. */
export function bracketRounds(matches) {
  return new Set((matches || []).filter((m) => m.kind === 'bracket').map((m) => m.round)).size;
}

/** "Grupo A · Rodada 2", "Semifinal", "Disputa de 3º lugar"… */
export function matchPhase(t, match, totalRounds) {
  if (match.kind === 'group') return t('stages.group_round', { g: match.group_key, n: match.round });
  if (match.round === totalRounds && match.slot === 2) return t('competition.bracket.third_place');
  return bracketRoundName(t, match.round, totalRounds);
}

/** done | live | scheduled for a stage (public vocabulary). */
export function stagePublicState(stage) {
  if (stage.finished) return 'done';
  if (stage.initialized || stage.in_progress) return 'live';
  return 'scheduled';
}

/** done | live | scheduled for a session (round) of a stage. */
export function roundPublicState(round) {
  if (round.finished) return 'done';
  if (round.in_progress) return 'live';
  return 'scheduled';
}

/** done | live | scheduled | bye for a match. */
export function matchPublicState(match) {
  if (match.status === 'done') return 'done';
  if (match.status === 'bye') return 'bye';
  if (match.status === 'live') return 'live';
  return 'scheduled';
}

/** Display name of a match side. */
export function sideName(t, side) {
  return side ? (side.name || side.username || t('events.show.removed_participant')) : t('competition.bracket.tbd');
}
