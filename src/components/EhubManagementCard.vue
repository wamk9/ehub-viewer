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
  <div class="mc-card" :class="{ 'mc-clickable': clickable }" @click="clickable && $emit('click', team)">

    <!-- Banner -->
    <div class="mc-banner" :style="{ background: grad }">
      <font-awesome-icon :icon="['fas', 'shield-halved']" class="mc-shield" />
      <!-- Badges: top-right -->
      <div class="mc-badges">
        <slot name="badges">
          <span v-if="team.is_open" class="mc-badge-open">
            <font-awesome-icon :icon="['fas', 'door-open']" />
            {{ $t('pages.teams.index.card.open') }}
          </span>
        </slot>
        <span v-if="team.is_verified" class="mc-badge-verified" :title="$t('pages.teams.index.card.verified')">
          <font-awesome-icon :icon="['fas', 'circle-check']" />
        </span>
      </div>
    </div>

    <!-- Logo: always gradient bg so transparent images display correctly -->
    <div class="mc-logo" :style="{ background: grad }">
      <img v-if="team.logo_image" :src="imgUrl(team.logo_image)" :alt="team.name" />
      <template v-else>{{ teamInitials }}</template>
    </div>

    <!-- Body -->
    <div class="mc-body">
      <div class="mc-name">
        {{ team.name }}
        <font-awesome-icon v-if="team.is_verified" :icon="['fas', 'circle-check']" class="mc-ver" />
      </div>
      <div class="mc-chips">
        <span v-if="team.category" class="cat-chip sub" style="font-size:.7rem;">
          {{ $t(`categories.names.${team.category}`) }}
        </span>
        <span v-if="team.org_name" class="cat-chip" style="display:inline-flex;align-items:center;gap:4px;font-size:.7rem;">
          <font-awesome-icon :icon="['fas', 'building-flag']" style="opacity:.65;font-size:.65rem;" />
          {{ team.org_name }}
        </span>
      </div>
      <p class="mc-desc">{{ team.description || '—' }}</p>
      <div class="mc-stats">
        <div class="mc-stat">
          <span class="v">{{ team.players_count ?? 0 }}</span>
          <span class="l">{{ $t('pages.teams.index.card.players') }}</span>
        </div>
        <div class="mc-stat">
          <span class="v">{{ team.wins_count ?? 0 }}</span>
          <span class="l">{{ $t('pages.teams.index.card.wins') }}</span>
        </div>
        <div class="mc-stat">
          <span class="v">{{ team.events_count ?? 0 }}</span>
          <span class="l">{{ $t('pages.teams.index.card.events') }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mc-foot" @click.stop>
      <slot name="actions" :team="team">
        <button
          class="btn-follow"
          :class="{ following: team.is_following }"
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
.mc-card {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.mc-card.mc-clickable { cursor: pointer; }
.mc-card.mc-clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--ehub-shadow);
  border-color: color-mix(in srgb, var(--ehub-primary) 40%, var(--ehub-line));
}

/* Banner */
.mc-banner {
  height: 64px;
  position: relative;
  overflow: hidden;
}
.mc-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(255,255,255,.07) 28px 30px);
}
.mc-shield {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: rgba(255,255,255,.15);
}

/* Badges top-right */
.mc-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
}
.mc-badge-open {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .04em;
  padding: 3px 9px;
  border-radius: 50rem;
  background: rgba(0,0,0,.38);
  backdrop-filter: blur(6px);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.mc-badge-verified {
  background: rgba(0,0,0,.3);
  backdrop-filter: blur(6px);
  color: #fff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .72rem;
}

/* Logo: gradient bg ensures transparent images show correctly */
.mc-logo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  border: 3px solid var(--ehub-card);
  margin: -30px 0 0 16px;
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
  z-index: 1;
}
.mc-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Body */
.mc-body {
  padding: 10px 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.mc-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ehub-ink);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.mc-ver { color: var(--ehub-primary); font-size: .82rem; }
.mc-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.mc-desc {
  color: var(--ehub-muted);
  font-size: .82rem;
  line-height: 1.45;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.mc-stats {
  display: flex;
  gap: 14px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--ehub-line);
}
.mc-stat { display: flex; flex-direction: column; }
.mc-stat .v { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); }
.mc-stat .l { font-size: .68rem; font-weight: 500; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .03em; }

/* Footer */
.mc-foot {
  padding: 10px 16px 14px;
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
