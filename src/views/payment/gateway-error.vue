<template>
    <main class="container py-5 text-center">
        <div class="gateway-error-card mx-auto">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="gateway-error-icon mb-4" />
            <h2 class="mb-2">{{ $t('finances.gateway_error.title') }}</h2>
            <p class="text-muted small mb-4">{{ reason || $t('finances.gateway_error.generic') }}</p>
            <router-link
                v-if="$route.query.org"
                :to="`/org/${$route.query.org}/manage/finances`"
                class="btn btn-primary btn-sm"
            >
                {{ $t('finances.gateway_error.back') }}
            </router-link>
            <router-link v-else :to="{ name: 'events' }" class="btn btn-outline-secondary btn-sm">
                {{ $t('finances.gateway_error.home') }}
            </router-link>
        </div>
    </main>
</template>

<script>
export default {
    computed: {
        reason() {
            const r = this.$route.query.reason;
            if (!r) return null;
            const map = {
                invalid_state:   this.$t('finances.gateway_error.invalid_state'),
                exchange_failed: this.$t('finances.gateway_error.exchange_failed'),
                access_denied:   this.$t('finances.gateway_error.access_denied'),
            };
            return map[r] ?? r;
        },
    },
};
</script>

<style scoped>
.gateway-error-card {
    max-width: 420px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 3rem 2rem;
}
.gateway-error-icon {
    font-size: 3rem;
    color: #f59e0b;
    opacity: 0.8;
}
</style>
