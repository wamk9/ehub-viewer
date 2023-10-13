<template>
<nav class="navbar align-items-center border-bottom d-none d-lg-flex">
  <div class="container-fluid">
  <div class="d-flex align-items-center ">
    <a href="/" class="navbar-brand m-0 textColor fw-bold brand">
      <img class="desktop-navbar-logo" src="@/assets/images/ehub-logo.png">
    </a>
  </div>
  <div class="d-flex align-items-center">
      <div class="d-none d-lg-block">
        <ul class="d-flex m-0 list-unstyled ">
          <NavbarDesktopItem
            v-for="navitem in navbarItems"
            :name="navitem.name"
            :hoverColor="navitem.hoverColor"
            :icon="navitem.icon"
            :route="navitem.route"
          />
        </ul>
      </div>
      <button id="loginBtn" class="btn btn-sm m-sm-2 m-1 bg-primary text-white rounded-5 px-sm-3 px-2" v-on:click="logOperation()">
        {{ logBtnTitle }} <font-awesome-icon :icon="logBtnIcon" />
      </button>
      <!--<img class="ms-2" src="/static_files/svgs2/grid-3x3-gap-fill.svg" alt="grid-3x3">-->
    </div>
  </div>
</nav>

<nav class="mobile-navbar bottom-0 position-fixed end-0 start-0">
  <div class="d-lg-none">
    <div class="container-fluid d-flex justify-content-between shadow pt-2">
      <a href="#" class="text-center text-decoration-none textColor">
        <div class="mb-1">
          <span class="bg-primary rounded-5 p-1 text-white">
            <img class="mobile-navbar-logo" src="@/assets/images/ehub-logo-minified.png">
          </span>
        </div>
        <div class="extraSmallFont active pb-1">eHub</div>
      </a>
      <NavbarMobileItem
        v-for="navitem in navbarItems"
        :name="navitem.name"
        :hoverColor="navitem.hoverColor"
        :icon="navitem.icon"
        :route="navitem.route"
      />

      <NavbarMobileItem
        :name="logBtnTitle"
        hoverColor="blue"
        :icon="logBtnIcon"
        v-on:click="logOperation()"
      />
    </div>
  </div>
</nav>
</template>

<script>
import Auth from '@/helpers/Api/Auth.js';
import NavbarDesktopItem from '@/components/general/navbar/navbar-desktop-item.vue';
import NavbarMobileItem from '@/components/general/navbar/navbar-mobile-item.vue';

export default {
  components: {
    NavbarDesktopItem,
    NavbarMobileItem
  },
  data() {
    return {
			navbarItems: [],
      registrationData: {
        name: '',
        email: '',
        password: '',
        steamId: '',
        name: '',
      },
    }
  },
  mounted() {
    this.getNavbarItems();
  },
  computed: {
    isLogged() {
      return !!this.$store.getters.getToken;
    },
    logBtnTitle() {
      return this.isLogged ? "Sair" : "Entrar";
    },
    logBtnIcon() {
      return this.isLogged ? ['fas', 'right-from-bracket'] : ['fas', 'right-to-bracket'];
    }
  },
  methods: {
    logOperation() {
      if (!this.isLogged){
        this.$router.push('auth');
      } else {
        Auth.logout();
      }
    },
    getNavbarItems() {
        this.navbarItems = [
        		{
                icon: 'trophy',
                hoverColor: '#FBBF11',
                name: 'Campeonatos',
                route: 'tournament'
            },
            {
                icon: 'people-group',
                hoverColor: '#FAFAFA',
                name: 'Equipes',
                route: 'tournament'
            },
            {
                icon: 'user',
                hoverColor: "grey",
                name: 'Perfil',
                route: 'tournament'
            },
            {
                icon: 'bell',
                hoverColor: "#5e90ea",
                name: 'Notificações',
                route: 'tournament'
            },
        ];
    }
  }
}
</script>
<style scoped>
</style>

<style>
.navbar {
  background-color: #303030;
  border-bottom-color: #0098D8 !important;
  border-bottom-width: 2px !important;
}

.mobile-navbar {
  background-color: #1c1c1c;
  z-index: 1000;
}

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

@media screen and (min-width: 1400px) {

}
</style>
