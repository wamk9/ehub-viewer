// Labels for the event form schema (v2) of this category/runmode.
export default {
  game: {
    title: "Game and server",
    description: "Title, platform and match region.",
    label: "Game",
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
      other: "Other",
      "no-option": "Select",
    },
  },
  platform: {
    label: "Platform",
    values: {
      pc: "PC",
      console: "Console",
      mobile: "Mobile",
      crossplay: "Crossplay",
      "no-option": "Select",
    },
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
  "match-format": {
    title: "Match format",
    description: "Series, teams and map selection.",
    label: "Match format",
    values: {
      bo1: "Best of 1",
      bo3: "Best of 3",
      bo5: "Best of 5",
      bo7: "Best of 7",
      "no-option": "Select",
    },
  },
  "final-format": {
    label: "Final format",
    values: {
      bo1: "Best of 1",
      bo3: "Best of 3",
      bo5: "Best of 5",
      bo7: "Best of 7",
      "no-option": "Select",
    },
  },
  "team-size": {
    label: "Players per team",
  },
  substitutes: {
    label: "Substitutes allowed",
  },
  "map-pool": {
    label: "Map pool",
  },
  "map-selection": {
    label: "Map selection",
    values: {
      veto: "Picks and bans",
      random: "Random",
      organizer: "Set by organizer",
      "no-option": "Select",
    },
  },
  "match-rules": {
    title: "Match rules",
    description: "Check-in, delays and requirements.",
  },
  "check-in-minutes": {
    label: "Check-in before match (min)",
  },
  "tolerance-minutes": {
    label: "Late tolerance (min)",
  },
  "anti-cheat-required": {
    label: "Anti-cheat required",
    checked: "Yes",
    unchecked: "No",
  },
  "voice-chat-required": {
    label: "Voice chat required",
    checked: "Yes",
    unchecked: "No",
  },
  livestream: {
    label: "Live stream",
    checked: "Yes",
    unchecked: "No",
  },
};
