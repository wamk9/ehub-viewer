<script setup>
import ehubButton from '@/components/inputs/ehub-button.vue';
// import router from '@/router';
</script>

<template>
<div class="row" :id="id">
    <div class="col-12 col-md-6 col-lg-4 tournament-block" v-for="tournament in tournaments">
        <div class="ratio ratio-1x1">
            <img class="preview-image w-100 tournament-image mb-4" :src="tournament.image">
        </div>
        <h3 class="tournament-title">{{ tournament.title }}</h3>
        <p class="tournament-started" v-if="tournament.started">Inicia em {{ tournament.started }}</p>
        <p v-if="tournament.finished">Finalizado em {{ tournament.finished }}</p>
        <ehubButton text="Saiba Mais" class="w-100 mt-auto"/>
    </div>
</div>
</template>

<script>
export default {
    props: {
      id: {
        type: String,
      },
      tournaments: {
          type: Array,
          required: true,
      },
    },
  data() {
    return {
      activeId : "",
      hasHref: false,
    }
  },
  methods: {
    executeAction(elementId) {
        if (this.scrollSpy)
          return;

        if (!elementId) {
            console.error('Insert ID of nav on ehub-list-group.');
            return;
        }

        if (!!this.activeId)
            document.getElementById(this.activeId).classList.remove('active');
        
        this.activeId = elementId;
        document.getElementById(this.activeId).classList.add('active');
        this.$emit('update:activeId', this.activeId);
        this.$emit(this.activeId + '_btn')
    },
  },
}
</script>

<style scoped>
.tournament-block {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
}

.tournament-image {
  border-radius: 50%;
}

.tournament-title {
    margin-top: 1rem;
    font-size: 1.3rem;
    text-align: center;
}

.tournament-started {
    font-size: .8rem;
    text-align: center;
}
</style>

<style>

</style>