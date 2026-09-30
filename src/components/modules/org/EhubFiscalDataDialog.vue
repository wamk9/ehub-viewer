<template>
  <EhubDialog :model-value="modelValue" :title="$t(K + 'title')" size="md" :persistent="saving" @close="close">
    <p class="efd-intro">{{ $t(K + 'intro') }}</p>

    <div class="efd-grid">
      <div class="f s2">
        <label>{{ $t(K + 'document') }} *</label>
        <input v-model="form.document" class="form-control" :class="{ 'is-invalid': err.document }" inputmode="numeric" maxlength="18" :placeholder="$t(K + 'document_ph')" @input="form.document = maskDoc(form.document)" />
        <small v-if="err.document" class="bad">{{ $t(K + 'err_document') }}</small>
      </div>
      <div class="f s4">
        <label>{{ docType === 'J' ? $t(K + 'name_pj') : $t(K + 'name_pf') }} *</label>
        <input v-model="form.name" class="form-control" :class="{ 'is-invalid': err.name }" maxlength="150" />
      </div>
      <div class="f s3">
        <label>{{ $t(K + 'email') }} *</label>
        <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': err.email }" maxlength="150" :placeholder="$t(K + 'email_ph')" />
      </div>
      <div class="f s3">
        <label>{{ $t(K + 'municipal') }}</label>
        <input v-model="form.municipal_registration" class="form-control" maxlength="30" />
      </div>
      <div class="f s2">
        <label>{{ $t(K + 'cep') }} *</label>
        <div class="position-relative">
          <input v-model="form.cep" class="form-control" :class="{ 'is-invalid': err.cep }" inputmode="numeric" maxlength="9" placeholder="00000-000" @input="onCep" />
          <span v-if="cepLoading" class="spinner-border spinner-border-sm efd-cep-spin"></span>
        </div>
      </div>
      <div class="f s4">
        <label>{{ $t(K + 'street') }} *</label>
        <input v-model="form.street" class="form-control" :class="{ 'is-invalid': err.street }" maxlength="150" />
      </div>
      <div class="f s2">
        <label>{{ $t(K + 'number') }} *</label>
        <input v-model="form.number" class="form-control" :class="{ 'is-invalid': err.number }" maxlength="20" />
      </div>
      <div class="f s4">
        <label>{{ $t(K + 'complement') }}</label>
        <input v-model="form.complement" class="form-control" maxlength="80" />
      </div>
      <div class="f s3">
        <label>{{ $t(K + 'district') }} *</label>
        <input v-model="form.district" class="form-control" :class="{ 'is-invalid': err.district }" maxlength="80" />
      </div>
      <div class="f s2">
        <label>{{ $t(K + 'city') }} *</label>
        <input v-model="form.city" class="form-control" :class="{ 'is-invalid': err.city }" maxlength="80" />
      </div>
      <div class="f s1">
        <label>UF *</label>
        <input v-model="form.uf" class="form-control text-uppercase" :class="{ 'is-invalid': err.uf }" maxlength="2" />
      </div>
    </div>

    <p v-if="error" class="efd-error"><font-awesome-icon :icon="['fas', 'triangle-exclamation']" />{{ error }}</p>

    <template #footer>
      <button type="button" class="btn btn-outline-secondary round" :disabled="saving" @click="close">{{ $t(K + 'cancel') }}</button>
      <button type="button" class="btn btn-primary round" :disabled="saving" @click="save">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>{{ $t(K + 'save') }}
      </button>
    </template>
  </EhubDialog>
</template>

<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';

const EMPTY = { document: '', name: '', municipal_registration: '', email: '', cep: '', street: '', number: '', complement: '', district: '', city: '', uf: '' };

/**
 * Fiscal data of the organization (NFS-e "tomador"). Required before adding
 * the billing card. The CEP fills the address through ViaCEP.
 */
export default {
  name: 'EhubFiscalDataDialog',
  components: { EhubDialog },
  props: {
    modelValue: { type: Boolean, default: false },
    orgRoute: { type: String, required: true },
    initial: { type: Object, default: null },
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return { K: 'pages.organization.manage.financeiro.fiscal.', form: { ...EMPTY }, err: {}, error: '', saving: false, cepLoading: false };
  },
  computed: {
    docType() { return this.form.document.replace(/\D/g, '').length > 11 ? 'J' : 'F'; },
  },
  watch: {
    modelValue(open) {
      if (!open) return;
      const i = this.initial || {};
      this.form = { ...EMPTY, ...Object.fromEntries(Object.entries(i).map(([k, v]) => [k, v ?? ''])) };
      this.form.document = this.maskDoc(this.form.document);
      this.form.cep = this.maskCep(this.form.cep);
      this.err = {};
      this.error = '';
    },
  },
  methods: {
    maskDoc(v) {
      const d = String(v || '').replace(/\D/g, '').slice(0, 14);
      if (d.length <= 11) return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    },
    maskCep(v) { return String(v || '').replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'); },
    async onCep() {
      this.form.cep = this.maskCep(this.form.cep);
      const cep = this.form.cep.replace(/\D/g, '');
      if (cep.length !== 8) return;
      this.cepLoading = true;
      try {
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const j = await r.json();
        if (!j.erro) {
          this.form.street = j.logradouro || this.form.street;
          this.form.district = j.bairro || this.form.district;
          this.form.city = j.localidade || this.form.city;
          this.form.uf = j.uf || this.form.uf;
        }
      } catch { /* manual entry still works */ }
      this.cepLoading = false;
    },
    async save() {
      this.saving = true;
      this.error = '';
      this.err = {};
      const res = await OrganizationBilling.updateFiscal(this.orgRoute, this.form);
      this.saving = false;
      if (res.code === 200) {
        this.$emit('saved', res.data);
        this.$emit('update:modelValue', false);
        return;
      }
      this.err = Object.fromEntries(Object.keys(res.errors || {}).map((k) => [k, true]));
      this.error = this.$t(this.K + (this.err.document ? 'err_document' : 'err_generic'));
    },
    close() { if (!this.saving) this.$emit('update:modelValue', false); },
  },
};
</script>

<style scoped>
.efd-intro { font-size: .82rem; color: var(--ehub-muted); margin: 0 0 14px; }
.efd-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px 12px; }
.efd-grid .f { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.efd-grid label { font-size: .72rem; font-weight: 700; color: var(--ehub-ink); }
.efd-grid .form-control { height: 38px; font-size: .85rem; }
.s1 { grid-column: span 1; } .s2 { grid-column: span 2; } .s3 { grid-column: span 3; } .s4 { grid-column: span 4; }
.bad { color: var(--ehub-danger-text); font-size: .72rem; }
.efd-cep-spin { position: absolute; right: 10px; top: 11px; color: var(--ehub-primary-text); }
.efd-error { display: flex; gap: 7px; font-size: .8rem; color: var(--ehub-danger-text); margin: 12px 0 0; }
@media (max-width: 560px) {
  .efd-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .s1, .s2 { grid-column: span 1; } .s3, .s4 { grid-column: span 2; }
}
</style>
