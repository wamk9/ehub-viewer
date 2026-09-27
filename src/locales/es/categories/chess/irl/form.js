// Labels for the event form schema (v2) of this category/runmode.
export default {
  "time-control": {
    title: "Ritmo de juego",
    description: "Tiempo, incremento y sistema de emparejamiento.",
  },
  format: {
    label: "Modalidad",
    values: {
      classical: "Clásico",
      rapid: "Rápido",
      blitz: "Blitz",
      bullet: "Bullet",
      other: "Otro",
      "no-option": "Selecciona",
    },
  },
  "time-minutes": {
    label: "Tiempo por jugador (min)",
  },
  "increment-seconds": {
    label: "Incremento por jugada (s)",
  },
  "total-rounds": {
    label: "Número de rondas",
  },
  pairing: {
    label: "Emparejamiento",
    values: {
      swiss: "Suizo",
      "round-robin": "Todos contra todos",
      knockout: "Eliminatorio",
      arena: "Arena",
      "no-option": "Selecciona",
    },
  },
  rated: {
    label: "Cuenta para el rating",
    checked: "Sí",
    unchecked: "No",
  },
  venue: {
    title: "Sede",
    description: "Dónde y cómo se juegan las partidas.",
  },
  livestream: {
    label: "Transmisión en vivo",
    checked: "Sí",
    unchecked: "No",
  },
  location: {
    label: "Ubicación",
  },
  "bring-own-board": {
    label: "Jugadores traen tablero y reloj",
    checked: "Sí",
    unchecked: "No",
  },
};
