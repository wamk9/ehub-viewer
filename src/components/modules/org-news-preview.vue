<template>
    <div class="row w-100">
        <a v-for="(item, index) in items.data" :key="index" :href="item.endpoint"
            class="col-12 my-2 text-start org-news-preview">
            <div class="ratio ratio-16x9 position-relative"
                :style="`background-image: url(${item.image}); background-size: cover; background-position: center;`">
                <div class="position-absolute bottom-0 w-100 text-white p-3 "
                    style="background-color: rgba(0,0,0,0.5); height: fit-content; top: auto; max-height: 100%;">
                    <h1>{{ item.title }}</h1>
                    <p class="mb-0">Created by: João</p>
                    <p>02/08/2025</p>
                </div>
            </div>
        </a>
    </div>

    <!-- Pagination -->
    <div class="row w-100 my-4" v-if="items.last_page > 1">
        <nav>
            <ul class="pagination justify-content-center">
                <!-- Previous -->
                <!-- <li class="page-item" :class="{ disabled: !items.prev_page_url }">
                    <a class="page-link" href="#" @click.prevent="loadPage(items.current_page - 1)">
                        &laquo;
                    </a>
                </li> -->

                <!-- Pages -->
                <li v-for="(link, i) in items.links" :key="i" class="page-item"
                    :class="{ active: link.active, disabled: !link.url }">
                    <a class="page-link" href="#" v-html="link.label"
                        @click.prevent="link.url && loadPage(new URL(link.url).searchParams.get('page'))"></a>
                </li>

                <!-- Next -->
                <!-- <li class="page-item" :class="{ disabled: !items.next_page_url }">
                    <a class="page-link" href="#" @click.prevent="loadPage(items.current_page + 1)">
                        &raquo;
                    </a>
                </li> -->
            </ul>
        </nav>
    </div>
</template>

<script>
export default {
    props: {
        title: String,
        items: Array,
        totalPages: Number,
        currentPage: Number,
        pages: Array,
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

<style scoped>
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

.org-news-preview {
    transition: all 0.3s ease-in-out;
}

.org-news-preview:hover {
    text-decoration: none;
    filter: saturate(0) brightness(0.8);
}
</style>
