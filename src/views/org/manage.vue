<script setup>
import orgManageGeneral from '@/components/modules/org-manage-general.vue';
import manageEventsIndex from '@/components/modules/org/manage/events/index.vue';
import manageFinancesIndex from '@/components/modules/org/manage/finances/index.vue';
import manageNewsIndex from '@/components/modules/org/manage/news/index.vue';
import Organization from '@/helpers/communication/Organization.js';
</script>

<template>
    <main class="container manage-root">
        <Transition :name="transitionName" :css="direction !== 'none'">
            <div v-if="!anyOptionActive" key="dashboard" class="manage-view">
                <div class="manage-header text-center mb-5">
                    <h1 class="manage-header__title">
                        <span v-if="orgName">{{ orgName }}</span>
                        <span v-else class="placeholder col-4 rounded"></span>
                    </h1>
                    <p class="manage-header__subtitle">{{ $t('pages.organization.manage.subtitle') }}</p>
                </div>

                <div class="row g-4 justify-content-center">
                    <div v-for="(option, index) in options" :key="index" class="col-12 col-sm-6">
                        <div
                            class="manage-card"
                            :class="`manage-card--${option[getOptionAction(index)].color}`"
                            @click="goToOption(getOptionAction(index), getOptionAction(index) === 'events')"
                            role="button"
                            tabindex="0"
                            @keydown.enter="goToOption(getOptionAction(index), getOptionAction(index) === 'events')"
                        >
                            <div class="manage-card__icon-wrap">
                                <font-awesome-icon :icon="option[getOptionAction(index)].icon" />
                            </div>
                            <h4 class="manage-card__title">{{ $t(`pages.organization.manage.options.${getOptionAction(index)}.title`) }}</h4>
                            <p class="manage-card__desc">{{ $t(`pages.organization.manage.options.${getOptionAction(index)}.desc`) }}</p>
                            <div class="manage-card__arrow">
                                <font-awesome-icon :icon="['fas', 'chevron-right']" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="getOptionActivation('general')" key="general" class="manage-view">
                <orgManageGeneral
                    :orgRoute="$route.params.orgRoute"
                    @close="resetOptionActivation"
                />
            </div>

            <div v-else-if="getOptionActivation('events')" key="events" class="manage-view">
                <manageEventsIndex
                    :show="true"
                    @close="resetOptionActivation"
                    :forceOption="forceOption"
                />
            </div>

            <div v-else-if="getOptionActivation('news')" key="news" class="manage-view">
                <manageNewsIndex
                    :orgRoute="$route.params.orgRoute"
                    @close="resetOptionActivation"
                />
            </div>

            <div v-else-if="getOptionActivation('finances')" key="finances" class="manage-view">
                <manageFinancesIndex
                    :show="true"
                    :orgRoute="$route.params.orgRoute"
                    @close="resetOptionActivation"
                />
            </div>
        </Transition>
    </main>
</template>

<script>
export default {
    props: {
        forceOption: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            orgName: null,
            direction: 'forward',
            options: [
                { general:  { icon: ['fas', 'gear'],          color: 'blue',   active: false } },
                { events:   { icon: ['fas', 'calendar-days'], color: 'green',  active: false } },
                { news:     { icon: ['fas', 'newspaper'],     color: 'cyan',   active: false } },
                { finances: { icon: ['fas', 'coins'],         color: 'yellow', active: false } },
            ]
        }
    },
    computed: {
        anyOptionActive() {
            return this.options.some(o => Object.values(o)[0].active);
        },
        transitionName() {
            if (this.direction === 'none') return '';
            return this.direction === 'forward' ? 'slide-forward' : 'slide-backward';
        },
    },
    async mounted() {
        const result = await Organization.show(this.$route.params.orgRoute);
        if (result.code === 200 && result.data) {
            this.orgName = result.data.name;
        }

        if (this.forceOption && this.forceOption.length) {
            this.goToOption(this.forceOption.shift(), false, false);
        }
    },
    methods: {
        getOptionActivation(optkey) {
            const optionObj = this.options.find(o => Object.keys(o)[0].toLowerCase() === optkey.toLowerCase());
            if (!optionObj) return false;
            return Object.values(optionObj)[0].active;
        },
        getOptionAction(index) {
            return Object.keys(this.options[index])[0];
        },
        resetOptionActivation() {
            this.direction = 'backward';
            this.options.forEach(o => {
                Object.values(o)[0].active = false;
            });
        },
        goToOption(action, needsRoute, animate = true) {
            this.direction = animate ? 'forward' : 'none';
            this.options = this.options.map(optionObj => {
                const key = Object.keys(optionObj)[0];
                return {
                    [key]: {
                        ...optionObj[key],
                        active: action.toLowerCase() === key.toLowerCase()
                    }
                };
            });

            if (needsRoute) {
                this.$router.push({
                    name: `${this.$route.name}-${action}`,
                    params: { orgRoute: this.$route.params.orgRoute },
                });
            }
        },
    },
}
</script>

<style scoped>
/* ── Layout ── */
.manage-root {
    position: relative;
    overflow: hidden;
}

.manage-view {
    width: 100%;
}

/* ── Forward: cards exit left, content enters from right ── */
.slide-forward-enter-from {
    transform: translateX(60px);
    opacity: 0;
}
.slide-forward-enter-active {
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease;
}
.slide-forward-enter-to {
    transform: translateX(0);
    opacity: 1;
}
.slide-forward-leave-from {
    transform: translateX(0);
    opacity: 1;
}
.slide-forward-leave-active {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease;
}
.slide-forward-leave-to {
    transform: translateX(-60px);
    opacity: 0;
}

/* ── Backward: content exits right, cards enter from left ── */
.slide-backward-enter-from {
    transform: translateX(-60px);
    opacity: 0;
}
.slide-backward-enter-active {
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease;
}
.slide-backward-enter-to {
    transform: translateX(0);
    opacity: 1;
}
.slide-backward-leave-from {
    transform: translateX(0);
    opacity: 1;
}
.slide-backward-leave-active {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.32s ease;
}
.slide-backward-leave-to {
    transform: translateX(60px);
    opacity: 0;
}

/* ── Header ── */
.manage-header__title {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: rgba(255, 255, 255, 0.95);
}

.manage-header__subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0;
}

/* ── Cards ── */
.manage-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.75rem 1.5rem 1.5rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
    min-height: 190px;
    overflow: hidden;
}

.manage-card:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
}

.manage-card:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 3px;
}

.manage-card__icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.manage-card__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
    color: rgba(255, 255, 255, 0.92);
}

.manage-card__desc {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 0;
    line-height: 1.45;
}

.manage-card__arrow {
    position: absolute;
    bottom: 1.25rem;
    right: 1.25rem;
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.18s ease, transform 0.18s ease;
    color: rgba(255, 255, 255, 0.4);
}

.manage-card:hover .manage-card__arrow {
    opacity: 1;
    transform: translateX(3px);
}

/* ── Color variants ── */
.manage-card--blue   { border-top: 3px solid #4e8bff; }
.manage-card--blue   .manage-card__icon-wrap { background: rgba(78, 139, 255, 0.18); color: #7eabff; }

.manage-card--green  { border-top: 3px solid #3dd68c; }
.manage-card--green  .manage-card__icon-wrap { background: rgba(61, 214, 140, 0.15); color: #5de8a2; }

.manage-card--cyan   { border-top: 3px solid #22d3ee; }
.manage-card--cyan   .manage-card__icon-wrap { background: rgba(34, 211, 238, 0.15); color: #67e8f9; }

.manage-card--yellow { border-top: 3px solid #fbbf24; }
.manage-card--yellow .manage-card__icon-wrap { background: rgba(251, 191, 36, 0.15);  color: #fcd34d; }
</style>
