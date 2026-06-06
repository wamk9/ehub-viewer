<template>
<div class="row mb-4">
  <div class="col-12">
    <div class="input-group mb-2">
      <select v-model="periodSelected" class="form-select" id="inputGroupSelect02" v-for="period in periods">
        <option :value="period.value">{{period.title}}</option>
      </select>
    </div>
  </div>
</div>

<div class="accordion" id="accordion-tournaments" >
  <div class="accordion-item" v-for="item in tournamentList">
    <h2 class="accordion-header" :id="item.route + '-heading'">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="'#' + item.route + '-panel'" aria-expanded="false" :aria-controls="item.route + '-panel'">
        {{item.name}}
      </button>
    </h2>

    <div :id="item.route + '-panel'" class="accordion-collapse collapse" :aria-labelledby="item.route + '-heading'">
      <div class="accordion-body">
        <div class="row">
          <div class="col-12 col-lg-3">
            <div class="ratio ratio-1x1">
              <img class="preview-image" :src="baseUrl + 'storage/league/' + this.refersTo + '/tournament/'+ item.route + '/logo.webp?cache=' + cacheTimestamp" @error="alternativeTournamentLogo">
            </div>
          </div>
          <div class="col-12 col-lg-9 ">
              <p class="mb-1"><strong>Categoria:</strong> {{ item.category }}</p>
              <p class="mb-1"><strong>Sub-Categoria:</strong> {{ item.subcategory }}</p>
              <p class="mb-1"><strong>Eventos:</strong> {{ item.events_qtd }}</p>

              <p v-if="item.subscription_limit == 0" class="mb-1"><strong>Inscritos:</strong> {{ item.subscriptions_qtd }}</p>
              <p v-else class="mb-1"><strong>Inscritos/Limite de Inscritos:</strong> {{ item.subscriptions_qtd }}/{{ item.subscription_limit }}</p>
          </div>
        </div>

        <div class="row">
            <div class="col-12">
                <p class="mb-1"><strong>Descrição:</strong></p>
                <p>{{item.description}}</p>
            </div>
        </div>

        <div class="row">
            <div class="col-12 text-center">
                <ehubButton
                    text="Gerenciar"
                    buttonStyle="margin: 0 .5rem;"
                />
                <ehubButton
                    text="Enviar aviso aos inscritos"
                    buttonStyle="margin: 0 .5rem;"
                    :disabled="true"
                    title="Em desenvolvimento..."
                />
                <ehubButton
                    text="Protestos"
                    buttonStyle="margin: 0 .5rem;"
                    :disabled="true"
                    title="Em desenvolvimento..."
                />
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <ehubButton buttonStyle="float: right;" text="Novo Campeonato" @click="() => { this.$router.push({name:'create-tournament'}); }"/>
    </div>
</div>
</template>

<script>
import Tournament from '@/helpers/communication/Tournament.js';
import SystemVars from '@/helpers/General/SystemVars';

import ehubButton from '@/components/inputs/ehub-button.vue';

export default {
    components: {
        ehubButton
    },
    props: {
        refersTo: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            resultCode: 0,
            sendingToApi: false,
            newLeagueImage: '',
            cacheTimestamp: Date.now(),
            periods: [
                {
                    value: '',
                    title: 'Carregando...'
                }
            ],
            periodSelected: null,
            tournamentList: [],
            baseUrl: SystemVars.baseUrl,
        }
    },
    computed: {

    },
    async created() {
        const result = await Tournament.getPeriods(this.refersTo);

        if (result.code == 200) {
            this.periods = result.data;
        }

        this.periodSelected = this.periods[0].value;
        //await this.getTournamentsList();
    },
    mounted() {
        
    },
    methods: {
        async executeAction() {
            this.sendingToApi = true;

            const dataToSend = {
                name: this.updatedLeagueData.name,
                logo_image: this.newLeagueImage,
                description: this.updatedLeagueData.description,
            };

            this.resultCode = (await League.updateProfile(this.refersTo, dataToSend)).code;

            if (this.resultCode == 200)
                this.$emit('league-updated', JSON.stringify(this.updatedLeagueData));

            this.sendingToApi = false;
        },
        async getTournamentsList() {
            const filter = {};

            if (!!this.periodSelected)
                filter.period = this.periodSelected;

            const result = await Tournament.getTournaments(this.refersTo, filter);

            if (result.code == 200) {
                this.tournamentList = result.data;
            } else {
                console.error(result.errors);
            }
        },
        alternativeTournamentLogo(event) {
          event.target.src = SystemVars.baseUrl + 'storage/league/default/tournament/default/logo.webp';
        },
    },
    watch: {
        async periodSelected() {
            await this.getTournamentsList();
        }
    }
    /*setup(props, { emit }) {
        const updatedVModel = computed({  // Use computed to wrap the object
           get: () => props.leagueData,
            set: (value) => emit('update:leagueData', value),
        });

        return { updatedVModel };
    }*/
}
</script>

<style scoped>
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