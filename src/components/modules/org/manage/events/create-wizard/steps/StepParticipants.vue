<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const route = useRoute()
const BRACKET_SIZES = [2, 4, 8, 16, 32, 64, 128, 256]

const gateways = ref([])
const hasGateway = computed(() => gateways.value.some(g => g.active))

onMounted(async () => {
  const result = await OrganizationBilling.getGateways(route.params.orgRoute)
  if (result.code === 200) gateways.value = result.data ?? []
})

function selectEntryType(v) { props.form.entry_type = v }
function selectFee(v) { props.form.fee = v === 'paid' ? (props.form.fee || 1) : 0 }
const feeMode = computed(() => (props.form.fee && +props.form.fee > 0) ? 'paid' : 'free')

watch(() => props.form.format, (fmt) => {
  if (fmt !== 'bracket') return
  if (!BRACKET_SIZES.includes(+props.form.max_registrations)) props.form.max_registrations = null
})
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s4.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s4.sub') }}</p>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4.entryType') }}</div>
      <div class="mode-cards">
        <button type="button" class="mode-card" :class="{ sel: form.entry_type === 'individual' }" @click="selectEntryType('individual')">
          <div class="mi"><font-awesome-icon :icon="['fas', 'user']" /></div>
          <div class="mn">{{ $t('pages.organization.manage.eventWizard.et.individual') }}</div>
          <div class="ms">{{ $t('pages.organization.manage.eventWizard.et.individualSub') }}</div>
        </button>
        <button type="button" class="mode-card" :class="{ sel: form.entry_type === 'team' }" @click="selectEntryType('team')">
          <div class="mi"><font-awesome-icon :icon="['fas', 'users']" /></div>
          <div class="mn">{{ $t('pages.organization.manage.eventWizard.et.team') }}</div>
          <div class="ms">{{ $t('pages.organization.manage.eventWizard.et.teamSub') }}</div>
        </button>
      </div>
    </div>

    <div class="form-section" v-if="form.entry_type === 'team'">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s4.teamSize') }}</label>
      <div class="input-group" style="max-width:200px">
        <span class="input-group-text"><font-awesome-icon :icon="['fas', 'users']" /></span>
        <input type="number" class="form-control" v-model.number="form.team_size" min="2" max="100" />
        <span class="input-group-text">{{ $t('pages.organization.manage.eventWizard.s4.players') }}</span>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4.slotsLabel') }}</div>

      <div v-if="form.format !== 'bracket'" class="row g-3">
        <div class="col-12">
          <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s4.maxSlots') }}</label>
          <input type="number" class="form-control" v-model="form.max_registrations" min="2" max="1024" placeholder="0" />
          <p class="field-hint">{{ $t(form.format === 'groups' ? 'pages.organization.manage.eventWizard.s4.slotsHintGroups' : 'pages.organization.manage.eventWizard.s4.slotsHint') }}</p>
        </div>
        <div class="col-sm-6">
          <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s4.minSlots') }}</label>
          <input type="number" class="form-control" v-model="form.min_registrations" min="0" placeholder="0" />
          <p class="field-hint">{{ $t('pages.organization.manage.eventWizard.s4.minSlotsHint') }}</p>
        </div>
      </div>

      <div v-else class="bracket-slots-wrap">
        <div class="bracket-slots-grid">
          <button
            v-for="n in BRACKET_SIZES" :key="n" type="button" class="bslot-btn"
            :class="{ sel: +form.max_registrations === n }"
            @click="form.max_registrations = n"
          >{{ n }}</button>
        </div>
        <div class="bracket-slots-alert">
          <font-awesome-icon :icon="['fas', 'sitemap']" />
          <span>{{ form.max_registrations || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4.feeLabel') }}</div>
      <div class="mode-cards">
        <button type="button" class="mode-card" :class="{ sel: feeMode === 'free' }" @click="selectFee('free')">
          <div class="mi"><font-awesome-icon :icon="['fas', 'ticket']" /></div>
          <div class="mn">{{ $t('pages.organization.manage.eventWizard.fee.free') }}</div>
          <div class="ms">{{ $t('pages.organization.manage.eventWizard.fee.freeSub') }}</div>
        </button>
        <button type="button" class="mode-card" :class="{ sel: feeMode === 'paid' }" @click="selectFee('paid')">
          <div class="mi"><font-awesome-icon :icon="['fas', 'credit-card']" /></div>
          <div class="mn">{{ $t('pages.organization.manage.eventWizard.fee.paid') }}</div>
          <div class="ms">{{ $t('pages.organization.manage.eventWizard.fee.paidSub') }}</div>
        </button>
      </div>

      <div v-if="feeMode === 'paid'" class="row g-2 mt-1">
        <div class="col-auto">
          <select class="form-select" v-model="form.currency" style="width:auto">
            <option value="BRL">R$ (BRL)</option>
            <option value="USD">US$ (USD)</option>
            <option value="EUR">€ (EUR)</option>
          </select>
        </div>
        <div class="col">
          <input type="number" class="form-control" v-model="form.fee" step="0.01" min="0" placeholder="0,00" />
        </div>
      </div>

      <div v-if="feeMode === 'paid' && !hasGateway" class="gw-alert-banner mt-3">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="gw-alert-ico" />
        <div>
          <div class="gw-alert-title">{{ $t('pages.organization.manage.eventWizard.gw.alertTitle') }}</div>
          <div class="gw-alert-desc">{{ $t('pages.organization.manage.eventWizard.gw.alertDesc') }}</div>
          <router-link :to="`/org/${route.params.orgRoute}/manage/finances`" class="btn btn-sm round px-3 gw-connect-btn">
            <font-awesome-icon :icon="['fas', 'plug']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.gw.connectBtn') }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s4.prize') }}</label>
      <div class="row g-2">
        <div class="col-auto">
          <select class="form-select" v-model="form.prize_pool_currency" style="width:auto">
            <option value="BRL">R$ (BRL)</option>
            <option value="USD">US$ (USD)</option>
            <option value="EUR">€ (EUR)</option>
          </select>
        </div>
        <div class="col">
          <input type="number" class="form-control" v-model="form.prize_pool_amount" step="0.01" min="0" placeholder="0,00" />
        </div>
      </div>
      <p class="field-hint">{{ $t('pages.organization.manage.eventWizard.s4.prizeHint') }}</p>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s4.requirements') }}</label>
      <textarea class="form-control" rows="3" style="resize:vertical" v-model="form.requirements" :placeholder="$t('pages.organization.manage.eventWizard.s4.requirementsPh')"></textarea>
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.form-section-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); margin-top: 5px; }

.mode-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
.mode-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 16px; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all .15s; background: var(--ehub-card); }
.mode-card:hover { border-color: var(--ehub-primary); }
.mode-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.mode-card .mi { font-size: 1.4rem; color: var(--ehub-muted); }
.mode-card.sel .mi { color: var(--ehub-primary); }
.mode-card .mn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); }
.mode-card .ms { font-size: .76rem; color: var(--ehub-muted); }

.bracket-slots-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 10px; }
.bslot-btn { min-width: 52px; padding: 8px 10px; border-radius: 8px; border: 1.5px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-ink); font-weight: 700; font-size: .88rem; cursor: pointer; transition: all .12s; }
.bslot-btn:hover { border-color: var(--ehub-primary); }
.bslot-btn.sel { border-color: var(--ehub-primary); background: var(--ehub-primary); color: #fff; }
.bracket-slots-alert { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: var(--ehub-muted); }
.bracket-slots-alert svg { color: var(--ehub-primary); }

.gw-alert-banner { display: flex; gap: 12px; padding: 13px 15px; border-radius: 12px; background: color-mix(in srgb,#e23b3b 8%,transparent); border: 1px solid color-mix(in srgb,#e23b3b 25%,transparent); }
.gw-alert-ico { color: #e23b3b; font-size: .9rem; flex-shrink: 0; margin-top: 2px; }
.gw-alert-title { font-size: .85rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 3px; }
.gw-alert-desc { font-size: .8rem; color: var(--ehub-muted); line-height: 1.45; margin-bottom: 10px; }
.gw-connect-btn { background: var(--ehub-primary); color: #fff; border: none; text-decoration: none; display: inline-flex; align-items: center; }

@media (max-width: 640px) { .mode-cards { grid-template-columns: 1fr; } }
</style>
