<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import League from '@/helpers/Api/League.js';
</script>

<template>
  
  <div class="col-12 col-lg-12 align-self-center">
    <div class="card text-center w-100 py-4 px-3 my-5">
      <div class="card-body align-self-center col-12 col-lg-10">
        <img class="preview-image" :src="leagueForm.logo_image">
        <h1 class="card-title mb-4">{{welcomeTitle}}</h1>
        <ehubInput
          v-model="leagueForm.name"
          :icon="['fas', 'address-card']"
          type="text"
          placeholder="Nome da sua liga"
        />
        
        <ehubInput
          v-model="leagueForm.route"
          :icon="['fas', 'link']"
          placeholder="URL da sua liga"
        />

        <ehubInput
          v-model="leagueForm.description"
          icon="asterisk"
          type="textarea"
          placeholder="Descrição"
        />

        <ehubInputImage
          v-model="leagueForm.logo_image"
        />

        <ehubButton 
          @click="executeAction"
          text="Enviar dados"
          :disabled="sendingToApi"
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
      leagueForm: {
        name: '',
        description: '',
        route: '',
        logo_image: '',
      },
    }
  },
  computed: {
    welcomeTitle() {
      return "Olá, que bom que você vai se juntar a nós" + (this.leagueForm.name ? ', ' + this.leagueForm.name : '') + '!';
    },
  },
  methods: {
    async executeAction() {
      this.sendingToApi = true;
      await League.create(this.leagueForm);
      this.sendingToApi = false;
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

<style>

</style>