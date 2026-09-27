// Labels for the event form schema (v2) of this category/runmode.
export default {
  "time-control": {
    title: "Ritmo de jogo",
    description: "Tempo, incremento e sistema de emparceiramento.",
  },
  format: {
    label: "Modalidade",
    values: {
      classical: "Clássico",
      rapid: "Rápido",
      blitz: "Blitz",
      bullet: "Bullet",
      other: "Outro",
      "no-option": "Selecione",
    },
  },
  "time-minutes": {
    label: "Tempo por jogador (min)",
  },
  "increment-seconds": {
    label: "Incremento por lance (s)",
  },
  "total-rounds": {
    label: "Número de rodadas",
  },
  pairing: {
    label: "Emparceiramento",
    values: {
      swiss: "Suíço",
      "round-robin": "Todos contra todos",
      knockout: "Eliminatório",
      arena: "Arena",
      "no-option": "Selecione",
    },
  },
  rated: {
    label: "Vale rating",
    checked: "Sim",
    unchecked: "Não",
  },
  venue: {
    title: "Local",
    description: "Onde e como as partidas acontecem.",
  },
  livestream: {
    label: "Transmissão ao vivo",
    checked: "Sim",
    unchecked: "Não",
  },
  platform: {
    label: "Plataforma",
    values: {
      lichess: "Lichess",
      "chess-com": "Chess.com",
      other: "Outro",
      "no-option": "Selecione",
    },
  },
  "anti-cheat-required": {
    label: "Câmera/anticheat obrigatório",
    checked: "Sim",
    unchecked: "Não",
  },
};
