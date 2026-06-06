<script setup>
import ehubNavGroup from '@/components/inputs/ehub-nav-group.vue';
import orgAbout from '@/components/modules/org-about.vue';
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';

import Organization from '@/helpers/communication/Organization.js';
import Article from '@/helpers/communication/Article.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <main class="container">
        <div class="row justify-content-center mb-5" v-if="$route.query.created === 'true'">
            <div class="col-12">
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ $t('pages.organization.show.created_alert') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            </div>
        </div>

        <div class="row justify-content-center">
            <div class="col-12 col-lg-3 align-self-center text-center">
                <InitialsAvatar
                    :name="leagueData.name"
                    :image="leagueData.logo_image"
                    type="org"
                    :size="180"
                    class="mx-auto"
                />
            </div>
            <div class="col-12 col-lg-9 align-self-center">
                <h1>{{ leagueData.name }}</h1>
                <p>{{ leagueData.description }}</p>
                <div class="d-flex gap-2 flex-wrap mt-3">
                    <button class="btn btn-primary">
                        <font-awesome-icon :icon="['fas', 'bell']" class="me-2" />
                        {{ $t('pages.organization.show.follow') }}
                    </button>
                    <button class="btn btn-secondary">
                        <font-awesome-icon :icon="['fas', 'envelope']" class="me-2" />
                        {{ $t('pages.organization.show.send_message') }}
                    </button>
                    <router-link
                        v-if="canManage"
                        :to="`/org/${$route.params.orgRoute}/manage`"
                        class="btn btn-outline-secondary"
                    >
                        <font-awesome-icon :icon="['fas', 'gear']" class="me-2" />
                        {{ $t('pages.organization.show.manage') }}
                    </router-link>
                </div>
            </div>
        </div>

        <div class="row justify-content-center mt-5">
            <div class="col-12">
                <ehubNavGroup :buttons="navGroupMenu" v-model:activeId="actualNavId" navType="tabs" class="mb-3 mt-5" />

                <div v-if="actualNavId == 'lastNews'" class="container">
                    <div v-if="articlesLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                    <div v-else-if="articles.length === 0" class="text-center py-5 text-muted">
                        <font-awesome-icon :icon="['fas', 'file-lines']" size="3x" class="mb-3 opacity-50" />
                        <p>{{ $t('pages.organization.news.public.empty') }}</p>
                    </div>
                    <div v-else class="row g-3 mt-1">
                        <div v-for="article in articles" :key="article.id" class="col-12 col-md-6 col-lg-4">
                            <router-link
                                :to="`/org/${$route.params.orgRoute}/news/${article.slug}`"
                                class="text-decoration-none"
                            >
                                <div class="news-card h-100">
                                    <div class="news-card__cover ratio ratio-16x9">
                                        <img
                                            v-if="article.cover_image"
                                            :src="SystemVars.baseUrl + 'storage/' + article.cover_image"
                                            :alt="article.title"
                                        />
                                        <div v-else class="news-card__cover-placeholder">
                                            <font-awesome-icon :icon="['fas', 'newspaper']" />
                                        </div>
                                    </div>
                                    <div class="news-card__body">
                                        <p class="news-card__date text-muted small mb-1">{{ formatArticleDate(article.published_at) }}</p>
                                        <h5 class="news-card__title">{{ article.title }}</h5>
                                        <p v-if="article.excerpt" class="news-card__excerpt text-muted small mb-2">{{ article.excerpt }}</p>
                                        <p v-if="article.author" class="text-muted small mb-0">
                                            {{ $t('pages.organization.news.public.by') }} {{ article.author.name }}
                                        </p>
                                    </div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- <lastLeagueNews v-if="actualNavId == 'lastNews'" :refersTo="$route.params.leagueRoute" /> -->
                <div class="container" v-else-if="actualNavId == 'events'">
                    <div v-if="eventsLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                    <div v-else-if="events.length === 0" class="text-center py-5 text-muted">
                        <font-awesome-icon :icon="['fas', 'calendar-days']" size="3x" class="mb-3 opacity-50" />
                        <p>{{ $t('pages.organization.show.events.empty') }}</p>
                    </div>
                    <div v-else class="row g-3 mt-1">
                        <div v-for="event in events" :key="event.id" class="col-12 col-md-6 col-lg-4">
                            <router-link
                                :to="`/org/${$route.params.orgRoute}/event/${event.route}`"
                                class="text-decoration-none"
                            >
                                <div class="event-card h-100">
                                    <div class="event-card__cover ratio ratio-16x9">
                                        <img v-if="event.image" :src="SystemVars.baseUrl + 'storage/' + event.image" :alt="event.name" />
                                        <div v-else class="event-card__cover-placeholder">
                                            <font-awesome-icon :icon="['fas', 'calendar-days']" />
                                        </div>
                                    </div>
                                    <div class="event-card__body">
                                        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                            <span class="badge" :class="event.finished ? 'bg-secondary' : 'bg-success'">
                                                {{ event.finished ? $t('pages.organization.show.events.finished') : $t('pages.organization.show.events.active') }}
                                            </span>
                                            <span class="badge" :class="event.fee == 0 ? 'bg-info text-dark' : 'bg-primary'">
                                                {{ event.fee == 0 ? $t('pages.organization.show.events.free') : (event.currency?.toUpperCase() + ' ' + event.fee) }}
                                            </span>
                                            <span v-if="event.category" class="event-card__category">{{ event.category }}</span>
                                        </div>
                                        <h5 class="event-card__title">{{ event.name }}</h5>
                                        <p v-if="event.short_description" class="event-card__excerpt text-muted small mb-0">{{ event.short_description }}</p>
                                    </div>
                                </div>
                            </router-link>
                        </div>
                    </div>
                </div>

                <div v-else-if="actualNavId == 'about'"
                    class="container d-flex flex-column justify-content-center align-items-center my-5">
                    <div v-if="membersLoading" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                    <orgAbout v-else :orgData="leagueData" :members="members" />
                </div>

            </div>

        </div>
    </main>
</template>

<script>
import Organization from '@/helpers/communication/Organization.js';
import Article from '@/helpers/communication/Article.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';

export default {
    data() {
        return {
            actualNavId: '',
            leagueData: {
                name: '',
                description: '',
                route: '',
                logo_image: '',
                hierarchies: { config: [] },
            },
            members: [],
            membersLoaded: false,
            membersLoading: false,
            events: [],
            eventsLoaded: false,
            eventsLoading: false,
            articles: [],
            articlesLoaded: false,
            articlesLoading: false,
        };
    },
    async created() {
        const result = await Organization.show(this.$route.params.orgRoute);
        if (result.code === 200) this.leagueData = result.data;
    },
    computed: {
        canManage() {
            return ['owner', 'admin'].includes(this.leagueData.role);
        },
        navGroupMenu() {
            return [
                { id: 'lastNews', title: this.$t('pages.organization.show.tabs.news') },
                { id: 'events',   title: this.$t('pages.organization.show.tabs.events'), active: true },
                { id: 'about',    title: this.$t('pages.organization.show.tabs.about') },
            ];
        },
    },
    watch: {
        actualNavId(val) {
            if (val === 'about'    && !this.membersLoaded)  this.loadMembers();
            if (val === 'events'   && !this.eventsLoaded)   this.loadEvents();
            if (val === 'lastNews' && !this.articlesLoaded) this.loadArticles();
        },
    },
    methods: {
        async loadMembers() {
            this.membersLoading = true;
            const result = await Organization.getMembers(this.$route.params.orgRoute);
            this.membersLoading = false;
            this.membersLoaded = true;
            if (result.code === 200) this.members = result.data ?? [];
        },
        async loadEvents() {
            this.eventsLoading = true;
            const result = await OrganizationEvent.index(this.$route.params.orgRoute);
            this.eventsLoading = false;
            this.eventsLoaded = true;
            if (result.code === 200) this.events = result.data ?? [];
        },
        async loadArticles() {
            this.articlesLoading = true;
            const result = await Article.getAll(this.$route.params.orgRoute);
            this.articlesLoading = false;
            this.articlesLoaded = true;
            if (result.code === 200) this.articles = result.data ?? [];
        },
        formatArticleDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        },
    },
}
</script>

<style scoped>
.news-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.18s ease, background 0.18s ease;
    display: flex;
    flex-direction: column;
}
.news-card:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.07);
}
.news-card__cover { overflow: hidden; }
.news-card__cover img { width: 100%; height: 100%; object-fit: cover; }
.news-card__cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.2);
    font-size: 2rem;
}
.news-card__body { padding: 1rem; flex: 1; }
.news-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin-bottom: 0.35rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.news-card__excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ── Event cards ── */
.event-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.18s ease, background 0.18s ease;
    display: flex;
    flex-direction: column;
}
.event-card:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.07);
}
.event-card__cover { overflow: hidden; }
.event-card__cover img { width: 100%; height: 100%; object-fit: cover; }
.event-card__cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.2);
    font-size: 2rem;
}
.event-card__body { padding: 1rem; flex: 1; }
.event-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin-bottom: 0.35rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.event-card__excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.event-card__category {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
</style>
