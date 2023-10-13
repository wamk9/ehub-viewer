<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import League from '@/helpers/Api/League.js';
</script>

<template>
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div v-if="resultCode == 200" class="alert alert-success alert-dismissible fade show" role="alert">
                Os dados da sua liga foram atualizados com sucesso!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" @click="() => (resultCode = 0)"></button>
            </div>
            <div v-else-if="resultCode > 200" class="alert alert-danger alert-dismissible fade show" role="alert">
                Ops! Parece que algo deu errado ao salvar os dados da sua liga, que tal tentar novamente mais tarde?
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" @click="() => (resultCode = 0)"></button>
            </div>


            
            <p>Aqui você poderá editar os dados iniciais de sua liga, como nome, link, descrição e imagem!</p>

            <div class="row align-items-center">
                <div class="col-12 col-lg-6">
                    <div class="ratio ratio-1x1">
                        <img class="preview-image" :src="leagueImage" @error="defaultLeagueImage">
                    </div>
                </div>

                <div class="col-12 col-lg-6 text-center">
                    <ehubInputImage
                        v-model="newLeagueImage"
                    />
                </div>
            </div>

            <div class="col-12">

                <ehubInput
                v-model="updatedLeagueData.name"
                :icon="['fas', 'address-card']"
                type="text"
                placeholder="Nome da sua liga"
                />
                
                <ehubInput
                v-model="updatedLeagueData.route"
                :icon="['fas', 'link']"
                placeholder="URL da sua liga"
                :disabled="true"
                />

                <ehubInput
                v-model="updatedLeagueData.description"
                icon="asterisk"
                type="textarea"
                placeholder="Descrição"
                />

                <ehubButton 
                @click="executeAction"
                text="Enviar dados"
                :disabled="sendingToApi"
                style="float: right"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        refersTo: {
            type: String,
            required: true,
        },
        leagueData: {
            type: Object,
        }
    },
    data() {
        return {
            resultCode: 0,
            sendingToApi: false,
            newLeagueImage: '',
            updatedLeagueData:  JSON.parse(JSON.stringify(this.leagueData)), //Used to remove reactivity
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

<style>

</style>