// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Juego y servidor",
    description: "Título, plataforma y región de las partidas.",
    label: "Juego",
    values: {
      cs2: "Counter-Strike 2",
      valorant: "VALORANT",
      "rainbow-six": "Rainbow Six Siege",
      lol: "League of Legends",
      dota2: "Dota 2",
      sf6: "Street Fighter 6",
      tekken8: "TEKKEN 8",
      "mortal-kombat": "Mortal Kombat 1",
      starcraft2: "StarCraft II",
      "age-of-empires": "Age of Empires",
      fc25: "EA Sports FC 25",
      nba2k: "NBA 2K",
      other: "Otro",
      "no-option": "Selecciona",
    },
  },
  platform: {
    label: "Plataforma",
    values: {
      pc: "PC",
      console: "Consola",
      mobile: "Móvil",
      crossplay: "Multiplataforma",
      "no-option": "Selecciona",
    },
  },
  "server-region": {
    label: "Región del servidor",
    values: {
      "south-america": "Sudamérica",
      "north-america": "Norteamérica",
      europe: "Europa",
      asia: "Asia",
      oceania: "Oceanía",
      "no-option": "Selecciona",
    },
  },
  "match-format": {
    title: "Formato de partidas",
    description: "Series, equipos y selección de mapas.",
    label: "Formato de partidas",
    values: {
      bo1: "Mejor de 1",
      bo3: "Mejor de 3",
      bo5: "Mejor de 5",
      bo7: "Mejor de 7",
      "no-option": "Selecciona",
    },
  },
  "final-format": {
    label: "Formato de la final",
    values: {
      bo1: "Mejor de 1",
      bo3: "Mejor de 3",
      bo5: "Mejor de 5",
      bo7: "Mejor de 7",
      "no-option": "Selecciona",
    },
  },
  "team-size": {
    label: "Jugadores por equipo",
  },
  substitutes: {
    label: "Suplentes permitidos",
  },
  "map-pool": {
    label: "Pool de mapas",
  },
  "map-selection": {
    label: "Selección de mapas",
    values: {
      veto: "Picks y bans",
      random: "Aleatoria",
      organizer: "Definida por la organización",
      "no-option": "Selecciona",
    },
  },
  "match-rules": {
    title: "Reglas de partida",
    description: "Check-in, retrasos y requisitos.",
  },
  "check-in-minutes": {
    label: "Check-in antes de la partida (min)",
  },
  "tolerance-minutes": {
    label: "Tolerancia de retraso (min)",
  },
  "anti-cheat-required": {
    label: "Anticheat obligatorio",
    checked: "Sí",
    unchecked: "No",
  },
  "voice-chat-required": {
    label: "Chat de voz obligatorio",
    checked: "Sí",
    unchecked: "No",
  },
  livestream: {
    label: "Transmisión en vivo",
    checked: "Sí",
    unchecked: "No",
  },
};
