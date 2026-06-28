<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Teams from '@/helpers/communication/Teams.js'
import SystemVars from '@/helpers/General/SystemVars'

const router = useRouter()
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

const ROLE_ICON = {
  captain: 'crown',
  vice: 'shield-halved',
  player: 'helmet-safety',
  reserve: 'user-clock',
}

function catGrad(cat) {
  const g = CAT_GRAD[cat]
  return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function fmtNum(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)
}

function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

const allTeams = ref([])
const loading = ref(true)
const roleFilter = ref('all')
const showModal = ref(false)
const joinCodeVisible = ref(false)
const joinCode = ref('')

async function load() {
  loading.value = true
  const result = await Teams.myTeams()
  loading.value = false
  if (result.code === 200) allTeams.value = result.data ?? []
}

load()

const filtered = computed(() => {
  if (roleFilter.value === 'all') return allTeams.value
  return allTeams.value.filter(t => t.role === roleFilter.value)
})

const summary = computed(() => ({
  total: allTeams.value.length,
  totalWins: allTeams.value.reduce((s, t) => s + (t.wins_count || 0), 0),
  totalEvents: allTeams.value.reduce((s, t) => s + (t.events_count || 0), 0),
}))

const ROLES = ['all', 'captain', 'vice', 'player', 'reserve']

function goToTeam(team) {
  if (team.route) router.push('/teams/' + team.route)
}
</script>

<template>
  <!-- HERO -->
  <header class="myteams-hero">
    <div class="container-fluid px-4">
      <div class="hero-inner">
        <div class="hero-left">
          <h1>
            {{ $t('pages.teams.mine.hero.title_pre') }}
            <span class="accent">{{ $t('pages.teams.mine.hero.title_accent') }}</span>
            {{ $t('pages.teams.mine.hero.title_suf') }}
          </h1>
          <p>{{ $t('pages.teams.mine.hero.subtitle') }}</p>
          <div class="summary-row" v-if="!loading && allTeams.length">
            <div class="summary-pill">
              <div class="sp-icon primary">
                <font-awesome-icon :icon="['fas', 'shield-halved']" />
              </div>
              <div class="sp-text">
                <span class="sp-num">{{ summary.total }}</span>
                <span class="sp-lbl">{{ $t('pages.teams.mine.summary.teams') }}</span>
              </div>
            </div>
            <div class="summary-pill">
              <div class="sp-icon gold">
                <font-awesome-icon :icon="['fas', 'trophy']" />
              </div>
              <div class="sp-text">
                <span class="sp-num">{{ summary.totalWins }}</span>
                <span class="sp-lbl">{{ $t('pages.teams.mine.summary.total_wins') }}</span>
              </div>
            </div>
            <div class="summary-pill">
              <div class="sp-icon violet">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" />
              </div>
              <div class="sp-text">
                <span class="sp-num">{{ summary.totalEvents }}</span>
                <span class="sp-lbl">{{ $t('pages.teams.mine.summary.total_events') }}</span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary round px-4" style="flex-shrink:0" @click="showModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
          {{ $t('pages.teams.mine.hero.new') }}
        </button>
      </div>
    </div>
  </header>

  <!-- CONTROL BAR -->
  <div class="control-bar">
    <div class="container-fluid px-4">
      <div class="control-inner">
        <span class="fb-label">{{ $t('pages.teams.mine.bar.role') }}</span>
        <div class="seg seg-sm">
          <button
            v-for="role in ROLES"
            :key="role"
            :class="{ active: roleFilter === role }"
            @click="roleFilter = role"
          >
            {{ $t('pages.teams.mine.bar.' + role) }}
          </button>
        </div>
        <div style="flex:1"></div>
        <span v-if="!loading" style="font-size:.82rem;color:var(--ehub-muted);white-space:nowrap;">
          {{ $t('pages.teams.mine.results').replace('{n}', filtered.length) }}
        </span>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <template v-else>
      <!-- Filter empty notice (only when there are teams but filter hides all) -->
      <div v-if="!filtered.length && allTeams.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'shield-halved']" /></div>
        <p class="mb-0">{{ $t('pages.teams.mine.empty') }}</p>
      </div>

      <!-- Grid — always rendered (even when allTeams is empty, shows only the new card) -->
      <div class="myteams-grid">
        <!-- Team cards -->
        <div
          v-for="team in filtered"
          :key="team.id"
          class="mteam-card"
          :data-role="team.role"
          @click="goToTeam(team)"
        >
          <!-- Banner -->
          <div class="mteam-banner" :style="{ background: catGrad(team.category) }">
            <font-awesome-icon :icon="['fas', 'shield-halved']" class="banner-shield" />
            <span v-if="team.is_verified" class="banner-verified">
              <font-awesome-icon :icon="['fas', 'circle-check']" />
            </span>
          </div>

          <!-- Head -->
          <div class="mteam-head">
            <div class="mteam-logo" :style="{ background: catGrad(team.category) }">
              <img v-if="team.logo_image" :src="imgUrl(team.logo_image)" :alt="team.name" style="width:100%;height:100%;object-fit:cover;border-radius:11px;" />
              <template v-else>{{ initials(team.name) }}</template>
            </div>
            <span class="role-badge" :class="team.role">
              <font-awesome-icon :icon="['fas', ROLE_ICON[team.role] || 'shield-halved']" />
              {{ $t('pages.teams.mine.roles.' + team.role) }}
            </span>
          </div>

          <!-- Body -->
          <div class="mteam-body">
            <div class="mteam-name">
              {{ team.name }}
              <font-awesome-icon v-if="team.is_verified" :icon="['fas', 'circle-check']" class="ver" />
            </div>
            <div class="mteam-chips">
              <span v-if="team.category" class="cat-chip sub" style="font-size:.7rem;">
                {{ $t('categories.names.' + team.category) }}
              </span>
              <span v-if="team.org_name" class="cat-chip" style="font-size:.7rem;display:inline-flex;align-items:center;gap:4px;">
                <font-awesome-icon :icon="['fas', 'building-flag']" style="opacity:.65;font-size:.65rem" />
                {{ team.org_name }}
              </span>
            </div>
            <p class="mteam-desc">{{ team.description || '—' }}</p>

            <div class="mteam-stats">
              <div class="mteam-stat">
                <div class="sv">{{ fmtNum(team.players_count) }}</div>
                <div class="sl">{{ $t('pages.teams.mine.card.players') }}</div>
              </div>
              <div class="mteam-stat highlight">
                <div class="sv">{{ fmtNum(team.wins_count) }}</div>
                <div class="sl">{{ $t('pages.teams.mine.card.wins') }}</div>
              </div>
              <div class="mteam-stat">
                <div class="sv">{{ fmtNum(team.events_count) }}</div>
                <div class="sl">{{ $t('pages.teams.mine.card.events') }}</div>
              </div>
            </div>

            <div v-if="team.is_open && (team.role === 'captain' || team.role === 'vice')" class="open-alert">
              <font-awesome-icon :icon="['fas', 'door-open']" />
              <span>{{ $t('pages.teams.mine.card.open') }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mteam-actions" @click.stop>
            <template v-if="team.role === 'captain' || team.role === 'vice'">
              <button class="btn-maction primary-action" @click="$router.push(`/team/${team.route}/manage`)">
                <font-awesome-icon :icon="['fas', 'sliders']" />
                {{ $t('pages.teams.mine.card.manage') }}
              </button>
              <button class="btn-maction">
                <font-awesome-icon :icon="['fas', 'users']" />
                {{ $t('pages.teams.mine.card.roster') }}
              </button>
              <button class="btn-maction">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
                {{ $t('pages.teams.mine.card.calendar') }}
              </button>
            </template>
            <template v-else>
              <button class="btn-maction primary-action">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
                {{ $t('pages.teams.mine.card.calendar') }}
              </button>
              <button class="btn-maction">
                <font-awesome-icon :icon="['fas', 'chart-bar']" />
                {{ $t('pages.teams.mine.card.results') }}
              </button>
            </template>
          </div>
        </div>

        <!-- New team card — always in grid -->
        <div class="new-team-card" @click="showModal = true">
          <div class="new-ico">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </div>
          <div class="new-lbl">{{ $t('pages.teams.mine.new_card.label') }}</div>
          <div class="new-sub">{{ $t('pages.teams.mine.new_card.sub') }}</div>
        </div>
      </div>
    </template>
  </main>

  <footer class="home-footer">
    {{ $t('pages.homepage.entrance.footer') }}
  </footer>

  <!-- NEW TEAM MODAL -->
  <Transition name="fade">
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="ehub-card p-5" style="max-width:420px;width:90%;">
        <div style="text-align:center;margin-bottom:24px;">
          <div class="modal-icon-wrap">
            <font-awesome-icon :icon="['fas', 'shield-halved']" style="font-size:1.4rem;color:var(--ehub-primary);" />
          </div>
          <h5 style="font-weight:800;margin-bottom:6px;">{{ $t('pages.teams.mine.modal.title') }}</h5>
          <p style="color:var(--ehub-muted);font-size:.88rem;margin:0;">{{ $t('pages.teams.mine.modal.subtitle') }}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <router-link to="/create-team" class="btn btn-primary round w-100" @click="showModal = false">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.teams.mine.modal.create') }}
          </router-link>
          <button class="btn btn-outline-secondary round w-100" @click="joinCodeVisible = !joinCodeVisible">
            <font-awesome-icon :icon="['fas', 'key']" class="me-2" />
            {{ $t('pages.teams.mine.modal.join') }}
          </button>
          <div v-if="joinCodeVisible" style="margin-top:4px;">
            <div class="input-group">
              <input
                v-model="joinCode"
                type="text"
                class="form-control"
                :placeholder="$t('pages.teams.mine.modal.code_placeholder')"
                style="border-radius:10px 0 0 10px;"
              />
              <button class="btn btn-primary" style="border-radius:0 10px 10px 0;">
                {{ $t('pages.teams.mine.modal.enter') }}
              </button>
            </div>
          </div>
          <button class="btn btn-link text-muted" @click="showModal = false; joinCodeVisible = false">
            {{ $t('pages.teams.mine.modal.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Role colours ── */
:root {
  --role-captain:    #FBBF11;
  --role-captain-bg: color-mix(in srgb, #FBBF11 14%, transparent);
  --role-captain-br: color-mix(in srgb, #FBBF11 30%, transparent);
  --role-player:     #7C3AED;
  --role-player-bg:  color-mix(in srgb, #7C3AED 12%, transparent);
  --role-player-br:  color-mix(in srgb, #7C3AED 24%, transparent);
}

/* ── Hero ── */
.myteams-hero {
  padding: 40px 24px 32px;
  border-bottom: 1px solid var(--ehub-line);
  background:
    radial-gradient(ellipse 55% 80% at 5% 0%, var(--ehub-glow) 0%, transparent 65%),
    radial-gradient(ellipse 40% 60% at 95% 110%, color-mix(in srgb, #FBBF11 10%, transparent) 0%, transparent 55%);
  position: relative; overflow: hidden;
}
.myteams-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(118deg, transparent 0 42px, color-mix(in srgb, var(--ehub-ink) 3%, transparent) 42px 44px);
}
.hero-inner {
  position: relative; display: flex; align-items: flex-end;
  justify-content: space-between; flex-wrap: wrap; gap: 20px;
}
.hero-left h1 {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 800;
  letter-spacing: -.025em; margin: 0 0 6px; color: var(--ehub-ink);
}
.hero-left h1 .accent { color: var(--ehub-primary); }
.hero-left p { color: var(--ehub-muted); font-size: .95rem; margin: 0; }

/* ── Summary pills ── */
.summary-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.summary-pill {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 50rem; padding: 8px 16px 8px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.sp-icon {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; flex-shrink: 0;
}
.sp-icon.primary { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.sp-icon.gold    { background: var(--role-captain-bg);   color: var(--role-captain); }
.sp-icon.violet  { background: var(--role-player-bg);    color: var(--role-player); }
.sp-num { font-size: 1.05rem; font-weight: 800; color: var(--ehub-ink); line-height: 1; }
.sp-lbl { font-size: .76rem; color: var(--ehub-muted); font-weight: 500; }
.sp-text { display: flex; flex-direction: column; }

/* ── Control bar ── */
.control-bar {
  position: sticky; top: 60px; z-index: 30;
  background: color-mix(in srgb, var(--ehub-page) 90%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ehub-line);
  padding: 10px 0;
}
.control-inner { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.fb-label {
  font-size: .72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .05em; color: var(--ehub-muted); margin-right: 2px;
}

/* ── Grid ── */
.myteams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* ── Team card ── */
.mteam-card {
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  cursor: pointer;
}
.mteam-card:hover { transform: translateY(-3px); box-shadow: var(--ehub-shadow); border-color: color-mix(in srgb, var(--ehub-primary) 35%, var(--ehub-line)); }
.mteam-card[data-role="captain"] { border-top: 3px solid #FBBF11; }
.mteam-card[data-role="vice"]    { border-top: 3px solid var(--ehub-primary); }
.mteam-card[data-role="player"]  { border-top: 3px solid #7C3AED; }
.mteam-card[data-role="reserve"] { border-top: 3px solid var(--ehub-muted); }

.mteam-banner {
  height: 62px; position: relative; overflow: hidden;
}
.mteam-banner::after {
  content: ''; position: absolute; inset: 0;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(255,255,255,.07) 28px 30px);
}
.banner-shield {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  font-size: 1.8rem; color: rgba(255,255,255,.18); z-index: 1;
}
.banner-verified {
  position: absolute; top: 10px; right: 12px;
  color: #fff; font-size: .88rem;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); z-index: 2;
}

.mteam-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 16px; margin-top: -22px; position: relative; z-index: 1;
}
.mteam-logo {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 800; color: #fff; letter-spacing: .02em;
  text-shadow: 0 1px 4px rgba(0,0,0,.35);
  border: 3px solid var(--ehub-card);
  box-shadow: 0 4px 12px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.18);
  flex-shrink: 0; overflow: hidden;
}

.role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .72rem; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
  padding: 5px 11px; border-radius: 50rem; border: 1px solid;
  margin-bottom: 4px;
}
.role-badge.captain { background: color-mix(in srgb, #FBBF11 14%, transparent); border-color: color-mix(in srgb, #FBBF11 30%, transparent); color: color-mix(in srgb, #FBBF11, #7a5400 30%); }
.role-badge.vice    { background: var(--ehub-primary-tint); border-color: var(--ehub-primary-border); color: var(--ehub-primary); }
.role-badge.player  { background: color-mix(in srgb, #7C3AED 12%, transparent); border-color: color-mix(in srgb, #7C3AED 24%, transparent); color: #7C3AED; }
.role-badge.reserve { background: var(--ehub-field-bg); border-color: var(--ehub-line); color: var(--ehub-muted); }

.mteam-body { padding: 10px 16px 0; flex: 1; display: flex; flex-direction: column; }
.mteam-name {
  font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 3px;
  display: flex; align-items: center; gap: 6px;
}
.mteam-name .ver { color: var(--ehub-primary); font-size: .8rem; }
.mteam-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.mteam-desc {
  color: var(--ehub-muted); font-size: .83rem; line-height: 1.45;
  margin: 0 0 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.mteam-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--ehub-line); border-radius: 10px; overflow: hidden; margin-bottom: 14px;
}
.mteam-stat { padding: 10px 10px 9px; text-align: center; }
.mteam-stat + .mteam-stat { border-left: 1px solid var(--ehub-line); }
.mteam-stat .sv { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); line-height: 1; }
.mteam-stat .sl { font-size: .67rem; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; margin-top: 3px; }
.mteam-stat.highlight .sv { color: #FBBF11; }

.open-alert {
  display: flex; align-items: center; gap: 8px;
  background: color-mix(in srgb, #1f8a5b 8%, transparent);
  border: 1px solid color-mix(in srgb, #1f8a5b 22%, transparent);
  border-radius: 8px; padding: 8px 12px; margin-bottom: 14px;
  font-size: .8rem; color: #1f8a5b; font-weight: 500;
}

.mteam-actions { padding: 0 16px 16px; display: flex; gap: 7px; flex-wrap: wrap; }
.btn-maction {
  flex: 1; min-width: 0;
  border: 1px solid var(--ehub-line); background: var(--ehub-field-bg);
  color: var(--ehub-ink); font-size: .8rem; font-weight: 600;
  padding: 8px 10px; border-radius: 9px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .15s; white-space: nowrap;
}
.btn-maction:hover { background: var(--ehub-card); border-color: var(--ehub-primary); color: var(--ehub-primary); }
.btn-maction.primary-action { background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff; }
.btn-maction.primary-action:hover { filter: brightness(1.1); }

/* ── New team card ── */
.new-team-card {
  border: 2px dashed var(--ehub-line); border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 40px 24px; cursor: pointer; color: var(--ehub-muted);
  transition: border-color .15s, color .15s, background .15s;
  text-align: center; min-height: 240px;
}
.new-team-card:hover { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint2); }
.new-ico {
  width: 52px; height: 52px; border-radius: 50%; border: 2px dashed currentColor;
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
}
.new-lbl { font-size: .9rem; font-weight: 600; }
.new-sub { font-size: .78rem; opacity: .7; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 60px 20px; color: var(--ehub-muted); }
.empty-state .ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }

/* ── Footer ── */
.home-footer {
  border-top: 1px solid var(--ehub-line); padding: 28px 20px;
  text-align: center; color: var(--ehub-muted); font-size: .82rem; margin-top: 40px;
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
}
.modal-icon-wrap {
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--ehub-primary-tint);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
