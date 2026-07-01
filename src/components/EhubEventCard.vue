<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SystemVars from '@/helpers/General/SystemVars'

const props = defineProps({
  event:    { type: Object, required: true },
  orgColor: { type: String, default: null },
  orgName:  { type: String, default: null },
})

const { t, locale } = useI18n()

const CAT_GRAD = {
  simracing:          ['#0098D8', '#00d4ff'],
  racingcars:         ['#0098D8', '#00d4ff'],
  rally:              ['#f08c00', '#ffc93c'],
  'esports-fps':      ['#e23b3b', '#ff8a3b'],
  'esports-moba':     ['#7C3AED', '#b06bff'],
  'esports-fighting': ['#d6336c', '#ff6b9d'],
  'esports-strategy': ['#1a6e4f', '#51cf66'],
  'esports-sports':   ['#2563eb', '#60a5fa'],
  motorsport:         ['#f08c00', '#ffc93c'],
  motorbike:          ['#dc4f00', '#ff8a3b'],
  cycling:            ['#1971c2', '#4dabf7'],
  running:            ['#1f8a5b', '#51cf66'],
  swimming:           ['#0284c7', '#38bdf8'],
  triathlon:          ['#7C3AED', '#c084fc'],
  hiking:             ['#4d7c0f', '#a3e635'],
  crossfit:           ['#9a3412', '#fb923c'],
  rowing:             ['#1d4ed8', '#93c5fd'],
  archery:            ['#92400e', '#fbbf24'],
  chess:              ['#495057', '#868e96'],
  'drone-racing':     ['#0e7490', '#22d3ee'],
}

const CAT_ICON = {
  simracing: 'flag-checkered', racingcars: 'flag-checkered', rally: 'car-side',
  'esports-fps': 'crosshairs', 'esports-moba': 'dragon', 'esports-fighting': 'hand-fist',
  'esports-strategy': 'chess-pawn', 'esports-sports': 'futbol', motorsport: 'car-side',
  motorbike: 'motorcycle', cycling: 'bicycle', running: 'person-running',
  swimming: 'person-swimming', triathlon: 'trophy', hiking: 'mountain-sun',
  crossfit: 'dumbbell', rowing: 'water', archery: 'bullseye',
  chess: 'chess-knight', 'drone-racing': 'helicopter',
}

const grad = computed(() => {
  if (props.orgColor && /^#[0-9A-Fa-f]{6}$/.test(props.orgColor)) {
    const n = parseInt(props.orgColor.slice(1), 16)
    const r = Math.max(0, ((n >> 16) & 0xff) - 50)
    const g = Math.max(0, ((n >> 8) & 0xff) - 50)
    const b = Math.max(0, (n & 0xff) - 50)
    const dark = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
    return `linear-gradient(135deg, ${props.orgColor}, ${dark})`
  }
  const g = CAT_GRAD[props.event.category]
  return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
})

const catIcon = computed(() => CAT_ICON[props.event.category] || 'trophy')

const logoInitials = computed(() => {
  const name = props.event.name || props.orgName || '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const feeLabel = computed(() => {
  const ev = props.event
  if (!ev.fee || ev.fee == 0) return t('pages.organization.show.events.free')
  const sym = ev.currency === 'usd' ? 'US$' : ev.currency === 'eur' ? '€' : 'R$'
  return `${sym} ${Number(ev.fee).toFixed(0)}`
})

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(
    locale.value === 'pt-BR' ? 'pt-BR' : locale.value,
    { day: '2-digit', month: 'short', year: 'numeric' }
  )
}

function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

const hasSlotLimit = computed(() => !!props.event.max_registrations)

const slotsPct = computed(() => {
  if (!hasSlotLimit.value) return 0
  return Math.min(100, Math.round((props.event.registrations_count || 0) / props.event.max_registrations * 100))
})

const slotsBarColor = computed(() => {
  const pct = slotsPct.value
  if (pct >= 90) return '#e05454'
  if (pct >= 60) return 'var(--ehub-gold)'
  return 'var(--ehub-primary)'
})
</script>

<template>
  <div class="ec-card">

    <!-- Banner: gradient bg + cover image + stripe + watermark + badges -->
    <div class="ec-banner" :style="{ background: grad }">
      <img v-if="event.cover_image" class="ec-cover" :src="imgUrl(event.cover_image)" :alt="event.name" />
      <div class="ec-banner-stripe"></div>
      <font-awesome-icon :icon="['fas', catIcon]" class="ec-shield" />
      <div class="ec-badges">
        <span class="ec-badge" :class="event.finished ? 'finished' : 'active'">
          {{ event.finished
            ? $t('pages.organization.show.events.finished')
            : $t('pages.organization.show.events.active') }}
        </span>
        <span class="ec-badge" :class="event.fee == 0 ? 'free' : 'paid'">
          {{ feeLabel }}
        </span>
      </div>
    </div>

    <!-- Head: org logo overlapping banner -->
    <div class="ec-head">
      <div class="ec-logo" :style="{ background: grad }">
        <img v-if="event.logo_image" :src="imgUrl(event.logo_image)" :alt="event.name" class="ec-logo-img" @error="e => e.target.style.display='none'" />
        <span>{{ logoInitials }}</span>
      </div>
    </div>

    <!-- Body: name + chips + metas -->
    <div class="ec-body">
      <div class="ec-name">{{ event.name }}</div>
      <div class="ec-chips">
        <span v-if="event.category" class="cat-chip sub" style="font-size:.68rem;">
          {{ $t(`categories.names.${event.category}`) }}
        </span>
        <span v-if="event.subcategory" class="cat-chip" style="font-size:.68rem;">
          {{ $t(`categories.subcategories.${event.subcategory}`, event.subcategory) }}
        </span>
      </div>
      <div class="ec-metas">
        <div v-if="event.start_at" class="ec-meta">
          <font-awesome-icon :icon="['fas', 'calendar-days']" />
          {{ fmtDate(event.start_at) }}
        </div>
        <div v-if="event.runmode" class="ec-meta">
          <font-awesome-icon :icon="['fas', event.runmode === 'online' ? 'wifi' : 'location-dot']" />
          {{ event.runmode === 'online'
            ? $t('pages.organization.show.events.online')
            : $t('pages.organization.show.events.irl') }}
        </div>
      </div>

      <div v-if="event.registrations_count != null" class="ec-slots">
        <div v-if="hasSlotLimit" class="bar">
          <span :style="{ width: slotsPct + '%', background: slotsBarColor }"></span>
        </div>
        <span class="ec-slots-label">
          <font-awesome-icon :icon="['fas', 'users']" />
          {{ event.registrations_count }}{{ hasSlotLimit ? '/' + event.max_registrations : '' }}
          <span v-if="!hasSlotLimit" class="ec-slots-unlimited">∞</span>
        </span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ec-card {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  cursor: pointer;
  height: 100%;
}
.ec-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ehub-shadow);
  border-color: color-mix(in srgb, var(--ehub-primary) 40%, var(--ehub-line));
}

/* Banner */
.ec-banner {
  height: 80px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.ec-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
.ec-banner-stripe {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(0,0,0,.08) 28px 30px);
}
.ec-shield {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.2rem;
  color: rgba(255,255,255,.15);
  z-index: 3;
}
.ec-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.ec-badge {
  font-size: .6rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 5px;
  backdrop-filter: blur(8px);
  white-space: nowrap;
}
.ec-badge.active   { background: rgba(0,0,0,.42); color: rgba(255,255,255,.9); }
.ec-badge.finished { background: rgba(0,0,0,.55); color: rgba(255,255,255,.45); }
.ec-badge.free     { background: color-mix(in srgb, #1f8a5b 75%, rgba(0,0,0,.3)); color: #d1fae5; }
.ec-badge.paid     { background: color-mix(in srgb, #f08c00 75%, rgba(0,0,0,.3)); color: #fef9c3; }

/* Head: logo overlapping banner */
.ec-head {
  display: flex;
  align-items: flex-end;
  padding: 0 12px 10px;
  margin-top: -28px;
  position: relative;
  z-index: 5;
}
.ec-logo {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  border: 3px solid var(--ehub-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: .01em;
  text-shadow: 0 1px 4px rgba(0,0,0,.3);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.ec-logo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 11px;
}

/* Body */
.ec-body {
  padding: 0 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ec-name {
  font-size: .95rem;
  font-weight: 700;
  color: var(--ehub-ink);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ec-chips { display: flex; gap: 5px; flex-wrap: wrap; }
.ec-metas { display: flex; flex-direction: column; gap: 4px; margin-top: auto; padding-top: 6px; }
.ec-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .78rem;
  color: var(--ehub-muted);
}
.ec-meta svg { font-size: .7rem; flex-shrink: 0; }

.ec-slots {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}
.ec-slots .bar {
  height: 5px;
  background: var(--ehub-line);
  border-radius: 99px;
  overflow: hidden;
}
.ec-slots .bar span {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width .3s ease;
}
.ec-slots-label {
  font-size: .75rem;
  color: var(--ehub-muted);
  display: flex;
  align-items: center;
  gap: 5px;
}
.ec-slots-label svg { font-size: .7rem; }
.ec-slots-unlimited { font-size: .85rem; line-height: 1; color: var(--ehub-muted); }
</style>
