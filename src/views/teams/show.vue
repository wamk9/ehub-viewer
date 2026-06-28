<template>
  <div v-if="loading" class="ts-skel-page">
    <div class="skel" style="height:200px;border-radius:0;width:100%"></div>
    <div style="max-width:1200px;margin:0 auto;padding:0 1.5rem">
      <div style="display:flex;gap:1rem;margin-top:-36px;align-items:flex-end;padding-bottom:1rem">
        <div class="skel" style="width:80px;height:80px;border-radius:14px;flex-shrink:0;border:3px solid var(--ehub-card)"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;padding-bottom:.5rem">
          <div class="skel" style="height:22px;width:220px"></div>
          <div class="skel" style="height:14px;width:140px"></div>
        </div>
      </div>
      <div style="display:flex;gap:1.5rem;margin:1rem 0 1.5rem">
        <div v-for="i in 4" :key="i" class="skel" :style="{ height:'52px', width:'90px', borderRadius:'10px', animationDelay: (i*0.09)+'s' }"></div>
      </div>
      <div style="display:flex;gap:.5rem;margin-bottom:1.5rem">
        <div v-for="i in 3" :key="'t'+i" class="skel" :style="{ height:'36px', width:'110px', borderRadius:'8px', animationDelay: (i*0.07)+'s' }"></div>
      </div>
      <div class="skel" style="height:220px;border-radius:14px"></div>
    </div>
  </div>

  <div v-else-if="!team" class="ts-state">
    <p class="ts-err">{{ $t('pages.teams.show.error') }}</p>
  </div>

  <div v-else class="ts-page">

    <!-- HERO -->
    <header class="ts-hero">
      <div class="ts-cover" :style="coverStyle">
        <font-awesome-icon icon="shield-halved" class="ts-cover-icon" />
      </div>
      <div class="ts-cover-fade"></div>
      <span class="ts-status-flag" :class="team.is_open ? 'open' : 'closed'">
        <font-awesome-icon :icon="team.is_open ? 'door-open' : 'lock'" />
        {{ $t(team.is_open ? 'pages.teams.show.status.open' : 'pages.teams.show.status.closed') }}
      </span>
    </header>

    <!-- HEAD -->
    <div class="ts-container">
      <div class="ts-head">
        <div class="ts-identity">
          <div class="ts-logo" :style="logoStyle">
            <img v-if="team.logo_image" :src="logoUrl" alt="" />
            <span v-else>{{ teamInitials }}</span>
          </div>
          <div class="ts-titleblock">
            <span class="ts-org-link" v-if="team.org_name">
              <font-awesome-icon icon="building-flag" /> {{ team.org_name }}
            </span>
            <h1 class="ts-name">
              {{ team.name }}
              <font-awesome-icon v-if="team.is_verified" icon="circle-check" class="ts-ver" :title="$t('pages.teams.show.head.verified')" />
              <span class="ts-tag">{{ team.tag }}</span>
            </h1>
            <div class="ts-chips">
              <span class="ts-chip" v-if="categoryInfo">
                <font-awesome-icon :icon="categoryInfo.icon" /> {{ categoryInfo.name }}
              </span>
              <span class="ts-chip" v-if="team.location">
                <font-awesome-icon icon="location-dot" /> {{ team.location }}
              </span>
              <span class="ts-chip" v-if="team.founded_year">
                <font-awesome-icon icon="calendar-check" /> {{ $t('pages.teams.show.stats.founded') }} {{ team.founded_year }}
              </span>
            </div>
          </div>
          <div class="ts-actions">
            <button class="ts-btn-follow" :class="{ following: team.is_following }" @click="toggleFollow">
              <font-awesome-icon :icon="team.is_following ? 'bell-slash' : 'bell'" />
              {{ $t(team.is_following ? 'pages.teams.show.head.following' : 'pages.teams.show.head.follow') }}
            </button>
            <button v-if="!team.is_member" class="ts-btn-apply" :class="{ 'is-closed': !team.is_open }" @click="openApplyModal">
              <font-awesome-icon :icon="team.is_open ? 'paper-plane' : 'lock'" />
              {{ $t(team.is_open ? 'pages.teams.show.head.apply' : 'pages.teams.show.head.closed') }}
            </button>
            <button v-if="team.is_admin" class="ts-btn-manage" @click="goManage">
              <font-awesome-icon icon="screwdriver-wrench" />
              {{ $t('pages.teams.show.head.manage') }}
            </button>
            <button v-else-if="team.is_member" class="ts-btn-manage" @click="$router.push(`/team/${team.route}/manage`)">
              <font-awesome-icon icon="users" />
              {{ $t('pages.teams.show.head.members_view') }}
            </button>
          </div>
        </div>

        <!-- STAT BAR -->
        <div class="ts-statbar">
          <div class="ts-stat">
            <span class="v">{{ team.players_count }}</span>
            <span class="l">{{ $t('pages.teams.show.stats.players') }}</span>
          </div>
          <div class="ts-stat highlight">
            <span class="v">{{ team.wins_count }}</span>
            <span class="l">{{ $t('pages.teams.show.stats.wins') }}</span>
          </div>
          <div class="ts-stat">
            <span class="v">{{ team.events_count }}</span>
            <span class="l">{{ $t('pages.teams.show.stats.events') }}</span>
          </div>
          <div class="ts-stat" v-if="team.founded_year">
            <span class="v">{{ team.founded_year }}</span>
            <span class="l">{{ $t('pages.teams.show.stats.founded') }}</span>
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="ts-tabs">
        <button class="ts-tab" :class="{ active: activeTab === 'roster' }" @click="activeTab = 'roster'">
          <font-awesome-icon icon="users" />
          {{ $t('pages.teams.show.tabs.roster') }}
          <span class="ts-pill">{{ team.members?.length || 0 }}</span>
        </button>
        <button class="ts-tab" :class="{ active: activeTab === 'results' }" @click="activeTab = 'results'">
          <font-awesome-icon icon="trophy" />
          {{ $t('pages.teams.show.tabs.results') }}
        </button>
        <button class="ts-tab" :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">
          <font-awesome-icon icon="circle-info" />
          {{ $t('pages.teams.show.tabs.about') }}
        </button>
      </div>

      <!-- ROSTER -->
      <section v-if="activeTab === 'roster'" class="ts-pane">
        <div class="ts-roster-grid">
          <router-link v-for="member in team.members" :key="member.id"
            :to="`/profile/${member.username}`" class="ts-player-card">
            <div class="ts-player-av" :style="memberAvatarStyle(member)">{{ memberInitials(member) }}</div>
            <div class="ts-player-info">
              <div class="ts-player-name">{{ member.name }}</div>
              <div class="ts-player-handle">@{{ member.username }}</div>
              <span class="ts-role-chip" :class="member.role">
                {{ $t('pages.teams.show.roles.' + (member.role || 'member')) }}
              </span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- RESULTS -->
      <section v-if="activeTab === 'results'" class="ts-pane">
        <div class="ts-empty">
          <div class="ts-empty-ico"><font-awesome-icon icon="trophy" /></div>
          <p>{{ $t('pages.teams.show.empty.results') }}</p>
        </div>
      </section>

      <!-- ABOUT -->
      <section v-if="activeTab === 'about'" class="ts-pane">
        <div class="ts-about-grid">
          <div class="ts-about-card">
            <h3>{{ $t('pages.teams.show.about.heading') }}</h3>
            <p class="ts-about-body">{{ team.description || '—' }}</p>
          </div>
          <div class="ts-about-card">
            <h3>{{ $t('pages.teams.show.about.details') }}</h3>
            <ul class="ts-info-list">
              <li v-if="team.location">
                <div class="ts-info-ico"><font-awesome-icon icon="location-dot" /></div>
                <div class="ts-info-meta">
                  <span class="k">{{ $t('pages.teams.show.about.location') }}</span>
                  <span class="val">{{ team.location }}</span>
                </div>
              </li>
              <li v-if="categoryInfo">
                <div class="ts-info-ico"><font-awesome-icon :icon="categoryInfo.icon" /></div>
                <div class="ts-info-meta">
                  <span class="k">{{ $t('pages.teams.show.about.category') }}</span>
                  <span class="val">{{ categoryInfo.name }}</span>
                </div>
              </li>
              <li v-if="team.org_name">
                <div class="ts-info-ico"><font-awesome-icon icon="building-flag" /></div>
                <div class="ts-info-meta">
                  <span class="k">{{ $t('pages.teams.show.about.org') }}</span>
                  <span class="val">{{ team.org_name }}</span>
                </div>
              </li>
              <li v-if="team.skill_level">
                <div class="ts-info-ico"><font-awesome-icon icon="chart-bar" /></div>
                <div class="ts-info-meta">
                  <span class="k">{{ $t('pages.teams.show.about.skill') }}</span>
                  <span class="val">{{ $t('pages.teams.show.skill.' + team.skill_level) }}</span>
                </div>
              </li>
              <li>
                <div class="ts-info-ico"><font-awesome-icon :icon="team.is_open ? 'door-open' : 'lock'" /></div>
                <div class="ts-info-meta">
                  <span class="k">{{ $t('pages.teams.show.about.status') }}</span>
                  <span class="val">{{ $t(team.is_open ? 'pages.teams.show.status.open' : 'pages.teams.show.status.closed') }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <router-link to="/teams" class="ts-back">
        <font-awesome-icon icon="arrow-left" />
        {{ $t('pages.teams.show.back') }}
      </router-link>
    </div>

    <!-- APPLY MODAL -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="applyModal" class="ts-overlay" @click.self="closeApplyModal">
          <div class="ts-modal-card">
            <div class="ts-modal-hd">
              <div class="ts-apply-hd">
                <div class="ts-apply-logo" :style="logoStyle">{{ teamInitials }}</div>
                <div>
                  <div class="ts-apply-name">{{ team.name }}</div>
                  <div class="ts-apply-sub">{{ $t('pages.teams.show.apply.sub') }}</div>
                </div>
              </div>
              <button class="ts-modal-close" @click="closeApplyModal">
                <font-awesome-icon icon="xmark" />
              </button>
            </div>
            <div class="ts-modal-body">
              <div class="ts-field">
                <label class="ts-label">{{ $t('pages.teams.show.apply.msg_label') }}</label>
                <textarea class="ts-textarea" v-model="applyForm.message" rows="4"
                  :placeholder="$t('pages.teams.show.apply.msg_ph')"
                  :class="{ 'is-invalid': applyErrors.message }"></textarea>
                <div v-if="applyErrors.message" class="ts-error">{{ $t('pages.teams.show.apply.msg_error') }}</div>
              </div>
              <div class="ts-field">
                <label class="ts-label">{{ $t('pages.teams.show.apply.role_label') }}</label>
                <select class="ts-select" v-model="applyForm.role">
                  <option value="">{{ $t('pages.teams.show.apply.role_ph') }}</option>
                  <option value="starter">{{ $t('pages.teams.show.roles.starter') }}</option>
                  <option value="reserve">{{ $t('pages.teams.show.roles.reserve') }}</option>
                  <option value="coach">{{ $t('pages.teams.show.roles.coach') }}</option>
                </select>
              </div>
              <div class="ts-apply-note">
                <font-awesome-icon icon="circle-info" />
                {{ $t('pages.teams.show.apply.note') }}
              </div>
            </div>
            <div class="ts-modal-ft">
              <button class="ts-btn-ghost" @click="closeApplyModal">{{ $t('pages.teams.show.apply.cancel') }}</button>
              <button class="ts-btn-primary" @click="submitApply">
                <font-awesome-icon icon="paper-plane" />
                {{ $t('pages.teams.show.apply.submit') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import Teams from '@/helpers/communication/Teams.js'
import SystemVars from '@/helpers/General/SystemVars.js'
import { toast } from '@/helpers/toast.js'

const AVATAR_PALETTE = ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a']

function strHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

const CATEGORY_MAP = {
  'simracing':        { icon: 'flag-checkered', names: { 'pt-BR': 'SimRacing', en: 'SimRacing', es: 'SimRacing' } },
  'esports-fps':      { icon: 'crosshairs',     names: { 'pt-BR': 'FPS Competitivo', en: 'Competitive FPS', es: 'FPS Competitivo' } },
  'esports-moba':     { icon: 'dragon',         names: { 'pt-BR': 'MOBA', en: 'MOBA', es: 'MOBA' } },
  'esports-fighting': { icon: 'hand-fist',      names: { 'pt-BR': 'Jogos de Luta', en: 'Fighting Games', es: 'Juegos de Lucha' } },
  'motorsport':       { icon: 'car-side',       names: { 'pt-BR': 'Automobilismo', en: 'Motorsport', es: 'Automovilismo' } },
  'chess':            { icon: 'chess-knight',   names: { 'pt-BR': 'Xadrez', en: 'Chess', es: 'Ajedrez' } },
  'running':          { icon: 'person-running', names: { 'pt-BR': 'Corrida', en: 'Running', es: 'Carrera' } },
  'cycling':          { icon: 'bicycle',        names: { 'pt-BR': 'Ciclismo', en: 'Cycling', es: 'Ciclismo' } },
}

export default {
  name: 'TeamShow',

  data() {
    return {
      loading: true,
      team: null,
      activeTab: 'roster',
      applyModal: false,
      applyForm: { message: '', role: '' },
      applyErrors: { message: false },
      coverVersion: Date.now(),
    }
  },

  computed: {
    teamInitials() {
      if (!this.team) return ''
      return this.team.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    },
    logoUrl() {
      return SystemVars.baseUrl + 'storage/' + this.team.logo_image
    },
    coverStyle() {
      if (this.team?.cover_image) {
        const url = SystemVars.baseUrl + 'storage/' + this.team.cover_image + '?v=' + this.coverVersion
        return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }
      const color = this.team?.color || '#0098D8'
      return { background: `linear-gradient(135deg, ${color}, ${this.lightenHex(color, 40)})` }
    },
    logoStyle() {
      const color = this.team?.color || '#0098D8'
      return { background: `linear-gradient(135deg, ${color}, ${this.lightenHex(color, 40)})` }
    },
    categoryInfo() {
      if (!this.team?.category) return null
      const cat = CATEGORY_MAP[this.team.category]
      if (!cat) return null
      const lang = this.$i18n.locale
      return { icon: cat.icon, name: cat.names[lang] || cat.names.en }
    },
  },

  methods: {
    async loadTeam() {
      this.loading = true
      const { code, data } = await Teams.getPublic(this.$route.params.teamRoute)
      if (code === 200) {
        this.team = data
      }
      this.loading = false
    },

    lightenHex(hex, amount) {
      const num = parseInt(hex.replace('#', ''), 16)
      const r = Math.min(255, (num >> 16) + amount)
      const g = Math.min(255, ((num >> 8) & 0xff) + amount)
      const b = Math.min(255, (num & 0xff) + amount)
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
    },

    memberInitials(member) {
      return member.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    },

    memberAvatarStyle(member) {
      const color = AVATAR_PALETTE[strHash(member.id || member.name || '') % AVATAR_PALETTE.length]
      return { background: color }
    },

    async toggleFollow() {
      if (!this.team) return
      if (this.team.is_following) {
        const { code } = await Teams.unfollow(this.team.route)
        if (code === 200) {
          this.team.is_following = false
          this.team.followers_count = Math.max(0, (this.team.followers_count || 1) - 1)
        }
      } else {
        const { code } = await Teams.follow(this.team.route)
        if (code === 200) {
          this.team.is_following = true
          this.team.followers_count = (this.team.followers_count || 0) + 1
        }
      }
    },

    goManage() {
      this.$router.push(`/team/${this.team.route}/manage`)
    },

    openApplyModal() {
      if (!this.team.is_open) return
      this.applyForm = { message: '', role: '' }
      this.applyErrors = { message: false }
      this.applyModal = true
    },

    closeApplyModal() {
      this.applyModal = false
    },

    async submitApply() {
      if (!this.applyForm.message.trim()) {
        this.applyErrors.message = true
        return
      }
      this.applyErrors.message = false
      const { code, message } = await Teams.apply(this.team.route, {
        message: this.applyForm.message,
        desired_role: this.applyForm.role || null,
      })
      if (code === 201) {
        this.closeApplyModal()
        toast.success(this.$t('pages.teams.show.apply.sent'))
      } else if (code === 409) {
        this.closeApplyModal()
        const key = message === 'already_member'
          ? 'pages.teams.show.apply.already_member'
          : 'pages.teams.show.apply.already_applied'
        toast.info(this.$t(key))
      } else {
        toast.error(this.$t('pages.teams.show.apply.error'))
      }
    },
  },

  created() {
    this.loadTeam()
  },
}
</script>

<style scoped>
/* ── Page ── */
.ts-page { min-height: 100vh; }
.ts-skel-page { background: var(--ehub-page); min-height: 100vh; }
.ts-state { display: flex; align-items: center; justify-content: center; padding: 80px 20px; flex-direction: column; gap: 16px; }
.ts-spinner { font-size: 1.8rem; color: var(--ehub-muted); }
.ts-err { color: var(--ehub-muted); font-size: .95rem; }

/* ── Hero ── */
.ts-hero { position: relative; height: 220px; overflow: hidden; border-bottom: 1px solid var(--ehub-line); }
.ts-cover { position: absolute; inset: 0; }
.ts-cover::after { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg, transparent 0 46px, rgba(255,255,255,.06) 46px 48px); }
.ts-cover-icon { position: absolute; bottom: -24px; right: 16px; font-size: 12rem; color: rgba(255,255,255,.07); line-height: 1; pointer-events: none; }
.ts-cover-fade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, color-mix(in srgb, var(--ehub-page) 88%, transparent) 100%); }
.ts-status-flag {
  position: absolute; top: 18px; right: 22px; z-index: 2;
  display: inline-flex; align-items: center; gap: 7px;
  font-size: .78rem; font-weight: 700; letter-spacing: .02em;
  padding: 6px 14px; border-radius: 50rem; backdrop-filter: blur(6px);
}
.ts-status-flag.open   { background: rgba(31,138,91,.85); color: #fff; }
.ts-status-flag.closed { background: rgba(0,0,0,.32); color: rgba(255,255,255,.8); }

/* ── Container ── */
.ts-container { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px; }

/* ── Head ── */
.ts-head { position: relative; margin-top: -52px; padding-bottom: 6px; }
.ts-identity { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.ts-logo {
  width: 116px; height: 116px; border-radius: 26px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.6rem; font-weight: 800; color: #fff; letter-spacing: .01em;
  text-shadow: 0 1px 6px rgba(0,0,0,.35);
  border: 4px solid var(--ehub-card);
  box-shadow: 0 8px 24px rgba(0,0,0,.24), inset 0 0 0 1px rgba(255,255,255,.18);
  overflow: hidden;
}
.ts-logo img { width: 100%; height: 100%; object-fit: cover; }
.ts-titleblock { flex: 1; min-width: 240px; padding-bottom: 6px; }
.ts-org-link { display: inline-flex; align-items: center; gap: 7px; font-size: .85rem; font-weight: 600; color: var(--ehub-muted); margin-bottom: 6px; }
.ts-org-link svg { color: var(--ehub-primary); }
.ts-name { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -.02em; margin: 0 0 6px; color: var(--ehub-ink); display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.ts-ver { color: var(--ehub-primary); font-size: 1.1rem; }
.ts-tag { color: var(--ehub-muted); font-size: 1rem; font-weight: 600; }
.ts-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ts-chip { display: inline-flex; align-items: center; gap: 6px; font-size: .8rem; font-weight: 500; color: var(--ehub-muted); }
.ts-chip svg { color: var(--ehub-primary); width: 14px; }

/* ── Actions ── */
.ts-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; padding-bottom: 8px; }
.ts-btn-follow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 50rem; font-size: .88rem; font-weight: 600; cursor: pointer;
  border: 1px solid var(--ehub-primary); background: var(--ehub-primary); color: #fff; transition: all .15s;
}
.ts-btn-follow:hover { background: var(--ehub-primary-dark); border-color: var(--ehub-primary-dark); }
.ts-btn-follow.following { background: transparent; color: var(--ehub-primary); }
.ts-btn-follow.following:hover { background: var(--ehub-primary-tint); }
.ts-btn-apply {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 50rem; font-size: .88rem; font-weight: 700; cursor: pointer;
  border: 1px solid var(--ehub-gold); background: var(--ehub-gold); color: #1a1a1a; transition: all .15s;
}
.ts-btn-apply:hover { background: color-mix(in srgb, var(--ehub-gold), #000 12%); border-color: color-mix(in srgb, var(--ehub-gold), #000 12%); }
.ts-btn-apply.is-closed { background: var(--ehub-field-bg); color: var(--ehub-muted); border-color: var(--ehub-line); cursor: default; }
.ts-btn-apply.is-closed:hover { background: var(--ehub-field-bg); }
.ts-btn-manage {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 50rem; font-size: .88rem; font-weight: 600; cursor: pointer;
  background: var(--ehub-field-bg); color: var(--ehub-field-text); border: 1px solid var(--ehub-line); transition: all .15s;
}
.ts-btn-manage:hover { background: var(--ehub-card); border-color: var(--ehub-muted); }

/* ── Stat bar ── */
.ts-statbar {
  display: flex; margin-top: 22px;
  border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card);
  background: var(--ehub-card); overflow: hidden;
}
.ts-stat { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--ehub-line); }
.ts-stat:last-child { border-right: 0; }
.ts-stat .v { font-size: 1.5rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; line-height: 1; }
.ts-stat .l { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); }
.ts-stat.highlight .v { color: var(--ehub-primary); }

/* ── Tabs ── */
.ts-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--ehub-line); margin-top: 34px; overflow-x: auto; scrollbar-width: none; }
.ts-tabs::-webkit-scrollbar { display: none; }
.ts-tab {
  border: 0; background: transparent; color: var(--ehub-muted);
  font-size: .95rem; font-weight: 600; padding: 12px 18px; cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  white-space: nowrap; display: inline-flex; align-items: center; gap: 8px;
  transition: color .15s, border-color .15s;
}
.ts-tab:hover { color: var(--ehub-ink); }
.ts-tab.active { color: var(--ehub-primary); border-bottom-color: var(--ehub-primary); }
.ts-pill { font-size: .72rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); padding: 1px 8px; border-radius: 50rem; }
.ts-tab.active .ts-pill { background: var(--ehub-primary-tint); color: var(--ehub-primary); }

/* ── Pane ── */
.ts-pane { padding-top: 26px; }

/* ── Roster ── */
.ts-roster-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.ts-player-card {
  display: flex; align-items: center; gap: 14px; padding: 16px;
  background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px;
  transition: border-color .15s, transform .15s;
  text-decoration: none; color: inherit;
}
.ts-player-card:hover { border-color: color-mix(in srgb, var(--ehub-primary) 40%, var(--ehub-line)); transform: translateY(-2px); text-decoration: none; color: inherit; }
.ts-player-av { width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: .01em; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
.ts-player-info { min-width: 0; flex: 1; }
.ts-player-name { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ts-player-handle { font-size: .78rem; color: var(--ehub-muted); margin-top: 1px; }
.ts-role-chip { font-size: .68rem; font-weight: 700; padding: 2px 9px; border-radius: 50rem; display: inline-block; margin-top: 5px; letter-spacing: .02em; }
.ts-role-chip.captain { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.ts-role-chip.vice    { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.ts-role-chip.starter { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
.ts-role-chip.reserve { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.ts-role-chip.coach   { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.ts-role-chip.member  { background: var(--ehub-field-bg); color: var(--ehub-muted); }
html[data-bs-theme="dark"] .ts-role-chip.captain { color: var(--ehub-gold); }
html[data-bs-theme="dark"] .ts-role-chip.starter { color: #51cf66; background: color-mix(in srgb, #51cf66 14%, transparent); }
html[data-bs-theme="dark"] .ts-role-chip.coach   { color: #c89bff; background: color-mix(in srgb, #b06bff 18%, transparent); }

/* ── Empty ── */
.ts-empty { text-align: center; padding: 56px 20px; color: var(--ehub-muted); }
.ts-empty-ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }

/* ── About ── */
.ts-about-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
@media (max-width: 860px) { .ts-about-grid { grid-template-columns: 1fr; } }
.ts-about-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 24px; }
.ts-about-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 14px; }
.ts-about-body { font-size: .94rem; line-height: 1.65; color: var(--ehub-ink); margin: 0; }
.ts-info-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.ts-info-list li { display: flex; align-items: flex-start; gap: 12px; }
.ts-info-ico { width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; background: var(--ehub-primary-tint); color: var(--ehub-primary); display: flex; align-items: center; justify-content: center; font-size: .9rem; }
.ts-info-meta { display: flex; flex-direction: column; gap: 1px; }
.ts-info-meta .k { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--ehub-muted); }
.ts-info-meta .val { font-size: .92rem; font-weight: 600; color: var(--ehub-ink); }

/* ── Back ── */
.ts-back { display: inline-flex; align-items: center; gap: 7px; font-size: .85rem; font-weight: 600; color: var(--ehub-muted); margin-top: 40px; text-decoration: none; }
.ts-back:hover { color: var(--ehub-primary); }

/* ── Apply modal ── */
.ts-overlay { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.ts-modal-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); width: 100%; max-width: 480px; overflow: hidden; }
.ts-modal-hd { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--ehub-line); }
.ts-apply-hd { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.ts-apply-logo { width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; font-weight: 800; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.22); }
.ts-apply-name { font-size: 1.05rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.01em; }
.ts-apply-sub { font-size: .8rem; color: var(--ehub-muted); margin-top: 2px; line-height: 1.4; }
.ts-modal-close { border: 0; background: transparent; color: var(--ehub-muted); cursor: pointer; font-size: 1rem; padding: 4px 8px; border-radius: 8px; flex-shrink: 0; }
.ts-modal-close:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.ts-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
.ts-field { display: flex; flex-direction: column; gap: 6px; }
.ts-label { font-size: .82rem; font-weight: 600; color: var(--ehub-muted); }
.ts-textarea { width: 100%; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 10px; color: var(--ehub-ink); padding: 10px 12px; font-size: .88rem; resize: vertical; font-family: inherit; }
.ts-textarea:focus { outline: none; border-color: var(--ehub-primary); }
.ts-textarea.is-invalid { border-color: #e23b3b; }
.ts-select { width: 100%; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 10px; color: var(--ehub-ink); padding: 10px 12px; font-size: .88rem; cursor: pointer; }
.ts-select:focus { outline: none; border-color: var(--ehub-primary); }
.ts-error { font-size: .78rem; color: #e23b3b; margin-top: 2px; }
.ts-apply-note { display: flex; align-items: flex-start; gap: 8px; font-size: .8rem; color: var(--ehub-muted); padding: 11px 14px; background: var(--ehub-field-bg); border-radius: 10px; border: 1px solid var(--ehub-line); line-height: 1.5; }
.ts-apply-note svg { color: var(--ehub-primary); flex-shrink: 0; margin-top: 1px; }
.ts-modal-ft { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--ehub-line); }
.ts-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 50rem; font-size: .88rem; font-weight: 600; cursor: pointer; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.ts-btn-ghost:hover { background: var(--ehub-card); color: var(--ehub-ink); }
.ts-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 50rem; font-size: .88rem; font-weight: 600; cursor: pointer; background: var(--ehub-primary); color: #fff; border: 1px solid var(--ehub-primary); }
.ts-btn-primary:hover { background: var(--ehub-primary-dark); }

/* ── Modal transition ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(.96); }

/* ── Responsive ── */
@media (max-width: 620px) {
  .ts-statbar { flex-wrap: wrap; }
  .ts-stat { min-width: 50%; border-right: 0 !important; border-bottom: 1px solid var(--ehub-line); }
  .ts-stat:nth-child(odd) { border-right: 1px solid var(--ehub-line) !important; }
}
</style>
