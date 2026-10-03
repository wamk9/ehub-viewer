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
import EhubVisualFields from '@/components/inputs/EhubVisualFields.vue';
import EhubCardSetupDialog from '@/components/modules/org/EhubCardSetupDialog.vue';
import EhubUsageChart from '@/components/modules/org/EhubUsageChart.vue';
import EhubReportBuilder from '@/components/EhubReportBuilder.vue';
import EhubFiscalDataDialog from '@/components/modules/org/EhubFiscalDataDialog.vue';
import EventCreateWizard from '@/components/modules/org/manage/events/create.vue';
import OrgNewsManager from '@/components/modules/org/manage/news/index.vue';

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
const ASSIGNABLE_ROLES = ['owner', 'admin', 'event_manager', 'financial', 'marketing', 'staff'];
// Same roles the API lets into reports.
const REPORT_ROLES = ['owner', 'admin', 'event_manager', 'financial'];

// Org permission matrix shown in the Roles panel (keep in sync with the API:
// OrganizationController canManage/roleLevel and EventPermissions).
const ORG_PERM_KEYS = [
  'manage_members', 'manage_org', 'billing', 'manage_events', 'delete_events',
  'event_registrations', 'event_form_data', 'event_payments', 'event_checkin', 'event_results_write', 'event_results', 'event_news', 'reports',
];
// Mirrors the API (EventPermissions + ReportController).
const ORG_ROLE_PERMS = {
  owner: ORG_PERM_KEYS,
  admin: ORG_PERM_KEYS,
  event_manager: ['manage_events', 'event_registrations', 'event_form_data', 'event_payments', 'event_checkin', 'event_results_write', 'event_results', 'event_news', 'reports'],
  financial: ['billing', 'event_registrations', 'event_payments', 'reports'],
  marketing: ['event_results', 'event_news'],
  staff: ['event_registrations', 'event_checkin', 'event_results_write', 'event_results'],
};

const ORG_ACTIVITY_ICONS = {
  org_created: 'building', member_added: 'user-plus', member_joined_invite: 'user-plus', invite_sent: 'paper-plane',
  role_changed: 'id-badge', member_removed: 'user-minus', member_left: 'right-from-bracket',
  event_created: 'calendar-plus', event_published: 'bullhorn', event_started: 'play',
  event_finished: 'flag', event_deleted: 'trash',
};

const ROLE_CLASS = {
  owner: 'owner',
  admin: 'admin',
  event_manager: 'manager',
  financial: 'staff',
  marketing: 'marketing',
  staff: 'helper',
};

export default {
  components: { OrgNewsManager, EhubMgmtLayout, EhubActivityLog, EhubStatCard, EventCreateWizard, EhubRolePermissionsTable, EhubDialog, EhubConfirmNameDialog, EhubInviteCard, EhubLeaveCard, EhubVisualFields, EhubCardSetupDialog, EhubUsageChart, EhubFiscalDataDialog, EhubReportBuilder },

  props: {
    forceOption: { type: Array, default: () => [] },
  },

  data() {
    const forced = this.forceOption?.[0] ?? null;
    const panelMap = { general: 'settings', events: 'events', finances: 'financeiro', members: 'members', roles: 'roles', activity: 'activity', news: 'news', reports: 'reports', settings: 'settings', overview: 'overview', financeiro: 'financeiro' };
    return {
      activePanel: panelMap[forced] ?? 'overview',
      F: 'pages.organization.manage.financeiro.',
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
      settingsForm: { name: '', description: '', founded_at: '', instagram: '', facebook: '', x_twitter: '', website: '', color: '', contact_email: '', phone: '' },
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
      finPaying: null,
      finCardOpen: false,
      finFiscalOpen: false,
      finConnecting: null,
      finDisconnecting: null,
      finSelectedInvoice: null,
      finInvoiceLoading: false,
      finSettingUpCard: false,

      // onboarding ("first steps") card
      welcome: false,
      onbDismissed: false,
      onbGateways: null,

      // reports (loaded the first time the panel opens)
      reportsOpened: false,
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
      // Filters match the status badge, so each event falls in exactly one of them.
      if (this.evFilter !== 'all') list = list.filter(e => this.eventStatus(e) === this.evFilter);
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
    // Invoices come newest first: the first one is the last closed month.
    finLastInvoice() { return this.finBilling?.invoices?.[0] || null; },
    finOlderInvoices() { return (this.finBilling?.invoices || []).slice(1); },
    finOpenInvoices() { return (this.finBilling?.invoices || []).filter((i) => this.finPayable(i)); },
    finOpenTotal() { return this.finOpenInvoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0); },
    finGatewayList() {
      return [
        { key: 'mercadopago', name: 'Mercado Pago', short: 'MP', logoClass: 'fin-gw-mp', feesKey: 'mp_fees' },
        { key: 'stripe_connect', name: 'Stripe', short: 'S', logoClass: 'fin-gw-sc', feesKey: 'stripe_fees' },
      ];
    },
    // First steps after creating the organization; each one links to where it is done.
    onboardingSteps() {
      if (!this.org) return [];
      const gateways = this.finLoaded ? this.finGateways.length : this.onbGateways;
      return [
        { key: 'event', icon: 'trophy', done: (this.org.events_count ?? this.events.length) > 0, action: () => this.goCreateEvent() },
        { key: 'payments', icon: 'credit-card', done: gateways > 0, action: () => this.switchPanel('financeiro') },
        { key: 'visual', icon: 'palette', done: !!(this.org.logo_image || this.org.color), action: () => this.switchPanel('settings') },
        { key: 'team', icon: 'user-plus', done: (this.org.members_count ?? this.members.length) > 1, action: () => this.switchPanel('members') },
      ];
    },
    onboardingDone() { return this.onboardingSteps.filter(s => s.done).length; },
    showOnboarding() {
      if (!this.org || this.onbDismissed || !this.canEv('event.manage')) return false;
      return this.welcome || this.onboardingDone < this.onboardingSteps.length;
    },
    // Overdue invoice: only the finance panel is reachable until it is paid.
    billingBlocked() { return !!this.org?.billing_blocked; },
    navItems() {
      const t = (k) => this.$t('pages.organization.manage.nav.' + k);
      if (this.billingBlocked) return [{ key: 'financeiro', icon: 'file-invoice-dollar', label: t('financeiro') }];
      // Each role only sees what the API lets it use (see ORG_ROLE_PERMS).
      const r = this.myRole;
      const has = (roles) => !r || roles.includes(r);
      return [
        { key: 'overview', icon: 'chart-line', label: t('overview') },
        { key: 'events', icon: 'calendar-days', label: t('events') },
        { key: 'members', icon: 'users', label: t('members') },
        { key: 'roles', icon: 'shield-halved', label: t('roles') },
        { key: 'activity', icon: 'clock-rotate-left', label: t('activity') },
        ...(has(['owner', 'admin', 'marketing']) ? [{ key: 'news', icon: 'newspaper', label: t('news') }] : []),
        ...(has(['owner', 'admin', 'financial']) ? [{ key: 'financeiro', icon: 'file-invoice-dollar', label: t('financeiro') }] : []),
        ...(REPORT_ROLES.includes(r) ? [{ key: 'reports', icon: 'chart-bar', label: t('reports') }] : []),
        ...(has(['owner', 'admin']) ? [{ key: 'settings', icon: 'gear', label: t('settings') }] : []),
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
    activePanel: {
      immediate: true,
      handler(p) { if (p === 'reports') this.reportsOpened = true; },
    },
    forceOption(val) {
      const panelMap = { general: 'settings', events: 'events', finances: 'financeiro', members: 'members', roles: 'roles', activity: 'activity', news: 'news', reports: 'reports', settings: 'settings', overview: 'overview', financeiro: 'financeiro' };
      const panel = panelMap[val?.[0]] ?? 'overview';
      this.activePanel = panel;
      if (panel === 'financeiro' && !this.finLoaded) this.loadFinances();
    },
  },

  async created() {
    await this.loadOrg();
    if (this.billingBlocked) {
      this.activePanel = 'financeiro';
      this.loadFinances();
      return;
    }
    // A link to a panel this role can't use falls back to the overview.
    if (!this.navItems.some((i) => i.key === this.activePanel)) this.activePanel = 'overview';
    // Opening /finances directly (reload, deep link, gateway return) never goes through switchPanel.
    if (this.activePanel === 'financeiro' && !this.finLoaded) this.loadFinances();
    this.initOnboarding();
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
        this.$refs.visual?.reset();
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
        this.$refs.visual?.reset();
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
        this.settingsForm.contact_email = result.data.contact_email || '';
        this.settingsForm.phone = result.data.phone || '';
        this.settingsForm.color = result.data.color || '';
      }
    },

    initOnboarding() {
      try { this.onbDismissed = localStorage.getItem('ehub_onb_done_' + this.orgRoute) === '1'; } catch (e) { /* storage unavailable */ }
      let fromCreate = false;
      try {
        fromCreate = sessionStorage.getItem('ehub_org_welcome') === this.orgRoute;
        if (fromCreate) sessionStorage.removeItem('ehub_org_welcome');
      } catch (e) { /* storage unavailable */ }
      if (fromCreate) {
        this.welcome = true;
        this.onbDismissed = false;
      }
      if (this.onbDismissed) return;
      OrganizationBilling.getGateways(this.orgRoute).then((res) => {
        if (res.code === 200 && Array.isArray(res.data)) this.onbGateways = res.data.length;
      });
    },
    dismissOnboarding() {
      this.onbDismissed = true;
      try { localStorage.setItem('ehub_onb_done_' + this.orgRoute, '1'); } catch (e) { /* storage unavailable */ }
    },

    async switchPanel(panel) {
      if (this.billingBlocked && panel !== 'financeiro') return;
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
      const result = await OrganizationEvent.index(this.orgRoute, true, true);
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
              this.$refs.visual?.reset();
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
              this.$refs.visual?.reset();
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
      // Only cache a successful load, so a failed request is retried next time the panel opens.
      this.finLoaded = billingRes.code === 200 && gwRes.code === 200;
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

    // The card needs fiscal data first (NFS-e): ask for it before opening the card form.
    finOpenCard() {
      if (!this.finBilling?.fiscal_complete) {
        toast.info(this.$t(this.F + 'fiscal.required_first'));
        this.finFiscalOpen = true;
        return;
      }
      this.finCardOpen = true;
    },
    finFiscalSaved(fiscal) {
      this.finBilling = { ...(this.finBilling || {}), fiscal, fiscal_complete: true };
      toast.success(this.$t(this.F + 'fiscal.saved'));
    },
    finDocMask(v) {
      const d = String(v || '');
      return d.length === 14
        ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
        : d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    },
    finCardSaved(card) {
      if (this.finBilling) this.finBilling = { ...this.finBilling, has_card: !!card, card };
      toast.success(this.$t(this.F + 'card_dialog.saved'));
    },
    // Invoices and receipts stay available in the Stripe customer portal.
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

    // "2026-09" → "setembro de 2026"
    finCycleLabel(cycle) {
      if (!cycle) return '—';
      const [y, m] = cycle.split('-').map(Number);
      const label = new Intl.DateTimeFormat(this.$i18n.locale, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
      return label.charAt(0).toUpperCase() + label.slice(1);
    },
    finPaymentLabel(inv) {
      if (inv.status === 'paid') return 'li_paid_on';
      if (inv.status === 'failed') return 'li_failed_on';
      return 'li_due_on';
    },
    finPaymentDate(inv) {
      if (inv.status === 'paid') return inv.paid_at ? this.finDate(inv.paid_at, true) : '—';
      if (inv.status === 'failed') return this.finDate(inv.failed_at, true);
      return this.finDate(inv.due_date);
    },
    finCycleShort(cycle) {
      const [y, m] = cycle.split('-').map(Number);
      return new Intl.DateTimeFormat(this.$i18n.locale, { month: 'short', year: '2-digit' }).format(new Date(y, m - 1, 1)).replace('.', '');
    },
    finDate(value, withTime = false) {
      if (!value) return '—';
      const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date(value);
      return new Intl.DateTimeFormat(this.$i18n.locale, withTime
        ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    },
    finStatusClass(status) {
      return { paid: 'ok', pending: 'warn', failed: 'live', empty: 'mute', waived: 'mute' }[status] || 'warn';
    },
    // When it was paid, when it failed, or when it is due.
    finInvoiceSub(inv) {
      const F = 'pages.organization.manage.financeiro.';
      if (inv.status === 'paid') return this.$t(F + 'paid_on', { date: this.finDate(inv.paid_at, true) });
      if (inv.status === 'failed') return this.$t(F + 'failed_on', { date: this.finDate(inv.failed_at, true) }) + (inv.blocks_at ? ' · ' + this.$t(F + 'blocks_on', { date: this.finDate(inv.blocks_at) }) : '');
      if (inv.status === 'empty' || inv.status === 'waived') return this.$t(F + 'no_charge');
      if (inv.blocks_at) return this.$t(F + 'due_blocks', { date: this.finDate(inv.due_date), block: this.finDate(inv.blocks_at) });
      return this.$t(F + 'due_on', { date: this.finDate(inv.due_date) });
    },
    finPayable(inv) { return ['pending', 'failed'].includes(inv.status) && Number(inv.total_amount) > 0; },
    async finPay(inv) {
      if (!this.finBilling?.has_card) { toast.error(this.$t(this.F + 'pay_no_card')); return; }
      this.finPaying = inv.billing_cycle;
      const res = await OrganizationBilling.payInvoice(this.orgRoute, inv.billing_cycle);
      this.finPaying = null;
      if (res.code !== 200) {
        const key = { billing_no_card: 'pay_no_card', billing_charge_failed: 'pay_failed' }[res.data] || 'pay_error';
        toast.error(this.$t(this.F + key));
        this.finLoaded = false;
        this.loadFinances();
        return;
      }
      toast.success(this.$t(this.F + 'pay_ok'));
      if (this.billingBlocked && !res.blocked) {
        // Released: reload everything the block was hiding.
        window.location.reload();
        return;
      }
      this.finLoaded = false;
      this.loadFinances();
      if (this.finSelectedInvoice?.billing_cycle === inv.billing_cycle) this.finOpenInvoice(inv.billing_cycle);
    },
    finMoney(v, cur) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: String(cur || 'brl').toUpperCase() }).format(Number(v) || 0);
    },
    finFormatAmount(val) {
      return parseFloat(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
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

        <!-- First steps -->
        <div v-if="showOnboarding" class="onb">
          <div class="onb-hd">
            <div>
              <h3>{{ welcome ? $t('pages.organization.manage.onboarding.welcome_title', { name: org?.name }) : $t('pages.organization.manage.onboarding.title') }}</h3>
              <p>{{ $t('pages.organization.manage.onboarding.sub', { done: onboardingDone, total: onboardingSteps.length }) }}</p>
            </div>
            <button type="button" class="onb-close" :title="$t('pages.organization.manage.onboarding.dismiss')" :aria-label="$t('pages.organization.manage.onboarding.dismiss')" @click="dismissOnboarding">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
          </div>
          <div class="onb-bar"><span :style="{ width: (onboardingDone / onboardingSteps.length * 100) + '%' }"></span></div>
          <div class="onb-grid">
            <button v-for="(s, i) in onboardingSteps" :key="s.key" type="button" class="onb-step" :class="{ done: s.done }" @click="s.action()">
              <span class="onb-ico">
                <font-awesome-icon :icon="['fas', s.done ? 'check' : s.icon]" />
              </span>
              <span class="onb-txt">
                <strong>{{ i + 1 }}. {{ $t('pages.organization.manage.onboarding.' + s.key + '_title') }}</strong>
                <small>{{ $t('pages.organization.manage.onboarding.' + s.key + '_desc') }}</small>
              </span>
              <span class="onb-go">{{ s.done ? $t('pages.organization.manage.onboarding.done') : $t('pages.organization.manage.onboarding.' + s.key + '_cta') }}</span>
            </button>
          </div>
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
            :icon="['fas', 'trophy']"
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
              <h3><font-awesome-icon :icon="['fas', 'calendar-days']" class="me-2" style="color:var(--ehub-primary-text)" />{{ $t('pages.organization.manage.overview.recent') }}</h3>
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
                <font-awesome-icon :icon="['fas', 'trophy']" />
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
            <p>{{ $t('pages.organization.manage.events.sub', { n: events.length }, events.length) }}</p>
          </div>
          <div class="spacer"></div>
          <button v-if="canEv('event.manage')" class="btn btn-primary round px-3" @click="goCreateEvent">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />
            {{ $t('pages.organization.manage.overview.new_event') }}
          </button>
        </div>

        <div class="sec-bar">
          <div class="role-seg">
            <button v-for="f in ['all','draft','upcoming','active','finished']" :key="f"
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
                    <button v-if="canOpenEvent()" class="act-btn act-btn--label" :title="$t('pages.organization.manage.events.manage_btn')" @click="manageEvent(ev)">
                      <font-awesome-icon :icon="['fas', 'sliders']" /><span>{{ $t('pages.organization.manage.events.manage_btn') }}</span>
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
            <p>{{ $t('pages.organization.manage.members.sub', { n: members.length }, members.length) }}</p>
          </div>
        </div>

        <div class="sec-bar">
          <div class="input-group input-group-sm" style="max-width:220px">
            <span class="input-group-text"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></span>
            <input type="text" class="form-control" v-model="mbSearch" :placeholder="$t('pages.organization.manage.members.search')" />
          </div>
          <div class="role-seg">
            <button v-for="r in ['all','owner','admin','event_manager','financial','marketing','staff']" :key="r"
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

      <!-- ═══ NEWS (organization articles) ═══ -->
      <section v-if="activePanel === 'news'" class="mgmt-pane">
        <OrgNewsManager :org-route="orgRoute" @close="switchPanel('overview')" />
      </section>

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

        <div v-if="billingBlocked || finBilling?.billing_blocked" class="fin-block">
          <font-awesome-icon :icon="['fas', 'lock']" class="fin-block-ico" />
          <div>
            <strong>{{ $t(F + 'blocked_title') }}</strong>
            <p>{{ $t(F + 'blocked_text') }}</p>
          </div>
        </div>

        <div v-if="finBillingLoading && !finBilling" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
        <template v-else>
          <!-- Summary -->
          <div class="fin-kpis">
            <div class="fin-kpi hl">
              <div class="l">{{ $t(F + 'kpi_usage', { month: finCycleLabel(finBilling?.current_cycle) }) }}</div>
              <div class="v">R$ {{ finFormatAmount(finBilling?.pending_total) }}</div>
              <div class="s">{{ $t(F + 'kpi_regs', { n: finBilling?.pending_items ?? 0 }, finBilling?.pending_items ?? 0) }}</div>
            </div>
            <div class="fin-kpi">
              <div class="l">{{ $t(F + 'kpi_next') }}</div>
              <div class="v">{{ finDate(finBilling?.closes_at) }}</div>
              <div class="s" :class="{ bad: !finBilling?.has_card }">
                {{ finBilling?.card?.last4 ? $t(F + 'kpi_next_card', { last4: finBilling.card.last4 }) : $t(F + 'kpi_next_nocard') }}
              </div>
            </div>
            <div class="fin-kpi" :class="{ alert: finOpenTotal > 0 }">
              <div class="l">{{ $t(F + 'kpi_open') }}</div>
              <div class="v">R$ {{ finFormatAmount(finOpenTotal) }}</div>
              <div class="s">{{ finOpenInvoices.length ? $t(F + 'kpi_open_n', { n: finOpenInvoices.length }, finOpenInvoices.length) : $t(F + 'kpi_open_none') }}</div>
            </div>
          </div>

          <div class="fin-cols">
            <!-- Usage chart + latest invoices, one per month -->
            <div class="cc fin-main">
              <div class="cc-hd">
                <h3><font-awesome-icon :icon="['fas', 'chart-bar']" style="color:var(--ehub-primary-text)" />{{ $t(F + 'usage_title') }}</h3>
              </div>
              <div v-if="finBilling?.usage_history?.length" class="cc-bd fin-chart">
                <EhubUsageChart :months="finBilling.usage_history" />
              </div>
              <!-- Months already over, waiting for their charge day -->
              <div v-for="c in (finBilling?.closing_cycles || [])" :key="'c' + c.billing_cycle" class="fin-inv-row static">
                <div class="fin-inv-main">
                  <span class="fin-inv-cycle">{{ finCycleLabel(c.billing_cycle) }}</span>
                  <span class="fin-inv-sub">{{ $t(F + 'closing_sub', { n: c.items_count, date: finDate(c.charges_at) }, c.items_count) }}</span>
                </div>
                <span class="s-badge pri">{{ $t(F + 'status_closing') }}</span>
                <span class="fin-inv-amount">R$ {{ finFormatAmount(c.total_amount) }}</span>
              </div>

              <div class="fin-sub-hd">{{ $t(F + 'last_invoice_title') }}</div>
              <div v-if="!finLastInvoice" class="cc-empty">
                <font-awesome-icon :icon="['fas', 'receipt']" class="ico" />{{ $t(F + 'no_invoices') }}
              </div>
              <template v-else>
                <dl class="fin-last">
                  <div><dt>{{ $t(F + 'li_month') }}</dt><dd>{{ finCycleLabel(finLastInvoice.billing_cycle) }}</dd></div>
                  <div><dt>{{ $t(F + 'li_amount') }}</dt><dd class="num">R$ {{ finFormatAmount(finLastInvoice.total_amount) }}</dd></div>
                  <div><dt>{{ $t(F + 'li_regs') }}</dt><dd class="num">{{ finLastInvoice.items_count ?? '—' }}</dd></div>
                  <div><dt>{{ $t(F + 'li_status') }}</dt><dd><span class="s-badge" :class="finStatusClass(finLastInvoice.status)">{{ $t(F + 'status_' + (finLastInvoice.status || 'pending')) }}</span></dd></div>
                  <div><dt>{{ $t(F + finPaymentLabel(finLastInvoice)) }}</dt><dd class="num" :class="{ ok: finLastInvoice.status === 'paid', bad: finLastInvoice.status === 'failed' }">{{ finPaymentDate(finLastInvoice) }}</dd></div>
                  <div><dt>{{ $t(F + 'li_attempts') }}</dt><dd class="num">{{ finLastInvoice.attempts || 0 }}</dd></div>
                </dl>
                <div class="fin-last-actions">
                  <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="finOpenInvoice(finLastInvoice.billing_cycle)">
                    <font-awesome-icon :icon="['fas', 'receipt']" class="me-1" />{{ $t(F + 'li_docs') }}
                  </button>
                  <button v-if="finPayable(finLastInvoice)" type="button" class="btn btn-sm btn-primary round px-3" :disabled="finPaying === finLastInvoice.billing_cycle" @click="finPay(finLastInvoice)">
                    <span v-if="finPaying === finLastInvoice.billing_cycle" class="spinner-border spinner-border-sm me-1"></span>{{ $t(F + 'pay_now') }}
                  </button>
                </div>
                <!-- Older invoices as compact shortcuts -->
                <div v-if="finOlderInvoices.length" class="fin-older">
                  <span class="lbl">{{ $t(F + 'older_invoices') }}</span>
                  <button v-for="inv in finOlderInvoices" :key="inv.id" type="button" class="fin-older-chip" :class="'st-' + inv.status" @click="finOpenInvoice(inv.billing_cycle)">
                    <i></i>{{ finCycleShort(inv.billing_cycle) }} · R$ {{ finFormatAmount(inv.total_amount) }}
                  </button>
                </div>
              </template>
            </div>

            <div class="fin-side">
              <!-- Fiscal data (NFS-e) — required before the card -->
              <div class="cc" :class="{ 'fin-warn': !finBilling?.fiscal_complete }">
                <div class="cc-hd">
                  <h3><font-awesome-icon :icon="['fas', 'file-invoice']" style="color:var(--ehub-primary-text)" />{{ $t(F + 'fiscal.card_title') }}</h3>
                  <button type="button" class="btn btn-sm round px-3" :class="finBilling?.fiscal_complete ? 'btn-outline-secondary' : 'btn-primary'" @click="finFiscalOpen = true">
                    {{ finBilling?.fiscal_complete ? $t(F + 'fiscal.edit') : $t(F + 'fiscal.fill') }}
                  </button>
                </div>
                <div class="cc-bd fin-fiscal">
                  <template v-if="finBilling?.fiscal_complete">
                    <strong>{{ finBilling.fiscal.name }}</strong>
                    <span>{{ finDocMask(finBilling.fiscal.document) }}</span>
                    <span>{{ finBilling.fiscal.city }}/{{ finBilling.fiscal.uf }} · {{ finBilling.fiscal.email }}</span>
                  </template>
                  <p v-else class="m-0"><font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />{{ $t(F + 'fiscal.missing') }}</p>
                </div>
                <EhubFiscalDataDialog v-model="finFiscalOpen" :org-route="orgRoute" :initial="finBilling?.fiscal" @saved="finFiscalSaved" />
              </div>

              <!-- Payment method -->
              <div class="cc">
                <div class="cc-hd">
                  <h3><font-awesome-icon :icon="['fas', 'credit-card']" style="color:var(--ehub-primary-text)" />{{ $t(F + 'pm_title') }}</h3>
                </div>
                <div class="cc-bd">
                  <div v-if="finBilling?.has_card" class="fin-cardviz" :style="{ background: orgGrad }">
                    <span class="brand">{{ finBilling.card?.brand || '' }}</span>
                    <span class="num">•••• •••• •••• {{ finBilling.card?.last4 || '••••' }}</span>
                    <span class="exp">{{ finBilling.card?.exp ? $t(F + 'card_exp', { exp: finBilling.card.exp }) : '' }}</span>
                  </div>
                  <div v-else class="fin-nocard">
                    <font-awesome-icon :icon="['fas', 'credit-card']" />
                    <span>{{ $t(F + 'no_card') }}</span>
                  </div>
                  <div class="fin-pm-actions">
                    <button class="btn btn-sm round px-3" :class="finBilling?.has_card ? 'btn-outline-primary' : 'btn-primary'" @click="finOpenCard">
                      {{ finBilling?.has_card ? $t(F + 'change_card') : $t(F + 'add_card') }}
                    </button>
                    <button v-if="finBilling?.has_card" class="btn btn-sm btn-link px-1" :disabled="finSettingUpCard" @click="finSetupCard">
                      <span v-if="finSettingUpCard" class="spinner-border spinner-border-sm me-1"></span>{{ $t(F + 'card_dialog.receipts') }}
                    </button>
                  </div>
                  <EhubCardSetupDialog v-model="finCardOpen" :org-route="orgRoute" @saved="finCardSaved" />
                </div>
              </div>

              <!-- How billing works -->
              <div class="cc">
                <div class="cc-hd">
                  <h3><font-awesome-icon :icon="['fas', 'circle-info']" style="color:var(--ehub-primary-text)" />{{ $t(F + 'how_title') }}</h3>
                </div>
                <ol class="fin-how">
                  <li><span class="d">5</span><span>{{ $t(F + 'how_1') }}</span></li>
                  <li><span class="d">6–10</span><span>{{ $t(F + 'how_2') }}</span></li>
                  <li><span class="d bad">11</span><span>{{ $t(F + 'how_3') }}</span></li>
                </ol>
              </div>
            </div>
          </div>
        </template>

        <!-- Gateways for paid event registrations -->
        <div class="cc" style="margin-top:16px">
          <div class="cc-hd">
            <h3><font-awesome-icon :icon="['fas', 'plug']" style="color:var(--ehub-primary-text)" />{{ $t(F + 'gw_title') }}</h3>
          </div>
          <p class="fin-gw-desc">{{ $t(F + 'gw_desc') }}</p>
          <div v-if="finGatewaysLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          <template v-else>
            <div v-for="gw in finGatewayList" :key="gw.key" class="fin-gw-row">
              <div class="fin-gw-logo" :class="gw.logoClass">{{ gw.short }}</div>
              <div class="fin-gw-txt">
                <div class="fin-gw-name">{{ gw.name }}</div>
                <div class="fin-gw-fees">{{ $t(F + gw.feesKey) }}</div>
              </div>
              <span v-if="finGateway(gw.key)" class="s-badge ok"><font-awesome-icon :icon="['fas', 'check']" /> {{ $t(F + 'gw_connected') }}</span>
              <button v-if="!finGateway(gw.key)" class="btn btn-sm btn-primary round px-3" :disabled="finConnecting === gw.key" @click="finConnect(gw.key)">
                <span v-if="finConnecting === gw.key" class="spinner-border spinner-border-sm me-1"></span>{{ $t(F + 'gw_connect') }}
              </button>
              <button v-else class="btn btn-sm btn-link text-danger px-1" :disabled="finDisconnecting === gw.key" @click="finDisconnect(gw.key)">
                <span v-if="finDisconnecting === gw.key" class="spinner-border spinner-border-sm me-1"></span>{{ $t(F + 'gw_disconnect') }}
              </button>
            </div>
            <div v-if="finGateways.length === 0" class="hint" style="padding:12px 17px;color:var(--ehub-warn-text)">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
              <span>{{ $t(F + 'gw_warning') }}</span>
            </div>
          </template>
        </div>

        <!-- Invoice detail modal -->
        <div v-if="finSelectedInvoice" class="fin-modal-overlay" @click.self="finSelectedInvoice = null">
          <div class="fin-modal-card">
            <div class="fin-modal-hd">
              <h5>{{ $t('pages.organization.manage.financeiro.invoice_detail', { cycle: finCycleLabel(finSelectedInvoice.billing_cycle) }) }}</h5>
              <button class="btn-close" @click="finSelectedInvoice = null"></button>
            </div>
            <div class="fin-modal-body">
              <div v-if="finInvoiceLoading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
              <template v-else>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex flex-column gap-1">
                    <span class="s-badge align-self-start" :class="finStatusClass(finSelectedInvoice.status)">
                      {{ $t('pages.organization.manage.financeiro.status_' + (finSelectedInvoice.status || 'pending')) }}
                    </span>
                    <span class="fin-inv-sub" :class="{ ok: finSelectedInvoice.status === 'paid', bad: finSelectedInvoice.status === 'failed' }">{{ finInvoiceSub(finSelectedInvoice) }}</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span style="font-weight:700;font-size:.95rem">R$ {{ finFormatAmount(finSelectedInvoice.total_amount) }}</span>
                    <button v-if="finPayable(finSelectedInvoice)" type="button" class="btn btn-sm btn-primary round px-3" :disabled="!!finPaying" @click="finPay(finSelectedInvoice)">
                      <span v-if="finPaying" class="spinner-border spinner-border-sm me-1"></span>{{ $t(F + 'pay_now') }}
                    </button>
                  </div>
                </div>
                <div v-if="finSelectedInvoice.documents || finSelectedInvoice.nfse" class="fin-docs">
                  <a v-if="finSelectedInvoice.nfse?.link" :href="finSelectedInvoice.nfse.link" target="_blank" rel="noopener noreferrer" class="fin-doc">
                    <font-awesome-icon :icon="['fas', 'file-invoice']" /><span>{{ $t(F + 'doc_nfse', { n: finSelectedInvoice.nfse.number || '' }) }}</span>
                  </a>
                  <span v-else-if="finSelectedInvoice.nfse" class="fin-doc muted">
                    <font-awesome-icon :icon="['fas', 'file-invoice']" /><span>{{ $t(F + 'nfse_status.' + finSelectedInvoice.nfse.status) }}</span>
                  </span>
                  <a v-if="finSelectedInvoice.documents?.receipt_url" :href="finSelectedInvoice.documents.receipt_url" target="_blank" rel="noopener noreferrer" class="fin-doc">
                    <font-awesome-icon :icon="['fas', 'receipt']" /><span>{{ $t(F + 'doc_receipt') }}</span>
                  </a>
                  <a v-if="finSelectedInvoice.documents?.invoice_pdf" :href="finSelectedInvoice.documents.invoice_pdf" target="_blank" rel="noopener noreferrer" class="fin-doc">
                    <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" /><span>{{ $t(F + 'doc_invoice_pdf') }}</span>
                  </a>
                  <a v-if="finSelectedInvoice.documents?.hosted_invoice_url" :href="finSelectedInvoice.documents.hosted_invoice_url" target="_blank" rel="noopener noreferrer" class="fin-doc">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" /><span>{{ $t(F + 'doc_hosted') }}</span>
                  </a>
                </div>
                <div class="fin-sub-hd" style="padding:6px 0">{{ $t(F + 'doc_items') }}</div>
                <div v-for="item in (finSelectedInvoice.items ?? [])" :key="item.id" class="fin-inv-item">
                  <span class="td-muted">{{ item.user?.name ?? '—' }}<small v-if="item.created_at" class="d-block">{{ finDate(item.created_at) }}</small></span>
                  <span style="font-size:.83rem">
                    {{ $t('finances.billing.type.' + item.billing_type) }}
                    <small v-if="item.currency && item.currency !== 'brl' && item.fee_original != null" class="d-block td-muted">
                      {{ $t(F + 'fx_line', { amount: finMoney(item.fee_original, item.currency), rate: item.exchange_rate ? Number(item.exchange_rate).toFixed(4) : '—' }) }}
                    </small>
                  </span>
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
            <h1>{{ $t('reports.title') }}</h1>
            <p>{{ $t('reports.sub_org') }}</p>
          </div>
        </div>
        <EhubReportBuilder v-if="reportsOpened" :base="'/org/' + orgRoute + '/reports'" scope="org" :owner-name="org?.name || ''" />
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

            <!-- Color + logo + cover (shared with teams and events) -->
            <div class="col-12">
              <EhubVisualFields
                ref="visual"
                v-model:color="settingsForm.color"
                :color-hint="$t('pages.organization.manage.settings.color_desc')"
                :logo-url="org?.logo_image ? orgLogoUrl : ''"
                :cover-url="org?.cover_image ? orgCoverUrl : ''"
                :initials="orgInitials"
                @logo-change="logoFile = $event"
                @cover-change="coverFile = $event"
                @remove-logo="removeLogoImage"
                @remove-cover="removeCoverImage"
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

        <!-- Contact: replies from participants go to this address -->
        <div class="set-card mb-4">
          <h3>{{ $t('pages.organization.manage.settings.contact') }}</h3>
          <p class="set-desc">{{ $t('pages.organization.manage.settings.contact_desc') }}</p>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label set-label" for="org-contact-mail">{{ $t('pages.organization.manage.settings.contact_email') }}</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fas', 'envelope']" /></span><input id="org-contact-mail" type="email" class="form-control" v-model="settingsForm.contact_email" placeholder="contato@..." autocomplete="email" /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label set-label" for="org-contact-phone">{{ $t('pages.organization.manage.settings.contact_phone') }}</label>
              <div class="input-group"><span class="input-group-text"><font-awesome-icon :icon="['fas', 'phone']" /></span><input id="org-contact-phone" type="tel" class="form-control" v-model="settingsForm.phone" placeholder="(11) 99999-9999" autocomplete="tel" /></div>
            </div>
            <div class="col-12 d-flex justify-content-end">
              <button class="btn btn-primary round px-4" :disabled="settingsSaving" @click="saveSettings">
                <span v-if="settingsSaving" class="spinner-border spinner-border-sm me-2"></span>
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
            <div style="font-size:.88rem;font-weight:700;color:var(--ehub-danger-text);margin-bottom:3px">{{ $t('pages.organization.manage.settings.delete_title') }}</div>
            <div style="font-size:.8rem;color:var(--ehub-muted);margin-bottom:10px">{{ $t('pages.organization.manage.settings.delete_desc') }}</div>
            <button class="btn btn-sm btn-danger round px-3" @click="deleteOrg">{{ $t('pages.organization.manage.settings.delete_btn') }}</button>
          </div>
        </div>
      </section>

  </EhubMgmtLayout>
</template>

<style scoped>
.act-btn.act-btn--label { width: auto; padding: 0 10px; gap: 6px; font-size: .76rem; font-weight: 700; display: inline-flex; align-items: center; }

.onb { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-left: 4px solid var(--ehub-primary); border-radius: 14px; padding: 16px 18px; margin-bottom: 16px; }
.onb-hd { display: flex; align-items: flex-start; gap: 12px; }
.onb-hd > div { flex: 1; }
.onb-hd h3 { font-size: 1rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 2px; }
.onb-hd p { font-size: .8rem; color: var(--ehub-muted); margin: 0; }
.onb-close { border: 0; background: transparent; color: var(--ehub-muted); width: 40px; height: 40px; margin: -8px -8px 0 0; border-radius: 8px; }
.onb-close:hover { background: var(--ehub-primary-tint); color: var(--ehub-ink); }
.onb-bar { height: 6px; border-radius: 3px; background: var(--ehub-line); margin: 12px 0 14px; overflow: hidden; }
.onb-bar span { display: block; height: 100%; background: var(--ehub-primary-strong); transition: width .3s; }
.onb-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.onb-step { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; text-align: left; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg, transparent); border-radius: 10px; padding: 12px; cursor: pointer; transition: border-color .15s, transform .15s; }
.onb-step:hover { border-color: var(--ehub-primary); transform: translateY(-1px); }
.onb-ico { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--ehub-primary-tint); color: var(--ehub-primary-text); font-size: .8rem; }
.onb-step.done .onb-ico { background: rgba(31, 138, 91, .14); color: var(--ehub-success-text); }
.onb-txt strong { display: block; font-size: .82rem; color: var(--ehub-ink); }
.onb-txt small { display: block; font-size: .73rem; color: var(--ehub-muted); line-height: 1.4; margin-top: 2px; }
.onb-step.done .onb-txt strong { text-decoration: line-through; color: var(--ehub-muted); }
.onb-go { margin-top: auto; font-size: .74rem; font-weight: 700; color: var(--ehub-primary-text); }
.onb-step.done .onb-go { color: var(--ehub-success-text); }
@media (max-width: 900px) { .onb-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 520px) { .onb-grid { grid-template-columns: minmax(0, 1fr); } }

.cc-link { font-size: .78rem; font-weight: 600; color: var(--ehub-primary-text); cursor: pointer; background: none; border: 0; padding: 8px 4px; margin: -8px -4px; }
.cc-link:hover { text-decoration: underline; }
.td-name { font-weight: 600; }
.set-desc { margin-bottom: 18px; }
.set-label { font-size: .82rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: 5px; }

/* ── Status badges ── */
.s-badge.active   { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: var(--ehub-success-text); }
.s-badge.finished { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.s-badge.upcoming { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.s-badge.draft    { background: color-mix(in srgb, #f08c00 16%, transparent); color: #f08c00; }

.role-seg { display: flex; gap: 4px; flex-wrap: wrap; }
.role-seg button { background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); color: var(--ehub-muted); font-size: .78rem; font-weight: 600; padding: 5px 13px; border-radius: 50rem; cursor: pointer; transition: all .14s; }
.role-seg button:hover { border-color: var(--ehub-primary); color: var(--ehub-ink); }
.role-seg button.active { background: var(--ehub-primary-strong); border-color: var(--ehub-primary); color: #fff; }

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
.role-chip { font-size: .75rem; font-weight: 600; padding: 3px 9px; border-radius: 50rem; display: inline-block; white-space: nowrap; }
.role-chip.owner   { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: var(--ehub-warn-text); }
.role-chip.admin   { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.role-chip.manager { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.role-chip.staff   { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.role-chip.marketing { background: color-mix(in srgb, #d6336c 14%, transparent); color: #d6336c; }
.role-chip.helper { background: color-mix(in srgb, #0f9d8a 14%, transparent); color: #0b7d6e; }
html[data-bs-theme="dark"] .role-chip.owner { color: var(--ehub-gold); }

/* ── Settings cards ── */

.set-hint { font-size: .78rem; color: var(--ehub-muted); margin: 0 0 10px; }


/* ── Financial panel ── */
.fin-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 16px; }
.fin-kpi { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 15px 18px; min-width: 0; }
.fin-kpi .l { font-size: .72rem; color: var(--ehub-muted); font-weight: 500; }
.fin-kpi .v { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; font-variant-numeric: tabular-nums; margin: 2px 0; }
.fin-kpi .s { font-size: .74rem; color: var(--ehub-muted); }
.fin-kpi .s.bad { color: var(--ehub-danger-text); }
.fin-kpi.hl { background: var(--ehub-primary-strong); border-color: var(--ehub-primary); }
.fin-kpi.hl .l, .fin-kpi.hl .v, .fin-kpi.hl .s { color: #fff; }
.fin-kpi.hl .l, .fin-kpi.hl .s { opacity: .85; }
.fin-kpi.alert { border-color: color-mix(in srgb, #e23b3b 45%, transparent); background: color-mix(in srgb, #e23b3b 6%, var(--ehub-card)); }
.fin-kpi.alert .v { color: var(--ehub-danger-text); }
.fin-cols { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
.fin-main { height: 100%; }
.fin-chart { border-bottom: 1px solid var(--ehub-line); }
.fin-last { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 18px; margin: 0; padding: 4px 17px 6px; }
.fin-last > div { min-width: 0; }
.fin-last dt { font-size: .72rem; font-weight: 600; color: var(--ehub-muted); margin-bottom: 2px; }
.fin-last dd { margin: 0; font-size: .88rem; font-weight: 600; color: var(--ehub-ink); }
.fin-last dd.num { font-variant-numeric: tabular-nums; }
.fin-last dd.ok { color: var(--ehub-success-text); }
.fin-last dd.bad { color: var(--ehub-danger-text); }
.fin-last-actions { display: flex; gap: 8px; flex-wrap: wrap; padding: 10px 17px 14px; }
.fin-older { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 10px 17px 14px; border-top: 1px solid var(--ehub-line); margin-top: auto; }
.fin-older .lbl { font-size: .72rem; font-weight: 700; color: var(--ehub-muted); margin-right: 4px; }
.fin-older-chip { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; font-weight: 600; color: var(--ehub-ink); background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 3px 10px; cursor: pointer; text-transform: capitalize; }
.fin-older-chip i { width: 7px; height: 7px; border-radius: 50%; background: var(--ehub-muted); }
.fin-older-chip.st-paid i { background: #1f8a5b; }
.fin-older-chip.st-failed i, .fin-older-chip.st-pending i { background: #e23b3b; }
.fin-older-chip:hover { border-color: var(--ehub-primary); }
.fin-docs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin-bottom: 14px; }
.fin-doc { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--ehub-line); border-radius: 10px; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); text-decoration: none; background: var(--ehub-field-bg); }
.fin-doc svg { color: var(--ehub-primary-text); }
.fin-doc:hover { border-color: var(--ehub-primary); color: var(--ehub-primary-text); }
.fin-doc.muted { color: var(--ehub-muted); font-weight: 500; cursor: default; }
.fin-doc.muted:hover { border-color: var(--ehub-line); color: var(--ehub-muted); }
.fin-fiscal { display: flex; flex-direction: column; gap: 2px; font-size: .8rem; color: var(--ehub-muted); }
.fin-fiscal strong { font-size: .88rem; color: var(--ehub-ink); }
.fin-warn { border-color: color-mix(in srgb, var(--ehub-gold, #d4a20f) 55%, transparent); }
.fin-warn .fin-fiscal p { color: color-mix(in srgb, var(--ehub-gold, #d4a20f), #000 30%); }
.fin-sub-hd { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 12px 17px 6px; }
.fin-side { display: flex; flex-direction: column; gap: 16px; }
.fin-side .cc + .cc { margin-top: 0; }
.fin-cardviz { position: relative; border-radius: 14px; padding: 16px 18px; color: #fff; min-height: 116px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 8px 22px rgba(0,0,0,.18); }
.fin-cardviz .brand { font-size: .82rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; opacity: .95; }
.fin-cardviz .num { font-size: 1.02rem; font-weight: 700; letter-spacing: .12em; font-variant-numeric: tabular-nums; }
.fin-cardviz .exp { font-size: .72rem; opacity: .85; }
.fin-nocard { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 22px 12px; border: 1px dashed var(--ehub-line); border-radius: 12px; color: var(--ehub-muted); font-size: .84rem; text-align: center; }
.fin-nocard svg { font-size: 1.3rem; }
.fin-pm-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.fin-how { list-style: none; margin: 0; padding: 12px 17px 16px; display: flex; flex-direction: column; gap: 10px; }
.fin-how li { display: flex; gap: 12px; align-items: flex-start; font-size: .8rem; color: var(--ehub-ink); line-height: 1.4; }
.fin-how .d { flex-shrink: 0; min-width: 44px; text-align: center; font-size: .72rem; font-weight: 800; padding: 3px 6px; border-radius: 8px; background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.fin-how .d.bad { background: color-mix(in srgb, #e23b3b 12%, transparent); color: var(--ehub-danger-text); }
.fin-gw-desc { font-size: .8rem; color: var(--ehub-muted); margin: 0; padding: 12px 17px 4px; }
.fin-gw-row { display: flex; align-items: center; gap: 12px; padding: 12px 17px; border-top: 1px solid var(--ehub-line); flex-wrap: wrap; }
.fin-gw-row:first-of-type { border-top: 0; }
.fin-gw-txt { flex: 1; min-width: 160px; }
.fin-inv-list { display: flex; flex-direction: column; }
@media (max-width: 1100px) { .fin-cols { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 700px) { .fin-kpis { grid-template-columns: minmax(0, 1fr); } }
.fin-inv-row.static { cursor: default; }
.fin-block { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; margin-bottom: 16px; border-radius: 13px; border: 1px solid color-mix(in srgb, #e23b3b 35%, transparent); background: color-mix(in srgb, #e23b3b 8%, transparent); }
.fin-block-ico { color: var(--ehub-danger-text); font-size: 1.1rem; margin-top: 3px; }
.fin-block strong { display: block; font-size: .92rem; color: var(--ehub-ink); margin-bottom: 3px; }
.fin-block p { margin: 0; font-size: .82rem; color: var(--ehub-muted); }
.fin-inv-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.fin-inv-main .fin-inv-cycle { width: auto; }
.fin-inv-sub { font-size: .74rem; color: var(--ehub-muted); }
.fin-inv-sub.ok { color: var(--ehub-success-text); }
.fin-inv-sub.bad { color: var(--ehub-danger-text); }
.fin-inv-caret { color: var(--ehub-muted); font-size: .72rem; width: 10px; }
.fin-inv-row { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s; font-size: .87rem; }
.fin-inv-row:last-child { border-bottom: 0; }
.fin-inv-row:hover { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.fin-inv-cycle { font-weight: 600; width: 6rem; color: var(--ehub-ink); }
.fin-inv-amount { font-weight: 600; color: var(--ehub-ink); }
.fin-gw-logo { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: .82rem; flex-shrink: 0; letter-spacing: -.01em; }
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
