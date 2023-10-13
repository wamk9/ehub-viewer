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
        <h1 class="card-title mb-5">{{welcomeTitle}}</h1>

        <section id="logo">
            <div class="row">
                <div class="col-12 mb-3">
                    <h2>Logotipo</h2>
                    <p>O logotipo é responsável por mostrar a cara do seu campeonato para o mundo! É ele que vai ficar nas nossas listagens tanto da liga quando nas gerais.</p>
                    <p>Para melhor aproveitamento, recomendamos enviar uma imagem quadrada (proporção 1 para 1).</p>
                </div>
            </div>
            <div class="row mb-5">
                <div class="col-12 col-md-5">
                    <div class="ratio ratio-1x1">
                        <img class="preview-logo" :src="tournamentForm.logo_image">
                    </div>
                </div>
                <div class="col-12 col-md-5 offset-md-2 align-self-center">
                    <ehubInputImage
                        id="logo"
                        v-model="tournamentForm.logo_image"
                    />
                </div>
            </div>
        </section>

        <hr class="my-5">

        <section id="required-info">
            <div class="row">
                <div class="col-12 mb-3">
                    <h2>Principais informações</h2>
                    <p>Aqui costumam ficar as principais informações do seu campeonato, todas elas são obrigatórias para podermos prosseguir com o cadastro, ok?</p>
                </div>
            </div>
            <div class="row mb-5">
                <div class="col-12">
                    <ehubInput
                        v-model="tournamentForm.name"
                        :icon="['fas', 'address-card']"
                        type="text"
                        placeholder="Nome do seu campeonato"
                    />
                    
                    <ehubInput
                        v-model="tournamentForm.route"
                        :icon="['fas', 'link']"
                        placeholder="URL do seu campeonato"
                    />

                    <ehubInput
                        v-model="tournamentForm.description"
                        icon="asterisk"
                        type="textarea"
                        placeholder="Descrição"
                    />

                    <ehubInput
                        v-model="tournamentForm.price"
                        :icon="['fas', 'address-card']"
                        type="text"
                        placeholder="Valor para participar do campeonato"
                    />
                    
                    <ehubInput
                        v-model="tournamentForm.subscription_limit"
                        :icon="['fas', 'link']"
                        placeholder="Quantidade de pessoas que podem se inscrever"
                    />

                    <ehubInput
                        v-model="tournamentForm.category_id"
                        icon="asterisk"
                        type="textarea"
                        placeholder="Categoria"
                    />
                </div>
            </div>
        </section>

        <hr class="my-5">

        <div class="row mb-5">
            <div class="col-12">
                <p>Tudo certo? Então...</p>
                <ehubButton 
                    @click="executeAction"
                    text="Envie seus dados"
                    :disabled="sendingToApi"
                />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sendingToApi: false,
      tournamentForm: {
        name: '',
        description: '',
        route: '',
        logo_image: '',
        banner_image: '',
        price: '',
        subscription_limit: '',
        category_id: 1,
      },
    }
  },
  computed: {
    welcomeTitle() {
      return "Hora de criar seu campeonato!";
    },
  },
  methods: {
    async executeAction() {
      this.sendingToApi = true;
      await League.create(this.tournamentForm);
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
.preview-logo {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius:50%;
  border-width: 2px;
  border-color: black;
  background-color: gray;
}
.preview-header {
  height: 300px;
  width: 100%;
  object-fit: cover;
  border-width: 2px;
  border-color: black;
  background-color: gray;
  margin-bottom: 2rem;
}

</style>

<style>

</style>