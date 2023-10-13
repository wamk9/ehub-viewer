<template>
<div class="row mb-4">
    <div class="col-12">
        <div class="input-group mb-2">
            <select class="form-select" id="inputGroupSelect02">
                <option value="2" selected>2023/2</option>
                <option value="1">2023/1</option>
            </select>
            <label class="input-group-text" for="inputGroupSelect02">Pesquisar</label>
        </div>

    </div>
</div>

<div class="accordion" id="accordionPanelsStayOpenExample">
    <div class="accordion-item">
        <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                Marcas e Pilotos
            </button>
        </h2>
        <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse">
            <div class="accordion-body">
                <div class="row">
                    <div class="col-12 col-lg-3">
                        <div class="ratio ratio-1x1">
                        <img class="preview-image" src="https://placehold.co/400">
                        </div>
                    </div>
                    <div class="col-12 col-lg-9 ">
                        <p class="mb-1"><strong>Categoria:</strong> Teste</p>        
                        <p class="mb-1"><strong>Sub-Categoria:</strong> Teste2</p>
                        <p class="mb-1"><strong>Eventos:</strong> 4</p>
                        <p class="mb-1"><strong>Limite de Inscritos/Inscritos:</strong> 15/10</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <p class="mb-1"><strong>Descrição:</strong></p>
                        <p>Phasellus pharetra tincidunt sapien et maximus. Proin auctor, libero nec eleifend faucibus, sem nunc vulputate orci, nec ultrices eros elit at nisi. Maecenas at lorem libero. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget sem a ipsum sagittis sodales vitae eu enim. Vivamus malesuada tempor lectus, ac placerat purus bibendum vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce sed lacus non magna vehicula placerat vel ullamcorper magna. Maecenas iaculis eros eget nulla tristique, a sollicitudin urna molestie. Curabitur placerat felis vel ultrices posuere. Duis sagittis dui ligula, in venenatis nulla mattis.</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 text-center">
                        <ehubButton
                            text="Editar Informações"
                            style="margin: 0 .5rem;"
                        />
                        <ehubButton
                            text="Enviar Aviso"
                            style="margin: 0 .5rem;"
                        />
                        <ehubButton
                            text="Encerrar"
                            style="margin: 0 .5rem;"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <ehubButton style="float: right;" text="Novo Campeonato" @click="() => { this.$router.push({name:'create-tournament'}); }"/>
    </div>
</div>
</template>

<script>
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
            cacheTimestamp: Date.now()
        }
    },
    computed: {
        leagueImage() {
            return !this.newLeagueImage ? 'http://ehubapp.com/storage/league/' + this.refersTo + '/logo.webp?cache=' + this.cacheTimestamp : this.newLeagueImage;
        },
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
        defaultLeagueImage() {
            return 'http://ehubapp.com/storage/league/default/logo.webp';
        }
    },
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