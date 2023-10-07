import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrophy,
  faRightToBracket,
  faPeopleGroup,
  faUser,
  faBell,
  faEnvelope,
  faAsterisk,
  faIdCard,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

import {
  faSteam 
} from "@fortawesome/free-brands-svg-icons";

//import { faBell } from "@fortawesome/free-regular-svg-icons";

library.add(
  faTrophy,
  faRightToBracket,
  faPeopleGroup,
  faBell,
  faUser,
  faEnvelope,
  faAsterisk,
  faSteam,
  faIdCard,
  faRightFromBracket
);

export default FontAwesomeIcon;