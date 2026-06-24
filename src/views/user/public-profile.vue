<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Api from '@/helpers/communication/Connection'
import SystemVars from '@/helpers/General/SystemVars'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useStore()

const loading = ref(true)
const notFound = ref(false)
const profile = ref(null)
const myUsername = ref(null)

const tabs = ['overview', 'results', 'teams', 'orgs']
const activeTab = ref('overview')

watch(() => route.query.tab, (tab) => {
  if (tab && tabs.includes(tab)) activeTab.value = tab
}, { immediate: true })

function switchTab(tab) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

const isOwnProfile = computed(() => myUsername.value && profile.value && myUsername.value === profile.value.username)

async function loadProfile() {
  loading.value = true
  notFound.value = false
  const res = await Api.getAsync('/user/' + route.params.username)
  loading.value = false
  if (res.code === 200) {
    profile.value = res.response?.message
  } else {
    notFound.value = true
  }
}

async function loadMyUsername() {
  if (!store.getters.isLoggedIn) return
  const res = await Api.getAsync('/user/profile')
  if (res.code === 200) myUsername.value = res.response?.message?.username
}

onMounted(() => {
  loadProfile()
  loadMyUsername()
})

watch(() => route.params.username, loadProfile)

function initials(name, surname) {
  return [name, surname].filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function storageUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : null
}

function coverStyle(p) {
  if (p.cover) {
    return {
      backgroundImage: `url(${storageUrl(p.cover)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  const color = p.profile_color || '#0098D8'
  const dark = darkenHex(color, 55)
  return { background: `linear-gradient(135deg, ${dark} 0%, ${color} 55%, ${lightenHex(color, 20)} 100%)` }
}

function avatarGrad(p) {
  const color = p.profile_color || '#0098D8'
  return `linear-gradient(135deg, ${darkenHex(color, 30)}, ${color})`
}

function darkenHex(hex, amt) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - amt)
  const g = Math.max(0, ((n >> 8) & 0xff) - amt)
  const b = Math.max(0, (n & 0xff) - amt)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function lightenHex(hex, amt) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + amt)
  const g = Math.min(255, ((n >> 8) & 0xff) + amt)
  const b = Math.min(255, (n & 0xff) + amt)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function posBadgeClass(pos) {
  if (pos === 1) return 'p1'
  if (pos === 2) return 'p2'
  if (pos === 3) return 'p3'
  if (pos === null || pos === 0) return 'dnf'
  return 'top'
}

function posLabel(pos) {
  if (pos === null || pos === 0) return 'DNF'
  return pos + 'º'
}

function memberSince(createdAt) {
  if (!createdAt) return ''
  return new Date(createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function teamLogoUrl(team) {
  return team.logo_image ? storageUrl(team.logo_image) : null
}

function teamGrad(team) {
  const CAT_COLORS = {
    simracing: ['#0098D8', '#00d4ff'],
    racingcars: ['#0098D8', '#00d4ff'],
    rally: ['#f08c00', '#ffc93c'],
    'esports-fps': ['#e23b3b', '#ff8a3b'],
    'esports-moba': ['#7C3AED', '#b06bff'],
    'esports-fighting': ['#d6336c', '#ff6b9d'],
    'esports-strategy': ['#1a6e4f', '#51cf66'],
    'esports-sports': ['#2563eb', '#60a5fa'],
    motorsport: ['#f08c00', '#ffc93c'],
  }
  const c = CAT_COLORS[team.category]
  return c
    ? `linear-gradient(135deg, ${c[0]}, ${c[1]})`
    : 'linear-gradient(135deg, #495057, #868e96)'
}

function orgLogoUrl(org) {
  return `${SystemVars.baseUrl}storage/org/${org.route}/logo.webp`
}

function orgGrad(org) {
  const color = org.color || '#0098D8'
  return `linear-gradient(135deg, ${darkenHex(color, 40)}, ${color})`
}

function roleLabel(role, isAdmin) {
  if (isAdmin) return t('pages.user.public.roles.captain')
  const key = role?.toLowerCase()
  return t(`pages.user.public.roles.${key}`, t('pages.user.public.roles.member'))
}

function roleClass(role, isAdmin) {
  if (isAdmin || role === 'captain') return 'captain'
  if (role === 'vice') return 'vice'
  if (role === 'reserve') return 'reserve'
  return 'player'
}

const recentResults = computed(() => (profile.value?.recent_results || []).slice(0, 6))
</script>

<template>
  <div class="pub-profile-page">
    <!-- Loading -->
    <div v-if="loading" class="pub-loading">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="pub-notfound">
      <font-awesome-icon :icon="['fas', 'user-slash']" class="pub-notfound-icon" />
      <p>{{ $t('pages.user.public.not_found') }}</p>
    </div>

    <template v-else-if="profile">
      <!-- Cover -->
      <div class="pub-cover" :style="coverStyle(profile)">
        <div class="pub-cover-fade"></div>
        <div class="pub-cover-deco">
          <font-awesome-icon :icon="['fas', 'flag-checkered']" />
        </div>
      </div>

      <!-- Main container -->
      <div class="pub-container">

        <!-- Profile head -->
        <div class="pub-head">
          <div class="pub-identity-row">
            <div class="pub-identity">
              <!-- Avatar -->
              <div class="pub-avatar" :style="{ background: avatarGrad(profile) }">
                <img
                  v-if="profile.image"
                  :src="storageUrl(profile.image)"
                  :alt="profile.name"
                  class="pub-avatar-img"
                  @error="$event.target.style.display = 'none'"
                />
                <template v-else>{{ initials(profile.name, profile.surname) }}</template>
              </div>

              <!-- Title block -->
              <div class="pub-titleblock">
                <div class="pub-name">
                  {{ profile.name }} {{ profile.surname }}
                </div>
                <div class="pub-handle">
                  <span>@{{ profile.username }}</span>
                  <span v-if="profile.car_number" class="pub-car">&nbsp;·&nbsp;#{{ profile.car_number }}</span>
                </div>
                <p v-if="profile.bio" class="pub-bio">{{ profile.bio }}</p>
                <div class="pub-meta">
                  <span v-if="profile.location" class="pub-meta-item">
                    <font-awesome-icon :icon="['fas', 'location-dot']" />
                    {{ profile.location }}
                  </span>
                  <span v-if="profile.created_at" class="pub-meta-item">
                    <font-awesome-icon :icon="['fas', 'calendar-days']" />
                    {{ $t('pages.user.public.member_since') }} {{ memberSince(profile.created_at) }}
                  </span>
                  <span v-if="profile.favorite_category" class="pub-meta-item">
                    <font-awesome-icon :icon="['fas', 'flag-checkered']" />
                    {{ profile.favorite_category }}
                  </span>
                </div>
                <div class="pub-social">
                  <a v-if="profile.discord" class="pub-social-link" :href="`https://discord.com/users/${profile.discord}`" target="_blank" rel="noopener" title="Discord">
                    <font-awesome-icon :icon="['fab', 'discord']" />
                  </a>
                  <a v-if="profile.youtube" class="pub-social-link" :href="profile.youtube" target="_blank" rel="noopener" title="YouTube">
                    <font-awesome-icon :icon="['fab', 'youtube']" />
                  </a>
                  <a v-if="profile.twitch" class="pub-social-link" :href="`https://twitch.tv/${profile.twitch}`" target="_blank" rel="noopener" title="Twitch">
                    <font-awesome-icon :icon="['fab', 'twitch']" />
                  </a>
                  <a v-if="profile.x_twitter" class="pub-social-link" :href="`https://x.com/${profile.x_twitter}`" target="_blank" rel="noopener" title="X / Twitter">
                    <font-awesome-icon :icon="['fab', 'x-twitter']" />
                  </a>
                  <a v-if="profile.linkedin" class="pub-social-link" :href="profile.linkedin" target="_blank" rel="noopener" title="LinkedIn">
                    <font-awesome-icon :icon="['fab', 'linkedin']" />
                  </a>
                  <a v-if="profile.website" class="pub-social-link" :href="profile.website" target="_blank" rel="noopener" title="Website">
                    <font-awesome-icon :icon="['fas', 'globe']" />
                  </a>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="pub-actions">
              <router-link v-if="isOwnProfile" to="/profile" class="btn btn-ghost round">
                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                {{ $t('pages.user.public.edit_profile') }}
              </router-link>
              <button class="btn btn-ghost round" :title="$t('pages.user.public.share')">
                <font-awesome-icon :icon="['fas', 'share-nodes']" />
              </button>
            </div>
          </div>

          <!-- Stats bar -->
          <div class="pub-statbar">
            <div class="pub-stat primary">
              <div class="sv">{{ profile.stats?.events ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.events') }}</div>
            </div>
            <div class="pub-stat gold">
              <div class="sv">{{ profile.stats?.wins ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.wins') }}</div>
            </div>
            <div class="pub-stat">
              <div class="sv">{{ profile.stats?.podiums ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.podiums') }}</div>
            </div>
            <div class="pub-stat">
              <div class="sv">{{ profile.stats?.points ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.points') }}</div>
            </div>
            <div class="pub-stat">
              <div class="sv">{{ profile.stats?.teams ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.teams') }}</div>
            </div>
            <div class="pub-stat">
              <div class="sv">{{ profile.stats?.orgs ?? 0 }}</div>
              <div class="sl">{{ $t('pages.user.public.stats.orgs') }}</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="pub-tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="pub-tab-btn"
            :class="{ active: activeTab === tab }"
            @click="switchTab(tab)"
          >
            {{ $t(`pages.user.public.tabs.${tab}`) }}
            <span v-if="tab === 'results' && profile.recent_results?.length" class="pub-pill">
              {{ profile.recent_results.length }}
            </span>
            <span v-if="tab === 'teams' && profile.teams?.length" class="pub-pill">
              {{ profile.teams.length }}
            </span>
            <span v-if="tab === 'orgs' && profile.orgs?.length" class="pub-pill">
              {{ profile.orgs.length }}
            </span>
          </button>
        </div>

        <!-- ─── OVERVIEW ─── -->
        <div v-if="activeTab === 'overview'" class="pub-tab-pane">
          <div class="pub-overview-grid">
            <!-- Left: recent results -->
            <div>
              <div class="wcard">
                <div class="wcard-head">
                  <h3><font-awesome-icon :icon="['fas', 'chart-bar']" /> {{ $t('pages.user.public.overview.recent_results') }}</h3>
                  <a href="#" @click.prevent="switchTab('results')">{{ $t('pages.user.public.overview.view_all') }}</a>
                </div>
                <div v-if="!recentResults.length" class="pub-empty-small">
                  {{ $t('pages.user.public.overview.no_results') }}
                </div>
                <div v-else>
                  <div v-for="r in recentResults" :key="r.event_route + r.created_at" class="rrow">
                    <div class="pos-badge" :class="posBadgeClass(r.position)">{{ posLabel(r.position) }}</div>
                    <div class="rrow-info">
                      <div class="rt">
                        <router-link :to="`/org/${r.org_route}/event/${r.event_route}`" class="rrow-link">
                          {{ r.event_name }}
                        </router-link>
                      </div>
                      <div class="rm">
                        <font-awesome-icon :icon="['fas', 'shield-halved']" />
                        {{ r.org_name }}
                      </div>
                    </div>
                    <div class="rrow-pts">{{ r.score ?? 0 }}<span class="unit"> pts</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: about -->
            <div>
              <div class="wcard">
                <div class="wcard-head">
                  <h3><font-awesome-icon :icon="['fas', 'circle-user']" /> {{ $t('pages.user.public.overview.about') }}</h3>
                </div>
                <div v-if="profile.favorite_category" class="about-item">
                  <div class="ai-ico"><font-awesome-icon :icon="['fas', 'flag-checkered']" /></div>
                  <div>
                    <div class="ai-lbl">{{ $t('pages.user.public.overview.about_items.favorite_category') }}</div>
                    <div class="ai-val">{{ profile.favorite_category }}</div>
                  </div>
                </div>
                <div v-if="profile.driving_style" class="about-item">
                  <div class="ai-ico"><font-awesome-icon :icon="['fas', 'gauge-high']" /></div>
                  <div>
                    <div class="ai-lbl">{{ $t('pages.user.public.overview.about_items.driving_style') }}</div>
                    <div class="ai-val">{{ profile.driving_style }}</div>
                  </div>
                </div>
                <div v-if="profile.car_number" class="about-item">
                  <div class="ai-ico"><font-awesome-icon :icon="['fas', 'hashtag']" /></div>
                  <div>
                    <div class="ai-lbl">{{ $t('pages.user.public.overview.about_items.car_number') }}</div>
                    <div class="ai-val">#{{ profile.car_number }}</div>
                  </div>
                </div>
                <div v-if="profile.discord" class="about-item">
                  <div class="ai-ico"><font-awesome-icon :icon="['fab', 'discord']" /></div>
                  <div>
                    <div class="ai-lbl">{{ $t('pages.user.public.overview.about_items.discord') }}</div>
                    <div class="ai-val">{{ profile.discord }}</div>
                  </div>
                </div>
                <div v-if="profile.motto" class="about-item">
                  <div class="ai-ico"><font-awesome-icon :icon="['fas', 'quote-left']" /></div>
                  <div>
                    <div class="ai-lbl">{{ $t('pages.user.public.overview.about_items.motto') }}</div>
                    <div class="ai-val">"{{ profile.motto }}"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── RESULTS ─── -->
        <div v-if="activeTab === 'results'" class="pub-tab-pane">
          <div class="wcard">
            <div v-if="!profile.recent_results?.length" class="pub-empty">
              <font-awesome-icon :icon="['fas', 'flag-checkered']" />
              <p>{{ $t('pages.user.public.results.empty') }}</p>
            </div>
            <template v-else>
              <div class="rth">
                <div>{{ $t('pages.user.public.results.pos') }}</div>
                <div>{{ $t('pages.user.public.results.event') }}</div>
                <div class="hide-sm">{{ $t('pages.user.public.results.org') }}</div>
                <div style="text-align:right">{{ $t('pages.user.public.results.pts') }}</div>
              </div>
              <div v-for="r in profile.recent_results" :key="r.event_route + r.created_at" class="rtrow">
                <div class="pos-badge" :class="posBadgeClass(r.position)">{{ posLabel(r.position) }}</div>
                <div class="rrow-info">
                  <div class="rt">
                    <router-link :to="`/org/${r.org_route}/event/${r.event_route}`" class="rrow-link">
                      {{ r.event_name }}
                    </router-link>
                  </div>
                </div>
                <div class="hide-sm" style="font-size:.84rem;color:var(--ehub-muted);font-weight:500;">{{ r.org_name }}</div>
                <div style="text-align:right;font-size:.88rem;font-weight:800;color:var(--ehub-ink);">
                  {{ r.score ?? 0 }}<span style="font-size:.7rem;font-weight:500;color:var(--ehub-muted);"> pts</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- ─── TEAMS ─── -->
        <div v-if="activeTab === 'teams'" class="pub-tab-pane">
          <div class="wcard">
            <div v-if="!profile.teams?.length" class="pub-empty">
              <font-awesome-icon :icon="['fas', 'shield-halved']" />
              <p>{{ $t('pages.user.public.teams.empty') }}</p>
            </div>
            <router-link
              v-for="team in profile.teams"
              :key="team.route"
              :to="`/teams/${team.route}`"
              class="pt-item"
            >
              <div class="pt-logo" :style="{ background: teamGrad(team) }">
                <img
                  v-if="teamLogoUrl(team)"
                  :src="teamLogoUrl(team)"
                  :alt="team.name"
                  style="width:100%;height:100%;object-fit:cover;border-radius:12px"
                  @error="$event.target.style.display='none'"
                />
                <template v-else>{{ initials(team.name, '') }}</template>
              </div>
              <div class="pt-info">
                <div class="pt-name">
                  {{ team.name }}
                  <font-awesome-icon v-if="team.is_verified" :icon="['fas', 'circle-check']" class="ver" />
                </div>
                <div class="pt-meta">{{ team.category }} · {{ team.players_count }} {{ $t('pages.user.public.teams.players') }}</div>
              </div>
              <span class="role-chip" :class="roleClass(team.role, team.is_admin)">
                {{ roleLabel(team.role, team.is_admin) }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- ─── ORGS ─── -->
        <div v-if="activeTab === 'orgs'" class="pub-tab-pane">
          <div class="wcard">
            <div v-if="!profile.orgs?.length" class="pub-empty">
              <font-awesome-icon :icon="['fas', 'building']" />
              <p>{{ $t('pages.user.public.orgs.empty') }}</p>
            </div>
            <router-link
              v-for="org in profile.orgs"
              :key="org.route"
              :to="`/org/${org.route}`"
              class="po-item"
            >
              <div class="po-logo" :style="{ background: orgGrad(org) }">
                <img
                  :src="orgLogoUrl(org)"
                  :alt="org.name"
                  style="width:100%;height:100%;object-fit:cover;border-radius:12px"
                  @error="$event.target.style.display='none'"
                />
              </div>
              <div class="po-info">
                <div class="po-name">{{ org.name }}</div>
              </div>
              <div v-if="org.role" class="po-role">{{ org.role }}</div>
            </router-link>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.pub-profile-page { min-height: 100vh; }

/* Loading / not found */
.pub-loading {
  display: flex; justify-content: center; align-items: center;
  padding: 80px 0;
}
.pub-notfound {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 24px; gap: 16px; color: var(--ehub-muted); text-align: center;
}
.pub-notfound-icon { font-size: 3rem; opacity: .4; }

/* Cover */
.pub-cover {
  position: relative; height: 200px; overflow: hidden;
  border-bottom: 1px solid var(--ehub-line);
}
.pub-cover-fade {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 40%, color-mix(in srgb, var(--ehub-page) 80%, transparent) 100%);
}
.pub-cover-deco {
  position: absolute; right: -24px; bottom: -28px;
  font-size: 14rem; color: rgba(255,255,255,.05); line-height: 1; pointer-events: none;
}

/* Container */
.pub-container { max-width: 1180px; margin: 0 auto; padding: 0 24px 48px; }

/* Profile head */
.pub-head { position: relative; margin-top: -28px; padding-top: 16px; }
.pub-identity-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 16px;
}
.pub-identity { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; }

/* Avatar */
.pub-avatar {
  width: 116px; height: 116px; border-radius: 26px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.3rem; font-weight: 800; color: #fff;
  border: 4px solid var(--ehub-card);
  box-shadow: 0 8px 24px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.18);
  position: relative; overflow: hidden;
}
.pub-avatar-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 22px;
}

/* Title block */
.pub-titleblock { flex: 1; min-width: 220px; padding-bottom: 4px; }
.pub-name {
  font-size: clamp(1.45rem, 3vw, 1.95rem); font-weight: 800;
  letter-spacing: -.025em; margin: 0 0 3px; color: var(--ehub-ink);
}
.pub-handle { color: var(--ehub-muted); font-size: .88rem; font-weight: 500; margin-bottom: 8px; }
.pub-car { color: var(--ehub-primary); font-weight: 700; }
.pub-bio { color: var(--ehub-ink); font-size: .9rem; line-height: 1.55; max-width: 560px; margin-bottom: 10px; opacity: .82; }
.pub-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
.pub-meta-item { display: inline-flex; align-items: center; gap: 6px; font-size: .8rem; font-weight: 500; color: var(--ehub-muted); }
.pub-meta-item svg { color: var(--ehub-primary); width: 14px; font-size: .78rem; }

/* Social */
.pub-social { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.pub-social-link {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--ehub-field-bg); border: 1px solid var(--ehub-line);
  display: flex; align-items: center; justify-content: center;
  color: var(--ehub-muted); font-size: .8rem; text-decoration: none; transition: all .15s;
}
.pub-social-link:hover { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }

/* Actions */
.pub-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding-bottom: 4px; }

/* Stats bar */
.pub-statbar {
  display: flex; margin-top: 24px;
  border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card);
  background: var(--ehub-card); overflow-x: auto;
}
.pub-stat {
  flex: 1; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; gap: 3px;
  border-right: 1px solid var(--ehub-line); min-width: 80px;
}
.pub-stat:last-child { border-right: 0; }
.pub-stat .sv { font-size: 1.4rem; font-weight: 800; letter-spacing: -.02em; line-height: 1; color: var(--ehub-ink); }
.pub-stat .sl { font-size: .66rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); margin-top: 3px; text-align: center; }
.pub-stat.gold .sv { color: var(--ehub-gold); }
.pub-stat.primary .sv { color: var(--ehub-primary); }

/* Tabs */
.pub-tabs {
  display: flex; border-bottom: 1px solid var(--ehub-line); margin-top: 32px;
  overflow-x: auto; scrollbar-width: none;
}
.pub-tabs::-webkit-scrollbar { display: none; }
.pub-tab-btn {
  border: 0; background: transparent; color: var(--ehub-muted); font-size: .9rem; font-weight: 600;
  padding: 12px 16px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px;
  white-space: nowrap; display: inline-flex; align-items: center; gap: 7px;
  transition: color .15s, border-color .15s;
}
.pub-tab-btn:hover { color: var(--ehub-ink); }
.pub-tab-btn.active { color: var(--ehub-primary); border-bottom-color: var(--ehub-primary); }
.pub-pill {
  font-size: .7rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted);
  padding: 1px 7px; border-radius: 50rem;
}
.pub-tab-btn.active .pub-pill { background: var(--ehub-primary-tint); color: var(--ehub-primary); }

/* Tab pane */
.pub-tab-pane { padding-top: 24px; }

/* Overview grid */
.pub-overview-grid { display: grid; grid-template-columns: 1fr 314px; gap: 20px; align-items: start; }
@media (max-width: 860px) { .pub-overview-grid { grid-template-columns: 1fr; } }

/* Widget card */
.wcard { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px; overflow: hidden; margin-bottom: 18px; }
.wcard-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 20px 13px; border-bottom: 1px solid var(--ehub-line);
}
.wcard-head h3 { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); margin: 0; display: flex; align-items: center; gap: 8px; }
.wcard-head h3 svg { color: var(--ehub-primary); font-size: .84rem; }
.wcard-head a { font-size: .8rem; font-weight: 600; color: var(--ehub-primary); cursor: pointer; text-decoration: none; }
.wcard-head a:hover { text-decoration: underline; }

/* Result rows */
.rrow {
  display: flex; align-items: center; gap: 14px; padding: 12px 20px;
  border-bottom: 1px solid var(--ehub-line); transition: background .12s;
}
.rrow:last-child { border-bottom: 0; }
.rrow:hover { background: var(--ehub-field-bg); }
.rrow-info { flex: 1; min-width: 0; }
.rrow-info .rt { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rrow-info .rm { font-size: .74rem; color: var(--ehub-muted); display: flex; align-items: center; gap: 7px; margin-top: 2px; }
.rrow-info .rm svg { color: var(--ehub-primary); font-size: .68rem; }
.rrow-pts { font-size: .88rem; font-weight: 800; color: var(--ehub-ink); flex-shrink: 0; white-space: nowrap; }
.rrow-pts .unit { font-size: .7rem; font-weight: 500; color: var(--ehub-muted); }
.rrow-link { color: inherit; text-decoration: none; }
.rrow-link:hover { color: var(--ehub-primary); }

/* Results table */
.rth {
  display: grid; grid-template-columns: 50px 1fr 160px 72px; gap: 12px; align-items: center;
  padding: 10px 20px; background: var(--ehub-field-bg); border-bottom: 1px solid var(--ehub-line);
  font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted);
}
.rtrow {
  display: grid; grid-template-columns: 50px 1fr 160px 72px; gap: 12px; align-items: center;
  padding: 12px 20px; border-bottom: 1px solid var(--ehub-line); transition: background .12s;
}
.rtrow:last-child { border-bottom: 0; }
.rtrow:hover { background: var(--ehub-field-bg); }
@media (max-width: 600px) {
  .rth, .rtrow { grid-template-columns: 50px 1fr 72px; }
  .hide-sm { display: none; }
}

/* Position badges */
.pos-badge {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: .8rem; font-weight: 800; flex-shrink: 0; letter-spacing: -.01em;
}
.pos-badge.p1 { background: color-mix(in srgb,var(--ehub-gold) 16%,transparent); color: var(--ehub-gold); }
.pos-badge.p2 { background: color-mix(in srgb,#8fa5b8 18%,transparent); color: #7a8d9e; }
.pos-badge.p3 { background: color-mix(in srgb,#cd7f32 14%,transparent); color: #cd7f32; }
.pos-badge.top { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.pos-badge.dnf { background: color-mix(in srgb,#e23b3b 10%,transparent); color: #e23b3b; font-size: .68rem; }

/* About items */
.about-item { display: flex; align-items: flex-start; gap: 13px; padding: 12px 20px; border-bottom: 1px solid var(--ehub-line); }
.about-item:last-child { border-bottom: 0; }
.ai-ico {
  width: 30px; height: 30px; border-radius: 8px; background: var(--ehub-primary-tint);
  color: var(--ehub-primary); display: flex; align-items: center; justify-content: center;
  font-size: .8rem; flex-shrink: 0; margin-top: 1px;
}
.ai-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); }
.ai-val { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); margin-top: 2px; line-height: 1.4; }

/* Teams list */
.pt-item {
  display: flex; align-items: center; gap: 13px; padding: 13px 20px;
  border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s;
  text-decoration: none; color: inherit;
}
.pt-item:last-child { border-bottom: 0; }
.pt-item:hover { background: var(--ehub-field-bg); }
.pt-logo {
  width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
  justify-content: center; font-size: .9rem; font-weight: 800; color: #fff; flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(0,0,0,.25); overflow: hidden;
}
.pt-info { flex: 1; min-width: 0; }
.pt-name { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); display: flex; align-items: center; gap: 6px; }
.pt-meta { font-size: .76rem; color: var(--ehub-muted); margin-top: 2px; }
.ver { color: var(--ehub-primary); font-size: .78rem; }

/* Orgs list */
.po-item {
  display: flex; align-items: center; gap: 13px; padding: 13px 20px;
  border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s;
  text-decoration: none; color: inherit;
}
.po-item:last-child { border-bottom: 0; }
.po-item:hover { background: var(--ehub-field-bg); }
.po-logo {
  width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
  justify-content: center; font-size: .88rem; font-weight: 800; color: #fff; flex-shrink: 0;
  overflow: hidden;
}
.po-info { flex: 1; min-width: 0; }
.po-name { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); display: flex; align-items: center; gap: 6px; }
.po-role {
  font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 50rem;
  background: var(--ehub-primary-tint); color: var(--ehub-primary);
  border: 1px solid var(--ehub-primary-border); flex-shrink: 0;
}

/* Role chips */
.role-chip {
  display: inline-flex; align-items: center; gap: 5px; font-size: .69rem; font-weight: 700;
  letter-spacing: .03em; text-transform: uppercase; padding: 3px 9px; border-radius: 50rem;
  border: 1px solid; flex-shrink: 0;
}
.role-chip.captain { background: color-mix(in srgb,var(--ehub-gold) 14%,transparent); border-color: color-mix(in srgb,var(--ehub-gold) 30%,transparent); color: color-mix(in srgb,var(--ehub-gold),#7a5400 30%); }
.role-chip.vice { background: var(--ehub-primary-tint); border-color: var(--ehub-primary-border); color: var(--ehub-primary); }
.role-chip.player { background: color-mix(in srgb,#7C3AED 12%,transparent); border-color: color-mix(in srgb,#7C3AED 22%,transparent); color: #7C3AED; }
.role-chip.reserve { background: var(--ehub-field-bg); border-color: var(--ehub-line); color: var(--ehub-muted); }

/* Empty states */
.pub-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 24px; gap: 12px; color: var(--ehub-muted); text-align: center;
  font-size: 1.5rem;
}
.pub-empty p { font-size: .9rem; margin: 0; }
.pub-empty-small { padding: 20px; font-size: .88rem; color: var(--ehub-muted); text-align: center; }
</style>
