// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Game and platform",
    description: "Simulator, platform and car class.",
    label: "Game",
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
      other: "Other",
      "no-option": "Select",
    },
  },
  platform: {
    label: "Platform",
    values: {
      pc: "PC",
      playstation: "PlayStation",
      xbox: "Xbox",
      crossplay: "Crossplay",
      "no-option": "Select",
    },
  },
  "car-class": {
    label: "Car class",
  },
  "server-region": {
    label: "Server region",
    values: {
      "south-america": "South America",
      "north-america": "North America",
      europe: "Europe",
      asia: "Asia",
      oceania: "Oceania",
      "no-option": "Select",
    },
  },
  "race-format": {
    title: "Race format",
    description: "Length, sessions and start procedure.",
  },
  "race-length-type": {
    label: "Length by",
    values: {
      laps: "Laps",
      time: "Time (min)",
      "no-option": "Select",
    },
  },
  "race-length": {
    label: "Race length (laps or minutes)",
  },
  "practice-minutes": {
    label: "Practice (min)",
  },
  "qualifying-format": {
    label: "Qualifying",
    values: {
      session: "Open session",
      hotlap: "Hot lap",
      "reverse-grid": "Reverse grid",
      none: "No qualifying",
      "no-option": "Select",
    },
  },
  "qualifying-minutes": {
    label: "Qualifying (min)",
  },
  "start-type": {
    label: "Start type",
    values: {
      standing: "Standing",
      rolling: "Rolling",
      "formation-lap": "Formation lap",
      "no-option": "Select",
    },
  },
  "mandatory-pit-stop": {
    label: "Mandatory pit stop",
    checked: "Yes",
    unchecked: "No",
  },
  "driver-swap": {
    label: "Driver swap (endurance)",
    checked: "Yes",
    unchecked: "No",
  },
  "event-settings": {
    title: "Race settings",
    description: "Parameters applied to every stage (can be adjusted per stage).",
  },
  "consume-percent": {
    label: "Fuel consumption (%)",
  },
  "wear-percent": {
    label: "Tyre wear (%)",
  },
  "damage-percent": {
    label: "Damage (%)",
  },
  setup: {
    label: "Setup",
    values: {
      open: "Open",
      fixed: "Fixed",
      "parc-ferme": "Parc fermé after qualifying",
      "no-option": "Select",
    },
  },
  assists: {
    label: "Driving aids",
    values: {
      factory: "Factory (as real car)",
      free: "Free",
      off: "Off",
      "no-option": "Select",
    },
  },
  "cockpit-view-only": {
    label: "Cockpit view only",
    checked: "Yes",
    unchecked: "No",
  },
  weather: {
    label: "Weather",
    values: {
      fixed: "Fixed",
      dynamic: "Dynamic",
      "no-option": "Select",
    },
  },
  "real-weather": {
    label: "Real weather",
    checked: "Yes",
    unchecked: "No",
  },
  "track-grip": {
    label: "Track grip",
    values: {
      green: "Green",
      optimum: "Optimum",
      dynamic: "Dynamic",
      "no-option": "Select",
    },
  },
  "time-progression": {
    label: "Time progression (day/night)",
    checked: "Yes",
    unchecked: "No",
  },
  "race-control": {
    title: "Race control",
    description: "Driver requirements and penalties.",
  },
  "incident-limit": {
    label: "Incident limit",
  },
  "min-license": {
    label: "Minimum license / rating",
  },
  "penalty-system": {
    label: "Penalties",
    values: {
      automatic: "In-game automatic",
      stewards: "Stewards",
      both: "Game + stewards",
      "no-option": "Select",
    },
  },
  "voice-chat-required": {
    label: "Voice chat required (e.g. Discord)",
    checked: "Yes",
    unchecked: "No",
  },
  livestream: {
    label: "Live stream",
    checked: "Yes",
    unchecked: "No",
  },
};
