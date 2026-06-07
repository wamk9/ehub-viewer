<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubInputImage from '@/components/inputs/ehub-input-image.vue';
import League from '@/helpers/Api/League.js';
import SystemVars from '@/helpers/General/SystemVars';

</script>

<template>
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
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
import { toast } from '@/helpers/toast.js';

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
            sendingToApi: false,
            newLeagueImage: '',
            updatedLeagueData:  JSON.parse(JSON.stringify(this.leagueData)), //Used to remove reactivity
            cacheTimestamp: Date.now()
        }
    },
    computed: {
        leagueImage() {
            return !this.newLeagueImage ? SystemVars.baseUrl + 'storage/user/profile/' + Store.getters.getUserId + '/logo.webp?cache=' + this.cacheTimestamp : this.newLeagueImage;
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

            const result = await League.updateProfile(this.refersTo, dataToSend);

            if (result.code == 200) {
                toast.success('Os dados da sua liga foram atualizados com sucesso!');
                this.$emit('league-updated', JSON.stringify(this.updatedLeagueData));
            } else {
                toast.error('Ops! Parece que algo deu errado ao salvar os dados da sua liga, que tal tentar novamente mais tarde?');
            }

            this.sendingToApi = false;
        },
        defaultLeagueImage() {
            return SystemVars.baseUrl + 'storage/league/default/logo.webp';
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