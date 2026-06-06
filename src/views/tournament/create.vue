<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import progressSteps from '@/components/general/progress-steps/progress-steps.vue';
import League from '@/helpers/Api/League';
import Tournament from '@/helpers/communication/Tournament.js';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
  
  <div class="col-12 col-lg-12 align-self-center">
    <div class="card text-center w-100 py-4 px-3 my-5">
      <div class="card-body align-self-center col-12 col-lg-10">
        <progressSteps v-model="page" :items="createTournamentSteps"></progressSteps>
        
        <h1 class="card-title mb-5">{{welcomeTitle}}</h1>

        <section v-if="page == 0" id="logo">
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
                        <img class="preview-logo" :src="srcTournamentLogo">
                    </div>
                </div>
                <div class="col-12 col-md-5 offset-md-2 align-self-center">
                    <ehubInputImage
                        id="logo"
                        v-model="tournamentForm.logo_image"
                    />
                </div>
            </div>

            <ehubButton 
              @click="page++"
              text="Próxima etapa"
              containerStyle="float: right; width: 49%; margin-top:3rem;"
              buttonStyle="width: 100%; padding: 10px 0;"
            />
        </section>

        <section v-else-if="page == 1" id="required-info">
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
                        placeholder="URL customizada para acesso ao campeonato"
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

                    <div class="input-group mb-3">
                      <select v-model="tournamentForm.category_route" class="form-select" id="category" @change="updateSubcategories">
                        <option v-for="category in categories" :value="category.route" :disabled="!!category.disabled">{{category.name}}</option>
                      </select>
                    </div>

                    <div class="input-group mb-3">
                      <select v-model="tournamentForm.subcategory_id" class="form-select" id="subcategory">
                        <option v-for="subcategory in subcategories" :value="subcategory.id" :disabled="!!subcategory.disabled">{{subcategory.name}}</option>
                      </select>
                    </div>
                </div>
            </div>
            <ehubButton 
              @click="page--"
              text="Etapa anterior"
              containerStyle="float: left; width: 49%; margin-top:3rem;"
              buttonStyle="width: 100%; padding: 10px 0;"
            />
            <ehubButton 
              @click="page++"
              text="Próxima etapa"
              containerStyle="float: right; width: 49%; margin-top:3rem;"
              buttonStyle="width: 100%; padding: 10px 0;"
            />
        </section>

        <section v-else-if="page == 2" id="add-events">
          <div class="row">
            <div class="col-12 mb-3">
              <h2>Adicione eventos ao campeonato</h2>
              <p>Temos as principais informações, agora que tal passar quais serão os eventos do seu campeonato?</p>
            </div>
          </div>

          <ehubButton 
            @click="page--"
            text="Etapa anterior"
            containerStyle="float: left; width: 49%; margin-top:3rem;"
            buttonStyle="width: 100%; padding: 10px 0;"
          />
          <ehubButton 
            @click="page++"
            text="Próxima etapa"
            containerStyle="float: right; width: 49%; margin-top:3rem;"
            buttonStyle="width: 100%; padding: 10px 0;"
          />
        </section>

        <section v-else-if="page == 3" id="check-info">

          <div class="col-12">
            <h3>Tudo certo? Então...</h3>
            <ehubButton 
                @click="executeAction"
                text="Envie seus dados"
                :disabled="sendingToApi"
            />
          </div>

          <ehubButton 
            @click="page--"
            text="Etapa anterior"
            containerStyle="float: left; width: 49%; margin-top:3rem;"
            buttonStyle="width: 100%; padding: 10px 0;"
          />
        </section>

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
        category_route: '',
        subcategory_id: 0,
      },
      page: 0,
      initCategory:
      {
        route: '',
        name: 'Selecione uma categoria',
        selected: true,
        disabled: true,
      },
      initSubcategory:
      {
        id: 0,
        name: 'Selecione uma subcategoria',
        selected: true,
        disabled: true,
      },
      categories: [
      {
          id: 0,
          name: 'Carregando...',
          selected: true,
          disabled: true,
        }
      ],
      subcategories: [
        {
          id: 0,
          name: 'Carregando...'
        }
      ],
      createTournamentSteps: [
        {
          name: 'Adicione um logo',
          icon: ['fas', 'image']
        },
        {
          name: 'Principais Informações',
          icon: ['fas', 'file-lines']
        },
        {
          name: 'Adicione eventos',
          icon: ['fas', 'calendar-plus']
        },
        {
          name: 'Confirmar Dados',
          icon: ['fas', 'check']
        }
      ],
    }
  },
  async mounted() {
    this.updateCategories();
    this.updateSubcategories();
  },
  computed: {
    welcomeTitle() {
      return "Hora de criar seu campeonato!";
    },
    srcTournamentLogo() {
      if (!!this.tournamentForm.logo_image)
        return this.tournamentForm.logo_image;
      else
        return SystemVars.baseUrl + 'storage/league/default/tournament/default/logo.webp';
    }
  },
  methods: {
    async executeAction() {
      this.sendingToApi = true;
      //console.log(await Tournament.getAllCategories());
      const result = await Tournament.create(this.tournamentForm);

      if (result.code == 200) {
        router.push('/league/' + this.$route.params.leagueRoute + '/tournament/' + this.tournamentForm.route);
      } else {
        for (const [key, value] of Object.entries(this.requestResponse.errors))
          this.formValidation[key] = { type: 'error', text: value[0] } ;

        this.sendingToApi = false;
      }
    },
    async updateCategories() {
      const resultCategory = await Tournament.getAllCategories();

      if (resultCategory.code == 200) {
        this.categories = resultCategory.data;
        this.categories.unshift(this.initCategory);
      }
    },
    async updateSubcategories() {
      const resultSubcategory = !!this.tournamentForm.category_route ? await Tournament.getSubcategories(this.tournamentForm.category_route) : { code: 422 };

      if (resultSubcategory.code == 200) {
        this.subcategories = resultSubcategory.data;
        this.subcategories.unshift(this.initSubcategory);
      } else {
        this.subcategories = [];
        this.subcategories.unshift(this.initSubcategory);
      }

      this.tournamentForm.subcategory_id = 0;
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