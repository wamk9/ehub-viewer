<template>
    <div v-if="show">
        <!-- Billing blocked warning -->
        <div v-if="billingData?.billing_blocked" class="alert alert-danger d-flex gap-2 align-items-center mb-4 small">
            <font-awesome-icon :icon="['fas', 'ban']" class="flex-shrink-0" />
            <span>{{ $t('finances.billing.blocked_warning') }}</span>
        </div>

        <!-- Stripe card setup -->
        <div class="gen-section mb-4">
            <p class="gen-section__title">{{ $t('finances.billing.payment_method') }}</p>
            <div v-if="loadingBilling" class="text-center py-2">
                <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <template v-else>
                <p v-if="billingData?.has_card" class="text-success small mb-2">
                    <font-awesome-icon :icon="['fas', 'credit-card']" class="me-1" />
                    {{ $t('finances.billing.card_registered') }}
                </p>
                <p v-else class="text-muted small mb-2">{{ $t('finances.billing.no_card') }}</p>
                <button class="btn btn-sm btn-outline-primary" @click="setupCard" :disabled="settingUpCard">
                    <span v-if="settingUpCard" class="spinner-border spinner-border-sm me-1"></span>
                    {{ billingData?.has_card ? $t('finances.billing.update_card') : $t('finances.billing.add_card') }}
                </button>
                <p class="text-muted mt-2 mb-0" style="font-size:0.72rem">{{ $t('finances.billing.stripe_notice') }}</p>
            </template>
        </div>

        <!-- Current cycle -->
        <div class="gen-section mb-4">
            <p class="gen-section__title">{{ $t('finances.billing.current_cycle', { cycle: billingData?.current_cycle }) }}</p>
            <div v-if="loadingBilling" class="text-center py-2">
                <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else class="d-flex align-items-center justify-content-between">
                <span class="text-muted small">{{ billingData?.pending_items ?? 0 }} {{ $t('finances.billing.items') }}</span>
                <span class="fw-bold">R$ {{ formatAmount(billingData?.pending_total) }}</span>
            </div>
        </div>

        <!-- Invoice history -->
        <div class="gen-section">
            <p class="gen-section__title">{{ $t('finances.billing.history') }}</p>

            <div v-if="loadingBilling" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>

            <div v-else-if="!billingData?.invoices?.length" class="text-center py-4 text-muted small">
                <font-awesome-icon :icon="['fas', 'file-invoice']" class="mb-2" style="font-size:1.5rem;opacity:.4;display:block" />
                {{ $t('finances.billing.no_invoices') }}
            </div>

            <div v-else class="invoice-list">
                <div v-for="inv in billingData.invoices" :key="inv.id" class="invoice-row" @click="openInvoice(inv.billing_cycle)">
                    <div class="invoice-cycle">{{ inv.billing_cycle }}</div>
                    <div class="flex-grow-1">
                        <span class="badge" :class="statusClass(inv.status)">{{ $t(`finances.billing.status.${inv.status}`) }}</span>
                    </div>
                    <div class="invoice-amount">R$ {{ formatAmount(inv.total_amount) }}</div>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-muted" style="font-size:.75rem" />
                </div>
            </div>
        </div>

        <!-- Invoice detail modal -->
        <div v-if="selectedInvoice" class="modal-overlay" @click.self="selectedInvoice = null">
            <div class="modal-card">
                <div class="modal-card__header">
                    <h5 class="mb-0">{{ $t('finances.billing.invoice_detail', { cycle: selectedInvoice.billing_cycle }) }}</h5>
                    <button class="btn-close btn-close-white" @click="selectedInvoice = null"></button>
                </div>
                <div class="modal-card__body">
                    <div v-if="loadingInvoice" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>
                    <template v-else>
                        <div class="d-flex justify-content-between mb-3">
                            <span class="badge" :class="statusClass(selectedInvoice.status)">{{ $t(`finances.billing.status.${selectedInvoice.status}`) }}</span>
                            <span class="fw-bold">R$ {{ formatAmount(selectedInvoice.total_amount) }}</span>
                        </div>
                        <div class="invoice-items">
                            <div v-for="item in selectedInvoice.items" :key="item.id" class="invoice-item">
                                <span class="text-muted small">{{ item.user?.name ?? '—' }}</span>
                                <span class="small">{{ $t(`finances.billing.type.${item.billing_type}`) }}</span>
                                <span class="fw-semibold small">R$ {{ formatAmount(item.fee_amount) }}</span>
                            </div>
                        </div>
                        <div v-if="!selectedInvoice.items?.length" class="text-muted text-center small py-2">
                            {{ $t('finances.billing.no_items') }}
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';

export default {
    props: {
        show: { type: Boolean, required: true },
        orgRoute: { type: String, required: true },
    },
    data() {
        return {
            loadingBilling: true,
            billingData: null,
            settingUpCard: false,
            selectedInvoice: null,
            loadingInvoice: false,
        };
    },
    watch: {
        show(val) { if (val) this.load(); },
    },
    mounted() { if (this.show) this.load(); },
    methods: {
        async load() {
            this.loadingBilling = true;
            const result = await OrganizationBilling.getBilling(this.orgRoute);
            this.loadingBilling = false;
            if (result.code === 200) this.billingData = result.data;
        },

        async setupCard() {
            this.settingUpCard = true;
            const result = await OrganizationBilling.setupStripe(this.orgRoute);
            this.settingUpCard = false;
            if (result.code === 200 && result.clientSecret) {
                // Stripe.js integration: open Stripe card modal
                // Requires @stripe/stripe-js loaded in the page
                // For now open the Stripe hosted setup link (TODO: embed)
                alert(this.$t('finances.billing.stripe_setup_pending'));
            }
        },

        async openInvoice(cycle) {
            this.selectedInvoice = { billing_cycle: cycle, items: [] };
            this.loadingInvoice = true;
            const result = await OrganizationBilling.getInvoice(this.orgRoute, cycle);
            this.loadingInvoice = false;
            if (result.code === 200) this.selectedInvoice = result.data;
        },

        formatAmount(val) {
            return parseFloat(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        },

        statusClass(status) {
            return {
                paid:    'bg-success',
                pending: 'bg-warning text-dark',
                failed:  'bg-danger',
                waived:  'bg-secondary',
                empty:   'bg-secondary',
            }[status] ?? 'bg-secondary';
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
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 0.75rem;
}
.invoice-list { display: flex; flex-direction: column; gap: 0.25rem; }
.invoice-row {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.65rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    cursor: pointer; border-radius: 6px; font-size: 0.875rem;
    transition: background 0.12s;
}
.invoice-row:hover { background: rgba(255,255,255,0.04); }
.invoice-row:last-child { border-bottom: none; }
.invoice-cycle { font-weight: 600; width: 5.5rem; color: rgba(255,255,255,0.8); }
.invoice-amount { font-weight: 600; color: rgba(255,255,255,0.9); }

/* Modal */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 1050; padding: 1rem;
}
.modal-card { background: #1a1d2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; width: 100%; max-width: 480px; overflow: hidden; }
.modal-card__header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.modal-card__body { padding: 1.2rem 1.4rem; max-height: 60vh; overflow-y: auto; }
.invoice-items { display: flex; flex-direction: column; gap: 0.4rem; }
.invoice-item {
    display: grid; grid-template-columns: 1fr 1fr auto;
    gap: 0.5rem; align-items: center;
    padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem;
}
.invoice-item:last-child { border-bottom: none; }
</style>
