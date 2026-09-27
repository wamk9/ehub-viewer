// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Juego y plataforma",
    description: "Simulador, plataforma y categoría de autos.",
    label: "Juego",
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
      other: "Otro",
      "no-option": "Selecciona",
    },
  },
  platform: {
    label: "Plataforma",
    values: {
      pc: "PC",
      playstation: "PlayStation",
      xbox: "Xbox",
      crossplay: "Multiplataforma",
      "no-option": "Selecciona",
    },
  },
  "car-class": {
    label: "Clase de autos",
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
  "race-format": {
    title: "Formato de carrera",
    description: "Duración, sesiones y procedimiento de largada.",
  },
  "race-length-type": {
    label: "Duración por",
    values: {
      laps: "Vueltas",
      time: "Tiempo (min)",
      "no-option": "Selecciona",
    },
  },
  "race-length": {
    label: "Duración (vueltas o minutos)",
  },
  "practice-minutes": {
    label: "Práctica (min)",
  },
  "qualifying-format": {
    label: "Clasificación",
    values: {
      session: "Sesión abierta",
      hotlap: "Vuelta lanzada",
      "reverse-grid": "Parrilla invertida",
      none: "Sin clasificación",
      "no-option": "Selecciona",
    },
  },
  "qualifying-minutes": {
    label: "Clasificación (min)",
  },
  "start-type": {
    label: "Tipo de largada",
    values: {
      standing: "Detenida",
      rolling: "Lanzada",
      "formation-lap": "Con vuelta de formación",
      "no-option": "Selecciona",
    },
  },
  "mandatory-pit-stop": {
    label: "Parada obligatoria en boxes",
    checked: "Sí",
    unchecked: "No",
  },
  "driver-swap": {
    label: "Cambio de pilotos (resistencia)",
    checked: "Sí",
    unchecked: "No",
  },
  "event-settings": {
    title: "Configuración de la carrera",
    description: "Parámetros aplicados a todas las etapas (se pueden ajustar por etapa).",
  },
  "consume-percent": {
    label: "Consumo de combustible (%)",
  },
  "wear-percent": {
    label: "Desgaste de neumáticos (%)",
  },
  "damage-percent": {
    label: "Daño (%)",
  },
  setup: {
    label: "Setup",
    values: {
      open: "Libre",
      fixed: "Fijo",
      "parc-ferme": "Parque cerrado tras la clasificación",
      "no-option": "Selecciona",
    },
  },
  assists: {
    label: "Ayudas de conducción",
    values: {
      factory: "Como el auto real",
      free: "Libres",
      off: "Desactivadas",
      "no-option": "Selecciona",
    },
  },
  "cockpit-view-only": {
    label: "Solo cámara de cockpit",
    checked: "Sí",
    unchecked: "No",
  },
  weather: {
    label: "Clima",
    values: {
      fixed: "Fijo",
      dynamic: "Dinámico",
      "no-option": "Selecciona",
    },
  },
  "real-weather": {
    label: "Clima real",
    checked: "Sí",
    unchecked: "No",
  },
  "track-grip": {
    label: "Goma en pista",
    values: {
      green: "Pista verde",
      optimum: "Óptima",
      dynamic: "Evoluciona con la sesión",
      "no-option": "Selecciona",
    },
  },
  "time-progression": {
    label: "Paso del tiempo (día/noche)",
    checked: "Sí",
    unchecked: "No",
  },
  "race-control": {
    title: "Dirección de carrera",
    description: "Requisitos de pilotos y sanciones.",
  },
  "incident-limit": {
    label: "Límite de incidentes",
  },
  "min-license": {
    label: "Licencia / rating mínimo",
  },
  "penalty-system": {
    label: "Sanciones",
    values: {
      automatic: "Automáticas del juego",
      stewards: "Comisarios",
      both: "Juego + comisarios",
      "no-option": "Selecciona",
    },
  },
  "voice-chat-required": {
    label: "Chat de voz obligatorio (ej.: Discord)",
    checked: "Sí",
    unchecked: "No",
  },
  livestream: {
    label: "Transmisión en vivo",
    checked: "Sí",
    unchecked: "No",
  },
};
