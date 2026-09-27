// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Jogo e plataforma",
    description: "Simulador, plataforma e categoria de carros.",
    label: "Jogo",
    values: {
      "assetto-corsa": "Assetto Corsa",
      "assetto-corsa-competizione": "Assetto Corsa Competizione",
      "assetto-corsa-evo": "Assetto Corsa EVO",
      automobilista: "Automobilista",
      "automobilista-2": "Automobilista 2",
      "forza-motorsport": "Forza Motorsport",
      "forza-horizon-5": "Forza Horizon 5",
      "gran-turismo-7": "Gran Turismo 7",
      iracing: "iRacing",
      "le-mans-ultimate": "Le Mans Ultimate",
      rfactor: "rFactor",
      "rfactor-2": "rFactor 2",
      "live-for-speed": "Live for Speed",
      "project-cars-2": "Project CARS 2",
      "project-cars-3": "Project CARS 3",
      "race-room-experience": "RaceRoom Racing Experience",
      "f1-25": "F1 25",
      "f1-24": "F1 24",
      "f1-23": "F1 23",
      "f1-22": "F1 22",
      "f1-2021": "F1 2021",
      "f1-2020": "F1 2020",
      "dirt-rally-2-0": "DiRT Rally 2.0",
      "dirt-rally": "DiRT Rally",
      "ea-sports-wrc": "EA Sports WRC",
      "wrc-generations": "WRC Generations",
      "beamng-drive": "BeamNG.drive",
      kartkraft: "KartKraft",
      "kart-racing-pro": "Kart Racing Pro",
      drift21: "Drift21",
      "gp-bikes": "GP Bikes",
      "mx-bikes": "MX Bikes",
      "trackmania-2020": "Trackmania (2020)",
      "trackmania-nations": "Trackmania Nations",
      "the-crew-motorfest": "The Crew Motorfest",
      other: "Outro",
      "no-option": "Selecione",
    },
  },
  platform: {
    label: "Plataforma",
    values: {
      pc: "PC",
      playstation: "PlayStation",
      xbox: "Xbox",
      crossplay: "Multiplataforma",
      "no-option": "Selecione",
    },
  },
  "car-class": {
    label: "Categoria / classe de carros",
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
  "race-format": {
    title: "Formato da corrida",
    description: "Duração, sessões e procedimentos de largada.",
  },
  "race-length-type": {
    label: "Duração por",
    values: {
      laps: "Voltas",
      time: "Tempo (min)",
      "no-option": "Selecione",
    },
  },
  "race-length": {
    label: "Duração da corrida (voltas ou minutos)",
  },
  "practice-minutes": {
    label: "Treino livre (min)",
  },
  "qualifying-format": {
    label: "Classificação",
    values: {
      session: "Sessão aberta",
      hotlap: "Volta lançada",
      "reverse-grid": "Grid invertido",
      none: "Sem classificação",
      "no-option": "Selecione",
    },
  },
  "qualifying-minutes": {
    label: "Classificação (min)",
  },
  "start-type": {
    label: "Tipo de largada",
    values: {
      standing: "Parada",
      rolling: "Lançada",
      "formation-lap": "Com volta de apresentação",
      "no-option": "Selecione",
    },
  },
  "mandatory-pit-stop": {
    label: "Parada obrigatória nos boxes",
    checked: "Sim",
    unchecked: "Não",
  },
  "driver-swap": {
    label: "Troca de pilotos (endurance)",
    checked: "Sim",
    unchecked: "Não",
  },
  "event-settings": {
    title: "Configurações da prova",
    description: "Parâmetros aplicados em todas as etapas (podem ser ajustados por etapa).",
  },
  "consume-percent": {
    label: "Consumo de combustível (%)",
  },
  "wear-percent": {
    label: "Desgaste de pneus (%)",
  },
  "damage-percent": {
    label: "Dano (%)",
  },
  setup: {
    label: "Setup",
    values: {
      open: "Livre",
      fixed: "Fixo",
      "parc-ferme": "Parque fechado após a classificação",
      "no-option": "Selecione",
    },
  },
  assists: {
    label: "Auxílios de pilotagem",
    values: {
      factory: "Como no carro real",
      free: "Livres",
      off: "Desligados",
      "no-option": "Selecione",
    },
  },
  "cockpit-view-only": {
    label: "Somente câmera de cockpit",
    checked: "Sim",
    unchecked: "Não",
  },
  weather: {
    label: "Clima",
    values: {
      fixed: "Fixo",
      dynamic: "Dinâmico",
      "no-option": "Selecione",
    },
  },
  "real-weather": {
    label: "Clima real",
    checked: "Sim",
    unchecked: "Não",
  },
  "track-grip": {
    label: "Borracha na pista",
    values: {
      green: "Pista verde",
      optimum: "Ideal",
      dynamic: "Evolui com a sessão",
      "no-option": "Selecione",
    },
  },
  "time-progression": {
    label: "Passagem de tempo (dia/noite)",
    checked: "Sim",
    unchecked: "Não",
  },
  "race-control": {
    title: "Direção de prova",
    description: "Requisitos dos pilotos e punições.",
  },
  "incident-limit": {
    label: "Limite de incidentes",
  },
  "min-license": {
    label: "Licença / rating mínimo",
  },
  "penalty-system": {
    label: "Punições",
    values: {
      automatic: "Automáticas do jogo",
      stewards: "Comissários",
      both: "Jogo + comissários",
      "no-option": "Selecione",
    },
  },
  "voice-chat-required": {
    label: "Chat de voz obrigatório (ex.: Discord)",
    checked: "Sim",
    unchecked: "Não",
  },
  livestream: {
    label: "Transmissão ao vivo",
    checked: "Sim",
    unchecked: "Não",
  },
};
