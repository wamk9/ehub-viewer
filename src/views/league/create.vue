<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import League from '@/helpers/Api/League.js';
import router from '@/router';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
  
  <div class="col-12 col-lg-12 align-self-center">
    <div class="card text-center w-100 py-4 px-3 my-5">
      <div class="card-body align-self-center col-12 col-lg-10">
        <img ref="leagueLogo" class="preview-image" :src="srcLeagueLogo" >
        <h1 class="card-title mb-4">{{welcomeTitle}}</h1>
        <ehubInput
          v-model="leagueForm.name"
          :icon="['fas', 'address-card']"
          type="text"
          placeholder="Nome da sua liga"
          :validation="formValidation.name"
        />

        <ehubInput
          v-model="leagueForm.route"
          :icon="['fas', 'link']"
          placeholder="URL da sua liga"
          :validation="formValidation.route"
        />

        <ehubInput
          v-model="leagueForm.description"
          icon="asterisk"
          type="textarea"
          placeholder="Descrição"
          :validation="formValidation.description"
        />

        <ehubInputImage
          v-model="leagueForm.logo_image"
        />

        <ehubButton 
          @click="executeAction"
          text="Enviar dados"
          :loading="sendingToApi"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sendingToApi: false,
      requestResponse: {
        leagueCreated: false
      },
      leagueForm: {
        name: '',
        description: '',
        route: '',
        logo_image: '',
      },
      formValidation: {},
    }
  },
  computed: {
    welcomeTitle() {
      return "Olá, que bom que você vai se juntar a nós" + (this.leagueForm.name ? ', ' + this.leagueForm.name : '') + '!';
    },

    btnLeagueTitle() {
      return this.requestResponse.leagueCreated ? 'Liga criada com sucesso, redirecionando...' : 'Enviar dados';
    },
    srcLeagueLogo() {
      if (!!this.leagueForm.logo_image)
        return this.leagueForm.logo_image;
      else
        return SystemVars.baseUrl + 'storage/league/default/logo.webp';
    }
  },
  methods: {
    async executeAction() {
      this.sendingToApi = true;

      this.formValidation = {};

      await League.create(this.leagueForm).then((response) => {
        this.requestResponse = response;
        if (this.requestResponse.leagueCreated) {
          router.push('/league/'+ this.leagueForm.route);
        } else {
          for (const [key, value] of Object.entries(this.requestResponse.errors))
            this.formValidation[key] = { type: 'error', text: value[0] } ;

          this.sendingToApi = false;
          this.requestResponse.leagueCreated = false;
        }
      });
    },
  },
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
  height: 150px;
  width: 150px;
  object-fit: cover;
  border-radius:50%;
  border-width: 2px;
  border-color: black;
  background-color: gray;
  margin-bottom: 2rem;
}
</style>