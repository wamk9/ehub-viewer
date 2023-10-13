<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import ehubModal from '@/components/modals/ehub-modal.vue';
import httpStatus from '@/components/general/http-status/http-status.vue';
import ehubNavGroup from '@/components/inputs/ehub-nav-group.vue';

import lastLeagueNews from '@/components/modules/league/last-league-news.vue';
import lastLeagueTournaments from '@/components/modules/league/last-league-tournaments.vue';
import leagueDashboard from '@/components/modules/league/dashboard/dashboard.vue';

import League from '@/helpers/Api/League.js';
</script>

<template>
  <div class="col-12 col-lg-12 align-self-center">
    <div class="card text-bg-dark w-100 py-4 px-3 my-5">
      <div v-if="successRequest" class="card-body align-self-center col-12 col-lg-10">
        <div class="row">
          <div class="col-12 col-lg-3">
            <div class="ratio ratio-1x1">
              <img class="preview-image" :src="leagueLogo" @error="alternativeLeagueLogo">
            </div>
          </div>
          <div class="col-12 col-lg-9 ">
            <h1 class="card-title mb-4">{{leagueData.name}}</h1>
            <p>{{leagueData.description}}</p>        
          </div>
        </div>

        <ehubNavGroup
          :buttons="navGroupMenu"
          v-model:activeId="actualNavId"
          navType="tabs"
          class="mb-3 mt-5"
        />

        <lastLeagueNews v-if="actualNavId == 'lastNews'" :refersTo="$route.params.leagueRoute"/>
        <lastLeagueTournaments v-else-if="actualNavId == 'tournaments'" :refersTo="$route.params.leagueRoute"/>
        <leagueDashboard 
          v-else-if="actualNavId == 'dashboard'"
          :refersTo="$route.params.leagueRoute"
          :hierarchy="leagueData.hierarchies"
          :leagueData="leagueData"
          @league-updated="updateLeaguePageInfo"
        />
      </div>
      <httpStatus v-else :status="statusReturned"/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sendingToApi: false,
      actualNavId: '',
      statusReturned: 200,
      leagueData: {
        name: '',
        description: '',
        route: '',
        logo_image: '',
        hierarchies: {
          config: [],
        }
        
      },
      cacheTimestamp: Date.now(),
    }
  },
  async mounted() {
    await this.getLeagueInfo();

  },
  computed: {
    successRequest() {
      return this.statusReturned == 200 ? true : false;
    },
    navGroupMenu() {
      let lastNewsNav = {id:'lastNews', title: 'Últimas notícias', disabled: true};
      let tournamentNav = {id:'tournaments', title: 'Campeonatos', active: true};
      let leagueAdminNav = {id:'dashboard', title: 'Painel Administrativo' };
      
      let allNav = [ lastNewsNav, tournamentNav ];

      if (this.leagueData.hierarchies.config.view_menu) allNav.push(leagueAdminNav);

      return allNav;
    },
    leagueLogo() {
      return this.successRequest ? 'http://ehubapp.com/storage/league/' + this.$route.params.leagueRoute + '/logo.webp?cache=' + this.cacheTimestamp  : "";
    }
  },
  methods: {
    updateLeaguePageInfo(value) {
      let leagueTempData = JSON.parse(value);

      this.leagueData.name = leagueTempData.name;
      this.leagueData.description = leagueTempData.description;
      this.cacheTimestamp = Date.now();
    },
    alternativeLeagueLogo(event) {
      if (this.successRequest)
        event.target.src = "http://ehub.com/storage/league/default/logo.webp";
    },
    async getLeagueInfo() {
        let returnedData = await League.getLeagueResume(this.$route.params.leagueRoute);
        this.statusReturned = returnedData.code;

        if (returnedData.code == 200)
          this.leagueData = returnedData.data;
      },
  },
  created() {
  }
}
</script>

<style scoped>
.card-title {
  font-weight: lighter;
  font-size: 2.2rem;
}
.auth-inputs {
  display: flex;
  flex-direction: column;
}
.preview-image {
  height: 90%;
  width: 90%;
  object-fit: cover;
  border-radius:50%;
  border-width: 2px;
  border-color: #000;
  margin-bottom: 2rem;
}
</style>