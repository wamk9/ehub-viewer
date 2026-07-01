<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Teams from '@/helpers/communication/Teams.js'
import { toast } from '@/helpers/toast.js'
import EhubViewCard from '@/components/EhubViewCard.vue'
import EhubFilterBar from '@/components/EhubFilterBar.vue'

const router = useRouter()
const { t } = useI18n()

const ROLE_ICON = {
  captain: 'crown',
  vice: 'shield-halved',
  player: 'helmet-safety',
  reserve: 'user-clock',
}

const ROLE_COLOR = {
  captain: '#FBBF11',
  vice: 'var(--ehub-primary)',
  player: '#7C3AED',
  reserve: 'var(--ehub-muted)',
}

const allTeams = ref([])
const loading = ref(true)
const roleFilter = ref('all')
const showModal = ref(false)
const joinCodeVisible = ref(false)
const joinCode = ref('')

const pendingInvites = ref([])
const inviteAction = ref(null)

async function load() {
  loading.value = true
  const [teamsResult, invitesResult] = await Promise.all([
    Teams.myTeams(),
    Teams.myInvites(),
  ])
  loading.value = false
  if (teamsResult.code === 200) allTeams.value = teamsResult.data ?? []
  if (invitesResult.code === 200) pendingInvites.value = invitesResult.data ?? []
}

async function acceptInvite(invite) {
  inviteAction.value = invite.token + '_accept'
  const result = await Teams.acceptTeamInvite(invite.token)
  inviteAction.value = null
  if (result.code === 200 || result.code === 201) {
    pendingInvites.value = pendingInvites.value.filter(i => i.token !== invite.token)
    toast.success(t('pages.teams.mine.invites.accepted', { team: invite.team?.name }))
    const r = await Teams.myTeams()
    if (r.code === 200) allTeams.value = r.data ?? []
  } else if (result.code === 403) {
    toast.error(t('pages.teams.mine.invites.error_authority'))
  } else {
    toast.error(t('pages.teams.mine.invites.error'))
  }
}

async function rejectInvite(invite) {
  inviteAction.value = invite.token + '_reject'
  const result = await Teams.rejectInvite(invite.token)
  inviteAction.value = null
  if (result.code === 200) {
    pendingInvites.value = pendingInvites.value.filter(i => i.token !== invite.token)
    toast.success(t('pages.teams.mine.invites.rejected'))
  } else {
    toast.error(t('pages.teams.mine.invites.error'))
  }
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

const ROLES = ['all', 'captain', 'vice', 'starter', 'reserve']

function goToTeam(team) {
  if (team.route) router.push('/team/' + team.route)
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

      </div>
    </div>
  </header>

  <!-- CONTROL BAR -->
  <EhubFilterBar>
    <template #filters>
      <button
        v-for="role in ROLES"
        :key="role"
        class="fchip"
        :class="{ active: roleFilter === role }"
        @click="roleFilter = role"
      >
        {{ $t('pages.teams.mine.bar.' + role) }}
      </button>
    </template>
  </EhubFilterBar>

  <!-- PENDING INVITES -->
  <section v-if="pendingInvites.length" class="container-fluid px-4 pt-4">
    <h3 class="invites-title">
      <font-awesome-icon :icon="['fas', 'envelope-open-text']" />
      {{ $t('pages.teams.mine.invites.title') }}
      <span class="invites-badge">{{ pendingInvites.length }}</span>
    </h3>
    <div class="invites-list">
      <div v-for="inv in pendingInvites" :key="inv.token" class="invite-card">
        <div class="invite-logo" :style="inv.team?.color ? { background: inv.team.color, color: '#fff' } : {}">
          <img v-if="inv.team?.logo_image" :src="inv.team.logo_image" :alt="inv.team?.name" />
          <span v-else-if="inv.team?.name" class="invite-logo-initials">
            {{ inv.team.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() }}
          </span>
          <font-awesome-icon v-else :icon="['fas', 'shield-halved']" />
        </div>
        <div class="invite-info">
          <span class="invite-team">{{ inv.team?.name ?? '—' }}</span>
          <span class="invite-meta">
            {{ $t('pages.teams.mine.invites.by', { name: inv.invited_by_name }) }} ·
            {{ $t('pages.teams.mine.invites.role') }}:
            <strong>{{ $t('pages.teams.mine.roles.' + inv.role) }}</strong>
          </span>
        </div>
        <div class="invite-actions">
          <button
            class="inv-btn accept"
            :disabled="!!inviteAction"
            @click="acceptInvite(inv)"
          >
            <font-awesome-icon v-if="inviteAction === inv.token + '_accept'" :icon="['fas', 'spinner']" spin />
            <font-awesome-icon v-else :icon="['fas', 'check']" />
            {{ $t('pages.teams.mine.invites.accept') }}
          </button>
          <button
            class="inv-btn reject"
            :disabled="!!inviteAction"
            @click="rejectInvite(inv)"
          >
            <font-awesome-icon v-if="inviteAction === inv.token + '_reject'" :icon="['fas', 'spinner']" spin />
            <font-awesome-icon v-else :icon="['fas', 'xmark']" />
            {{ $t('pages.teams.mine.invites.reject') }}
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="myteams-grid">
      <div v-for="i in 6" :key="i" class="skel mteam-card-skel" :style="{ animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <template v-else>
      <div class="myteams-grid">
        <EhubViewCard
          v-for="team in filtered"
          :key="team.id"
          :team="team"
          :accent-color="ROLE_COLOR[team.role] ?? null"
          @click="goToTeam(team)"
        >
          <template #badges>
            <span class="role-badge" :class="team.role">
              <font-awesome-icon :icon="['fas', ROLE_ICON[team.role] || 'shield-halved']" />
              {{ $t('pages.teams.mine.roles.' + team.role) }}
            </span>
          </template>
          <template #actions>
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
          </template>
        </EhubViewCard>

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

/* ── Skeleton ── */
.mteam-card-skel { height: 360px; border-radius: 16px; }

/* ── Grid ── */
.myteams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* ── Role badge (slot content inside vc-badges) ── */
.role-badge {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  font-size: .62rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  padding: 4px 9px; border-radius: 6px;
  backdrop-filter: blur(8px); color: #fff;
  white-space: nowrap; width: 100%;
}
.role-badge.captain { background: color-mix(in srgb, #FBBF11 85%, rgba(0,0,0,.5)); color: #3a2700; }
.role-badge.vice    { background: color-mix(in srgb, var(--ehub-primary) 85%, rgba(0,0,0,.5)); }
.role-badge.player  { background: color-mix(in srgb, #7C3AED 85%, rgba(0,0,0,.5)); }
.role-badge.reserve { background: rgba(0,0,0,.42); color: rgba(255,255,255,.8); }

/* ── Action buttons (slot content inside vc-foot) ── */
.btn-maction {
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
.new-team-card:only-child { grid-column: 1 / -1; }
.new-ico {
  width: 52px; height: 52px; border-radius: 50%; border: 2px dashed currentColor;
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
}
.new-lbl { font-size: .9rem; font-weight: 600; }
.new-sub { font-size: .78rem; opacity: .7; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 60px 20px; color: var(--ehub-muted); }
.empty-state .ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }

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

/* ── Pending invites ── */
.invites-title {
  font-size: .85rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  color: var(--ehub-muted); display: flex; align-items: center; gap: 8px; margin: 0 0 12px;
}
.invites-badge {
  background: var(--ehub-primary); color: #fff;
  font-size: .7rem; font-weight: 700; border-radius: 20px; padding: 2px 7px;
}
.invites-list { display: flex; flex-direction: column; gap: 10px; }
.invite-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 14px; padding: 14px 16px;
  border-left: 3px solid var(--ehub-primary);
}
.invite-logo {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  background: var(--ehub-primary-tint); border: 1px solid var(--ehub-line);
  display: flex; align-items: center; justify-content: center;
  color: var(--ehub-primary); font-size: 1.1rem; overflow: hidden;
}
.invite-logo img { width: 100%; height: 100%; object-fit: cover; }
.invite-logo-initials { font-size: .85rem; font-weight: 700; color: #fff; line-height: 1; }
.invite-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.invite-team { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.invite-meta { font-size: .78rem; color: var(--ehub-muted); }
.invite-actions { display: flex; gap: 8px; flex-shrink: 0; }
.inv-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 9px; font-size: .82rem; font-weight: 600;
  border: 1px solid; cursor: pointer; transition: all .15s;
}
.inv-btn:disabled { opacity: .5; cursor: not-allowed; }
.inv-btn.accept {
  background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff;
}
.inv-btn.accept:hover:not(:disabled) { opacity: .88; }
.inv-btn.reject {
  background: transparent; border-color: var(--ehub-line); color: var(--ehub-muted);
}
.inv-btn.reject:hover:not(:disabled) { border-color: #e05454; color: #e05454; background: rgba(224,84,84,.06); }

@media (max-width: 540px) {
  .invite-card { flex-wrap: wrap; }
  .invite-actions { width: 100%; }
  .inv-btn { flex: 1; justify-content: center; }
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
