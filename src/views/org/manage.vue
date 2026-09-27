<script>
import Organization from '@/helpers/communication/Organization.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';
import EhubStatCard from '@/components/EhubStatCard.vue';
import EhubActivityLog from '@/components/EhubActivityLog.vue';
import EhubMgmtLayout from '@/components/general/EhubMgmtLayout.vue';
import EhubRolePermissionsTable from '@/components/EhubRolePermissionsTable.vue';
import EhubDialog from '@/components/modals/EhubDialog.vue';
import EhubConfirmNameDialog from '@/components/modals/EhubConfirmNameDialog.vue';
import EhubInviteCard from '@/components/modules/members/EhubInviteCard.vue';
import EhubLeaveCard from '@/components/modules/members/EhubLeaveCard.vue';
import EhubColorPicker from '@/components/inputs/ehub-color-picker.vue';
import EhubProfileImageUpload from '@/components/inputs/EhubProfileImageUpload.vue';
import EventCreateWizard from '@/components/modules/org/manage/events/create.vue';

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

// owner > admin > everyone else (mirrors OrganizationController::roleLevel).
const ROLE_LEVEL = { owner: 3, admin: 2 };
const roleLevel = (role) => (role ? ROLE_LEVEL[role] ?? 1 : 0);
const ASSIGNABLE_ROLES = ['owner', 'admin', 'event_manager', 'financial', 'marketing'];

// Org permission matrix shown in the Roles panel (keep in sync with the API:
// OrganizationController canManage/roleLevel and EventPermissions).
const ORG_PERM_KEYS = [
  'manage_members', 'manage_org', 'billing', 'manage_events', 'delete_events',
  'event_registrations', 'event_form_data', 'event_payments', 'event_results', 'event_news',
];
const ORG_ROLE_PERMS = {
  owner: ORG_PERM_KEYS,
  admin: ORG_PERM_KEYS,
  event_manager: ['manage_events', 'event_registrations', 'event_form_data', 'event_payments', 'event_results', 'event_news'],
  financial: ['billing', 'event_registrations', 'event_payments'],
  marketing: ['event_results', 'event_news'],
};

const ORG_ACTIVITY_ICONS = {
  member_added: 'user-plus', member_joined_invite: 'user-plus', invite_sent: 'paper-plane',
  role_changed: 'id-badge', member_removed: 'user-minus', member_left: 'right-from-bracket',
  event_created: 'calendar-plus', event_published: 'bullhorn', event_started: 'play',
  event_finished: 'flag-checkered', event_deleted: 'trash',
};

const ROLE_CLASS = {
  owner: 'owner',
  admin: 'admin',
  event_manager: 'manager',
  financial: 'staff',
  marketing: 'marketing',
};

export default {
  components: { EhubMgmtLayout, EhubActivityLog, EhubStatCard, EventCreateWizard, EhubRolePermissionsTable, EhubDialog, EhubConfirmNameDialog, EhubInviteCard, EhubLeaveCard, EhubColorPicker, EhubProfileImageUpload },

  props: {
    forceOption: { type: Array, default: () => [] },
  },

  data() {
    const forced = this.forceOption?.[0] ?? null;
    const panelMap = { general: 'settings', events: 'events', finances: 'financeiro', members: 'members', roles: 'roles', activity: 'activity', reports: 'reports', settings: 'settings', overview: 'overview', financeiro: 'financeiro' };
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
      removeTarget: null,
      evBusy: null,
      evDelete: null,
      activities: [],
      activitiesTotal: 0,
      activitiesPage: 1,
      activitiesLoading: false,
      leaveOpen: false,
      inviteSending: false,

      // settings panel
      settingsForm: { name: '', description: '', founded_at: '', instagram: '', facebook: '', x_twitter: '', website: '', color: '' },
      settingsSaving: false,
      visualSaving: false,
      logoFile: null,
      logoVersion: Date.now(),
      coverFile: null,
      coverVersion: Date.now(),

      // financeiro
      finBilling: null,
      finBillingLoading: false,
      finGateways: [],
      finGatewaysLoading: false,
      finLoaded: false,
      finConnecting: null,
      finDisconnecting: null,
      finSelectedInvoice: null,
      finInvoiceLoading: false,
      finSettingUpCard: false,

      // reports
      repTab: 'standard',
      customReports: [],
      repNewForm: false,
      repNewName: '',
      repNewType: 'registrations',
      repNewPeriod: '30d',
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
      return this.org?.my_user_id || null;
    },
    myRole() {
      return this.org?.role || null;
    },
    /** Event abilities for this user (EventPermissions on the API). */
    evPerms() {
      return this.org?.event_permissions || { panels: [], abilities: [] };
    },
    activitiesWithIcons() {
      return this.activities.map((a) => ({ ...a, icon: ORG_ACTIVITY_ICONS[a.type] || 'clock-rotate-left' }));
    },
    isOnlyOwner() {
      return this.myRole === 'owner' && this.members.filter((m) => m.role === 'owner').length <= 1;
    },
    orgPermKeys() {
      return ORG_PERM_KEYS;
    },
    /** Static matrix of what each org role can do (mirrors the API rules). */
    orgRolesMatrix() {
      return Object.entries(ORG_ROLE_PERMS).map(([name, perms], i) => {
        const own = Object.fromEntries(ORG_PERM_KEYS.map((k) => [k, perms.includes(k)]));
        return { id: name, name, parent_id: i === 0 ? null : 'owner', own, effective: own };
      });
    },
    /** Roles I may give: below my own level; owners may also appoint co-owners. */
    assignableRoles() {
      return ASSIGNABLE_ROLES.filter((r) => roleLevel(r) < roleLevel(this.myRole) || (r === 'owner' && this.myRole === 'owner'));
    },
    standardReports() {
      return [
        { key: 'registrations', icon: 'user-plus', bg: 'var(--ehub-primary-tint)', color: 'var(--ehub-primary)' },
        { key: 'revenue', icon: 'dollar-sign', bg: 'color-mix(in srgb, #1f8a5b 14%, transparent)', color: '#1f8a5b' },
        { key: 'members', icon: 'users', bg: 'color-mix(in srgb, var(--ehub-gold) 18%, transparent)', color: 'color-mix(in srgb, var(--ehub-gold), #000 28%)' },
        { key: 'events', icon: 'calendar-days', bg: 'color-mix(in srgb, #7C3AED 14%, transparent)', color: '#7C3AED' },
      ];
    },
    navItems() {
      const t = (k) => this.$t('pages.organization.manage.nav.' + k);
      return [
        { key: 'overview', icon: 'chart-line', label: t('overview') },
        { key: 'events', icon: 'calendar-days', label: t('events') },
        { key: 'members', icon: 'users', label: t('members') },
        { key: 'roles', icon: 'shield-halved', label: t('roles') },
        { key: 'activity', icon: 'clock-rotate-left', label: t('activity') },
        { key: 'financeiro', icon: 'file-invoice-dollar', label: t('financeiro') },
        { key: 'reports', icon: 'chart-bar', label: t('reports') },
        { key: 'settings', icon: 'gear', label: t('settings') },
      ];
    },
    navLinks() {
      return [
        { to: `/org/${this.orgRoute}`, icon: 'arrow-up-right-from-square', label: this.$t('pages.organization.manage.nav.public') },
        { to: '/my-orgs', icon: 'arrow-left', label: this.$t('pages.organization.manage.nav.back') },
      ];
    },
  },

  watch: {
    forceOption(val) {
      const panelMap = { general: 'settings', events: 'events', finances: 'financeiro', members: 'members', roles: 'roles', activity: 'activity', reports: 'reports', settings: 'settings', overview: 'overview', financeiro: 'financeiro' };
      const panel = panelMap[val?.[0]] ?? 'overview';
      this.activePanel = panel;
      if (panel === 'financeiro' && !this.finLoaded) this.loadFinances();
    },
  },

  async created() {
    await this.loadOrg();
    await this.loadEvents();
    await this.loadMembers();
    this.loadActivities();
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

    async removeLogoImage() {
      const result = await Organization.removeLogo(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.logo_removed'));
        this.org.logo_image = null;
        this.logoVersion = Date.now();
        this.logoFile = null;
        this.$refs.logoUpload?.reset();
      } else {
        toast.error(this.$t('pages.organization.manage.settings.remove_error'));
      }
    },
    async removeCoverImage() {
      const result = await Organization.removeCover(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.settings.cover_removed'));
        this.org.cover_image = null;
        this.coverVersion = Date.now();
        this.coverFile = null;
        this.$refs.coverUpload?.reset();
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
        this.settingsForm.founded_at = result.data.founded_at ? result.data.founded_at.slice(0, 7) : '';
        this.settingsForm.instagram = result.data.instagram || '';
        this.settingsForm.facebook = result.data.facebook || '';
        this.settingsForm.x_twitter = result.data.x_twitter || '';
        this.settingsForm.website = result.data.website || '';
        this.settingsForm.color = result.data.color || '';
      }
    },

    async switchPanel(panel) {
      this.activePanel = panel;
      const routeMap = {
        overview: 'manage-organization',
        events: 'manage-organization-events',
        members: 'manage-organization-members',
        roles: 'manage-organization-roles',
        activity: 'manage-organization-activity',
        financeiro: 'manage-organization-finances',
        reports: 'manage-organization-reports',
        settings: 'manage-organization-settings',
      };
      const routeName = routeMap[panel];
      if (routeName && this.$route.name !== routeName) {
        this.$router.replace({ name: routeName, params: { orgRoute: this.orgRoute } });
      }
      if (panel === 'events' && !this.events.length) await this.loadEvents();
      if (panel === 'members' && !this.members.length) await this.loadMembers();
      if (panel === 'activity' && !this.activities.length) await this.loadActivities();
      if (panel === 'financeiro' && !this.finLoaded) await this.loadFinances();
    },

    async loadActivities(page = 1) {
      this.activitiesLoading = true;
      const res = await Organization.getActivities(this.orgRoute, page, 20);
      this.activitiesLoading = false;
      if (res.code !== 200) return;
      this.activities = page === 1 ? (res.data || []) : [...this.activities, ...(res.data || [])];
      this.activitiesTotal = res.total;
      this.activitiesPage = page;
    },
    roleLabel(role) {
      return role ? this.$t('pages.organization.manage.roles.' + role) : '';
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
      if (ev.publication === 'draft') return 'draft';
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

    canEv(ability) { return this.evPerms.abilities.includes(ability); },
    canOpenEvent() { return this.evPerms.panels.length > 0; },
    canEditEvent(ev) { return this.canEv('event.manage') && !ev.initialized; },

    memberSince(m) {
      const d = m.joined_at || m.created_at;
      return d ? new Intl.DateTimeFormat(this.$i18n.locale, { month: 'short', year: 'numeric' }).format(new Date(d)) : '—';
    },

    /** I can change/remove a member only if they are below me and not myself. */
    canTouch(m) {
      return !!this.myUserId && m.user?.id !== this.myUserId && roleLevel(m.role) < roleLevel(this.myRole);
    },

    memberError(result, fallbackKey) {
      const msg = typeof result.data === 'string' ? result.data : result.data?.message;
      const key = 'pages.organization.manage.members.err.' + msg;
      return this.$te(key) ? this.$t(key) : this.$t('pages.organization.manage.members.' + fallbackKey);
    },

    async leaveOrg() {
      this.leaveOpen = false;
      const result = await Organization.leaveOrganization(this.orgRoute);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.members.left'));
        this.$router.push('/my-orgs');
      } else {
        toast.error(this.memberError(result, 'leave_error'));
      }
    },

    async sendInvite({ identifier, role, reset }) {
      this.inviteSending = true;
      const result = await Organization.addMember(this.orgRoute, identifier, role);
      this.inviteSending = false;
      if (result.code === 200 || result.code === 201) {
        toast.success(this.$t('pages.organization.manage.members.invited'));
        reset();
        await this.loadMembers();
      } else {
        toast.error(this.memberError(result, 'invite_error'));
      }
    },

    async removeMember(member) {
      this.removeTarget = null;
      const result = await Organization.removeMember(this.orgRoute, member.user.id);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.members.removed'));
        await this.loadMembers();
      } else {
        toast.error(this.memberError(result, 'remove_error'));
      }
    },

    async updateRole(member, role) {
      const result = await Organization.updateMemberRole(this.orgRoute, member.user.id, role);
      if (result.code === 200) {
        toast.success(this.$t('pages.organization.manage.members.role_updated'));
        member.role = role;
      } else {
        toast.error(this.memberError(result, 'role_error'));
        await this.loadMembers(); // reset the select to the stored role
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
              this.org.logo_image = 'org/' + this.orgRoute + '/logo.webp';
              this.$refs.logoUpload?.reset();
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
              this.org.cover_image = 'org/' + this.orgRoute + '/cover.webp';
              this.$refs.coverUpload?.reset();
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
      const payload = { ...this.settingsForm, founded_at: this.settingsForm.founded_at ? this.settingsForm.founded_at + '-01' : null };
      const result = await Organization.updateProfile(this.orgRoute, payload);
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
        this.$router.push('/my-orgs');
      } else {
        toast.error(this.$t('pages.organization.manage.settings.delete_error'));
      }
    },

    goToEvent(ev) {
      if (ev.publication === 'draft' && this.canEditEvent(ev)) {
        this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.orgRoute, eventRoute: ev.route } });
        return;
      }
      if (this.canOpenEvent()) this.$router.push(`/org/${this.orgRoute}/event/${ev.route}/manage`);
    },
    manageEvent(ev) {
      this.$router.push(`/org/${this.orgRoute}/event/${ev.route}/manage`);
    },
    editEvent(ev) {
      this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.orgRoute, eventRoute: ev.route } });
    },
    async duplicateEvent(ev) {
      if (this.evBusy) return;
      this.evBusy = ev.route;
      const res = await OrganizationEvent.duplicate(this.orgRoute, ev.route);
      this.evBusy = null;
      if (res.code === 201) {
        toast.success(this.$t('pages.organization.manage.events.duplicated'));
        this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.orgRoute, eventRoute: res.data.route } });
      } else {
        toast.error(this.$t('pages.organization.manage.events.action_error'));
      }
    },
    async deleteEvent() {
      const ev = this.evDelete;
      if (!ev) return;
      this.evBusy = ev.route;
      const res = await OrganizationEvent.destroy(this.orgRoute, ev.route);
      this.evBusy = null;
      if (res.code === 200) {
        this.evDelete = null;
        this.events = this.events.filter((e) => e.route !== ev.route);
        toast.success(this.$t('pages.organization.manage.events.deleted'));
      } else {
        toast.error(this.$t('pages.organization.manage.events.action_error'));
      }
    },

    goCreateEvent() {
      this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.orgRoute } });
    },

    // ── Financeiro ──────────────────────────────────────────────────────
    async loadFinances() {
      this.finBillingLoading = true;
      this.finGatewaysLoading = true;
      const [billingRes, gwRes] = await Promise.all([
        OrganizationBilling.getBilling(this.orgRoute),
        OrganizationBilling.getGateways(this.orgRoute),
      ]);
      this.finBillingLoading = false;
      this.finGatewaysLoading = false;
      this.finLoaded = true;
      if (billingRes.code === 200) this.finBilling = billingRes.data;
      if (gwRes.code === 200 && Array.isArray(gwRes.data)) this.finGateways = gwRes.data;
      const connected = this.$route?.query?.connected;
      if (connected) {
        toast.success(this.$t('finances.gateways.connect_success', { gateway: connected.replace('_', ' ') }));
        this.$router.replace({ query: {} });
      }
    },

    finGateway(gw) { return this.finGateways.find(g => g.gateway === gw) ?? null; },

    async finConnect(gateway) {
      this.finConnecting = gateway;
      const result = await OrganizationBilling.connectGateway(this.orgRoute, gateway);
      this.finConnecting = null;
      if (result.code === 200 && result.url) window.location.href = result.url;
    },

    async finDisconnect(gateway) {
      if (!confirm(this.$t('pages.organization.manage.financeiro.gw_confirm_disconnect'))) return;
      this.finDisconnecting = gateway;
      const result = await OrganizationBilling.disconnectGateway(this.orgRoute, gateway);
      this.finDisconnecting = null;
      if (result.code === 200) this.finGateways = this.finGateways.filter(g => g.gateway !== gateway);
    },

    async finSetupCard() {
      this.finSettingUpCard = true;
      const returnUrl = window.location.origin + '/org/' + this.orgRoute + '/manage';
      const res = await OrganizationBilling.getStripePortal(this.orgRoute, returnUrl);
      this.finSettingUpCard = false;
      if (res.code === 200 && res.url) {
        window.location.href = res.url;
      }
    },

    async finOpenInvoice(cycle) {
      this.finSelectedInvoice = { billing_cycle: cycle, items: [] };
      this.finInvoiceLoading = true;
      const result = await OrganizationBilling.getInvoice(this.orgRoute, cycle);
      this.finInvoiceLoading = false;
      if (result.code === 200) this.finSelectedInvoice = result.data;
    },

    finFormatAmount(val) {
      return parseFloat(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    },

    // ── Reports ─────────────────────────────────────────────────────────
    repAddReport() {
      if (!this.repNewName.trim()) return;
      this.customReports.push({
        id: Date.now(),
        name: this.repNewName.trim(),
        type: this.repNewType,
        period: this.repNewPeriod,
      });
      this.repNewForm = false;
      this.repNewName = '';
    },

    repDeleteReport(id) {
      this.customReports = this.customReports.filter(r => r.id !== id);
    },
  },
};
</script>

<template>
  <EventCreateWizard v-if="$route.name === 'manage-organization-events-create'" :show="true" :force-option="forceOption" />

  <EhubMgmtLayout
    v-else
    :name="org?.name || ''"
    :subtitle="org?.category || ''"
    :logo-url="org?.logo_image ? orgLogoUrl : ''"
    :initials="orgInitials"
    :logo-bg="orgGrad"
    :loading="loading"
    :items="navItems"
    :active="activePanel"
    :links="navLinks"
    @select="switchPanel"
  >

      <!-- ═══ OVERVIEW ═══ -->
      <section v-show="activePanel === 'overview'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.overview.title') }}</h1>
            <p>{{ $t('pages.organization.manage.overview.sub') }}</p>
          </div>
          <div class="spacer"></div>
          <button v-if="canEv('event.manage')" class="btn btn-primary round px-3" @click="goCreateEvent">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.organization.manage.overview.new_event') }}
          </button>
        </div>

        <!-- Stat cards -->
        <div class="stat-grid">
          <EhubStatCard
            :icon="['fas', 'calendar-check']"
            icon-class="primary"
            :value="activeEvents"
            :label="$t('pages.organization.manage.overview.stats.active')"
            :delta="String(activeEvents)"
            :delta-icon="['fas', 'arrow-trend-up']"
            delta-class="up"
          />
          <EhubStatCard
            :icon="['fas', 'users']"
            icon-class="gold"
            :value="org?.members_count ?? '—'"
            :label="$t('pages.organization.manage.overview.stats.members')"
          />
          <EhubStatCard
            :icon="['fas', 'flag-checkered']"
            icon-class="purple"
            :value="org?.events_count ?? '—'"
            :label="$t('pages.organization.manage.overview.stats.total_events')"
          />
          <EhubStatCard
            :icon="['fas', 'flag']"
            icon-class="green"
            :value="events.filter(e => !e.finished && isUpcoming(e)).length || '—'"
            :label="$t('pages.organization.manage.overview.stats.next')"
          />
        </div>

        <!-- 2-col -->
        <div class="dash-grid">
          <!-- Recent events -->
          <div class="cc">
            <div class="cc-hd">
              <h3><font-awesome-icon :icon="['fas', 'calendar-days']" class="me-2" style="color:var(--ehub-primary)" />{{ $t('pages.organization.manage.overview.recent') }}</h3>
              <button class="cc-link" @click="switchPanel('events')">{{ $t('pages.organization.manage.overview.see_all') }}</button>
            </div>
            <div v-if="!events.length && !eventsLoading" class="cc-empty">
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
            <div v-if="!members.length && !membersLoading" class="cc-empty">
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
        <div style="margin-top:16px">
          <EhubActivityLog
            :title="$t('pages.organization.manage.activity.title')"
            :activities="activitiesWithIcons.slice(0, 8)"
            :loading="activitiesLoading && !activities.length"
            :empty-label="$t('pages.organization.manage.activity.empty')"
            :show-more="activitiesTotal > 8"
            :view-more-label="$t('pages.organization.manage.overview.see_all')"
            @view-more="switchPanel('activity')"
          >
            <template #text="{ activity: a }">
              <i18n-t :keypath="'pages.organization.manage.activity.' + a.type" tag="span" scope="global">
                <template #actor><strong>{{ a.params?.actor }}</strong></template>
                <template #target><strong>{{ a.params?.target }}</strong></template>
                <template #name><strong>{{ a.params?.name }}</strong></template>
                <template #role>{{ roleLabel(a.params?.role) }}</template>
                <template #old_role>{{ roleLabel(a.params?.old_role) }}</template>
                <template #new_role>{{ roleLabel(a.params?.new_role) }}</template>
              </i18n-t>
            </template>
          </EhubActivityLog>
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
          <button v-if="canEv('event.manage')" class="btn btn-primary round px-3" @click="goCreateEvent">
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
              <tr v-for="ev in filteredEvents" :key="ev.route" :style="{ cursor: canOpenEvent() ? 'pointer' : 'default' }" @click="goToEvent(ev)">
                <td class="td-name">{{ ev.name }}</td>
                <td class="td-muted">{{ fmtDate(ev.start_at) }}</td>
                <td class="td-muted">
                  <span v-if="ev.max_registrations">{{ ev.registrations_count ?? 0 }}/{{ ev.max_registrations }}</span>
                  <span v-else>{{ ev.registrations_count ?? 0 }}</span>
                </td>
                <td><span class="s-badge" :class="eventStatus(ev)">{{ $t('pages.organization.manage.events.status.' + eventStatus(ev)) }}</span></td>
                <td @click.stop>
                  <div class="act-row">
                    <button v-if="canOpenEvent()" class="act-btn" :title="$t('pages.organization.manage.events.manage_btn')" @click="manageEvent(ev)">
                      <font-awesome-icon :icon="['fas', 'sliders']" />
                    </button>
                    <button v-if="canEditEvent(ev)" class="act-btn" :title="$t('pages.organization.manage.events.edit_btn')" @click="editEvent(ev)">
                      <font-awesome-icon :icon="['fas', 'pen']" />
                    </button>
                    <button v-if="canEv('event.manage')" class="act-btn" :title="$t('pages.organization.manage.events.duplicate_btn')" :disabled="evBusy === ev.route" @click="duplicateEvent(ev)">
                      <font-awesome-icon :icon="['fas', 'copy']" />
                    </button>
                    <button v-if="canEv('event.delete') && !(ev.initialized && !ev.finished)" class="act-btn del" :title="$t('pages.organization.manage.events.delete_btn')" @click="evDelete = ev">
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ═══ MEMBERS (same structure as team roster) ═══ -->
      <section v-show="activePanel === 'members'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.nav.members') }}</h1>
            <p>{{ $t('pages.organization.manage.members.sub', { n: members.length }) }}</p>
          </div>
        </div>

        <div class="sec-bar">
          <div class="input-group input-group-sm" style="max-width:220px">
            <span class="input-group-text"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></span>
            <input type="text" class="form-control" v-model="mbSearch" :placeholder="$t('pages.organization.manage.members.search')" />
          </div>
          <div class="role-seg">
            <button v-for="r in ['all','owner','admin','event_manager','financial','marketing']" :key="r"
              :class="{ active: mbRoleFilter === r }" @click="mbRoleFilter = r">
              {{ r === 'all' ? $t('pages.organization.manage.members.all') : $t('pages.organization.manage.roles.' + r) }}
            </button>
          </div>
        </div>

        <div class="cc" style="margin-bottom:16px">
          <div v-if="membersLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
          <table v-else class="mgmt-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.organization.manage.members.tbl.member') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.handle') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.role') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.since') }}</th>
                <th>{{ $t('pages.organization.manage.members.tbl.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredMembers.length === 0">
                <td colspan="5" class="text-center td-muted py-4">{{ $t('pages.organization.manage.members.empty') }}</td>
              </tr>
              <tr v-for="m in filteredMembers" :key="m.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="m-av" :style="{ background: memberGrad(m) }">
                      <img v-if="memberAvatarUrl(m)" :src="memberAvatarUrl(m)" class="m-av-img" :alt="memberName(m)" @error="$event.target.style.display='none'" />
                      <span v-else>{{ memberInitials(m) }}</span>
                    </div>
                    <span class="td-name" style="font-size:.87rem">{{ memberName(m) }}</span>
                  </div>
                </td>
                <td class="td-muted">@{{ m.user?.username }}</td>
                <td>
                  <select v-if="canTouch(m)" class="form-select form-select-sm" style="max-width:170px;font-size:.8rem" :value="m.role" @change="updateRole(m, $event.target.value)">
                    <option v-for="r in assignableRoles" :key="r" :value="r">{{ $t('pages.organization.manage.roles.' + r) }}</option>
                  </select>
                  <span v-else class="role-chip" :class="roleClass(m.role)">{{ $t('pages.organization.manage.roles.' + m.role) }}</span>
                </td>
                <td class="td-muted">{{ memberSince(m) }}</td>
                <td>
                  <div class="act-row">
                    <button v-if="canTouch(m)" class="act-btn del" @click="removeTarget = m" :title="$t('pages.organization.manage.members.remove')">
                      <font-awesome-icon :icon="['fas', 'xmark']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Invite (e-mail or username) -->
        <EhubInviteCard
          v-if="assignableRoles.length"
          :title="$t('pages.organization.manage.members.invite_title')"
          :description="$t('pages.organization.manage.members.invite_sub')"
          :placeholder="$t('pages.organization.manage.members.invite_ph')"
          :button-label="$t('pages.organization.manage.members.invite_send')"
          :roles="assignableRoles.map((r) => ({ value: r, label: $t('pages.organization.manage.roles.' + r) }))"
          :loading="inviteSending"
          @submit="sendInvite"
        />

        <!-- Danger zone -->
        <EhubLeaveCard
          :title="$t('pages.organization.manage.members.danger')"
          :description="$t('pages.organization.manage.members.leave_desc')"
          :button-label="$t('pages.organization.manage.members.leave')"
          :disabled="isOnlyOwner"
          :disabled-message="$t('pages.organization.manage.members.leave_only_owner')"
          @leave="leaveOpen = true"
        />
      </section>

      <EhubDialog :model-value="!!removeTarget" :title="$t('pages.organization.manage.members.remove_title')" icon="user-minus" centered size="sm" @close="removeTarget = null">
        <p class="m-0" style="font-size:.9rem">{{ $t('pages.organization.manage.members.remove_q', { name: removeTarget ? memberName(removeTarget) : '' }) }}</p>
        <template #footer>
          <button class="btn btn-outline-secondary round px-3" @click="removeTarget = null">{{ $t('pages.organization.manage.members.cancel') }}</button>
          <button class="btn btn-danger round px-3" @click="removeMember(removeTarget)">{{ $t('pages.organization.manage.members.remove') }}</button>
        </template>
      </EhubDialog>

      <EhubDialog v-model="leaveOpen" :title="$t('pages.organization.manage.members.leave')" icon="right-from-bracket" tone="muted" centered size="sm">
        <p class="m-0" style="font-size:.9rem">{{ $t('pages.organization.manage.members.leave_q') }}</p>
        <template #footer>
          <button class="btn btn-outline-secondary round px-3" @click="leaveOpen = false">{{ $t('pages.organization.manage.members.cancel') }}</button>
          <button class="btn btn-danger round px-3" @click="leaveOrg">{{ $t('pages.organization.manage.members.leave') }}</button>
        </template>
      </EhubDialog>

      <EhubConfirmNameDialog
        :model-value="!!evDelete"
        :title="$t('pages.organization.manage.events.delete_btn')"
        :message="$t('pages.event.manage.adv.del_confirm_msg')"
        :name="evDelete?.name || ''"
        :type-label="$t('pages.event.manage.adv.type_name_hint', { n: evDelete?.name || '' })"
        :confirm-label="$t('pages.event.manage.adv.del_btn')"
        :cancel-label="$t('pages.organization.manage.members.cancel')"
        :loading="!!evBusy"
        @update:model-value="(v) => { if (!v) evDelete = null; }"
        @confirm="deleteEvent"
      />

      <!-- ═══ ACTIVITY (same component as teams) ═══ -->
      <section v-show="activePanel === 'activity'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.activity.title') }}</h1>
            <p>{{ $t('pages.organization.manage.activity.sub', { n: activitiesTotal }) }}</p>
          </div>
        </div>
        <EhubActivityLog
          :title="$t('pages.organization.manage.activity.history')"
          :activities="activitiesWithIcons"
          :loading="activitiesLoading && !activities.length"
          :empty-label="$t('pages.organization.manage.activity.empty')"
        >
            <template #text="{ activity: a }">
              <i18n-t :keypath="'pages.organization.manage.activity.' + a.type" tag="span" scope="global">
                <template #actor><strong>{{ a.params?.actor }}</strong></template>
                <template #target><strong>{{ a.params?.target }}</strong></template>
                <template #name><strong>{{ a.params?.name }}</strong></template>
                <template #role>{{ roleLabel(a.params?.role) }}</template>
                <template #old_role>{{ roleLabel(a.params?.old_role) }}</template>
                <template #new_role>{{ roleLabel(a.params?.new_role) }}</template>
              </i18n-t>
            </template>
        </EhubActivityLog>
        <div v-if="activities.length < activitiesTotal" class="text-center mt-3">
          <button class="btn btn-outline-secondary round px-4" :disabled="activitiesLoading" @click="loadActivities(activitiesPage + 1)">
            <span v-if="activitiesLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ $t('pages.organization.manage.activity.load_more') }}
          </button>
        </div>
      </section>

      <!-- ═══ ROLES (permission matrix, same component as teams) ═══ -->
      <section v-show="activePanel === 'roles'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.roles_panel.title') }}</h1>
            <p>{{ $t('pages.organization.manage.roles_panel.sub') }}</p>
          </div>
        </div>
        <EhubRolePermissionsTable
          :roles="orgRolesMatrix"
          :perm-keys="orgPermKeys"
          role-prefix="pages.organization.manage.roles"
          perm-prefix="pages.organization.manage.roles_panel.permissions"
          :col-label="$t('pages.organization.manage.members.tbl.role')"
          :granted-label="$t('pages.organization.manage.roles_panel.granted')"
:show-inherited="false"
          :denied-label="$t('pages.organization.manage.roles_panel.denied')"
        />
      </section>

      <!-- ═══ FINANCEIRO ═══ -->
      <section v-show="activePanel === 'financeiro'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.financeiro.title') }}</h1>
            <p>{{ $t('pages.organization.manage.financeiro.sub') }}</p>
          </div>
        </div>

        <div v-if="finBilling?.billing_blocked" class="alert alert-danger d-flex gap-2 align-items-center mb-4" style="font-size:.85rem">
          <font-awesome-icon :icon="['fas', 'ban']" class="flex-shrink-0" />
          <span>{{ $t('pages.organization.manage.financeiro.billing_blocked') }}</span>
        </div>

        <!-- Volumetria -->
        <div class="set-card" style="padding:0;overflow:hidden;margin-bottom:16px">
          <div class="fin-vol-hd" style="padding:18px 24px 14px">
            <span class="fin-sec-title">{{ $t('pages.organization.manage.financeiro.vol_title') }}</span>
            <p class="set-desc mb-0">{{ $t('pages.organization.manage.financeiro.vol_desc') }}</p>
          </div>
          <div v-if="finBillingLoading" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          <template v-else>
            <div class="vol-banner" :style="{ background: orgGrad }">
              <div class="vol-body">
                <div class="vol-period">{{ $t('pages.organization.manage.financeiro.vol_period') }}: {{ finBilling?.current_cycle || '—' }}</div>
                <div class="vol-title-text">{{ $t('pages.organization.manage.financeiro.vol_desc') }}</div>
                <div class="vol-metric-row">
                  <div>
                    <div class="vol-metric-val">{{ activeEvents }}</div>
                    <div class="vol-metric-lbl">{{ $t('pages.organization.manage.financeiro.vol_events') }}</div>
                  </div>
                  <div>
                    <div class="vol-metric-val">{{ finBilling?.pending_items ?? '—' }}</div>
                    <div class="vol-metric-lbl">{{ $t('pages.organization.manage.financeiro.vol_regs') }}</div>
                  </div>
                  <div>
                    <div class="vol-metric-val">{{ members.length || '—' }}</div>
                    <div class="vol-metric-lbl">{{ $t('pages.organization.manage.financeiro.vol_members') }}</div>
                  </div>
                </div>
              </div>
              <div class="vol-aside">
                <div class="vol-total-lbl">{{ $t('pages.organization.manage.financeiro.vol_total') }}</div>
                <div class="vol-total-val">R$ {{ finFormatAmount(finBilling?.pending_total) }}</div>
                <div class="vol-due">{{ $t('pages.organization.manage.financeiro.vol_due') }}: dia 5</div>
                <span class="vol-status-badge" :class="(finBilling?.pending_total ?? 0) > 0 ? 'pending' : 'paid'">
                  <font-awesome-icon :icon="['fas', (finBilling?.pending_total ?? 0) > 0 ? 'clock' : 'check']" />
                  {{ (finBilling?.pending_total ?? 0) > 0 ? $t('pages.organization.manage.financeiro.vol_pending') : $t('pages.organization.manage.financeiro.vol_paid') }}
                </span>
              </div>
            </div>
            <div v-if="finBilling?.invoices?.length" class="fin-inv-list">
              <div class="fin-inv-hd">{{ $t('pages.organization.manage.financeiro.history') }}</div>
              <div v-for="inv in finBilling.invoices" :key="inv.id" class="fin-inv-row" @click="finOpenInvoice(inv.billing_cycle)">
                <span class="fin-inv-cycle">{{ inv.billing_cycle }}</span>
                <span class="s-badge" :class="inv.status === 'paid' ? 'active' : inv.status === 'pending' ? 'upcoming' : 'finished'">
                  {{ $t('pages.organization.manage.financeiro.status_' + (inv.status || 'pending')) }}
                </span>
                <span style="flex:1"></span>
                <span class="fin-inv-amount">R$ {{ finFormatAmount(inv.total_amount) }}</span>
                <font-awesome-icon :icon="['fas', 'chevron-right']" style="color:var(--ehub-muted);font-size:.7rem" />
              </div>
            </div>
            <div v-else style="padding:16px 24px;font-size:.83rem;color:var(--ehub-muted)">{{ $t('pages.organization.manage.financeiro.no_invoices') }}</div>
          </template>
        </div>

        <!-- Cartão de Crédito -->
        <div class="set-card" style="margin-bottom:16px">
          <h3>{{ $t('pages.organization.manage.financeiro.card_title') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.financeiro.card_desc') }}</p>
          <div v-if="finBillingLoading" class="py-2"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          <div v-else class="d-flex align-items-center gap-3 flex-wrap">
            <div v-if="finBilling?.has_card" class="d-flex align-items-center gap-2" style="font-size:.87rem;color:var(--ehub-ink)">
              <font-awesome-icon :icon="['fas', 'credit-card']" style="color:var(--ehub-primary)" />
              {{ $t('pages.organization.manage.financeiro.card_registered') }}
            </div>
            <span v-else style="font-size:.83rem;color:var(--ehub-muted)">{{ $t('pages.organization.manage.financeiro.no_card') }}</span>
            <button class="btn btn-sm btn-outline-primary round px-3" :disabled="finSettingUpCard" @click="finSetupCard">
              <span v-if="finSettingUpCard" class="spinner-border spinner-border-sm me-1"></span>
              {{ finBilling?.has_card ? $t('pages.organization.manage.financeiro.change_card') : $t('pages.organization.manage.financeiro.add_card') }}
            </button>
          </div>
          <p class="mt-2 mb-0" style="font-size:.72rem;color:var(--ehub-muted)">{{ $t('pages.organization.manage.financeiro.card_notice') }}</p>
        </div>

        <!-- Gateways -->
        <div class="set-card">
          <h3>{{ $t('pages.organization.manage.financeiro.gw_title') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.financeiro.gw_desc') }}</p>
          <div v-if="finGatewaysLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          <div v-else class="fin-gw-grid">
            <!-- MercadoPago -->
            <div class="fin-gw-card">
              <div class="d-flex align-items-center gap-3" style="margin-bottom:14px">
                <div class="fin-gw-logo fin-gw-mp">MP</div>
                <div style="flex:1;min-width:0">
                  <div class="fin-gw-name">MercadoPago</div>
                  <div class="fin-gw-fees">{{ $t('pages.organization.manage.financeiro.mp_fees') }}</div>
                </div>
                <span v-if="finGateway('mercadopago')" class="s-badge active">
                  <font-awesome-icon :icon="['fas', 'check']" /> {{ $t('pages.organization.manage.financeiro.gw_connected') }}
                </span>
              </div>
              <button v-if="!finGateway('mercadopago')" class="btn btn-sm btn-primary w-100 round" :disabled="finConnecting === 'mercadopago'" @click="finConnect('mercadopago')">
                <span v-if="finConnecting === 'mercadopago'" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('pages.organization.manage.financeiro.gw_connect') }}
              </button>
              <button v-else class="btn btn-sm btn-outline-danger w-100 round" :disabled="finDisconnecting === 'mercadopago'" @click="finDisconnect('mercadopago')">
                <span v-if="finDisconnecting === 'mercadopago'" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('pages.organization.manage.financeiro.gw_disconnect') }}
              </button>
            </div>
            <!-- Stripe Connect -->
            <div class="fin-gw-card">
              <div class="d-flex align-items-center gap-3" style="margin-bottom:14px">
                <div class="fin-gw-logo fin-gw-sc">SC</div>
                <div style="flex:1;min-width:0">
                  <div class="fin-gw-name">Stripe</div>
                  <div class="fin-gw-fees">{{ $t('pages.organization.manage.financeiro.stripe_fees') }}</div>
                </div>
                <span v-if="finGateway('stripe_connect')" class="s-badge active">
                  <font-awesome-icon :icon="['fas', 'check']" /> {{ $t('pages.organization.manage.financeiro.gw_connected') }}
                </span>
              </div>
              <button v-if="!finGateway('stripe_connect')" class="btn btn-sm btn-primary w-100 round" :disabled="finConnecting === 'stripe_connect'" @click="finConnect('stripe_connect')">
                <span v-if="finConnecting === 'stripe_connect'" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('pages.organization.manage.financeiro.gw_connect') }}
              </button>
              <button v-else class="btn btn-sm btn-outline-danger w-100 round" :disabled="finDisconnecting === 'stripe_connect'" @click="finDisconnect('stripe_connect')">
                <span v-if="finDisconnecting === 'stripe_connect'" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('pages.organization.manage.financeiro.gw_disconnect') }}
              </button>
            </div>
          </div>
          <div v-if="finGateways.length === 0 && !finGatewaysLoading" class="alert alert-warning mt-3 mb-0 small">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
            {{ $t('pages.organization.manage.financeiro.gw_warning') }}
          </div>
        </div>

        <!-- Invoice detail modal -->
        <div v-if="finSelectedInvoice" class="fin-modal-overlay" @click.self="finSelectedInvoice = null">
          <div class="fin-modal-card">
            <div class="fin-modal-hd">
              <h5>{{ $t('pages.organization.manage.financeiro.invoice_detail', { cycle: finSelectedInvoice.billing_cycle }) }}</h5>
              <button class="btn-close" @click="finSelectedInvoice = null"></button>
            </div>
            <div class="fin-modal-body">
              <div v-if="finInvoiceLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="s-badge" :class="finSelectedInvoice.status === 'paid' ? 'active' : 'upcoming'">
                    {{ $t('pages.organization.manage.financeiro.status_' + (finSelectedInvoice.status || 'pending')) }}
                  </span>
                  <span style="font-weight:700;font-size:.95rem">R$ {{ finFormatAmount(finSelectedInvoice.total_amount) }}</span>
                </div>
                <div v-for="item in (finSelectedInvoice.items ?? [])" :key="item.id" class="fin-inv-item">
                  <span class="td-muted">{{ item.user?.name ?? '—' }}</span>
                  <span style="font-size:.83rem">{{ $t('finances.billing.type.' + item.billing_type) }}</span>
                  <span style="font-weight:600;font-size:.83rem">R$ {{ finFormatAmount(item.fee_amount) }}</span>
                </div>
                <div v-if="!finSelectedInvoice.items?.length" class="text-center py-3 td-muted" style="font-size:.83rem">
                  {{ $t('pages.organization.manage.financeiro.no_items') }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ REPORTS ═══ -->
      <section v-show="activePanel === 'reports'" class="mgmt-pane">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.organization.manage.reports.title') }}</h1>
            <p>{{ $t('pages.organization.manage.reports.sub') }}</p>
          </div>
          <div class="spacer"></div>
          <button v-if="repTab === 'custom'" class="btn btn-primary round px-3" @click="repNewForm = true">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.organization.manage.reports.new') }}
          </button>
        </div>

        <div class="sec-bar" style="margin-bottom:16px">
          <div class="role-seg">
            <button :class="{ active: repTab === 'standard' }" @click="repTab = 'standard'">{{ $t('pages.organization.manage.reports.standard') }}</button>
            <button :class="{ active: repTab === 'custom' }" @click="repTab = 'custom'">{{ $t('pages.organization.manage.reports.custom') }}</button>
          </div>
        </div>

        <!-- Standard reports -->
        <div v-show="repTab === 'standard'" class="rep-grid">
          <div v-for="rep in standardReports" :key="rep.key" class="rep-card">
            <div class="rep-card-ico" :style="{ background: rep.bg, color: rep.color }">
              <font-awesome-icon :icon="['fas', rep.icon]" />
            </div>
            <h4>{{ $t('pages.organization.manage.reports.type_' + rep.key) }}</h4>
            <p>{{ $t('pages.organization.manage.reports.type_' + rep.key + '_desc') }}</p>
            <div class="rep-card-foot">
              <span class="rep-last">{{ $t('pages.organization.manage.reports.never') }}</span>
              <button class="btn btn-sm btn-outline-secondary round px-3" disabled>
                {{ $t('pages.organization.manage.reports.generate') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Custom reports -->
        <div v-show="repTab === 'custom'">
          <div v-if="repNewForm" class="cc mb-3" style="padding:18px 20px">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label set-label">{{ $t('pages.organization.manage.reports.form_name') }}</label>
                <input type="text" class="form-control" v-model="repNewName" :placeholder="$t('pages.organization.manage.reports.form_name_ph')" />
              </div>
              <div class="col-md-4">
                <label class="form-label set-label">{{ $t('pages.organization.manage.reports.form_type') }}</label>
                <select class="form-select" v-model="repNewType">
                  <option value="registrations">{{ $t('pages.organization.manage.reports.type_registrations') }}</option>
                  <option value="revenue">{{ $t('pages.organization.manage.reports.type_revenue') }}</option>
                  <option value="members">{{ $t('pages.organization.manage.reports.type_members') }}</option>
                  <option value="events">{{ $t('pages.organization.manage.reports.type_events') }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label set-label">{{ $t('pages.organization.manage.reports.form_period') }}</label>
                <select class="form-select" v-model="repNewPeriod">
                  <option value="30d">{{ $t('pages.organization.manage.reports.per30') }}</option>
                  <option value="90d">{{ $t('pages.organization.manage.reports.per90') }}</option>
                  <option value="365d">{{ $t('pages.organization.manage.reports.per365') }}</option>
                </select>
              </div>
              <div class="col-12 d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary round px-3" @click="repNewForm = false; repNewName = ''">{{ $t('pages.organization.manage.members.cancel') }}</button>
                <button class="btn btn-primary round px-4" @click="repAddReport">{{ $t('pages.organization.manage.reports.create') }}</button>
              </div>
            </div>
          </div>

          <div v-if="!customReports.length" class="empty-state">
            <div class="ico"><font-awesome-icon :icon="['fas', 'chart-bar']" /></div>
            <p>{{ $t('pages.organization.manage.reports.no_custom') }}</p>
            <button class="btn btn-primary round px-4 mt-2" @click="repNewForm = true">
              <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
              {{ $t('pages.organization.manage.reports.new') }}
            </button>
          </div>

          <div v-else class="cc">
            <table class="mgmt-tbl">
              <thead>
                <tr>
                  <th>{{ $t('pages.organization.manage.reports.col_name') }}</th>
                  <th>{{ $t('pages.organization.manage.reports.col_type') }}</th>
                  <th>{{ $t('pages.organization.manage.reports.col_period') }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in customReports" :key="r.id">
                  <td class="td-name">{{ r.name }}</td>
                  <td class="td-muted">{{ $t('pages.organization.manage.reports.type_' + r.type) }}</td>
                  <td class="td-muted">{{ $t('pages.organization.manage.reports.per' + r.period.replace('d', '')) }}</td>
                  <td>
                    <div class="act-row">
                      <button class="act-btn del" @click="repDeleteReport(r.id)">
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
            <div class="col-md-6">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.founded_at') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.founded_at_hint') }}</p>
              <input type="month" class="form-control" v-model="settingsForm.founded_at" />
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

            <!-- Color (same components as team settings) -->
            <div class="col-12">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.color') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.color_desc') }}</p>
              <EhubColorPicker v-model="settingsForm.color" />
            </div>

            <div class="col-md-6">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.logo_upload') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.logo_hint') }}</p>
              <EhubProfileImageUpload
                ref="logoUpload"
                type="logo"
                :current-url="org?.logo_image ? orgLogoUrl : null"
                :fallback-style="{ background: orgGrad }"
                @change="logoFile = $event"
                @remove="removeLogoImage"
              >
                <template #fallback><span>{{ orgInitials }}</span></template>
              </EhubProfileImageUpload>
            </div>

            <div class="col-md-6">
              <label class="form-label set-label">{{ $t('pages.organization.manage.settings.cover_upload') }}</label>
              <p class="set-hint">{{ $t('pages.organization.manage.settings.cover_hint') }}</p>
              <EhubProfileImageUpload
                ref="coverUpload"
                type="cover"
                :current-url="org?.cover_image ? orgCoverUrl : null"
                :fallback-style="{ background: orgGrad }"
                @change="coverFile = $event"
                @remove="removeCoverImage"
              />
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

  </EhubMgmtLayout>
</template>

<style scoped>
.cc-link { font-size: .78rem; font-weight: 600; color: var(--ehub-primary); cursor: pointer; background: none; border: 0; padding: 0; }
.cc-link:hover { text-decoration: underline; }
.td-name { font-weight: 600; }
.set-desc { margin-bottom: 18px; }
.set-label { font-size: .82rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: 5px; }

/* ── Status badges ── */
.s-badge.active   { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
.s-badge.finished { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.s-badge.upcoming { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.s-badge.draft    { background: color-mix(in srgb, #f08c00 16%, transparent); color: #f08c00; }

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
.m-av-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.role-chip { font-size: .7rem; font-weight: 600; padding: 3px 9px; border-radius: 50rem; display: inline-block; white-space: nowrap; }
.role-chip.owner   { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.role-chip.admin   { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.role-chip.manager { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.role-chip.staff   { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.role-chip.marketing { background: color-mix(in srgb, #d6336c 14%, transparent); color: #d6336c; }
html[data-bs-theme="dark"] .role-chip.owner { color: var(--ehub-gold); }

/* ── Settings cards ── */

.set-hint { font-size: .78rem; color: var(--ehub-muted); margin: 0 0 10px; }


/* ── Financial panel ── */
.fin-sec-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: var(--ehub-muted); }
.vol-banner { padding: 22px 26px; color: #fff; display: flex; align-items: flex-start; gap: 28px; flex-wrap: wrap; }
.vol-body { flex: 1; min-width: 180px; }
.vol-period { font-size: .78rem; opacity: .8; margin-bottom: 2px; }
.vol-title-text { font-size: .96rem; font-weight: 700; margin-bottom: 16px; }
.vol-metric-row { display: flex; gap: 22px; flex-wrap: wrap; }
.vol-metric-val { font-size: 1.45rem; font-weight: 800; line-height: 1; }
.vol-metric-lbl { font-size: .7rem; opacity: .75; margin-top: 2px; }
.vol-aside { text-align: right; flex-shrink: 0; min-width: 130px; }
.vol-total-lbl { font-size: .74rem; opacity: .75; margin-bottom: 3px; }
.vol-total-val { font-size: 1.9rem; font-weight: 800; letter-spacing: -.03em; line-height: 1; margin-bottom: 5px; }
.vol-due { font-size: .72rem; opacity: .75; margin-bottom: 10px; }
.vol-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 700; padding: 4px 10px; border-radius: 50rem; }
.vol-status-badge.pending { background: rgba(255,255,255,.22); color: #fff; }
.vol-status-badge.paid    { background: rgba(16,185,129,.3); color: #6ee7b7; }
.fin-inv-list { border-top: 1px solid var(--ehub-line); }
.fin-inv-hd { font-size: .67rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 9px 24px; border-bottom: 1px solid var(--ehub-line); }
.fin-inv-row { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s; font-size: .87rem; }
.fin-inv-row:last-child { border-bottom: 0; }
.fin-inv-row:hover { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.fin-inv-cycle { font-weight: 600; width: 6rem; color: var(--ehub-ink); }
.fin-inv-amount { font-weight: 600; color: var(--ehub-ink); }
.fin-gw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 13px; }
.fin-gw-card { background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 12px; padding: 18px 20px; }
.fin-gw-logo { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: .82rem; flex-shrink: 0; letter-spacing: -.01em; }
.fin-gw-mp { background: rgba(0,158,227,.18); color: #009ee3; }
.fin-gw-sc { background: rgba(99,91,255,.16); color: #635bff; }
.fin-gw-name { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); }
.fin-gw-fees { font-size: .74rem; color: var(--ehub-muted); margin-top: 1px; }
.fin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }
.fin-modal-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); width: 100%; max-width: 480px; overflow: hidden; box-shadow: var(--ehub-shadow); }
.fin-modal-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--ehub-line); }
.fin-modal-hd h5 { font-size: .95rem; font-weight: 800; color: var(--ehub-ink); margin: 0; }
.fin-modal-body { padding: 18px 20px; max-height: 60vh; overflow-y: auto; }
.fin-inv-item { display: grid; grid-template-columns: 1fr 1fr auto; gap: .5rem; align-items: center; padding: .45rem 0; border-bottom: 1px solid var(--ehub-line); }
.fin-inv-item:last-child { border-bottom: 0; }

/* ── Reports panel ── */
.rep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; margin-bottom: 22px; }
.rep-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 20px 22px; display: flex; flex-direction: column; }
.rep-card-ico { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: .84rem; margin-bottom: 12px; flex-shrink: 0; }
.rep-card h4 { font-size: .9rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 5px; }
.rep-card p { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 14px; line-height: 1.45; flex: 1; }
.rep-card-foot { display: flex; align-items: center; gap: 7px; margin-top: auto; }
.rep-last { font-size: .72rem; color: var(--ehub-muted); flex: 1; }

</style>
