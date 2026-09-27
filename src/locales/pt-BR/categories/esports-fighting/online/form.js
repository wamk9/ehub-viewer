// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Jogo e servidor",
    description: "Título, plataforma e região das partidas.",
    label: "Jogo",
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
      other: "Outro",
      "no-option": "Selecione",
    },
  },
  platform: {
    label: "Plataforma",
    values: {
      pc: "PC",
      console: "Console",
      mobile: "Mobile",
      crossplay: "Multiplataforma",
      "no-option": "Selecione",
    },
  },
  "server-region": {
    label: "Região do servidor",
    values: {
      "south-america": "América do Sul",
      "north-america": "América do Norte",
      europe: "Europa",
      asia: "Ásia",
      oceania: "Oceania",
      "no-option": "Selecione",
    },
  },
  "match-format": {
    title: "Formato das partidas",
    description: "Séries, equipes e seleção de mapas.",
    label: "Formato das partidas",
    values: {
      bo1: "Melhor de 1",
      bo3: "Melhor de 3",
      bo5: "Melhor de 5",
      bo7: "Melhor de 7",
      "no-option": "Selecione",
    },
  },
  "final-format": {
    label: "Formato da final",
    values: {
      bo1: "Melhor de 1",
      bo3: "Melhor de 3",
      bo5: "Melhor de 5",
      bo7: "Melhor de 7",
      "no-option": "Selecione",
    },
  },
  "team-size": {
    label: "Jogadores por equipe",
  },
  substitutes: {
    label: "Reservas permitidos",
  },
  "map-pool": {
    label: "Pool de mapas",
  },
  "map-selection": {
    label: "Escolha de mapas",
    values: {
      veto: "Picks e bans",
      random: "Aleatória",
      organizer: "Definida pela organização",
      "no-option": "Selecione",
    },
  },
  "match-rules": {
    title: "Regras de partida",
    description: "Check-in, atrasos e requisitos.",
  },
  "check-in-minutes": {
    label: "Check-in antes da partida (min)",
  },
  "tolerance-minutes": {
    label: "Tolerância de atraso (min)",
  },
  "anti-cheat-required": {
    label: "Anticheat obrigatório",
    checked: "Sim",
    unchecked: "Não",
  },
  "voice-chat-required": {
    label: "Chat de voz obrigatório",
    checked: "Sim",
    unchecked: "Não",
  },
  livestream: {
    label: "Transmissão ao vivo",
    checked: "Sim",
    unchecked: "Não",
  },
};
