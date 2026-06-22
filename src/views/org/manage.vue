<script>
import Organization from '@/helpers/communication/Organization.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';

const ORG_GRADS = [
  ['#0098D8', '#00d4ff'],
  ['#e23b3b', '#ff8a3b'],
  ['#7C3AED', '#b06bff'],
  ['#d6336c', '#ff6b9d'],
  ['#f08c00', '#ffc93c'],
  ['#1f8a5b', '#51cf66'],
  ['#495057', '#868e96'],
  ['#0c5da8', '#4db8ff'],
  ['#c04a00', '#ff8c5a'],
];

const ROLE_CLASS = {
  owner: 'owner',
  admin: 'admin',
  event_manager: 'manager',
  financial: 'staff',
};

export default {
  props: {
    forceOption: { type: Array, default: () => [] },
  },

  data() {
    const forced = this.forceOption?.[0] ?? null;
    const panelMap = { general: 'settings', events: 'events', finances: 'settings' };
    return {
      activePanel: panelMap[forced] ?? 'overview',
      org: null,
      loading: true,
      baseUrl: SystemVars.baseUrl,

      // events panel
      events: [],
      eventsLoading: false,
      evFilter: 'all',
      evSearch: '',

      // members panel
      members: [],
      membersLoading: false,
      mbSearch: '',
      mbRoleFilter: 'all',
      showInvite: false,
      inviteEmail: '',
      inviteRole: 'event_manager',
      inviteSending: false,

      // settings panel
      settingsForm: { name: '', description: '', instagram: '', facebook: '', x_twitter: '', website: '', color: '' },
      settingsSaving: false,
      visualSaving: false,
      logoFile: null,
      logoLocalPreview: null,
      logoVersion: Date.now(),
      hasLogo: true,
      coverFile: null,
      coverLocalPreview: null,
      coverVersion: Date.now(),
      hasCover: true,
    };
  },

  computed: {
    orgRoute() { return this.$route.params.orgRoute; },
    orgInitials() {
      const n = this.org?.name || '';
      return n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    },
    orgGrad() {
      return this.hexGrad(this.settingsForm.color || this.org?.color);
    },
    orgLogoUrl() {
      return this.baseUrl + 'storage/org/' + this.orgRoute + '/logo.webp?v=' + this.logoVersion;
    },
    orgCoverUrl() {
      return this.baseUrl + 'storage/org/' + this.orgRoute + '/cover.webp?v=' + this.coverVersion;
    },
    activeEvents() {
      return this.events.filter(e => !e.finished).length;
    },
    filteredEvents() {
      let list = this.events;
      if (this.evFilter === 'upcoming') list = list.filter(e => !e.finished && this.isUpcoming(e));
      else if (this.evFilter === 'active') list = list.filter(e => !e.finished && !this.isUpcoming(e));
      else if (this.evFilter === 'finished') list = list.filter(e => e.finished);
      const q = this.evSearch.trim().toLowerCase();
      if (q) list = list.filter(e => (e.name || '').toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q));
      return list;
    },
    filteredMembers() {
      let list = this.members;
      if (this.mbRoleFilter !== 'all') list = list.filter(m => m.role === this.mbRoleFilter);
      const q = this.mbSearch.trim().toLowerCase();
      if (q) list = list.filter(m => {
        const full = `${m.user?.name ?? ''} ${m.user?.surname ?? ''} ${m.user?.username ?? ''}`.toLowerCase();
        return full.includes(q);
      });
      return list;
    },
    myUserId() {
      return this.$store?.getters?.getUser?.id;
    },
  },

  async created() {
    await this.loadOrg();
    await this.loadEvents();
    await this.loadMembers();
  },

  methods: {
    hexGrad(hex) {
      if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        const code = (this.org?.name || 'A').charCodeAt(0);
        const idx = (isNaN(code) ? 0 : code) % ORG_GRADS.length;
        const g = ORG_GRADS[idx] ?? ORG_GRADS[0];
        return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
      }
      const n = parseInt(hex.slice(1), 16);
      const r = Math.max(0, ((n >> 16) & 0xff) - 50);
      const g = Math.max(0, ((n >> 8) & 0xff) - 50);
      const b = Math.max(0, (n & 0xff) - 50);
      const dark = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
      return `linear-gradient(135deg, ${hex}, ${dark})`;
    },
    onLogoFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.logoFile = file;
      this.logoLocalPreview = URL.createObjectURL(file);
    },
    onCoverFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.coverFile = file;
      this.coverLocalPreview = URL.createObjectURL(file);
    },
    async uploadLogo() {
      if (!this.logoFile) return;
      this.logoUploading = true;
      const result = await Organization.uploadLogo(this.orgRoute, this.logoFile);
      this.logoUploading = false;
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.logo_uploaded'));
        this.logoVersion = Date.now();
        this.logoFile = null;
        this.logoLocalPreview = null;
        if (this.$refs.logoInput) this.$refs.logoInput.value = '';
      } else {
        toast.error(this.$t('pages.organization.manage.settings.logo_upload_error'));
      }
    },
    async uploadCover() {
      if (!this.coverFile) return;
      this.coverUploading = true;
      const result = await Organization.uploadCover(this.orgRoute, this.coverFile);
      this.coverUploading = false;
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.cover_uploaded'));
        this.coverVersion = Date.now();
        this.coverFile = null;
        this.coverLocalPreview = null;
        if (this.$refs.coverInput) this.$refs.coverInput.value = '';
      } else {
        toast.error(this.$t('pages.organization.manage.settings.cover_upload_error'));
      }
    },

    async removeLogoImage() {
      const result = await Organization.removeLogo(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.logo_removed'));
        this.hasLogo = false;
        this.logoVersion = Date.now();
        this.logoLocalPreview = null;
        this.logoFile = null;
        if (this.$refs.logoInput) this.$refs.logoInput.value = '';
      } else {
        toast.error(this.$t('pages.organization.manage.settings.remove_error'));
      }
    },
    async removeCoverImage() {
      const result = await Organization.removeCover(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.cover_removed'));
        this.hasCover = false;
        this.coverVersion = Date.now();
        this.coverLocalPreview = null;
        this.coverFile = null;
        if (this.$refs.coverInput) this.$refs.coverInput.value = '';
      } else {
        toast.error(this.$t('pages.organization.manage.settings.remove_error'));
      }
    },

    async loadOrg() {
      this.loading = true;
      const result = await Organization.show(this.orgRoute);
      this.loading = false;
      if (result.code === 200 && result.data) {
        this.org = result.data;
        this.settingsForm.name = result.data.name || '';
        this.settingsForm.description = result.data.description || '';
        this.settingsForm.instagram = result.data.instagram || '';
        this.settingsForm.facebook = result.data.facebook || '';
        this.settingsForm.x_twitter = result.data.x_twitter || '';
        this.settingsForm.website = result.data.website || '';
        this.settingsForm.color = result.data.color || '';
      }
    },

    async switchPanel(panel) {
      this.activePanel = panel;
      if (panel === 'events' && !this.events.length) await this.loadEvents();
      if (panel === 'members' && !this.members.length) await this.loadMembers();
    },

    async loadEvents() {
      this.eventsLoading = true;
      const result = await OrganizationEvent.index(this.orgRoute, true);
      this.eventsLoading = false;
      if (result.code === 200 && Array.isArray(result.data)) this.events = result.data;
    },

    async loadMembers() {
      this.membersLoading = true;
      const result = await Organization.getMembers(this.orgRoute);
      this.membersLoading = false;
      if (result.code === 200 && Array.isArray(result.data)) this.members = result.data;
    },

    isUpcoming(ev) {
      if (!ev.start_at) return false;
      return new Date(ev.start_at) > new Date();
    },

    eventStatus(ev) {
      if (ev.finished) return 'finished';
      if (ev.start_at && new Date(ev.start_at) > new Date()) return 'upcoming';
      return 'active';
    },

    fmtDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString(this.$i18n.locale, { day: '2-digit', month: 'short', year: 'numeric' });
    },

    memberName(m) {
      return `${m.user?.name ?? ''} ${m.user?.surname ?? ''}`.trim() || m.user?.username || '?';
    },

    memberInitials(m) {
      const name = this.memberName(m);
      return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },

    memberGrad(m) {
      const name = this.memberName(m) || (m.user?.username ?? 'A');
      const code = name.charCodeAt(0);
      const idx = (isNaN(code) ? 0 : code) % ORG_GRADS.length;
      const g = ORG_GRADS[idx] ?? ORG_GRADS[0];
      return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
    },

    memberAvatarUrl(m) {
      if (!m.user?.image) return null;
      return this.baseUrl + 'storage/' + m.user.image;
    },

    roleClass(role) { return ROLE_CLASS[role] || 'staff'; },

    async sendInvite() {
      if (!this.inviteEmail.trim()) return;
      this.inviteSending = true;
      const result = await Organization.addMember(this.orgRoute, this.inviteEmail.trim(), this.inviteRole);
      this.inviteSending = false;
      if (result.code === 200 || result.code === 201) {
        toast.success(this.$t('pages.organization.manage.members.invited'));
        this.inviteEmail = '';
        this.showInvite = false;
        await this.loadMembers();
      } else {
        toast.error(result.data?.message || this.$t('pages.organization.manage.members.invite_error'));
      }
    },

    async removeMember(member) {
      if (!confirm(this.$t('pages.organization.manage.members.confirm_remove'))) return;
      const result = await Organization.removeMember(this.orgRoute, member.user.id);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.members.removed'));
        await this.loadMembers();
      } else {
        toast.error(this.$t('pages.organization.manage.members.remove_error'));
      }
    },

    async updateRole(member, role) {
      const result = await Organization.updateMemberRole(this.orgRoute, member.user.id, role);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.members.role_updated'));
        member.role = role;
      } else {
        toast.error(this.$t('pages.organization.manage.members.role_error'));
      }
    },

    async saveVisual() {
      this.visualSaving = true;
      const tasks = [];

      if (this.settingsForm.color) {
        tasks.push(Organization.updateProfile(this.orgRoute, { color: this.settingsForm.color }));
      }
      if (this.logoFile) {
        tasks.push(
          Organization.uploadLogo(this.orgRoute, this.logoFile).then(r => {
            if (r.code === 200) {
              this.logoVersion = Date.now();
              this.logoFile = null;
              this.logoLocalPreview = null;
              if (this.$refs.logoInput) this.$refs.logoInput.value = '';
            } else {
              toast.error(this.$t('pages.organization.manage.settings.logo_upload_error'));
            }
          })
        );
      }
      if (this.coverFile) {
        tasks.push(
          Organization.uploadCover(this.orgRoute, this.coverFile).then(r => {
            if (r.code === 200) {
              this.coverVersion = Date.now();
              this.coverFile = null;
              this.coverLocalPreview = null;
              if (this.$refs.coverInput) this.$refs.coverInput.value = '';
            } else {
              toast.error(this.$t('pages.organization.manage.settings.cover_upload_error'));
            }
          })
        );
      }

      await Promise.all(tasks);
      this.visualSaving = false;
      toast.success(this.$t('pages.organization.manage.settings.saved'));
    },

    async saveSettings() {
      this.settingsSaving = true;
      const result = await Organization.updateProfile(this.orgRoute, this.settingsForm);
      this.settingsSaving = false;
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.saved'));
        if (this.org) this.org.name = this.settingsForm.name;
      } else {
        toast.error(this.$t('pages.organization.manage.settings.save_error'));
      }
    },

    async deleteOrg() {
      if (!confirm(this.$t('pages.organization.manage.settings.confirm_delete'))) return;
      const result = await Organization.delete(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.deleted'));
        this.$router.push('/orgs/mine');
      } else {
        toast.error(this.$t('pages.organization.manage.settings.delete_error'));
      }
    },

    goToEvent(ev) {
      this.$router.push(`/org/${this.orgRoute}/event/${ev.route}/manage`);
    },

    goCreateEvent() {
      this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.orgRoute } });
    },
  },
};
</script>

<template>
  <div class="mgmt-wrap">

    <!-- ── SIDEBAR ── -->
    <aside class="mgmt-sidebar">
      <div class="sb-org">
        <div v-if="loading" class="sb-logo" style="background:var(--ehub-field-bg)"></div>
        <div v-else class="sb-logo" :style="{ background: orgGrad }">
          <img v-if="org?.route" :src="baseUrl + 'storage/org/' + org.route + '/logo.webp'" class="sb-logo-img" :alt="org?.name" @error="$event.target.style.display='none'" />
          <span>{{ orgInitials }}</span>
        </div>
        <div>
          <div class="sb-name">{{ org?.name || '—' }}</div>
          <div class="sb-cat">{{ org?.category || '—' }}</div>
        </div>
      </div>

      <nav class="sb-nav">
        <button class="nav-item" :class="{ active: activePanel === 'overview' }" @click="switchPanel('overview')">
          <font-awesome-icon :icon="['fas', 'chart-line']" />
          <span>{{ $t('pages.organization.manage.nav.overview') }}</span>
        </button>
        <button class="nav-item" :class="{ active: activePanel === 'events' }" @click="switchPanel('events')">
          <font-awesome-icon :icon="['fas', 'calendar-days']" />
          <span>{{ $t('pages.organization.manage.nav.events') }}</span>
          <span v-if="activeEvents > 0" class="nav-badge">{{ activeEvents }}</span>
        </button>
        <button class="nav-item" :class="{ active: activePanel === 'members' }" @click="switchPanel('members')">
          <font-awesome-icon :icon="['fas', 'users']" />
          <span>{{ $t('pages.organization.manage.nav.members') }}</span>
        </button>
        <button class="nav-item" :class="{ active: activePanel === 'settings' }" @click="switchPanel('settings')">
          <font-awesome-icon :icon="['fas', 'gear']" />
          <span>{{ $t('pages.organization.manage.nav.settings') }}</span>
        </button>
        <div class="nav-div"></div>
        <router-link :to="`/org/${orgRoute}`" class="nav-item">
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
          <span>{{ $t('pages.organization.manage.nav.public') }}</span>
        </router-link>
        <router-link to="/orgs/mine" class="nav-item">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          <span>{{ $t('pages.organization.manage.nav.back') }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- ── MAIN ── -->
    <main class="mgmt-main">

      <!-- ═══ OVERVIEW ═══ -->
      <section v-show="activePanel === 'overview'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.overview.title') }}</h1>
            <p>{{ $t('pages.organization.manage.overview.sub') }}</p>
          </div>
          <div class="spacer"></div>
          <button class="btn btn-primary round px-3" @click="goCreateEvent">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.organization.manage.overview.new_event') }}
          </button>
        </div>

        <!-- Stat cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="sc-row">
              <div class="sc-ico primary"><font-awesome-icon :icon="['fas', 'calendar-check']" /></div>
              <span class="sc-delta up"><font-awesome-icon :icon="['fas', 'arrow-trend-up']" /> {{ activeEvents }}</span>
            </div>
            <div class="sc-val">{{ activeEvents }}</div>
            <div class="sc-lbl">{{ $t('pages.organization.manage.overview.stats.active') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-row">
              <div class="sc-ico gold"><font-awesome-icon :icon="['fas', 'users']" /></div>
            </div>
            <div class="sc-val">{{ org?.members_count ?? '—' }}</div>
            <div class="sc-lbl">{{ $t('pages.organization.manage.overview.stats.members') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-row">
              <div class="sc-ico purple"><font-awesome-icon :icon="['fas', 'flag-checkered']" /></div>
            </div>
            <div class="sc-val">{{ org?.events_count ?? '—' }}</div>
            <div class="sc-lbl">{{ $t('pages.organization.manage.overview.stats.total_events') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-row">
              <div class="sc-ico green"><font-awesome-icon :icon="['fas', 'flag']" /></div>
            </div>
            <div class="sc-val">{{ events.filter(e => !e.finished && isUpcoming(e)).length || '—' }}</div>
            <div class="sc-lbl">{{ $t('pages.organization.manage.overview.stats.next') }}</div>
          </div>
        </div>

        <!-- 2-col -->
        <div class="dash-grid">
          <!-- Recent events -->
          <div class="cc">
            <div class="cc-hd">
              <h3><font-awesome-icon :icon="['fas', 'calendar-days']" class="me-2" style="color:var(--ehub-primary)" />{{ $t('pages.organization.manage.overview.recent') }}</h3>
              <button class="cc-link" @click="switchPanel('events')">{{ $t('pages.organization.manage.overview.see_all') }}</button>
            </div>
            <div v-if="!events.length && !eventsLoading" class="px-4 py-3 text-center" style="color:var(--ehub-muted);font-size:.85rem">
              {{ $t('pages.organization.manage.events.empty') }}
            </div>
            <div v-if="eventsLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            <div
              v-for="ev in events.slice(0, 4)" :key="ev.route"
              class="ev-mini" @click="goToEvent(ev)">
              <div class="ev-mini-ico" :style="{ background: orgGrad }">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" />
              </div>
              <div class="ev-mini-body">
                <div class="ev-mini-name">{{ ev.name }}</div>
                <div class="ev-mini-meta">{{ fmtDate(ev.start_at) }}</div>
              </div>
              <span class="s-badge" :class="eventStatus(ev)">{{ $t('pages.organization.manage.events.status.' + eventStatus(ev)) }}</span>
            </div>
          </div>

          <!-- Quick members -->
          <div class="cc">
            <div class="cc-hd">
              <h3><font-awesome-icon :icon="['fas', 'users']" class="me-2" style="color:var(--ehub-gold)" />{{ $t('pages.organization.manage.overview.members_title') }}</h3>
              <button class="cc-link" @click="switchPanel('members')">{{ $t('pages.organization.manage.overview.see_all') }}</button>
            </div>
            <div v-if="!members.length && !membersLoading" class="px-4 py-3 text-center" style="color:var(--ehub-muted);font-size:.85rem">
              {{ $t('pages.organization.manage.members.empty') }}
            </div>
            <div v-if="membersLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            <div v-for="m in members.slice(0, 5)" :key="m.id" class="ev-mini">
              <div class="m-av" :style="{ background: memberGrad(m) }">
                <img v-if="memberAvatarUrl(m)" :src="memberAvatarUrl(m)" class="m-av-img" :alt="memberName(m)" @error="$event.target.style.display='none'" />
                <span v-else>{{ memberInitials(m) }}</span>
              </div>
              <div class="ev-mini-body">
                <div class="ev-mini-name">{{ memberName(m) }}</div>
                <div class="ev-mini-meta">{{ m.user?.username }}</div>
              </div>
              <span class="role-chip" :class="roleClass(m.role)">{{ $t('pages.organization.manage.roles.' + m.role) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ EVENTS ═══ -->
      <section v-show="activePanel === 'events'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.nav.events') }}</h1>
            <p>{{ $t('pages.organization.manage.events.sub', { n: events.length }) }}</p>
          </div>
          <div class="spacer"></div>
          <button class="btn btn-primary round px-3" @click="goCreateEvent">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.organization.manage.overview.new_event') }}
          </button>
        </div>

        <div class="sec-bar">
          <div class="role-seg">
            <button v-for="f in ['all','upcoming','active','finished']" :key="f"
              :class="{ active: evFilter === f }" @click="evFilter = f">
              {{ $t('pages.organization.manage.events.filter.' + f) }}
            </button>
          </div>
          <div class="sb-sp"></div>
          <div class="input-group input-group-sm" style="max-width:200px">
            <span class="input-group-text"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></span>
            <input type="text" class="form-control" v-model="evSearch" :placeholder="$t('pages.organization.manage.events.search')" />
          </div>
        </div>

        <div class="cc">
          <div v-if="eventsLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
          <table v-else class="mgmt-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.organization.manage.events.tbl.event') }}</th>
                <th>{{ $t('pages.organization.manage.events.tbl.date') }}</th>
                <th>{{ $t('pages.organization.manage.events.tbl.slots') }}</th>
                <th>{{ $t('pages.organization.manage.events.tbl.status') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredEvents.length === 0">
                <td colspan="5" class="text-center td-muted py-4">{{ $t('pages.organization.manage.events.empty') }}</td>
              </tr>
              <tr v-for="ev in filteredEvents" :key="ev.route" style="cursor:pointer" @click="goToEvent(ev)">
                <td class="td-name">{{ ev.name }}</td>
                <td class="td-muted">{{ fmtDate(ev.start_at) }}</td>
                <td class="td-muted">
                  <span v-if="ev.max_registrations">{{ ev.registrations_count ?? 0 }}/{{ ev.max_registrations }}</span>
                  <span v-else>{{ ev.registrations_count ?? 0 }}</span>
                </td>
                <td><span class="s-badge" :class="eventStatus(ev)">{{ $t('pages.organization.manage.events.status.' + eventStatus(ev)) }}</span></td>
                <td @click.stop>
                  <div class="act-row">
                    <button class="act-btn" @click="goToEvent(ev)" :title="$t('pages.organization.manage.events.manage_btn')">
                      <font-awesome-icon :icon="['fas', 'sliders']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══ MEMBERS ═══ -->
      <section v-show="activePanel === 'members'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.nav.members') }}</h1>
            <p>{{ $t('pages.organization.manage.members.sub', { n: members.length }) }}</p>
          </div>
          <div class="spacer"></div>
        </div>

        <div class="sec-bar">
          <div class="input-group input-group-sm" style="max-width:220px">
            <span class="input-group-text"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></span>
            <input type="text" class="form-control" v-model="mbSearch" :placeholder="$t('pages.organization.manage.members.search')" />
          </div>
          <div class="role-seg">
            <button v-for="r in ['all','owner','admin','event_manager','financial']" :key="r"
              :class="{ active: mbRoleFilter === r }" @click="mbRoleFilter = r">
              {{ r === 'all' ? $t('pages.organization.manage.members.all') : $t('pages.organization.manage.roles.' + r) }}
            </button>
          </div>
          <div class="sb-sp"></div>
          <button class="btn btn-sm btn-primary round px-3" @click="showInvite = !showInvite">
            <font-awesome-icon :icon="['fas', 'user-plus']" class="me-2" />{{ $t('pages.organization.manage.members.invite') }}
          </button>
        </div>

        <!-- Invite row -->
        <div v-if="showInvite" class="invite-box cc mb-3">
          <div class="row g-2 align-items-end" style="padding:16px 18px">
            <div class="col-md-5">
              <label class="form-label" style="font-size:.78rem;font-weight:600;color:var(--ehub-muted)">{{ $t('pages.organization.manage.members.invite_email_label') }}</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text"><font-awesome-icon :icon="['fas', 'envelope']" /></span>
                <input type="email" class="form-control" v-model="inviteEmail" :placeholder="$t('pages.organization.manage.members.invite_email_ph')" />
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label" style="font-size:.78rem;font-weight:600;color:var(--ehub-muted)">{{ $t('pages.organization.manage.members.invite_role_label') }}</label>
              <select class="form-select form-select-sm" v-model="inviteRole">
                <option value="event_manager">{{ $t('pages.organization.manage.roles.event_manager') }}</option>
                <option value="financial">{{ $t('pages.organization.manage.roles.financial') }}</option>
                <option value="admin">{{ $t('pages.organization.manage.roles.admin') }}</option>
              </select>
            </div>
            <div class="col-auto d-flex gap-2">
              <button class="btn btn-sm btn-primary" :disabled="inviteSending" @click="sendInvite">
                <span v-if="inviteSending" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('pages.organization.manage.members.invite_send') }}
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="showInvite = false">{{ $t('pages.organization.manage.members.cancel') }}</button>
            </div>
          </div>
        </div>

        <div class="cc">
          <div v-if="membersLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
          <table v-else class="mgmt-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.organization.manage.members.tbl.member') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.role') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.since') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredMembers.length === 0">
                <td colspan="4" class="text-center td-muted py-4">{{ $t('pages.organization.manage.members.empty') }}</td>
              </tr>
              <tr v-for="m in filteredMembers" :key="m.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="m-av" :style="{ background: memberGrad(m) }">
                      <img v-if="memberAvatarUrl(m)" :src="memberAvatarUrl(m)" class="m-av-img" :alt="memberName(m)" @error="$event.target.style.display='none'" />
                      <span v-else>{{ memberInitials(m) }}</span>
                    </div>
                    <div>
                      <div class="td-name" style="font-size:.87rem">{{ memberName(m) }}</div>
                      <div class="td-muted" style="font-size:.75rem">@{{ m.user?.username }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="m.role === 'owner' || m.user?.id === myUserId" class="role-chip" :class="roleClass(m.role)">{{ $t('pages.organization.manage.roles.' + m.role) }}</span>
                  <select v-else class="form-select form-select-sm" style="max-width:160px;font-size:.8rem" :value="m.role" @change="updateRole(m, $event.target.value)">
                    <option value="admin">{{ $t('pages.organization.manage.roles.admin') }}</option>
                    <option value="event_manager">{{ $t('pages.organization.manage.roles.event_manager') }}</option>
                    <option value="financial">{{ $t('pages.organization.manage.roles.financial') }}</option>
                  </select>
                </td>
                <td class="td-muted">{{ m.created_at ? new Date(m.created_at).getFullYear() : '—' }}</td>
                <td>
                  <div class="act-row">
                    <button v-if="m.role !== 'owner' && m.user?.id !== myUserId" class="act-btn del" @click="removeMember(m)" :title="$t('pages.organization.manage.members.remove')">
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══ SETTINGS ═══ -->
      <section v-show="activePanel === 'settings'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.nav.settings') }}</h1>
            <p>{{ $t('pages.organization.manage.settings.sub') }}</p>
          </div>
        </div>

        <!-- General -->
        <div class="set-card">
          <h3>{{ $t('pages.organization.manage.settings.general') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.settings.general_desc') }}</p>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.name') }}</label>
              <input type="text" class="form-control" v-model="settingsForm.name" />
            </div>
            <div class="col-12">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.description') }}</label>
              <textarea class="form-control" rows="3" v-model="settingsForm.description" style="resize:vertical"></textarea>
            </div>
            <div class="col-12 d-flex justify-content-end">
              <button class="btn btn-primary round px-4" :disabled="settingsSaving" @click="saveSettings">
                <span v-if="settingsSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ $t('pages.organization.manage.settings.save') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Visual identity -->
        <div class="set-card">
          <h3>{{ $t('pages.organization.manage.settings.visual') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.settings.visual_desc') }}</p>
          <div class="row g-4">

            <!-- Color -->
            <div class="col-12">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.color') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.color_desc') }}</p>
              <div class="color-pick-row">
                <div class="color-swatch-preview" :style="{ background: orgGrad }">{{ orgInitials }}</div>
                <div class="color-pick-inputs">
                  <input type="color" v-model="settingsForm.color" class="color-native" />
                  <input type="text" v-model="settingsForm.color" class="form-control form-control-sm color-hex-input" maxlength="7" placeholder="#000000" />
                </div>
              </div>
            </div>

            <!-- Logo upload -->
            <div class="col-md-6">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.logo_upload') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.logo_hint') }}</p>
              <div class="upload-area">
                <div class="logo-prev-box" :style="{ background: orgGrad }">
                  <img v-if="logoLocalPreview" :src="logoLocalPreview" class="logo-up-img" />
                  <img v-else :src="orgLogoUrl" class="logo-up-img"
                    @load="hasLogo = true"
                    @error="hasLogo = false; $event.target.style.display='none'" />
                  <span class="upload-initials">{{ orgInitials }}</span>
                </div>
                <div class="upload-actions">
                  <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="onLogoFileChange" />
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-secondary round px-3" @click="$refs.logoInput.click()">
                      <font-awesome-icon :icon="['fas', 'image']" class="me-2" />
                      {{ $t('pages.organization.manage.settings.choose_file') }}
                    </button>
                    <button v-if="hasLogo && !logoFile" class="btn btn-sm btn-outline-danger round px-3" @click="removeLogoImage">
                      <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />
                      {{ $t('pages.organization.manage.settings.remove_logo') }}
                    </button>
                  </div>
                  <span v-if="logoFile" class="upload-filename">{{ logoFile.name }}</span>
                </div>
              </div>
            </div>

            <!-- Cover upload -->
            <div class="col-md-6">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.cover_upload') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.cover_hint') }}</p>
              <div class="cover-up-prev" :style="coverLocalPreview
                ? { backgroundImage: `url(${coverLocalPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: orgGrad }">
                <img v-if="!coverLocalPreview" :src="orgCoverUrl" class="cover-up-img"
                  @load="hasCover = true"
                  @error="hasCover = false; $event.target.style.display='none'" />
              </div>
              <input ref="coverInput" type="file" accept="image/*" style="display:none" @change="onCoverFileChange" />
              <div class="mt-2 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-sm btn-outline-secondary round px-3" @click="$refs.coverInput.click()">
                  <font-awesome-icon :icon="['fas', 'image']" class="me-2" />
                  {{ $t('pages.organization.manage.settings.choose_file') }}
                </button>
                <button v-if="hasCover && !coverFile" class="btn btn-sm btn-outline-danger round px-3" @click="removeCoverImage">
                  <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />
                  {{ $t('pages.organization.manage.settings.remove_cover') }}
                </button>
                <span v-if="coverFile" class="upload-filename">{{ coverFile.name }}</span>
              </div>
            </div>

            <!-- Save -->
            <div class="col-12 d-flex justify-content-end">
              <button class="btn btn-primary round px-4" :disabled="visualSaving" @click="saveVisual">
                <span v-if="visualSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ $t('pages.organization.manage.settings.save') }}
              </button>
            </div>

          </div>
        </div>

        <!-- Social -->
        <div class="set-card">
          <h3>{{ $t('pages.organization.manage.settings.social') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.settings.social_desc') }}</p>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label set-label">Instagram</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fab', 'instagram']" /></span><input type="text" class="form-control" v-model="settingsForm.instagram" placeholder="@handle" /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label set-label">X / Twitter</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fab', 'x-twitter']" /></span><input type="text" class="form-control" v-model="settingsForm.x_twitter" placeholder="@handle" /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label set-label">Facebook</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fab', 'facebook']" /></span><input type="text" class="form-control" v-model="settingsForm.facebook" placeholder="facebook.com/..." /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label set-label">Website</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fas', 'globe']" /></span><input type="text" class="form-control" v-model="settingsForm.website" placeholder="https://..." /></div>
            </div>
            <div class="col-12 d-flex justify-content-end">
              <button class="btn btn-primary round px-4" :disabled="settingsSaving" @click="saveSettings">
                <span v-if="settingsSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ $t('pages.organization.manage.settings.save') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="set-card danger">
          <h3>{{ $t('pages.organization.manage.settings.danger') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.settings.danger_desc') }}</p>
          <div style="background:color-mix(in srgb,#e23b3b 8%,transparent);border:1px solid color-mix(in srgb,#e23b3b 25%,var(--ehub-line));border-radius:10px;padding:14px 16px;max-width:400px">
            <div style="font-size:.88rem;font-weight:700;color:#e23b3b;margin-bottom:3px">{{ $t('pages.organization.manage.settings.delete_title') }}</div>
            <div style="font-size:.8rem;color:var(--ehub-muted);margin-bottom:10px">{{ $t('pages.organization.manage.settings.delete_desc') }}</div>
            <button class="btn btn-sm btn-danger round px-3" @click="deleteOrg">{{ $t('pages.organization.manage.settings.delete_btn') }}</button>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.mgmt-wrap { display: flex; min-height: calc(100vh - 60px); }

/* ── Sidebar ── */
.mgmt-sidebar {
  width: 236px; flex-shrink: 0;
  background: var(--ehub-card); border-right: 1px solid var(--ehub-line);
  position: sticky; top: 60px; height: calc(100vh - 60px);
  overflow-y: auto; display: flex; flex-direction: column;
}
.sb-org { padding: 15px 14px; border-bottom: 1px solid var(--ehub-line); display: flex; align-items: center; gap: 10px; }
.sb-logo {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 800; color: #fff; overflow: hidden; position: relative;
}
.sb-logo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sb-name { font-size: .84rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; }
.sb-cat { font-size: .7rem; color: var(--ehub-muted); }
.sb-nav { padding: 9px 7px; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 9px;
  cursor: pointer; color: var(--ehub-muted); font-size: .875rem; font-weight: 600;
  transition: all .15s; text-decoration: none; border: 0; background: transparent;
  width: 100%; text-align: left; margin-bottom: 2px;
}
.nav-item svg { width: 15px; text-align: center; font-size: .8rem; flex-shrink: 0; }
.nav-item:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); text-decoration: none; }
.nav-item.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.nav-badge { margin-left: auto; background: var(--ehub-primary); color: #fff; font-size: .63rem; font-weight: 700; padding: 1px 6px; border-radius: 50rem; }
.nav-div { height: 1px; background: var(--ehub-line); margin: 6px 3px; }

/* ── Main ── */
.mgmt-main { flex: 1; padding: 28px 32px; min-width: 0; }
.mgmt-pane { display: block; }

/* ── Panel header ── */
.pnl-hd { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.pnl-hd h1 { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 2px; letter-spacing: -.02em; }
.pnl-hd p { color: var(--ehub-muted); font-size: .84rem; margin: 0; }
.spacer { flex: 1; min-width: 16px; }

/* ── Stat cards ── */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; margin-bottom: 22px; }
.stat-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 17px 19px; }
.sc-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 11px; }
.sc-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .82rem; }
.sc-ico.primary { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.sc-ico.gold { background: color-mix(in srgb, var(--ehub-gold) 18%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.sc-ico.purple { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.sc-ico.green { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
.sc-delta { font-size: .72rem; font-weight: 700; display: flex; align-items: center; gap: 3px; }
.sc-delta.up { color: #1f8a5b; }
.sc-val { font-size: 1.75rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.03em; line-height: 1; }
.sc-lbl { font-size: .72rem; color: var(--ehub-muted); margin-top: 3px; font-weight: 500; }

/* ── Dashboard 2-col ── */
.dash-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 16px; }

/* ── Content card ── */
.cc { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.cc-hd { display: flex; align-items: center; gap: 10px; padding: 13px 17px; border-bottom: 1px solid var(--ehub-line); }
.cc-hd h3 { font-size: .9rem; font-weight: 700; color: var(--ehub-ink); margin: 0; flex: 1; }
.cc-link { font-size: .78rem; font-weight: 600; color: var(--ehub-primary); cursor: pointer; background: none; border: 0; padding: 0; }
.cc-link:hover { text-decoration: underline; }

/* ── Table ── */
.mgmt-tbl { width: 100%; border-collapse: collapse; }
.mgmt-tbl th { font-size: .67rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 9px 15px; text-align: left; border-bottom: 1px solid var(--ehub-line); white-space: nowrap; }
.mgmt-tbl td { padding: 11px 15px; border-bottom: 1px solid var(--ehub-line); font-size: .875rem; color: var(--ehub-ink); vertical-align: middle; }
.mgmt-tbl tbody tr:last-child td { border-bottom: 0; }
.mgmt-tbl tbody tr:hover td { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.td-muted { color: var(--ehub-muted) !important; font-size: .82rem !important; }
.td-name { font-weight: 600; }

/* ── Status badges ── */
.s-badge { display: inline-flex; align-items: center; gap: 4px; font-size: .7rem; font-weight: 700; padding: 3px 9px; border-radius: 50rem; }
.s-badge.active   { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
.s-badge.finished { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.s-badge.upcoming { background: var(--ehub-primary-tint); color: var(--ehub-primary); }

/* ── Row actions ── */
.act-row { display: flex; gap: 4px; }
.act-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--ehub-line); background: transparent; color: var(--ehub-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: .75rem; transition: all .15s; }
.act-btn:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.act-btn.del:hover { background: color-mix(in srgb, #e23b3b 12%, transparent); color: #e23b3b; border-color: color-mix(in srgb, #e23b3b 35%, transparent); }

/* ── Section bar ── */
.sec-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.sb-sp { flex: 1; }
.role-seg { display: flex; gap: 4px; flex-wrap: wrap; }
.role-seg button { background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); color: var(--ehub-muted); font-size: .78rem; font-weight: 600; padding: 5px 13px; border-radius: 50rem; cursor: pointer; transition: all .14s; }
.role-seg button:hover { border-color: var(--ehub-primary); color: var(--ehub-ink); }
.role-seg button.active { background: var(--ehub-primary); border-color: var(--ehub-primary); color: #fff; }

/* ── Event mini / member row ── */
.ev-mini { display: flex; align-items: center; gap: 11px; padding: 11px 17px; border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s; }
.ev-mini:last-child { border-bottom: 0; }
.ev-mini:hover { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.ev-mini-ico { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: .82rem; color: #fff; }
.ev-mini-body { flex: 1; min-width: 0; }
.ev-mini-name { font-size: .87rem; font-weight: 600; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev-mini-meta { font-size: .73rem; color: var(--ehub-muted); }

/* ── Member avatar ── */
.m-av { width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: .64rem; font-weight: 700; color: #fff; flex-shrink: 0; position: relative; overflow: hidden; }
.m-av-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.role-chip { font-size: .7rem; font-weight: 600; padding: 3px 9px; border-radius: 50rem; display: inline-block; white-space: nowrap; }
.role-chip.owner   { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.role-chip.admin   { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.role-chip.manager { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.role-chip.staff   { background: var(--ehub-field-bg); color: var(--ehub-muted); }
html[data-bs-theme="dark"] .role-chip.owner { color: var(--ehub-gold); }

/* ── Settings cards ── */
.set-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 22px 24px; margin-bottom: 16px; }
.set-card h3 { font-size: .97rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 3px; }
.set-desc { font-size: .83rem; color: var(--ehub-muted); margin: 0 0 18px; }
.set-label { font-size: .82rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: 5px; }
.set-card.danger { border-color: color-mix(in srgb, #e23b3b 30%, var(--ehub-line)); }
.set-card.danger h3 { color: #e23b3b; }

/* Visual identity */
.set-hint { font-size: .78rem; color: var(--ehub-muted); margin: 0 0 10px; }
.color-pick-row { display: flex; align-items: center; gap: 12px; }
.color-swatch-preview { width: 64px; height: 64px; border-radius: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
.color-pick-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.color-native { width: 44px; height: 38px; padding: 2px; border-radius: 8px; border: 1px solid var(--ehub-line); cursor: pointer; background: none; }
.color-hex-input { max-width: 110px; font-family: monospace; font-size: .85rem; }
.upload-area { display: flex; gap: 14px; align-items: flex-start; }
.logo-prev-box { width: 80px; height: 80px; border-radius: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; color: #fff; overflow: hidden; position: relative; }
.logo-up-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.upload-initials { position: relative; z-index: 0; pointer-events: none; }
.upload-actions { flex: 1; min-width: 0; }
.upload-filename { font-size: .73rem; color: var(--ehub-muted); margin-top: 5px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.cover-up-prev { height: 90px; border-radius: 11px; overflow: hidden; position: relative; }
.cover-up-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* ── Invite box ── */
.invite-box { margin-bottom: 0; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .mgmt-wrap { flex-direction: column; }
  .mgmt-sidebar { width: 100%; height: auto; position: relative; top: 0; border-right: 0; border-bottom: 1px solid var(--ehub-line); flex-direction: row; overflow-x: auto; }
  .sb-org { border-bottom: 0; border-right: 1px solid var(--ehub-line); flex-shrink: 0; }
  .sb-nav { display: flex; flex-direction: row; padding: 8px; gap: 3px; overflow-x: auto; }
  .nav-item { white-space: nowrap; flex-shrink: 0; margin-bottom: 0; }
  .nav-div { display: none; }
  .mgmt-main { padding: 18px 14px; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
