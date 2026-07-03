<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GRADIENT_SWATCHES, gradientByIndex } from '@/helpers/General/CategoryConfig.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  gradientIndex: { type: Number, default: 0 },
  variant: { type: String, default: 'logo' }, // 'logo' | 'cover'
})
const emit = defineEmits(['update:modelValue', 'update:gradientIndex'])

const { t } = useI18n()

const inputRef = ref(null)
const dragover = ref(false)
const fileName = ref('')
const fileSize = ref('')

function formatSize(bytes) {
  return bytes > 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB'
}

function readFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  fileName.value = file.name
  fileSize.value = formatSize(file.size)
  const reader = new FileReader()
  reader.onload = e => emit('update:modelValue', e.target.result)
  reader.readAsDataURL(file)
}

function onChange(e) {
  readFile(e.target.files[0])
}

function onDrop(e) {
  dragover.value = false
  readFile(e.dataTransfer?.files?.[0])
}

function pick() {
  inputRef.value?.click()
}

function remove() {
  emit('update:modelValue', '')
  fileName.value = ''
  fileSize.value = ''
  if (inputRef.value) inputRef.value.value = ''
}

function selectGradient(i) {
  emit('update:gradientIndex', i)
}

const coverBg = computed(() => props.modelValue
  ? `url(${props.modelValue})`
  : gradientByIndex(props.gradientIndex))
</script>

<template>
  <div class="emu-wrap">

    <!-- ── Logo variant: dashed drop zone, side-by-side preview ── -->
    <div
      v-if="variant === 'logo'"
      class="emu-logo-zone"
      :class="{ dragover, clickable: !modelValue }"
      @click="!modelValue && pick()"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="onDrop"
    >
      <div v-if="!modelValue" class="emu-logo-ph">
        <div class="emu-logo-ico"><font-awesome-icon :icon="['fas', 'cloud-arrow-up']" /></div>
        <div class="emu-logo-text">
          <span class="emu-logo-main">{{ t('common.mediaUpload.logoDrop') }}</span>
          <span class="emu-logo-sub">{{ t('common.mediaUpload.logoHint') }}</span>
        </div>
      </div>
      <div v-else class="emu-logo-preview">
        <div class="emu-checker"><img :src="modelValue" alt="" /></div>
        <div class="emu-logo-info">
          <div class="emu-logo-name">{{ fileName || '—' }}</div>
          <div class="emu-logo-size">{{ fileSize }}</div>
          <div class="emu-logo-actions">
            <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click.stop="pick">
              <font-awesome-icon :icon="['fas', 'pen']" class="me-1" />{{ t('common.mediaUpload.change') }}
            </button>
            <button type="button" class="btn btn-sm round px-3 emu-remove-btn" @click.stop="remove">
              <font-awesome-icon :icon="['fas', 'xmark']" class="me-1" />{{ t('common.mediaUpload.remove') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Cover variant: color/gradient block, drag-drop, glass buttons ── -->
    <template v-else>
      <div
        class="emu-cover-pick"
        :class="{ dragover }"
        :style="{ backgroundImage: coverBg, cursor: modelValue ? 'default' : 'pointer' }"
        @click="!modelValue && pick()"
        @dragover.prevent="dragover = true"
        @dragleave.prevent="dragover = false"
        @drop.prevent="onDrop"
      >
        <div class="emu-cover-stripe"></div>
        <div v-if="!modelValue" class="emu-cover-ph">
          <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" />
          <span>{{ t('common.mediaUpload.coverDrop') }}</span>
        </div>
        <div v-else class="emu-cover-btns">
          <button type="button" class="emu-glass-btn" @click.stop="pick">
            <font-awesome-icon :icon="['fas', 'pen']" />{{ t('common.mediaUpload.change') }}
          </button>
          <button type="button" class="emu-glass-btn emu-glass-danger" @click.stop="remove">
            <font-awesome-icon :icon="['fas', 'xmark']" />{{ t('common.mediaUpload.remove') }}
          </button>
        </div>
      </div>
      <p class="emu-hint">{{ t('common.mediaUpload.coverHint') }}</p>
      <div v-if="!modelValue" class="emu-swatch-row">
        <button
          v-for="(g, i) in GRADIENT_SWATCHES" :key="i"
          type="button" class="emu-grad-sw" :class="{ sel: i === gradientIndex }"
          :style="{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }"
          @click="selectGradient(i)"
        ></button>
      </div>
    </template>

    <input ref="inputRef" type="file" accept="image/*" class="d-none" @change="onChange" />
  </div>
</template>

<style scoped>
.emu-wrap { width: 100%; }

/* ── Logo variant ── */
.emu-logo-zone { border: 2px dashed var(--ehub-line); border-radius: 14px; background: var(--ehub-field-bg); overflow: hidden; transition: border-color .15s, background .15s; }
.emu-logo-zone.clickable { cursor: pointer; }
.emu-logo-zone.clickable:hover, .emu-logo-zone.dragover { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.emu-logo-zone.dragover { border-style: solid; }
.emu-logo-ph { display: flex; align-items: center; gap: 16px; padding: 22px 20px; }
.emu-logo-ico { width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0; background: var(--ehub-card); border: 1px solid var(--ehub-line); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--ehub-primary); }
.emu-logo-text { display: flex; flex-direction: column; gap: 3px; }
.emu-logo-main { font-size: .87rem; font-weight: 600; color: var(--ehub-ink); }
.emu-logo-sub { font-size: .75rem; color: var(--ehub-muted); line-height: 1.4; }
.emu-logo-preview { display: flex; align-items: center; gap: 16px; padding: 14px 18px; }
.emu-checker { width: 68px; height: 68px; border-radius: 12px; flex-shrink: 0; overflow: hidden; background-image: repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%); background-size: 10px 10px; border: 1px solid var(--ehub-line); }
html[data-bs-theme="dark"] .emu-checker { background-image: repeating-conic-gradient(#444 0% 25%, #222 0% 50%); }
.emu-checker img { width: 100%; height: 100%; object-fit: contain; display: block; }
.emu-logo-info { flex: 1; min-width: 0; }
.emu-logo-name { font-size: .83rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.emu-logo-size { font-size: .73rem; color: var(--ehub-muted); margin-bottom: 10px; }
.emu-logo-actions { display: flex; gap: 7px; flex-wrap: wrap; }
.emu-remove-btn { border: 1px solid color-mix(in srgb, #e23b3b 30%, transparent); color: #e23b3b; }

/* ── Cover variant ── */
.emu-cover-pick { height: 110px; border-radius: 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 10px; background-size: cover; background-position: center; position: relative; overflow: hidden; transition: opacity .15s; }
.emu-cover-pick:hover { opacity: .92; }
.emu-cover-pick.dragover { outline: 3px solid rgba(255,255,255,.55); outline-offset: -4px; opacity: 1 !important; }
.emu-cover-stripe { position: absolute; inset: 0; pointer-events: none; background-image: repeating-linear-gradient(118deg, transparent 0 42px, rgba(255,255,255,.06) 42px 44px); }
.emu-cover-ph { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.85); font-size: .88rem; font-weight: 600; position: relative; }
.emu-cover-btns { position: relative; display: flex; gap: 8px; }
.emu-glass-btn { display: flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 50rem; background: rgba(0,0,0,.45); backdrop-filter: blur(8px); color: #fff; font-size: .8rem; font-weight: 600; border: 1px solid rgba(255,255,255,.2); cursor: pointer; transition: background .15s; }
.emu-glass-btn:hover { background: rgba(0,0,0,.65); }
.emu-glass-danger { background: rgba(160,0,0,.5) !important; }
.emu-glass-danger:hover { background: rgba(160,0,0,.72) !important; }
.emu-hint { font-size: .78rem; color: var(--ehub-muted); margin: 4px 0 8px; }
.emu-swatch-row { display: flex; gap: 7px; flex-wrap: wrap; }
.emu-grad-sw { width: 32px; height: 32px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: transform .12s, box-shadow .12s; flex-shrink: 0; }
.emu-grad-sw:hover { transform: scale(1.1); }
.emu-grad-sw.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.06); }
</style>
