<template>
  <div class="w-100 row">
    <div class="row w-100">
      <div class="col-12 col-md-6 text-start">
        <h1>{{ title }}</h1>
      </div>
      <div class="col-12 col-md-6 text-end">
        <div class="btn-group btn-group-lg" role="group" aria-label="Move carousel">
          <button class="btn btn-primary" @click="prevSlide">‹</button>
          <button class="btn btn-primary" @click="nextSlide">›</button>
        </div>
      </div>
      <div class="col-12 my-1">
        <hr />
      </div>
    </div>

    <div class="row w-100">
      <div class="col-12">
        <div class="overflow-hidden">
          <div class="d-flex transition me-3" ref="carouselTrack"
            :style="{ transform: `translateX(-${currentIndex * cardWidthPx}px)` }">
            <div v-for="(item, index) in items" :key="index" class="card me-2 flex-shrink-0" :class="cardColClass">
              <div class="ratio ratio-16x9">
                <img class="card-img-top" :src="item.image" :alt="item.title">
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ item.title }}</h5>
                <div display="inline-block mb-2">
                  <span class="badge rounded-pill me-2" :class="getTagColorClass(tag.color)" v-for="tag in item.tags">
                    {{ tag.title }}
                  </span>
                </div>
                <p class="card-text">{{ item.description }}</p>
              </div>
              <button class="btn btn-primary">{{ $t("modules.carouselcards.informations_button") }}</button>
            </div>
            <div v-if="callToAction" class="mx-3 card flex-shrink-0 col-12">
              <div class="card-body text-center px-3 d-flex justify-content-center align-items-center flex-column">
                <h5 class="card-title">{{ callToAction.title }}</h5>
                <p class="card-text">{{ callToAction.description }}</p>
                <div class="d-flex justify-content-center">
                  <button v-for="(button, idx) in callToAction.buttons" :key="idx" class="btn btn-primary mx-2"
                    @click="$emit('action', button.endpoint)">
                    {{ button.title }}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    items: Array,
    callToAction: Object
  },
  data() {
    return {
      currentIndex: 0,
      cardWidthPx: 0,
    }
  },
  computed: {
    cardColClass() {
      return "col-12 col-md-6 col-lg-4";
    }
  },
  methods: {
    getVisibleCards() {
      const width = window.innerWidth;
      if (width >= 992) return 3; // lg
      if (width >= 768) return 2; // md
      return 1; // sm
    },
    nextSlide() {
      const visible = this.getVisibleCards();
      const maxIndex = Math.max(0, this.items.length - this.callToAction ? 0 : visible);
      if (this.currentIndex < maxIndex) this.currentIndex < this.items.length - visible ? this.currentIndex++ : this.currentIndex = maxIndex;
    },
    prevSlide() {
      const visible = this.getVisibleCards();
      const maxIndex = Math.max(0, this.items.length);

      if (this.currentIndex >= maxIndex) this.currentIndex -= visible;
      else if (this.currentIndex > 0) this.currentIndex--;

      if (this.currentIndex < 0) this.currentIndex = 0;
    },
    updateCardWidth() {
      if (this.$refs.carouselTrack) {
        const card = this.$refs.carouselTrack.querySelector('.card');
        if (card) {
          const style = getComputedStyle(card);
          this.cardWidthPx = card.offsetWidth + parseInt(style.marginRight);
        }
      }
    },
    getTagColorClass(color) {
      switch (color) {
        case 'blue':
          return 'bg-primary text-white';
        case 'green':
          return 'bg-success text-white';
        case 'gray':
          return 'bg-secondary text-white';
        case 'yellow':
          return 'bg-warning text-white';
        case 'red':
          return 'bg-danger text-white';
        default:
          return 'bg-secondary text-white';
      }
    }
  },
  mounted() {
    this.updateCardWidth();
    window.addEventListener('resize', this.updateCardWidth);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateCardWidth);
  }
}
</script>

<style>
.transition {
  transition: transform 0.5s ease;
  display: flex;
}

.card-img-top {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.card {
  flex-shrink: 0;
}
</style>
