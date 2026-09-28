<template>
  <EhubDialog :model-value="modelValue" :title="$t(K + 'title')" size="sm" :persistent="saving" @close="close">
    <p class="ecs-intro">{{ $t(K + 'intro') }}</p>

    <div v-if="loading" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
    <!-- Stripe's secure card fields: the card number never reaches eHub servers. -->
    <div v-show="!loading" ref="mount" class="ecs-element"></div>

    <p v-if="error" class="ecs-error"><font-awesome-icon :icon="['fas', 'triangle-exclamation']" />{{ error }}</p>
    <p class="ecs-secure"><font-awesome-icon :icon="['fas', 'lock']" />{{ $t(K + 'secure') }}</p>

    <template #footer>
      <button type="button" class="btn btn-outline-secondary round" :disabled="saving" @click="close">{{ $t(K + 'cancel') }}</button>
      <button type="button" class="btn btn-primary round" :disabled="loading || saving || !ready" @click="save">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>{{ $t(K + 'save') }}
      </button>
    </template>
  </EhubDialog>
</template>

<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';
import { loadStripeJs } from '@/helpers/General/stripeJs.js';

/**
 * Adds or replaces the organization's billing card inside eHub using Stripe's
 * Payment Element (SetupIntent). Emits `saved` with the card summary.
 */
export default {
  name: 'EhubCardSetupDialog',
  components: { EhubDialog },
  props: {
    modelValue: { type: Boolean, default: false },
    orgRoute: { type: String, required: true },
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return { K: 'pages.organization.manage.financeiro.card_dialog.', loading: false, saving: false, ready: false, error: '', stripe: null, elements: null };
  },
  watch: {
    modelValue(open) {
      if (open) this.$nextTick(this.init);
      else this.teardown();
    },
  },
  beforeUnmount() { this.teardown(); },
  methods: {
    async init() {
      this.loading = true;
      this.error = '';
      this.ready = false;
      try {
        const res = await OrganizationBilling.setupStripe(this.orgRoute);
        if (res.code !== 200 || !res.clientSecret || !res.publishableKey) throw new Error('setup');
        const Stripe = await loadStripeJs();
        this.stripe = Stripe(res.publishableKey);
        const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        this.elements = this.stripe.elements({
          clientSecret: res.clientSecret,
          locale: this.$i18n.locale === 'pt-BR' ? 'pt-BR' : this.$i18n.locale,
          appearance: {
            theme: dark ? 'night' : 'stripe',
            variables: { colorPrimary: '#0098D8', borderRadius: '8px', fontSizeBase: '14px' },
          },
        });
        const element = this.elements.create('payment', { layout: 'tabs' });
        element.on('ready', () => { this.loading = false; });
        element.on('change', (e) => { this.ready = e.complete; if (e.complete) this.error = ''; });
        element.mount(this.$refs.mount);
      } catch {
        this.loading = false;
        this.error = this.$t(this.K + 'load_error');
      }
    },
    async save() {
      this.saving = true;
      this.error = '';
      const { error, setupIntent } = await this.stripe.confirmSetup({ elements: this.elements, redirect: 'if_required' });
      if (error) {
        this.saving = false;
        this.error = error.message || this.$t(this.K + 'save_error');
        return;
      }
      const res = await OrganizationBilling.confirmStripeCard(this.orgRoute, setupIntent.id);
      this.saving = false;
      if (res.code !== 200) {
        this.error = this.$t(this.K + 'save_error');
        return;
      }
      this.$emit('saved', res.card);
      this.$emit('update:modelValue', false);
    },
    close() {
      if (this.saving) return;
      this.$emit('update:modelValue', false);
    },
    teardown() {
      try { this.elements?.getElement('payment')?.destroy(); } catch { /* already gone */ }
      this.elements = null;
    },
  },
};
</script>

<style scoped>
.ecs-intro { font-size: .84rem; color: var(--ehub-muted); margin: 0 0 14px; }
.ecs-element { min-height: 60px; }
.ecs-error { display: flex; gap: 7px; align-items: flex-start; font-size: .8rem; color: #e23b3b; margin: 12px 0 0; }
.ecs-secure { display: flex; gap: 7px; align-items: center; font-size: .72rem; color: var(--ehub-muted); margin: 14px 0 0; }
</style>
