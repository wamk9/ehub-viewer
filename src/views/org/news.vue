<script setup>
import Article from '@/helpers/communication/Article.js';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <main class="container">

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="notFound" class="text-center py-5 text-muted">
            <font-awesome-icon :icon="['fas', 'file-circle-xmark']" size="3x" class="mb-3 opacity-50" />
            <p>{{ $t('pages.organization.news.public.not_found') }}</p>
            <router-link :to="`/org/${$route.params.orgRoute}`" class="btn btn-outline-secondary btn-sm">
                {{ $t('pages.organization.news.public.back_to_org') }}
            </router-link>
        </div>

        <template v-else-if="item">
            <div class="row w-100">
                <div class="col-12 my-2 text-start org-news-preview">
                    <div class="ratio ratio-16x9 position-relative"
                        :style="item.cover_image
                            ? `background-image: url(${SystemVars.baseUrl}storage/${item.cover_image}); background-size: cover; background-position: center;`
                            : 'background: rgba(255,255,255,0.05);'">
                        <div class="position-absolute bottom-0 w-100 text-white p-3"
                            style="background-color: rgba(0,0,0,0.5); height: fit-content; top: auto; max-height: 100%;">
                            <h1>{{ item.title }}</h1>
                            <h2 v-if="item.excerpt" class="text-muted h5">{{ item.excerpt }}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row w-100 my-4">
                <div class="col-12 col-md-8 article-content" v-html="item.content"></div>
            </div>

            <div class="row w-100 my-4">
                <div class="col-12 text-center">
                    <hr />
                    <p class="text-muted small">
                        {{ $t('pages.organization.news.public.written_by') }}
                        <strong>{{ item.author?.name }}</strong>
                        {{ $t('pages.organization.news.public.at') }}
                        {{ formatDate(item.published_at || item.created_at) }}
                        {{ $t('pages.organization.news.public.linked_to') }}
                        <strong>{{ item.org_name }}</strong>.
                    </p>
                    <p class="text-muted small">
                        {{ $t('pages.organization.news.public.disclaimer') }}
                    </p>
                </div>
            </div>
        </template>

    </main>
</template>

<script>
import Article from '@/helpers/communication/Article.js';
import SystemVars from '@/helpers/General/SystemVars';

export default {
    data() {
        return {
            loading: true,
            notFound: false,
            item: null,
        };
    },
    async mounted() {
        const result = await Article.show(
            this.$route.params.orgRoute,
            this.$route.params.newsRoute,
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
.article-content :deep(h1) { font-size: 1.9rem; font-weight: 700; margin: 1.2rem 0 0.5rem; }
.article-content :deep(h2) { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.4rem; }
.article-content :deep(h3) { font-size: 1.2rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
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
</style>
