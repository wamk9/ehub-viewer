<script>
import Organization from '@/helpers/communication/Organization.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';

const ORG_GRADS = [
  ['#0098D8', '#00d4ff'],
  ['#7C3AED', '#b06bff'],
  ['#1f8a5b', '#51cf66'],
  ['#f08c00', '#ffc93c'],
  ['#e23b3b', '#ff8a3b'],
  ['#d6336c', '#ff6b9d'],
  ['#1971c2', '#4dabf7'],
  ['#0e7490', '#22d3ee'],
];

const ROLE_ICON = {
  owner: 'crown',
  admin: 'shield-halved',
  event_manager: 'user-tie',
  financial: 'id-badge',
};

const ROLE_CLASS = {
  owner: 'owner',
  admin: 'admin',
  event_manager: 'manager',
  financial: 'staff',
};

export default {
  data() {
    return {
      organizations: [],
      loading: true,
      activeRole: 'all',
      baseUrl: SystemVars.baseUrl,
    };
  },

  computed: {
    roles() {
      return [
        { value: 'all', key: 'all' },
        { value: 'owner', key: 'owner' },
        { value: 'admin', key: 'admin' },
        { value: 'event_manager', key: 'manager' },
        { value: 'financial', key: 'staff' },
      ];
    },
    filtered() {
      if (this.activeRole === 'all') return this.organizations;
      return this.organizations.filter(o => o.role === this.activeRole);
    },
    totalEvents() {
      return this.organizations.reduce((s, o) => s + (o.events_count || 0), 0);
    },
    totalMembers() {
      return this.organizations.reduce((s, o) => s + (o.members_count || 0), 0);
    },
  },

  async created() {
    await this.loadOrganizations();
  },

  methods: {
    async loadOrganizations() {
      this.loading = true;
      const result = await Organization.getMine();
      this.loading = false;
      if (result.code === 200) {
        this.organizations = result.data || [];
      } else {
        toast.error(this.$t('pages.organization.mine.error.load'));
      }
    },
    orgGrad(org) {
      if (org.color && /^#[0-9A-Fa-f]{6}$/.test(org.color)) {
        const n = parseInt(org.color.slice(1), 16);
        const r = Math.max(0, ((n >> 16) & 0xff) - 50);
        const g = Math.max(0, ((n >> 8) & 0xff) - 50);
        const b = Math.max(0, (n & 0xff) - 50);
        const dark = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
        return `linear-gradient(135deg, ${org.color}, ${dark})`;
      }
      const idx = org.name.charCodeAt(0) % ORG_GRADS.length;
      const [c1, c2] = ORG_GRADS[idx];
      return `linear-gradient(135deg, ${c1}, ${c2})`;
    },
    roleClass(role) {
      return ROLE_CLASS[role] || 'staff';
    },
    roleIcon(role) {
      return ROLE_ICON[role] || 'id-badge';
    },
    initials(name) {
      if (!name) return '?';
      return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },
    fmtNum(n) {
      if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
      return '' + n;
    },
    joinedYear(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).getFullYear();
    },
    logoUrl(org) {
      if (!org.logo_image) return null;
      return this.baseUrl + 'storage/' + org.logo_image;
    },
  },
};
</script>

<template>
  <!-- ══ HERO ══ -->
  <header class="myorgs-hero">
    <div class="container-fluid px-4">
      <div class="hero-inner">
        <div class="hero-left">
          <h1>{{ $t('pages.organization.mine.hero.title') }} <span class="accent">{{ $t('pages.organization.mine.hero.title_accent') }}</span></h1>
          <p>{{ $t('pages.organization.mine.hero.subtitle') }}</p>
          <div class="summary-row">
            <div class="summary-pill">
              <div class="sp-icon primary"><font-awesome-icon :icon="['fas', 'building-flag']" /></div>
              <div class="sp-text">
                <span class="sp-num">{{ organizations.length }}</span>
                <span class="sp-lbl">{{ $t('pages.organization.mine.summary.orgs') }}</span>
              </div>
            </div>
            <div class="summary-pill">
              <div class="sp-icon primary"><font-awesome-icon :icon="['fas', 'flag-checkered']" /></div>
              <div class="sp-text">
                <span class="sp-num">{{ totalEvents }}</span>
                <span class="sp-lbl">{{ $t('pages.organization.mine.summary.events') }}</span>
              </div>
            </div>
            <div class="summary-pill">
              <div class="sp-icon gold"><font-awesome-icon :icon="['fas', 'users']" /></div>
              <div class="sp-text">
                <span class="sp-num">{{ fmtNum(totalMembers) }}</span>
                <span class="sp-lbl">{{ $t('pages.organization.mine.summary.members') }}</span>
              </div>
            </div>
          </div>
        </div>
        <router-link to="/create-org" class="btn btn-primary round px-4" style="flex-shrink:0">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
          {{ $t('pages.organization.mine.hero.new') }}
        </router-link>
      </div>
    </div>
  </header>

  <!-- ══ CONTROL BAR ══ -->
  <div class="control-bar">
    <div class="container-fluid px-4">
      <div class="control-inner">
        <span class="fb-label">{{ $t('pages.organization.mine.bar.role') }}</span>
        <div class="role-seg">
          <button v-for="r in roles" :key="r.value"
            :class="{ active: activeRole === r.value }"
            @click="activeRole = r.value">
            {{ $t('pages.organization.mine.bar.' + r.key) }}
          </button>
        </div>
        <div style="flex:1"></div>
        <span class="results-count">{{ $t('pages.organization.mine.results', { n: filtered.length }) }}</span>
      </div>
    </div>
  </div>

  <!-- ══ CONTENT ══ -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="myorgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '260px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <template v-else>
      <!-- Grid -->
      <div class="myorgs-grid">
        <div v-for="org in filtered" :key="org.id"
          class="morg-card" :data-role="roleClass(org.role)"
          @click="$router.push('/org/' + org.route)">

          <!-- Banner -->
          <div class="morg-banner" :style="{ background: orgGrad(org) }">
            <img :src="baseUrl + 'storage/org/' + org.route + '/cover.webp'"
              class="morg-banner-cover" @error="$event.target.style.display='none'" />
          </div>

          <!-- Head: logo + role badge -->
          <div class="morg-head">
            <div class="morg-logo" :style="{ background: orgGrad(org) }">
              <img :src="baseUrl + 'storage/org/' + org.route + '/logo.webp'" :alt="org.name"
                class="morg-logo-img" @error="$event.target.style.display='none'" />
              <span>{{ initials(org.name) }}</span>
            </div>
            <span class="role-badge" :class="roleClass(org.role)">
              <font-awesome-icon :icon="['fas', roleIcon(org.role)]" />
              {{ $t('pages.organization.mine.roles.' + org.role) }}
            </span>
          </div>

          <!-- Body -->
          <div class="morg-body">
            <div class="morg-name">{{ org.name }}</div>
            <div v-if="org.description" class="morg-desc">{{ org.description }}</div>
            <div class="morg-stats">
              <div class="morg-stat">
                <div class="sv">{{ org.events_count ?? 0 }}</div>
                <div class="sl">{{ $t('pages.organization.mine.stats.events') }}</div>
              </div>
              <div class="morg-stat">
                <div class="sv">{{ fmtNum(org.members_count ?? 0) }}</div>
                <div class="sl">{{ $t('pages.organization.mine.stats.members') }}</div>
              </div>
              <div class="morg-stat">
                <div class="sv">{{ joinedYear(org.created_at) }}</div>
                <div class="sl">{{ $t('pages.organization.mine.stats.since') }}</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="morg-actions" @click.stop>
            <template v-if="org.role === 'owner' || org.role === 'admin'">
              <router-link :to="`/org/${org.route}/manage`" class="btn-maction primary-action">
                <font-awesome-icon :icon="['fas', 'sliders']" /> {{ $t('pages.organization.mine.actions.manage') }}
              </router-link>
              <router-link :to="`/org/${org.route}`" class="btn-maction">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" /> {{ $t('pages.organization.mine.actions.events') }}
              </router-link>
              <router-link :to="`/org/${org.route}/manage`" class="btn-maction">
                <font-awesome-icon :icon="['fas', 'users']" /> {{ $t('pages.organization.mine.actions.members') }}
              </router-link>
            </template>
            <template v-else-if="org.role === 'event_manager'">
              <router-link :to="`/org/${org.route}/manage`" class="btn-maction primary-action">
                <font-awesome-icon :icon="['fas', 'sliders']" /> {{ $t('pages.organization.mine.actions.manage') }}
              </router-link>
              <router-link :to="`/org/${org.route}`" class="btn-maction">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" /> {{ $t('pages.organization.mine.actions.events') }}
              </router-link>
            </template>
            <template v-else>
              <router-link :to="`/org/${org.route}`" class="btn-maction primary-action">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" /> {{ $t('pages.organization.mine.actions.events') }}
              </router-link>
            </template>
          </div>
        </div>

        <!-- New org card -->
        <router-link to="/create-org" class="new-org-card">
          <div class="new-ico"><font-awesome-icon :icon="['fas', 'plus']" /></div>
          <div class="new-lbl">{{ $t('pages.organization.mine.newcard.label') }}</div>
          <div class="new-sub">{{ $t('pages.organization.mine.newcard.sub') }}</div>
        </router-link>
      </div>

      <!-- Empty state (overlay inside grid area when filtered empty) -->
      <div v-if="!filtered.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'building']" /></div>
        <p class="mb-0">{{ $t('pages.organization.mine.empty.filter') }}</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
/* ── Role CSS vars ── */
:deep(:root),
:root {
  --role-owner:    #FBBF11;
  --role-owner-bg: color-mix(in srgb, #FBBF11 14%, transparent);
  --role-owner-br: color-mix(in srgb, #FBBF11 30%, transparent);
  --role-admin:    var(--ehub-primary);
  --role-admin-bg: var(--ehub-primary-tint);
  --role-admin-br: var(--ehub-primary-border, color-mix(in srgb, var(--ehub-primary) 30%, transparent));
  --role-manager:  #7C3AED;
  --role-manager-bg: color-mix(in srgb, #7C3AED 12%, transparent);
  --role-manager-br: color-mix(in srgb, #7C3AED 24%, transparent);
}

/* ── Hero ── */
.myorgs-hero {
  padding: 40px 24px 32px;
  border-bottom: 1px solid var(--ehub-line);
  background:
    radial-gradient(ellipse 55% 80% at 5% 0%, var(--ehub-glow, color-mix(in srgb, var(--ehub-primary) 15%, transparent)) 0%, transparent 65%),
    radial-gradient(ellipse 40% 60% at 95% 110%, color-mix(in srgb, var(--ehub-gold) 10%, transparent) 0%, transparent 55%);
  position: relative; overflow: hidden;
}
.myorgs-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(118deg, transparent 0 42px, color-mix(in srgb, var(--ehub-ink) 3%, transparent) 42px 44px);
}
.hero-inner { position: relative; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.hero-left h1 { font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 800; letter-spacing: -.025em; margin: 0 0 6px; color: var(--ehub-ink); }
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
.sp-icon.gold { background: var(--role-owner-bg); color: var(--role-owner); }
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
.fb-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); }
.role-seg { display: flex; gap: 4px; flex-wrap: wrap; }
.role-seg button {
  background: var(--ehub-field-bg); border: 1px solid var(--ehub-line);
  color: var(--ehub-muted); font-size: .78rem; font-weight: 600;
  padding: 5px 13px; border-radius: 50rem; cursor: pointer; transition: all .14s;
}
.role-seg button:hover { border-color: var(--ehub-primary); color: var(--ehub-ink); }
.role-seg button.active { background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff; }
.results-count { font-size: .82rem; color: var(--ehub-muted); white-space: nowrap; }

/* ── Grid ── */
.myorgs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

/* ── Org card ── */
.morg-card {
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  cursor: pointer;
}
.morg-card:hover { transform: translateY(-3px); box-shadow: var(--ehub-shadow, 0 8px 32px rgba(0,0,0,.16)); border-color: color-mix(in srgb, var(--ehub-primary) 35%, var(--ehub-line)); }
.morg-card[data-role="owner"]   { border-top: 3px solid var(--role-owner); }
.morg-card[data-role="admin"]   { border-top: 3px solid var(--role-admin); }
.morg-card[data-role="manager"] { border-top: 3px solid var(--role-manager); }
.morg-card[data-role="staff"]   { border-top: 3px solid var(--ehub-muted); }

.morg-banner { height: 62px; position: relative; overflow: hidden; flex-shrink: 0; }
.morg-banner-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.morg-banner::after {
  content: ''; position: absolute; inset: 0;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(255,255,255,.07) 28px 30px);
}

.morg-head { display: flex; align-items: flex-end; justify-content: space-between; padding: 0 16px; margin-top: -22px; position: relative; z-index: 1; }
.morg-logo {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 800; color: #fff; letter-spacing: .02em;
  text-shadow: 0 1px 4px rgba(0,0,0,.35);
  border: 3px solid var(--ehub-card);
  box-shadow: 0 4px 12px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.18);
  flex-shrink: 0; overflow: hidden; position: relative;
}
.morg-logo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 11px; }

.role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .72rem; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
  padding: 5px 11px; border-radius: 50rem; border: 1px solid;
  margin-bottom: 4px;
}
.role-badge.owner   { background: var(--role-owner-bg);   border-color: var(--role-owner-br);   color: color-mix(in srgb, var(--role-owner), #7a5400 30%); }
.role-badge.admin   { background: var(--role-admin-bg);   border-color: var(--role-admin-br, color-mix(in srgb, var(--ehub-primary) 30%, transparent));   color: var(--role-admin); }
.role-badge.manager { background: var(--role-manager-bg); border-color: var(--role-manager-br); color: var(--role-manager); }
.role-badge.staff   { background: var(--ehub-field-bg);   border-color: var(--ehub-line);        color: var(--ehub-muted); }
html[data-bs-theme="dark"] .role-badge.owner { color: var(--role-owner); }

.morg-body { padding: 10px 16px 0; flex: 1; display: flex; flex-direction: column; }
.morg-name { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 3px; }
.morg-desc { color: var(--ehub-muted); font-size: .83rem; line-height: 1.45; margin: 0 0 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.morg-stats { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--ehub-line); border-radius: 10px; overflow: hidden; margin-bottom: 14px; margin-top: 8px; }
.morg-stat { padding: 10px 10px 9px; text-align: center; }
.morg-stat + .morg-stat { border-left: 1px solid var(--ehub-line); }
.morg-stat .sv { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); line-height: 1; }
.morg-stat .sl { font-size: .67rem; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; margin-top: 3px; }

/* ── Actions ── */
.morg-actions { padding: 0 16px 16px; display: flex; gap: 7px; flex-wrap: wrap; }
.btn-maction {
  flex: 1; min-width: 0;
  border: 1px solid var(--ehub-line); background: var(--ehub-field-bg);
  color: var(--ehub-ink); font-size: .8rem; font-weight: 600;
  padding: 8px 10px; border-radius: 9px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .15s; white-space: nowrap; text-decoration: none;
}
.btn-maction:hover { background: var(--ehub-card); border-color: var(--ehub-primary); color: var(--ehub-primary); }
.btn-maction.primary-action { background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff; }
.btn-maction.primary-action:hover { opacity: .9; color: #fff; }

/* ── New org card ── */
.new-org-card {
  border: 2px dashed var(--ehub-line); border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 40px 24px; cursor: pointer; color: var(--ehub-muted);
  transition: border-color .15s, color .15s, background .15s;
  text-align: center; min-height: 240px; text-decoration: none;
}
.new-org-card:hover { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.new-ico { width: 52px; height: 52px; border-radius: 50%; border: 2px dashed currentColor; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.new-lbl { font-size: .9rem; font-weight: 600; }
.new-sub { font-size: .78rem; opacity: .7; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 40px 20px; color: var(--ehub-muted); }
.empty-state .ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }
</style>
