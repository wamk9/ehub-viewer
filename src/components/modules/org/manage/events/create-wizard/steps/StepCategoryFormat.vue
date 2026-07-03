<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Category from '@/helpers/communication/Category.js'
import { categoryIcon, categoryGradient } from '@/helpers/General/CategoryConfig.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const categories = ref([])
const subcategories = ref([])
const catSearch = ref('')
const subcatSearch = ref('')

const FORMATS = [
  { key: 'points', icon: 'list-check' },
  { key: 'bracket', icon: 'sitemap' },
  { key: 'groups', icon: 'layer-group' },
  { key: 'time', icon: 'stopwatch' },
]

onMounted(async () => {
  const result = await Category.getAll()
  if (result.code === 200) categories.value = result.data ?? []
})

const selectedCategoryObj = computed(() => categories.value.find(c => c.route === props.form.category))

const availableRunmodes = computed(() => selectedCategoryObj.value?.runmodes ?? [])

const filteredCategories = computed(() => {
  const q = catSearch.value.toLowerCase()
  return categories.value.filter(c => !q || (c.name || c.route).toLowerCase().includes(q))
})

const filteredSubcategories = computed(() => {
  const q = subcatSearch.value.toLowerCase()
  return subcategories.value.filter(s => !q || s.name.toLowerCase().includes(q))
})

async function selectCategory(cat) {
  if (props.form.category === cat.route) return
  props.form.category = cat.route
  props.form.subcategory = ''
  props.form.runmode = ''
  subcategories.value = []
  if (cat.runmodes?.length === 1) props.form.runmode = cat.runmodes[0].key

  const result = await Category.getSubcategories(cat.route)
  if (result.code === 200) subcategories.value = result.data ?? []
}

function resetCategory() {
  props.form.category = ''
  props.form.subcategory = ''
  props.form.runmode = ''
  subcategories.value = []
}

watch(() => props.form.runmode, (val) => {
  if (val !== 'irl') props.form.location = ''
})
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s2.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s2.sub') }}</p>

    <!-- Category -->
    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s2.catLabel') }}</div>

      <template v-if="!form.category">
        <div class="cat-search-wrap">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-ico" />
          <input type="text" class="form-control cat-search-inp" v-model="catSearch" :placeholder="$t('pages.organization.manage.eventWizard.s2.catSearchPh')" />
        </div>
        <div class="cat-scroll">
          <div class="cat-grid">
            <button
              v-for="cat in filteredCategories" :key="cat.route"
              type="button" class="cat-card" @click="selectCategory(cat)"
            >
              <div class="cat-ico" :style="{ color: 'var(--ehub-primary)' }"><font-awesome-icon :icon="['fas', categoryIcon(cat.route)]" /></div>
              <div class="cat-name">{{ cat.name }}</div>
            </button>
          </div>
          <div v-if="!filteredCategories.length" class="cat-no-results">{{ $t('pages.organization.manage.eventWizard.s2.catNoRes') }}</div>
        </div>
      </template>

      <template v-else>
        <div class="cat-sel-badge">
          <div class="cat-sel-ico" :style="{ background: categoryGradient(form.category) }">
            <font-awesome-icon :icon="['fas', categoryIcon(form.category)]" />
          </div>
          <div class="cat-sel-txt">
            <div class="cat-sel-name">{{ selectedCategoryObj?.name || form.category }}</div>
            <div class="cat-sel-hint">{{ $t('pages.organization.manage.eventWizard.s2.catSelected') }}</div>
          </div>
          <font-awesome-icon :icon="['fas', 'circle-check']" style="color:var(--ehub-primary);font-size:1.1rem" />
          <button type="button" class="cat-change-btn" @click="resetCategory">{{ $t('pages.organization.manage.eventWizard.s2.catChange') }}</button>
        </div>

        <div v-if="subcategories.length" class="mt-3">
          <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s2.subcatLabel') }}</div>
          <div class="cat-search-wrap">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-ico" />
            <input type="text" class="form-control cat-search-inp" v-model="subcatSearch" :placeholder="$t('pages.organization.manage.eventWizard.s2.subcatSearchPh')" />
          </div>
          <div class="cat-scroll" style="max-height:200px">
            <div class="subcat-grid">
              <button
                v-for="sub in filteredSubcategories" :key="sub.id"
                type="button" class="subcat-card" :class="{ sel: form.subcategory === sub.route }"
                @click="form.subcategory = sub.route"
              >{{ sub.name }}</button>
            </div>
            <div v-if="!filteredSubcategories.length" class="cat-no-results">{{ $t('pages.organization.manage.eventWizard.s2.subcatNoRes') }}</div>
          </div>
          <p class="field-hint mt-2">{{ $t('pages.organization.manage.eventWizard.s2.subcatHint') }}</p>
        </div>
      </template>
    </div>

    <!-- Mode -->
    <div class="form-section" v-if="availableRunmodes.length">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s2.modeLabel') }}</div>
      <div class="mode-cards">
        <button
          v-for="rm in availableRunmodes" :key="rm.key"
          type="button" class="mode-card" :class="{ sel: form.runmode === rm.key }"
          @click="form.runmode = rm.key"
        >
          <div class="mi"><font-awesome-icon :icon="['fas', rm.key === 'online' ? 'wifi' : 'location-dot']" /></div>
          <div class="mn">{{ $t(`pages.organization.manage.eventWizard.mode.${rm.key === 'online' ? 'online' : 'irl'}`) }}</div>
          <div class="ms">{{ $t(`pages.organization.manage.eventWizard.mode.${rm.key === 'online' ? 'onlineSub' : 'irlSub'}`) }}</div>
        </button>
      </div>
    </div>

    <div class="form-section" v-if="form.runmode === 'irl'">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s2.location') }}</label>
      <div class="input-group">
        <span class="input-group-text"><font-awesome-icon :icon="['fas', 'location-dot']" /></span>
        <input type="text" class="form-control" v-model="form.location" :placeholder="$t('pages.organization.manage.eventWizard.s2.locationPh')" />
      </div>
    </div>

    <!-- Format -->
    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s2.fmtLabel') }}</div>
      <div class="fmt-grid">
        <button
          v-for="f in FORMATS" :key="f.key"
          type="button" class="fmt-card" :class="{ sel: form.format === f.key }"
          @click="form.format = f.key"
        >
          <div class="fi"><font-awesome-icon :icon="['fas', f.icon]" /></div>
          <div class="fn">{{ $t(`pages.organization.manage.eventWizard.fmt.${f.key}`) }}</div>
          <div class="fd">{{ $t(`pages.organization.manage.eventWizard.fmt.${f.key}D`) }}</div>
        </button>
      </div>
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
.field-hint { font-size: .78rem; color: var(--ehub-muted); }

.cat-search-wrap { position: relative; margin-bottom: 10px; }
.search-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ehub-muted); font-size: .8rem; pointer-events: none; }
.cat-search-inp { padding-left: 36px !important; }
.cat-scroll { max-height: 248px; overflow-y: auto; padding-right: 2px; }
.cat-no-results { text-align: center; padding: 20px; color: var(--ehub-muted); font-size: .84rem; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
.cat-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 14px 10px 12px; cursor: pointer; text-align: center; transition: all .15s; background: var(--ehub-card); }
.cat-card:hover { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.cat-card .cat-ico { font-size: 1.5rem; margin-bottom: 7px; line-height: 1; }
.cat-card .cat-name { font-size: .8rem; font-weight: 700; color: var(--ehub-ink); }

.cat-sel-badge { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 12px; background: var(--ehub-primary-tint); border: 1.5px solid var(--ehub-primary-border); }
.cat-sel-ico { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; flex-shrink: 0; }
.cat-sel-txt { flex: 1; min-width: 0; }
.cat-sel-name { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); }
.cat-sel-hint { font-size: .73rem; color: var(--ehub-muted); }
.cat-change-btn { font-size: .78rem; font-weight: 600; cursor: pointer; color: var(--ehub-primary); background: none; border: 1px solid var(--ehub-primary-border); border-radius: 8px; padding: 4px 12px; white-space: nowrap; }
.cat-change-btn:hover { background: var(--ehub-primary-tint); }

.subcat-grid { display: flex; flex-wrap: wrap; gap: 7px; }
.subcat-card { border: 2px solid var(--ehub-line); border-radius: 50rem; padding: 7px 16px; cursor: pointer; font-size: .82rem; font-weight: 600; color: var(--ehub-ink); background: var(--ehub-card); transition: all .15s; white-space: nowrap; }
.subcat-card:hover, .subcat-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); color: var(--ehub-primary); }

.mode-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
.mode-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 16px; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all .15s; background: var(--ehub-card); }
.mode-card:hover { border-color: var(--ehub-primary); }
.mode-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.mode-card .mi { font-size: 1.4rem; color: var(--ehub-muted); }
.mode-card.sel .mi { color: var(--ehub-primary); }
.mode-card .mn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); }
.mode-card .ms { font-size: .76rem; color: var(--ehub-muted); }

.fmt-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 9px; }
.fmt-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 15px 16px; cursor: pointer; transition: all .15s; background: var(--ehub-card); text-align: left; }
.fmt-card:hover { border-color: var(--ehub-primary); }
.fmt-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.fmt-card .fi { font-size: 1.1rem; color: var(--ehub-muted); margin-bottom: 7px; }
.fmt-card.sel .fi { color: var(--ehub-primary); }
.fmt-card .fn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 2px; }
.fmt-card .fd { font-size: .76rem; color: var(--ehub-muted); line-height: 1.4; }

@media (max-width: 640px) {
  .mode-cards, .fmt-grid { grid-template-columns: 1fr; }
}
</style>
