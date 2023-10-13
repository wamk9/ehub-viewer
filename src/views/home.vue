<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import Auth from '@/helpers/Api/Auth.js';
</script>

<template>
  <div class="col-12 align-self-center">
    <div class="card text-center w-100 py-4 px-3">
      <div class="card-body align-self-center col-12 col-lg-10">
        <h1 class="card-title mb-4">{{ authFormTitle }}</h1>
        <div class="auth-inputs">
          <ehubInput
            v-model="authForm.email"
            icon="envelope"
            type="email"
            placeholder="Seu email"
          />

          <ehubInput
            v-model="authForm.password"
            icon="asterisk"
            type="password"
            placeholder="Sua senha"
          />
        </div>

        <div class="auth-inputs" v-if="isNewUser">
          <ehubInput
            v-model="authForm.steamid"
            :icon="['fab', 'steam']"
            placeholder="Seu Steam ID"
          />

          <ehubInput
            v-model="authForm.steamid"
            icon="id-card"
            placeholder="Seu nome completo"
          />

          <input
            type="file"
            accept="image/jpeg/*"
            @change="uploadImage()"
          />
        </div>
        <a href="#" v-on:click="executeAction()" class="round btn btn-primary px-5">{{ AuthBtnAction }}</a>
        <hr class="my-4">
        <p class="card-text">{{ authFormDescription }} <a href="#" v-on:click="changeAuthForm()">Clique aqui!</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isNewUser: false,
      leagueForm: {
        name: '',
        description: '',
        route: '',
      },
      errors: []
    }
  },
  computed: {
    authFormTitle() {
      return this.isNewUser ? "Bem-vindo" : "Que bom que você voltou";
    },
    authFormDescription() {
      return this.isNewUser ? "Já possui cadastro?" : "Ainda não possui cadastro?";
    },
    AuthBtnAction() {
      return this.isNewUser ? "Cadastre-se" : "Entrar";
    }
  },
  methods: {
    changeAuthForm() {
      this.isNewUser = !this.isNewUser;
    },
    uploadImage() {
      let rawImg;
      const file = document.querySelector('input[type=file]').files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        rawImg = reader.result;
        leagueForm.image = rawImg;
      }
      reader.readAsDataURL(file);
    },
    executeAction() {
      if (this.isNewUser) 
      {
        return;
      }

      Auth.login(this.authForm);
    },
  },
  // Fetches posts when the component is created.
  created() {
    /*axios.get(`http://127.0.0.1:8000/api/`)
    .then(response => {
      // JSON responses are automatically parsed.
      this.posts = response.data
    })
    .catch(e => {
      this.errors.push(e)
    })*/
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

</style>

<style>
body {
  background-image: url('https://cdn.pixabay.com/photo/2014/11/15/13/13/sports-ground-531919_960_720.jpg') !important;
  background-size: cover;
  backdrop-filter: blur(20px);
}
</style>