<template>
    <div v-if="show">
        <div class="gen-section mb-4">
            <p class="gen-section__title">{{ $t('finances.gateways.title') }}</p>
            <p class="text-muted small mb-4">{{ $t('finances.gateways.description') }}</p>

            <div v-if="loading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>

            <div v-else class="d-flex flex-column gap-3">

                <!-- MercadoPago -->
                <div class="gateway-card">
                    <div class="gateway-card__info">
                        <div class="gateway-card__logo gateway-card__logo--mp">MP</div>
                        <div>
                            <strong class="d-block">MercadoPago</strong>
                            <span v-if="mpGateway" class="text-success small">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="me-1" />
                                {{ $t('finances.gateways.connected') }} · {{ mpGateway.gateway_user_id }}
                            </span>
                            <span v-else class="text-muted small">{{ $t('finances.gateways.not_connected') }}</span>
                        </div>
                    </div>
                    <div class="gateway-card__actions">
                        <button v-if="!mpGateway" class="btn btn-sm btn-primary" :disabled="connecting === 'mercadopago'" @click="connect('mercadopago')">
                            <span v-if="connecting === 'mercadopago'" class="spinner-border spinner-border-sm me-1"></span>
                            {{ $t('finances.gateways.connect') }}
                        </button>
                        <button v-else class="btn btn-sm btn-outline-danger" :disabled="disconnecting === 'mercadopago'" @click="disconnect('mercadopago')">
                            <span v-if="disconnecting === 'mercadopago'" class="spinner-border spinner-border-sm me-1"></span>
                            {{ $t('finances.gateways.disconnect') }}
                        </button>
                    </div>
                </div>

                <!-- Stripe Connect -->
                <div class="gateway-card">
                    <div class="gateway-card__info">
                        <div class="gateway-card__logo gateway-card__logo--sc">SC</div>
                        <div>
                            <strong class="d-block">Stripe</strong>
                            <span v-if="scGateway" class="text-success small">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="me-1" />
                                {{ $t('finances.gateways.connected') }} · {{ scGateway.gateway_user_id }}
                            </span>
                            <span v-else class="text-muted small">{{ $t('finances.gateways.not_connected') }}</span>
                        </div>
                    </div>
                    <div class="gateway-card__actions">
                        <button v-if="!scGateway" class="btn btn-sm btn-primary" :disabled="connecting === 'stripe_connect'" @click="connect('stripe_connect')">
                            <span v-if="connecting === 'stripe_connect'" class="spinner-border spinner-border-sm me-1"></span>
                            {{ $t('finances.gateways.connect') }}
                        </button>
                        <button v-else class="btn btn-sm btn-outline-danger" :disabled="disconnecting === 'stripe_connect'" @click="disconnect('stripe_connect')">
                            <span v-if="disconnecting === 'stripe_connect'" class="spinner-border spinner-border-sm me-1"></span>
                            {{ $t('finances.gateways.disconnect') }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="gateways.length === 0 && !loading" class="alert alert-warning small mt-3 mb-0">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                {{ $t('finances.gateways.warning_none') }}
            </div>
        </div>
    </div>
</template>

<script>
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';
import { toast } from '@/helpers/toast.js';

export default {
    props: {
        show: { type: Boolean, required: true },
        orgRoute: { type: String, required: true },
    },
    data() {
        return {
            loading: true,
            gateways: [],
            connecting: null,
            disconnecting: null,
        };
    },
    computed: {
        mpGateway() { return this.gateways.find(g => g.gateway === 'mercadopago') ?? null; },
        scGateway() { return this.gateways.find(g => g.gateway === 'stripe_connect') ?? null; },
    },
    watch: {
        show(val) { if (val) this.load(); },
    },
    mounted() {
        if (this.show) this.load();
        const connected = this.$route?.query?.connected;
        if (connected) {
            toast.success(this.$t('finances.gateways.connect_success', { gateway: connected.replace('_', ' ') }));
            this.$router.replace({ query: {} });
        }
    },
    methods: {
        async load() {
            this.loading = true;
            const result = await OrganizationBilling.getGateways(this.orgRoute);
            this.loading = false;
            if (result.code === 200 && Array.isArray(result.data)) {
                this.gateways = result.data;
            }
        },
        async connect(gateway) {
            this.connecting = gateway;
            const result = await OrganizationBilling.connectGateway(this.orgRoute, gateway);
            this.connecting = null;
            if (result.code === 200 && result.url) {
                window.location.href = result.url;
            }
        },
        async disconnect(gateway) {
            this.disconnecting = gateway;
            const result = await OrganizationBilling.disconnectGateway(this.orgRoute, gateway);
            this.disconnecting = null;
            if (result.code === 200) {
                this.gateways = this.gateways.filter(g => g.gateway !== gateway);
            }
        },
    },
};
</script>

<style scoped>
.gen-section {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
}
.gen-section__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.6rem;
}
.gateway-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.2rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    flex-wrap: wrap;
}
.gateway-card__info { display: flex; align-items: center; gap: 0.9rem; }
.gateway-card__logo {
    width: 2.5rem; height: 2.5rem;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.03em;
}
.gateway-card__logo--mp { background: rgba(0,158,227,0.2); color: #009ee3; }
.gateway-card__logo--sc { background: rgba(99,91,255,0.2); color: #635bff; }
</style>
