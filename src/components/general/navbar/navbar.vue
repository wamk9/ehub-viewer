<template>
  <nav
    class="sticky-top navbar align-items-center border-bottom d-none d-lg-flex flex-row justify-content-between px-3">
    <div class="container-fluid">
      <div class="d-flex align-items-center">
        <router-link to="/" class="navbar-brand m-0 textColor fw-bold brand text-decoration-none">
          <img class="desktop-navbar-logo" src="@/assets/images/ehub-logo.png">
        </router-link>
      </div>
      <div class="d-flex align-items-center">
        <div class="d-none d-lg-block">
          <ul class="d-flex m-0 list-unstyled ">
            <NavbarDesktopItem v-for="navitem in navbarItems" :name="navitem.name" :hoverColor="navitem.hoverColor"
              :icon="navitem.icon" :route="navitem.route" :dropdownItems="navitem.dropdownItems" :type="navitem.type" />

            <NavbarDesktopProfile :notificationEndpoint="notificationEndpoint" :profileEndpoint="profileEndpoint"
              :unloggedOptions="unloggedProfileItems" :loggedOptions="loggedProfileItems" />
          </ul>
        </div>

        <!-- <button id="loginBtn" class="btn btn-lg m-sm-2 m-1 bg-primary text-white rounded-5 px-sm-3 px-2"
          v-on:click="logOperation()">
          {{ logBtnTitle }} <font-awesome-icon :icon="logBtnIcon" />
        </button> -->
        <!--<img class="ms-2" src="/static_files/svgs2/grid-3x3-gap-fill.svg" alt="grid-3x3">-->
      </div>
    </div>
  </nav>

  <nav class="mobile-navbar bottom-0 position-fixed end-0 start-0">
    <div class="d-lg-none">
      <div class="mobile-nav-inner">

        <!-- Home -->
        <NavbarMobileItem
          name="eHub"
          hoverColor="#0098D8"
          :icon="['fas', 'house']"
          route="/"
        />

        <!-- Shared items (search, etc.) -->
        <NavbarMobileItem v-for="navitem in navbarItems" :key="navitem.route"
          :name="navitem.name" :hoverColor="navitem.hoverColor"
          :icon="navitem.icon" :route="navitem.route" />

        <!-- Logged -->
        <template v-if="isLogged">
          <!-- Notificações dropup -->
          <div class="dropup mobile-dropup">
            <button class="mobile-nav-item mobile-drop-btn" data-bs-toggle="dropdown"
              data-bs-display="static" aria-expanded="false">
              <font-awesome-icon :icon="['fas', 'bell']" class="mobile-nav-icon" />
              <span class="mobile-nav-label">{{ $t('navbar.user.logged.notifications.title') }}</span>
            </button>
            <ul class="dropdown-menu ehub-dropdown-mobile">
              <li><span class="dropdown-item text-muted small py-3 text-center d-block">
                <font-awesome-icon :icon="['fas', 'bell']" class="me-2 opacity-50" />
                Nenhuma notificação
              </span></li>
            </ul>
          </div>

          <!-- Usuário dropup -->
          <div class="dropup mobile-dropup">
            <button class="mobile-nav-item mobile-drop-btn" data-bs-toggle="dropdown"
              data-bs-display="static" aria-expanded="false">
              <font-awesome-icon :icon="['fas', 'user']" class="mobile-nav-icon" />
              <span class="mobile-nav-label">{{ $t('navbar.user.logged.profile.title') }}</span>
            </button>
            <ul class="dropdown-menu ehub-dropdown-mobile">
              <!-- Header -->
              <li class="px-3 py-2 d-flex align-items-center gap-3 mobile-profile-header">
                <InitialsAvatar :name="mobileProfileName" :image="mobileProfileImage" type="user" :size="44" />
                <div class="overflow-hidden">
                  <div class="text-white fw-semibold text-truncate" style="font-size:0.9rem">
                    {{ mobileProfileName || '—' }}
                  </div>
                  <div class="text-muted text-truncate" style="font-size:0.78rem">
                    @{{ mobileProfileUsername || '…' }}
                  </div>
                </div>
              </li>
              <li><hr class="dropdown-divider border-secondary my-1"></li>
              <!-- Items -->
              <li v-for="item in loggedProfileItems" :key="item.name">
                <hr v-if="item.action === 'logout'" class="dropdown-divider border-secondary my-1" />
                <a v-if="item.action === 'logout'" class="dropdown-item logout-item" href="#"
                  @click.prevent="logOperation()">
                  <font-awesome-icon v-if="item.faIcon" :icon="item.faIcon" class="me-2 opacity-75" />
                  {{ item.name }}
                </a>
                <router-link v-else class="dropdown-item" :to="item.route">
                  <font-awesome-icon v-if="item.faIcon" :icon="item.faIcon" class="me-2 opacity-75" />
                  {{ item.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </template>

        <!-- Not logged -->
        <template v-else>
          <NavbarMobileItem
            :name="$t('navbar.user.unlogged.login.title')"
            hoverColor="#6195f5"
            :icon="['fas', 'right-to-bracket']"
            route="/login"
          />
          <NavbarMobileItem
            :name="$t('navbar.user.unlogged.register.title')"
            hoverColor="#6195f5"
            :icon="['fas', 'user-plus']"
            route="/register"
          />
        </template>

      </div>
    </div>
  </nav>
</template>

<script>
import Auth from '@/helpers/communication/auth.js';
import Api  from '@/helpers/communication/Connection';
import NavbarDesktopItem from '@/components/general/navbar/navbar-desktop-item.vue';
import NavbarDesktopProfile from '@/components/general/navbar/navbar-desktop-profile.vue';
import NavbarMobileItem from '@/components/general/navbar/navbar-mobile-item.vue';
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import { i18n } from '@/helpers/i18n';
import store from '@/store';
export default {
  components: {
    NavbarDesktopItem,
    NavbarMobileItem,
    NavbarDesktopProfile,
    InitialsAvatar,
  },
  data() {
    return {
      navbarItems: [],
      profileEndpoint: '',
      notificationEndpoint: '',
      mobileProfileImage: '',
      mobileProfileName: '',
      mobileProfileUsername: '',
      unloggedProfileItems: [
        {
          name: i18n.t('navbar.user.unlogged.login.title'),
          faIcon: ['fas', 'right-to-bracket'],
          route: '/login'
        },
        {
          name: i18n.t('navbar.user.unlogged.register.title'),
          faIcon: ['fas', 'user-plus'],
          route: '/register'
        }
      ],
      loggedProfileItems: [
        {
          name: i18n.t('navbar.user.logged.profile.title'),
          faIcon: ['fas', 'user'],
          route: '/profile'
        },
        {
          name: i18n.t('navbar.user.logged.my-orgs.title'),
          faIcon: ['fas', 'building'],
          route: '/organizations/mine'
        },
        {
          name: i18n.t('navbar.user.logged.logout.title'),
          faIcon: ['fas', 'right-from-bracket'],
          action: 'logout',
          route: '#'
        },
      ]
    }
  },
  computed: {
    isLogged() {
      return !!this.$store.getters.getToken;
    },
    logBtnTitle() {
      return this.isLogged ? "Logout" : "Login";
    },
    logBtnIcon() {
      return this.isLogged ? ['fas', 'right-from-bracket'] : ['fas', 'right-to-bracket'];
    }
  },
  mounted() {
    this.getNavbarItems();
    this.loadMobileProfile();
  },
  methods: {
    async loadMobileProfile() {
      if (!this.isLogged) return;
      try {
        const result = await Api.getAsync('/user/profile', {
          headers: { Authorization: 'Bearer ' + store.getters.getToken }
        });
        if (result.code === 200) {
          const d = result.response;
          if (d.image)    this.mobileProfileImage    = d.image;
          if (d.name)     this.mobileProfileName     = d.name + ' ' + (d.surname ?? '');
          if (d.username) this.mobileProfileUsername = d.username;
        }
      } catch { /* keep placeholder */ }
    },
    logOperation() {
      if (!this.isLogged) {
        this.$router.push('/login');
      } else {
        Auth.logout();
      }
    },
    getNavbarItems() {
      // const unloggedItem = [{
      //   icon: {
      //     type: 'image',
      //     value: 'https://placehold.co/400',
      //   },
      //   type: 'profile',
      //   hoverColor: "grey",
      //   name: 'Profile',
      //   route: '#',
      //   dropdownItems: [
      //     {
      //       name: i18n.t('navbar.user.unlogged.login'),
      //       icon: {},
      //       route: '#'
      //     },
      //     {
      //       name: i18n.t('navbar.user.unlogged.register'),
      //       icon: {},
      //       route: '#'
      //     },
      //   ]
      // }];

      // const loggedItem = [
      //   {
      //     icon: {
      //       type: 'font-awesome',
      //       value: 'bell'
      //     },
      //     hoverColor: "#5e90ea",
      //     name: i18n.t('navbar.user.logged.notifications.title'),
      //     route: '#',
      //     type: 'notifications'
      //   },
      //   {
      //     icon: {
      //       type: 'image',
      //       value: 'https://placehold.co/400',
      //     },
      //     type: 'profile',
      //     hoverColor: "grey",
      //     name: 'Profile',
      //     route: '#',
      //     dropdownItems: [
      //       {
      //         name: i18n.t('navbar.user.logged.profile.title'),
      //         icon: {},
      //         route: '#'
      //       },
      //       {
      //         name: i18n.t('navbar.user.logged.config.title'),
      //         icon: {},
      //         route: '#'
      //       },
      //       {
      //         name: i18n.t('navbar.user.logged.my-orgs.title'),
      //         icon: {},
      //         route: '#'
      //       },
      //       {
      //         name: i18n.t('navbar.user.logged.logout.title'),
      //         icon: {},
      //         route: '#'
      //       },
      //     ]
      //   }];

      const items = [
        {
          icon: ['fas', 'magnifying-glass'],
          hoverColor: '#FBBF11',
          name: i18n.t('navbar.search.title'),
          route: '/search'
        },
      ];

      this.navbarItems = [...items];
    }
  }
}
</script>
<style scoped></style>

<style>
.navbar {
  background-color: rgba(48, 48, 48, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: #0098D8 !important;
  border-bottom-width: 2px !important;
  position: fixed !important;
  top: 0;
  width: 100%;
  z-index: 1030;
}

.mobile-navbar {
  background-color: #1c1c1c;
  border-top: 1px solid #2a2a2a;
  z-index: 1000;
}

.mobile-nav-inner {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 8px 4px 10px;
}

.mobile-dropup { position: static; }

.mobile-drop-btn {
  background: none;
  border: none;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #888;
  min-width: 48px;
  cursor: pointer;
  transition: color 0.2s;
}
.mobile-drop-btn:hover,
.mobile-drop-btn[aria-expanded="true"] { color: #6195f5; }
.mobile-drop-btn[aria-expanded="true"] .mobile-nav-label { border-bottom-color: #6195f5; }

.mobile-nav-icon { font-size: 1.2rem; line-height: 1; }
.mobile-nav-label { font-size: 10px; line-height: 1; white-space: nowrap; border-bottom: 2px solid transparent; padding-bottom: 1px; }

.ehub-dropdown-mobile {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
  padding: 8px 0;
  left: 0 !important;
  right: 0 !important;
  bottom: 100% !important;
  transform: none !important;
  width: 100vw;
  max-width: 100vw;
}

.ehub-dropdown-mobile .dropdown-item {
  color: #d0d0d0;
  font-size: 0.9rem;
  padding: 0.65rem 1.25rem;
  text-decoration: none;
  display: block;
  transition: background 0.15s;
}
.ehub-dropdown-mobile .dropdown-item:hover { background: #2e2e2e; color: #fff; }
.ehub-dropdown-mobile .logout-item { color: #e05050; }
.ehub-dropdown-mobile .logout-item:hover { background: rgba(224,80,80,0.1); }
.mobile-profile-header { border-bottom: none; }

.textColor {
  color: #fafafa;
}

.desktop-navbar-logo {
  height: 35px;
}

.mobile-navbar-logo {
  height: 16px;
  margin-bottom: 3px;
}

.changeWidth {
  width: 36px;
}

.brand {
  font-size: 18px;
}

.brandSubHeading {
  font-size: 12px;
}

.searchInput {
  width: 280px;
}

.iconHeight {
  height: 20px;
  width: 20px;
}

.searchImg {
  top: 12px;
  right: 250px;
}


.smallFont {
  font-size: 15px;
}

#hostBtn {
  background: #163A66;
  background: linear-gradient(to left, #1C4980 50%, #163A66 50%) right;
  background-size: 200%;
  transition: 0.5s ease-out;
}

#hostBtn:hover {
  background-position: left;
}

#loginBtn {
  background: #0d6efd;
  background: linear-gradient(to left, #0073e6 50%, #005CB8 50%) right;
  background-size: 200%;
  transition: 0.5s ease-out;
}

#loginBtn:hover {
  background-position: left;
}

#iconContainer {
  height: 35px;
  width: 35px;
}

.extraSmallFont {
  font-size: 12px;
  border-bottom: 2px solid transparent;
}

/* body */
#bodyContent {
  min-height: calc(100vh - 77px)
}

.maintextColor {
  color: #1C4980;
}

.horizontalBar {
  max-width: 200px;
  height: 2px;
  background: #F2C034;
}

.extraSmallFont.active {
  border-bottom: 2px solid #6195f5
}

@media screen and (min-width: 1400px) {}
</style>
