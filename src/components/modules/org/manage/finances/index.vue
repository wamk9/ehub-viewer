<template>
    <div v-if="show" class="finances-manage">

        <div class="gen-header mb-4">
            <button class="gen-back" @click="$emit('close')">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ $t('finances.title') }}
            </button>
            <h2 class="gen-title">{{ $t('finances.title') }}</h2>
            <div></div>
        </div>

        <ul class="nav nav-tabs gen-tabs mb-4">
            <li class="nav-item">
                <button class="nav-link" :class="{ active: tab === 'gateways' }" @click="tab = 'gateways'">
                    <font-awesome-icon :icon="['fas', 'link']" class="me-1" />
                    {{ $t('finances.tabs.gateways') }}
                </button>
            </li>
            <li class="nav-item">
                <button class="nav-link" :class="{ active: tab === 'billing' }" @click="tab = 'billing'">
                    <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="me-1" />
                    {{ $t('finances.tabs.billing') }}
                </button>
            </li>
        </ul>

        <gatewaysTab :show="tab === 'gateways'" :orgRoute="orgRoute" />
        <billingTab  :show="tab === 'billing'"  :orgRoute="orgRoute" />

    </div>
</template>

<script setup>
import gatewaysTab from './gateways.vue';
import billingTab  from './billing.vue';
</script>

<script>
export default {
    props: {
        show:     { type: Boolean, required: true },
        orgRoute: { type: String, required: true },
    },
    emits: ['close'],
    data() {
        return { tab: 'gateways' };
    },
    watch: {
        show(val) {
            if (val) this.tab = 'gateways';
        },
    },
};
</script>

<style scoped>
.gen-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
}
.gen-back {
    background: none; border: none; color: rgba(255,255,255,0.45);
    font-size: 0.875rem; padding: 0; cursor: pointer;
    display: inline-flex; align-items: center; gap: 0.45rem;
    transition: color 0.15s;
}
.gen-back:hover { color: rgba(255,255,255,0.9); }
.gen-title { text-align: center; font-size: 1.25rem; font-weight: 600; margin: 0; color: rgba(255,255,255,0.92); }

.gen-tabs { border-bottom: 1px solid rgba(255,255,255,0.12); gap: 0.25rem; }
.gen-tabs .nav-link {
    color: rgba(255,255,255,0.45); border: none;
    border-bottom: 2px solid transparent;
    padding: 0.55rem 1.1rem; font-size: 0.9rem; font-weight: 500;
    background: none; border-radius: 0; transition: color 0.15s, border-color 0.15s;
}
.gen-tabs .nav-link:hover { color: rgba(255,255,255,0.8); border-bottom-color: rgba(255,255,255,0.2); }
.gen-tabs .nav-link.active { color: #fff; border-bottom-color: #4e8bff; background: none; }
</style>
