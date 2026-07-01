<script>
import Organization from '@/helpers/communication/Organization.js';
import { toast } from '@/helpers/toast.js';
import EhubViewCard from '@/components/EhubViewCard.vue';
import EhubFilterBar from '@/components/EhubFilterBar.vue';

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

const ROLE_COLOR = {
  owner: '#FBBF11',
  admin: 'var(--ehub-primary)',
  event_manager: '#7C3AED',
  financial: 'var(--ehub-muted)',
};

export default {
  components: { EhubViewCard, EhubFilterBar },

  data() {
    return {
      organizations: [],
      loading: true,
      activeRole: 'all',
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
    roleClass(role) {
      return ROLE_CLASS[role] || 'staff';
    },
    roleIcon(role) {
      return ROLE_ICON[role] || 'id-badge';
    },
    roleColor(role) {
      return ROLE_COLOR[role] || null;
    },
    fmtNum(n) {
      if (!n) return '0';
      if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
      return '' + n;
    },
    joinedYear(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).getFullYear();
    },
    orgAsTeam(org) {
      return {
        name: org.name,
        description: org.description,
        logo_image: org.logo_image || null,
        cover_image: org.cover_image || null,
        color: org.color || null,
        category: null,
        org_name: null,
        is_verified: false,
        is_open: false,
      };
    },
    orgStats(org) {
      return [
        { value: org.events_count ?? 0, label: this.$t('pages.organization.mine.stats.events') },
        { value: this.fmtNum(org.members_count ?? 0), label: this.$t('pages.organization.mine.stats.members') },
        { value: this.joinedYear(org.created_at), label: this.$t('pages.organization.mine.stats.since') },
      ];
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

      </div>
    </div>
  </header>

  <!-- ══ CONTROL BAR ══ -->
  <EhubFilterBar>
    <template #filters>
      <button
        v-for="r in roles"
        :key="r.value"
        class="fchip"
        :class="{ active: activeRole === r.value }"
        @click="activeRole = r.value"
      >
        {{ $t('pages.organization.mine.bar.' + r.key) }}
      </button>
    </template>
  </EhubFilterBar>

  <!-- ══ CONTENT ══ -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="myorgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '360px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <template v-else>
      <div class="myorgs-grid">
        <EhubViewCard
          v-for="org in filtered"
          :key="org.id"
          :team="orgAsTeam(org)"
          :stats="orgStats(org)"
          :accent-color="roleColor(org.role)"
          @click="$router.push('/org/' + org.route)"
        >
          <template #badges>
            <span class="role-badge" :class="roleClass(org.role)">
              <font-awesome-icon :icon="['fas', roleIcon(org.role)]" />
              {{ $t('pages.organization.mine.roles.' + org.role) }}
            </span>
          </template>
          <template #actions>
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
          </template>
        </EhubViewCard>

        <!-- New org card -->
        <router-link to="/create-org" class="new-org-card">
          <div class="new-ico"><font-awesome-icon :icon="['fas', 'plus']" /></div>
          <div class="new-lbl">{{ $t('pages.organization.mine.newcard.label') }}</div>
          <div class="new-sub">{{ $t('pages.organization.mine.newcard.sub') }}</div>
        </router-link>
      </div>

    </template>
  </main>
</template>

<style scoped>
/* ── Role CSS vars ── */
:root {
  --role-owner:      #FBBF11;
  --role-owner-bg:   color-mix(in srgb, #FBBF11 14%, transparent);
  --role-owner-br:   color-mix(in srgb, #FBBF11 30%, transparent);
  --role-admin:      var(--ehub-primary);
  --role-admin-bg:   var(--ehub-primary-tint);
  --role-admin-br:   color-mix(in srgb, var(--ehub-primary) 30%, transparent);
  --role-manager:    #7C3AED;
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

/* ── Grid ── */
.myorgs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

/* ── Role badge (slot content inside vc-badges) ── */
.role-badge {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  font-size: .62rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  padding: 4px 9px; border-radius: 6px;
  backdrop-filter: blur(8px); color: #fff;
  white-space: nowrap; width: 100%;
}
.role-badge.owner   { background: color-mix(in srgb, #FBBF11 85%, rgba(0,0,0,.5)); color: #3a2700; }
.role-badge.admin   { background: color-mix(in srgb, var(--ehub-primary) 85%, rgba(0,0,0,.5)); }
.role-badge.manager { background: color-mix(in srgb, #7C3AED 85%, rgba(0,0,0,.5)); }
.role-badge.staff   { background: rgba(0,0,0,.42); color: rgba(255,255,255,.8); }

/* ── Action buttons (slot content inside vc-foot) ── */
.btn-maction {
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
.new-org-card:only-child { grid-column: 1 / -1; }
.new-ico { width: 52px; height: 52px; border-radius: 50%; border: 2px dashed currentColor; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.new-lbl { font-size: .9rem; font-weight: 600; }
.new-sub { font-size: .78rem; opacity: .7; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 40px 20px; color: var(--ehub-muted); }
.empty-state .ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }
</style>
