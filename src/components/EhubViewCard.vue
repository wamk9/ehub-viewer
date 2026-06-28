<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SystemVars from '@/helpers/General/SystemVars'

const props = defineProps({
  team: { type: Object, required: true },
  followLoading: { type: Boolean, default: false },
  clickable: { type: Boolean, default: true },
})
const emit = defineEmits(['click', 'follow'])

const { t } = useI18n()

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

function lightenHex(hex, amount) {
  const num = parseInt((hex || '#0098D8').replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

const grad = computed(() => {
  const team = props.team
  if (team.color) return `linear-gradient(135deg, ${team.color}, ${lightenHex(team.color, 40)})`
  const g = CAT_GRAD[team.category]
  return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
})

const teamInitials = computed(() => {
  const name = props.team.name || '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}
</script>

<template>
  <div class="vc-card" :class="{ 'vc-clickable': clickable }" @click="clickable && $emit('click', team)">

    <!-- Banner: gradient bg + optional cover image + badges right -->
    <div class="vc-banner" :style="{ background: grad }">
      <img v-if="team.cover_image" class="vc-cover" :src="imgUrl(team.cover_image)" />
      <div class="vc-banner-stripe"></div>
      <font-awesome-icon :icon="['fas', 'shield-halved']" class="vc-shield" />
      <!-- Badges: right side of banner, above cover image -->
      <div class="vc-badges" @click.stop>
        <slot name="badges">
          <span v-if="team.is_open" class="vc-badge">
            <font-awesome-icon :icon="['fas', 'door-open']" />
            {{ $t('pages.teams.index.card.open') }}
          </span>
          <span v-if="team.is_verified" class="vc-badge verified">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
            {{ $t('pages.teams.index.card.verified') }}
          </span>
        </slot>
      </div>
    </div>

    <!-- Head: logo overlapping banner -->
    <div class="vc-head">
      <div class="vc-logo" :style="{ background: grad }">
        <img v-if="team.logo_image" :src="imgUrl(team.logo_image)" :alt="team.name" />
        <template v-else>{{ teamInitials }}</template>
      </div>
    </div>

    <!-- Body: name + chips + desc -->
    <div class="vc-body">
      <div class="vc-name">
        {{ team.name }}
        <font-awesome-icon v-if="team.is_verified" :icon="['fas', 'circle-check']" class="vc-ver" />
      </div>
      <div class="vc-chips">
        <span v-if="team.category" class="cat-chip sub" style="font-size:.7rem;">
          {{ $t(`categories.names.${team.category}`) }}
        </span>
        <span v-if="team.org_name" class="cat-chip" style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;">
          <font-awesome-icon :icon="['fas', 'building-flag']" style="opacity:.65;font-size:.65rem;" />
          {{ team.org_name }}
        </span>
      </div>
      <p class="vc-desc">{{ team.description || '—' }}</p>
    </div>

    <!-- Stats: centered bordered grid cards -->
    <div class="vc-stats">
      <div class="vc-stat">
        <span class="v">{{ team.players_count ?? 0 }}</span>
        <span class="l">{{ $t('pages.teams.index.card.players') }}</span>
      </div>
      <div class="vc-stat">
        <span class="v">{{ team.wins_count ?? 0 }}</span>
        <span class="l">{{ $t('pages.teams.index.card.wins') }}</span>
      </div>
      <div class="vc-stat">
        <span class="v">{{ team.events_count ?? 0 }}</span>
        <span class="l">{{ $t('pages.teams.index.card.events') }}</span>
      </div>
    </div>

    <!-- Footer: actions auto-column grid -->
    <div class="vc-foot" @click.stop>
      <slot name="actions" :team="team">
        <button
          class="vc-btn"
          :class="{ 'vc-btn-active': team.is_following }"
          :disabled="followLoading"
          @click="$emit('follow', team)"
        >
          <font-awesome-icon :icon="['fas', team.is_following ? 'check' : 'plus']" />
          {{ team.is_following ? $t('pages.teams.index.card.following') : $t('pages.teams.index.card.follow') }}
        </button>
      </slot>
    </div>

  </div>
</template>

<style scoped>
.vc-card {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.vc-card.vc-clickable { cursor: pointer; }
.vc-card.vc-clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--ehub-shadow);
  border-color: color-mix(in srgb, var(--ehub-primary) 40%, var(--ehub-line));
}

/* Banner: gradient bg, cover image on top, badges top-right */
.vc-banner {
  height: 80px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
/* Cover image: on top of gradient, behind overlay */
.vc-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}
/* Stripe overlay: above image */
.vc-banner-stripe {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(0,0,0,.08) 28px 30px);
}
.vc-shield {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.2rem;
  color: rgba(255,255,255,.15);
  z-index: 3;
}
/* Badges: top-right of banner, above cover image */
.vc-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  max-width: 65%;
}
.vc-badge {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 6px;
  background: rgba(0,0,0,.42);
  backdrop-filter: blur(8px);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  width: 100%;
}
.vc-badge.verified { background: color-mix(in srgb, var(--ehub-primary) 80%, #000 20%); }

/* Head: logo overlapping banner, above cover image */
.vc-head {
  display: flex;
  align-items: flex-end;
  padding: 0 12px 10px;
  margin-top: -28px;
  position: relative;
  z-index: 5;
}

/* Logo: always gradient bg for transparent images */
.vc-logo {
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
}
.vc-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Body */
.vc-body {
  padding: 0 12px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.vc-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ehub-ink);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.vc-ver { color: var(--ehub-primary); font-size: .8rem; }
.vc-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 6px; }
.vc-desc {
  color: var(--ehub-muted);
  font-size: .82rem;
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Stats: bordered grid cards, centered */
.vc-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--ehub-line);
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 12px 10px;
}
.vc-stat {
  padding: 10px 8px 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.vc-stat + .vc-stat { border-left: 1px solid var(--ehub-line); }
.vc-stat .v { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); line-height: 1; }
.vc-stat .l { font-size: .65rem; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; margin-top: 4px; }

/* Footer: actions auto-column grid */
.vc-foot {
  padding: 0 12px 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 6px;
}
.vc-btn {
  border: 1px solid var(--ehub-line);
  background: var(--ehub-field-bg);
  color: var(--ehub-ink);
  font-size: .8rem;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 9px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all .15s;
  white-space: nowrap;
}
.vc-btn:hover { background: var(--ehub-card); border-color: var(--ehub-primary); color: var(--ehub-primary); }
.vc-btn.vc-btn-active { background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff; }
.vc-btn.vc-btn-active:hover { filter: brightness(1.1); }
</style>
