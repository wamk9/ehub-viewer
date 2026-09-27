// Labels for the event form schema (v2) of this category/runmode.
export default {
  "time-control": {
    title: "Time control",
    description: "Time, increment and pairing system.",
  },
  format: {
    label: "Format",
    values: {
      classical: "Classical",
      rapid: "Rapid",
      blitz: "Blitz",
      bullet: "Bullet",
      other: "Other",
      "no-option": "Select",
    },
  },
  "time-minutes": {
    label: "Time per player (min)",
  },
  "increment-seconds": {
    label: "Increment per move (s)",
  },
  "total-rounds": {
    label: "Number of rounds",
  },
  pairing: {
    label: "Pairing",
    values: {
      swiss: "Swiss",
      "round-robin": "Round robin",
      knockout: "Knockout",
      arena: "Arena",
      "no-option": "Select",
    },
  },
  rated: {
    label: "Rated",
    checked: "Yes",
    unchecked: "No",
  },
  venue: {
    title: "Venue",
    description: "Where and how games are played.",
  },
  livestream: {
    label: "Live stream",
    checked: "Yes",
    unchecked: "No",
  },
  platform: {
    label: "Platform",
    values: {
      lichess: "Lichess",
      "chess-com": "Chess.com",
      other: "Other",
      "no-option": "Select",
    },
  },
  "anti-cheat-required": {
    label: "Camera/anti-cheat required",
    checked: "Yes",
    unchecked: "No",
  },
};
