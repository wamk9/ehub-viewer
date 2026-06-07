<template>
    <main class="container py-4">

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="notFound" class="text-center py-5 text-muted">
            <font-awesome-icon :icon="['fas', 'file-circle-xmark']" size="3x" class="mb-3 opacity-50" />
            <p>{{ $t('events.show.news.empty') }}</p>
            <router-link :to="`/org/${$route.params.orgRoute}/event/${$route.params.eventRoute}`" class="btn btn-outline-secondary btn-sm">
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                {{ $t('pages.organization.general.back') }}
            </router-link>
        </div>

        <template v-else-if="item">
            <div class="row justify-content-center">
                <div class="col-12 col-lg-9">

                    <!-- Cover -->
                    <div v-if="item.cover_image" class="article-cover mb-4">
                        <img :src="baseUrl + 'storage/' + item.cover_image" :alt="item.title" />
                    </div>

                    <!-- Header -->
                    <div class="mb-4">
                        <p class="text-muted small mb-1">{{ formatDate(item.published_at) }}</p>
                        <h1 class="article-title mb-2">{{ item.title }}</h1>
                        <p v-if="item.excerpt" class="lead text-muted small">{{ item.excerpt }}</p>
                        <p v-if="item.author" class="text-muted small mb-0">
                            {{ $t('events.show.news.by') }} <strong>{{ item.author.name }}</strong>
                            <template v-if="item.event_name"> · {{ item.event_name }}</template>
                        </p>
                    </div>

                    <hr style="border-color:rgba(255,255,255,0.08)" />

                    <!-- Content -->
                    <div class="article-content mt-4" v-html="item.content"></div>

                    <hr style="border-color:rgba(255,255,255,0.08);margin-top:3rem" />

                    <div class="mt-3">
                        <router-link
                            :to="`/org/${$route.params.orgRoute}/event/${$route.params.eventRoute}`"
                            class="btn btn-outline-secondary btn-sm"
                        >
                            <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                            {{ $t('pages.organization.general.back') }}
                        </router-link>
                    </div>

                </div>
            </div>
        </template>

    </main>
</template>

<script>
import OrganizationEventArticle from '@/helpers/communication/OrganizationEventArticle.js';
import SystemVars from '@/helpers/General/SystemVars';

export default {
    data() {
        return {
            loading: true,
            notFound: false,
            item: null,
            baseUrl: SystemVars.baseUrl,
        };
    },
    async mounted() {
        const result = await OrganizationEventArticle.show(
            this.$route.params.orgRoute,
            this.$route.params.eventRoute,
            this.$route.params.articleSlug,
        );
        this.loading = false;
        if (result.code === 200 && result.data) {
            this.item = result.data;
        } else {
            this.notFound = true;
        }
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
            });
        },
    },
};
</script>

<style scoped>
.article-cover { border-radius: 12px; overflow: hidden; max-height: 420px; }
.article-cover img { width: 100%; height: 100%; object-fit: cover; }
.article-title { font-size: 1.9rem; font-weight: 700; color: rgba(255,255,255,0.95); line-height: 1.2; }
.article-content { color: rgba(255,255,255,0.8); font-size: 1rem; line-height: 1.8; }
.article-content :deep(h1) { font-size: 1.9rem; font-weight: 700; margin: 1.2rem 0 0.5rem; color: rgba(255,255,255,0.95); }
.article-content :deep(h2) { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.4rem; color: rgba(255,255,255,0.9); }
.article-content :deep(h3) { font-size: 1.2rem; font-weight: 600; margin: 0.8rem 0 0.3rem; color: rgba(255,255,255,0.85); }
.article-content :deep(p)  { line-height: 1.75; margin-bottom: 1rem; }
.article-content :deep(blockquote) {
    border-left: 3px solid rgba(255,255,255,0.3);
    padding-left: 1rem;
    color: rgba(255,255,255,0.55);
    margin: 0.75rem 0;
}
.article-content :deep(pre) {
    background: rgba(0,0,0,0.4);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    overflow-x: auto;
}
.article-content :deep(a)   { color: #7eabff; }
.article-content :deep(img) { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
.article-content :deep(iframe) { max-width: 100%; border-radius: 6px; margin: 0.5rem 0; }
.article-content :deep(ul), .article-content :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
.article-content :deep(li) { line-height: 1.7; }
.article-content :deep(hr) { border-color: rgba(255,255,255,0.12); margin: 1.5rem 0; }
.article-content :deep(code) {
    background: rgba(255,255,255,0.08);
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    font-size: 0.88em;
}
.article-content :deep(strong) { color: rgba(255,255,255,0.95); }
</style>
