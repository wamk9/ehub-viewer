<script setup>
import ehubButton from '@/components/inputs/ehub-button.vue';
import router from '@/router';
</script>

<template>
<div class="card-body align-self-center col-12 col-lg-12 text-center">
    <div class="row mb-5">
        <div class="col-12 col-md-8 offset-md-2 col-lg-4 offset-lg-4"> 
            <div class="ratio ratio-1x1">
                <div class="preview-image" :style="httpStatusImg"></div>
            </div>
        </div>
    </div>

    <h2>{{ status }} - {{statusTitle[status]}}</h2>
    <p>{{ statusDescription[status] }}</p>

    <hr class= my-4>

    <div class="row">
        <div class="col-12">
            <ehubButton 
                @click="executeAction"
                text="Voltar para a página anterior"
                :disabled="false"
            />
        </div>
    </div>
</div>
</template>

<script>
export default {
    props: {
        status: {
            type: String,
        },
    },
  data() {
    return {
      errors: []
    }
  },
  computed: {
    httpStatusImg() {
        return 'background-image: url(https://http.cat/' + this.status + ')';
    },
    statusTitle() {
        return {
            404: 'Não encontrado',
        };
    },
    statusDescription() {
        return {
            404: 'Ops! Não achamos a página que você está procurando...',
        };
    },
  },
  methods: {
    executeAction() {
        router.back().go();
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
  height: 100%;
  width: 100%;
  background-size: 190%;
  background-position-x: 50%;
  background-position-y: 25%;
  border-radius:50%;
  border-width: 2px;
  border-color: black;
  background-color: gray;
  margin-bottom: 2rem;
  
}
</style>

<style>

</style>