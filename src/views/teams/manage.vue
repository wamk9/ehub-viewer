<template>
  <div class="mgmt-wrap">

    <!-- SIDEBAR -->
    <aside class="mgmt-sidebar">
      <div class="sb-team">
        <div class="sb-logo" :style="sbLogoStyle">
          <img v-if="team?.logo_image" :src="logoUrl" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9px" />
          <span v-else>{{ initials }}</span>
        </div>
        <div style="min-width:0">
          <div class="sb-name">{{ team?.name || '—' }}</div>
          <div class="sb-cat">{{ categoryName }}</div>
        </div>
      </div>
      <nav class="sb-nav">
        <button class="nav-item" :class="{ active: activePanel === 'overview' }" @click="setPanel('overview')">
          <font-awesome-icon icon="chart-line" />
          <span>{{ $t('pages.teams.manage.nav.overview') }}</span>
        </button>
        <button class="nav-item" :class="{ active: activePanel === 'roster' }" @click="setPanel('roster')">
          <font-awesome-icon icon="users" />
          <span>{{ $t('pages.teams.manage.nav.roster') }}</span>
        </button>
        <button v-if="can('manage_applications')" class="nav-item" :class="{ active: activePanel === 'applications' }" @click="setPanel('applications')">
          <font-awesome-icon icon="inbox" />
          <span>{{ $t('pages.teams.manage.nav.applications') }}</span>
        </button>
        <button class="nav-item" :class="{ active: activePanel === 'roles' }" @click="setPanel('roles')">
          <font-awesome-icon icon="shield-halved" />
          <span>{{ $t('pages.teams.manage.nav.roles') }}</span>
        </button>
        <div class="nav-div"></div>
        <button v-if="can('manage_settings') || can('manage_visual')" class="nav-item" :class="{ active: activePanel === 'settings' }" @click="setPanel('settings')">
          <font-awesome-icon icon="gear" />
          <span>{{ $t('pages.teams.manage.nav.settings') }}</span>
        </button>
        <div class="nav-div"></div>
        <router-link class="nav-item" :to="`/teams/${teamRoute}`">
          <font-awesome-icon icon="arrow-up-right-from-square" />
          <span>{{ $t('pages.teams.manage.nav.public') }}</span>
        </router-link>
        <router-link class="nav-item" to="/my-teams">
          <font-awesome-icon icon="arrow-left" />
          <span>{{ $t('pages.teams.manage.nav.back') }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- LOADING -->
    <main class="mgmt-main mgmt-state" v-if="loading">
      <font-awesome-icon icon="spinner" spin style="font-size:1.5rem;color:var(--ehub-muted)" />
    </main>

    <!-- ERROR -->
    <main class="mgmt-main mgmt-state" v-else-if="!team">
      <p style="color:var(--ehub-muted)">{{ $t('pages.teams.manage.error') }}</p>
    </main>

    <!-- CONTENT -->
    <main class="mgmt-main" v-else>

      <!-- OVERVIEW -->
      <section v-show="activePanel === 'overview'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.teams.manage.overview.title') }}</h1>
            <p>{{ $t('pages.teams.manage.overview.sub') }}</p>
          </div>
        </div>

        <div class="stat-grid">
          <EhubStatCard
            icon="users"
            icon-bg="var(--ehub-primary-tint)"
            icon-color="var(--ehub-primary)"
            :value="team.players_count || 0"
            :label="$t('pages.teams.manage.stats.players')"
            delta="—"
          />
          <EhubStatCard
            icon="trophy"
            icon-bg="color-mix(in srgb,var(--ehub-gold) 20%,transparent)"
            icon-color="color-mix(in srgb,var(--ehub-gold),#000 20%)"
            :value="team.wins_count || 0"
            :label="$t('pages.teams.manage.stats.wins')"
            delta="—"
          />
          <EhubStatCard
            icon="calendar-check"
            icon-bg="color-mix(in srgb,#1f8a5b 14%,transparent)"
            icon-color="#1f8a5b"
            :value="team.events_count || 0"
            :label="$t('pages.teams.manage.stats.events')"
            delta="—"
          />
          <EhubStatCard
            :icon="team.is_open ? 'door-open' : 'door-closed'"
            icon-bg="var(--ehub-field-bg)"
            icon-color="var(--ehub-muted)"
            :value="team.is_open ? $t('pages.teams.manage.settings.open') : $t('pages.teams.manage.settings.closed')"
            :value-style="{ fontSize: '1.1rem' }"
            :label="$t('pages.teams.manage.overview.status')"
            delta="—"
          />
        </div>

        <div class="dash-grid">
          <div class="cc">
            <div class="cc-hd">
              <h3>{{ $t('pages.teams.manage.nav.roster') }}</h3>
              <button class="cc-link" @click="setPanel('roster')">{{ $t('pages.teams.manage.view_all') }}</button>
            </div>
            <div v-if="team.members?.length">
              <div v-for="m in team.members.slice(0, 4)" :key="m.id" class="ev-mini">
                <div class="m-av" :style="avatarStyle(m)">
                    <img :src="m.avatar" class="m-av-img" alt=""
                      @error="$event.target.style.display='none'"
                      @load="$event.target.nextElementSibling.style.display='none'" />
                    <span>{{ memberInitials(m) }}</span>
                  </div>
                <div class="ev-mini-body">
                  <div class="ev-mini-name">{{ m.name }}</div>
                  <div class="ev-mini-meta">@{{ m.username }}</div>
                </div>
                <span class="role-chip" :class="m.role">{{ $t(`pages.teams.manage.roles.${m.role}`) }}</span>
              </div>
            </div>
            <div v-else style="text-align:center;padding:32px 20px;color:var(--ehub-muted);font-size:.83rem">—</div>
          </div>

          <EhubActivityLog
            :title="$t('pages.teams.manage.activity')"
            :activities="activitiesWithIcons"
            :loading="activitiesLoading"
            :loading-label="$t('pages.teams.manage.loading')"
            :empty-label="$t('pages.teams.manage.activity_empty')"
          >
            <template #text="{ activity }">
              <span v-if="activity.type === 'team_role_changed'" v-html="$t('pages.teams.manage.activity_role_changed', {
                actor: activity.params.actor,
                target: activity.params.target,
                old_role: $t(`pages.teams.manage.roles.${activity.params.old_role}`),
                new_role: $t(`pages.teams.manage.roles.${activity.params.new_role}`),
              })" />
              <span v-else-if="activity.type === 'team_member_removed'" v-html="$t('pages.teams.manage.activity_member_removed', {
                actor: activity.params.actor,
                target: activity.params.target,
                role: $t(`pages.teams.manage.roles.${activity.params.role}`),
              })" />
              <span v-else-if="activity.type === 'team_member_joined_application'" v-html="$t('pages.teams.manage.activity_member_joined_application', {
                actor: activity.params.actor,
                target: activity.params.target,
                role: $t(`pages.teams.manage.roles.${activity.params.role}`),
              })" />
              <span v-else-if="activity.type === 'team_member_joined_invite'" v-html="$t('pages.teams.manage.activity_member_joined_invite', {
                actor: activity.params.actor,
                target: activity.params.target,
                role: $t(`pages.teams.manage.roles.${activity.params.role}`),
              })" />
            </template>
          </EhubActivityLog>
        </div>
      </section>

      <!-- ROSTER -->
      <section v-show="activePanel === 'roster'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.teams.manage.roster.title') }}</h1>
            <p>{{ $t('pages.teams.manage.roster.sub') }}</p>
          </div>
        </div>

        <div class="cc" style="margin-bottom:16px">
          <table class="mgmt-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.teams.manage.roster.col_player') }}</th>
                <th>{{ $t('pages.teams.manage.roster.col_handle') }}</th>
                <th>{{ $t('pages.teams.manage.roster.col_role') }}</th>
                <th>{{ $t('pages.teams.manage.roster.col_actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in team.members" :key="m.id">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="m-av" :style="avatarStyle(m)">
                      <img :src="m.avatar" class="m-av-img" alt=""
                        @error="$event.target.style.display='none'"
                        @load="$event.target.nextElementSibling.style.display='none'" />
                      <span>{{ memberInitials(m) }}</span>
                    </div>
                    <span class="td-name">{{ m.name }}</span>
                  </div>
                </td>
                <td class="td-muted">@{{ m.username }}</td>
                <td>
                  <select
                    v-if="can('manage_roster') && assignableRoleNames.includes(m.role) && m.id !== myId"
                    class="role-select"
                    :value="m.role"
                    @change="changeRole(m, $event.target.value)"
                  >
                    <option v-for="r in assignableRoles" :key="r.id" :value="r.name">
                      {{ $t(`pages.teams.manage.roles.${r.name}`) }}
                    </option>
                  </select>
                  <span v-else class="role-chip" :class="m.role">{{ $t(`pages.teams.manage.roles.${m.role}`) }}</span>
                </td>
                <td>
                  <div class="act-row" v-if="can('manage_roster') && assignableRoleNames.includes(m.role) && m.id !== myId">
                    <button class="act-btn del" :title="$t('pages.teams.manage.roster.remove')" @click="openModal('remove_member', m)">
                      <font-awesome-icon icon="xmark" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="set-card" v-if="can('invite_members')">
          <h3>{{ $t('pages.teams.manage.roster.invite') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.roster.invite_sub') }}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input v-model="inviteInput" type="text" class="form-control"
              :placeholder="$t('pages.teams.manage.roster.invite_ph')"
              style="flex:1;min-width:180px" />
            <select v-model="inviteRole" class="form-select" style="flex:0 0 140px">
              <option v-for="r in invitableRoles" :key="r.id" :value="r.name">
                {{ $t(`pages.teams.manage.roles.${r.name}`) }}
              </option>
            </select>
            <button class="btn btn-primary round px-4" @click="sendInvite">
              {{ $t('pages.teams.manage.roster.send_invite') }}
            </button>
          </div>
        </div>

        <div class="set-card danger">
          <h3>{{ $t('pages.teams.manage.settings.danger') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.settings.leave_desc') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn btn-outline-secondary round px-4" @click="openModal('leave')" :disabled="isOnlyRoot">
              <font-awesome-icon icon="right-from-bracket" class="me-2" />
              {{ $t('pages.teams.manage.settings.leave') }}
            </button>
            <p v-if="isOnlyRoot" class="only-root-msg">
              {{ $t('pages.teams.manage.settings.leave_only_root', { role: $t(`pages.teams.manage.roles.${rootRoleName}`) }) }}
            </p>
          </div>
        </div>

      </section>

      <!-- APPLICATIONS -->
      <section v-show="activePanel === 'applications'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.teams.manage.applications.title') }}</h1>
            <p>{{ $t('pages.teams.manage.applications.sub') }}</p>
          </div>
        </div>

        <div class="set-card" v-if="can('manage_applications')">
          <h3>{{ $t('pages.teams.manage.settings.recruitment') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.settings.recruitment_desc') }}</p>
          <div class="seg" style="display:inline-flex">
            <button :class="{ active: settingsForm.is_open }" @click="settingsForm.is_open = true; saveSettings()">
              {{ $t('pages.teams.manage.settings.open') }}
            </button>
            <button :class="{ active: !settingsForm.is_open }" @click="settingsForm.is_open = false; saveSettings()">
              {{ $t('pages.teams.manage.settings.closed') }}
            </button>
          </div>
        </div>

        <div v-if="!team.is_open" class="set-card" style="display:flex;align-items:center;gap:14px">
          <font-awesome-icon icon="lock" style="font-size:1.4rem;color:var(--ehub-muted);flex-shrink:0" />
          <div>
            <div style="font-weight:700;color:var(--ehub-ink)">{{ $t('pages.teams.manage.applications.closed_title') }}</div>
            <div style="font-size:.83rem;color:var(--ehub-muted);margin-top:3px">{{ $t('pages.teams.manage.applications.closed_desc') }}</div>
          </div>
        </div>

        <template v-else>
          <div v-if="applicationsLoading" style="text-align:center;padding:52px 20px;color:var(--ehub-muted)">
            <font-awesome-icon icon="spinner" spin />
          </div>

          <div v-else-if="applications.length === 0" class="set-card">
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;color:var(--ehub-muted)">
              <font-awesome-icon icon="inbox" style="font-size:2rem;opacity:.35;margin-bottom:10px" />
              <p style="margin:0">{{ $t('pages.teams.manage.applications.empty') }}</p>
            </div>
          </div>

          <div v-else class="set-card" style="padding:0;overflow:hidden">
            <div v-for="app in applications" :key="app.id" class="app-row">
              <div class="app-avatar">{{ app.user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) }}</div>
              <div class="app-info">
                <div class="app-name">{{ app.user.name }} <span class="app-handle">@{{ app.user.username }}</span></div>
                <div v-if="app.desired_role" class="app-role">{{ $t('pages.teams.manage.applications.role_prefix') }}: {{ app.desired_role }}</div>
                <div class="app-msg">{{ app.message }}</div>
              </div>
              <div class="app-actions">
                <button class="btn btn-sm btn-success round" @click="acceptApplication(app)">{{ $t('pages.teams.manage.applications.accept') }}</button>
                <button class="btn btn-sm btn-outline-danger round" style="margin-top:6px" @click="rejectApplication(app)">{{ $t('pages.teams.manage.applications.reject') }}</button>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ROLES -->
      <section v-show="activePanel === 'roles'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.teams.manage.roles_panel.title') }}</h1>
            <p>{{ $t('pages.teams.manage.roles_panel.sub') }}</p>
          </div>
        </div>

        <div class="cc" v-if="rolesData.length">
          <table class="mgmt-tbl roles-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.teams.manage.roster.col_role') }}</th>
                <th v-for="r in rolesData" :key="r.id" class="text-center">
                  {{ $t(`pages.teams.manage.roles.${r.name}`) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in rolePermKeys" :key="perm">
                <td class="perm-label">{{ $t(`pages.teams.manage.roles_panel.permissions.${perm}`) }}</td>
                <td v-for="r in rolesData" :key="r.id" class="text-center">
                  <span v-if="!r.parent_id" class="perm-dot perm-dot--yes perm-dot--always">✓</span>
                  <template v-else>
                    <span v-if="r.effective[perm]" class="perm-dot" :class="r.own[perm] ? 'perm-dot--yes' : 'perm-dot--inherited'"
                      :title="r.own[perm] ? '' : $t('pages.teams.manage.roles_panel.inherited')">
                      {{ r.own[perm] ? '✓' : '↑' }}
                    </span>
                    <span v-else class="perm-dot perm-dot--no">—</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="roles-legend">
            <span class="perm-dot perm-dot--yes">✓</span> {{ $t('pages.teams.manage.roles_panel.permissions.invite_members').replace('Convidar','') }} &nbsp;
            <span class="perm-dot perm-dot--inherited">↑</span> {{ $t('pages.teams.manage.roles_panel.inherited') }} &nbsp;
            <span class="perm-dot perm-dot--no">—</span>
          </p>
        </div>

        <div v-else class="mgmt-state">
          <font-awesome-icon icon="spinner" spin style="font-size:1.5rem;color:var(--ehub-muted)" />
        </div>
      </section>

      <!-- SETTINGS -->
      <section v-show="activePanel === 'settings'">
        <div class="pnl-hd">
          <div><h1>{{ $t('pages.teams.manage.settings.title') }}</h1></div>
        </div>

        <div class="set-card" v-if="can('manage_settings')">
          <h3>{{ $t('pages.teams.manage.settings.identity') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.settings.identity_desc') }}</p>
          <div class="row g-3 mb-3">
            <div class="col-md-8">
              <label class="form-label">{{ $t('pages.teams.manage.settings.name') }}</label>
              <input v-model="settingsForm.name" type="text" class="form-control" maxlength="60" />
            </div>
            <div class="col-md-4">
              <label class="form-label">{{ $t('pages.teams.manage.settings.tag') }}</label>
              <input v-model="settingsForm.tag" type="text" class="form-control" maxlength="5"
                style="text-transform:uppercase" @input="settingsForm.tag = settingsForm.tag.toUpperCase()" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">{{ $t('pages.teams.manage.settings.desc') }}</label>
            <textarea v-model="settingsForm.description" class="form-control" rows="3" maxlength="500"
              style="resize:vertical"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">{{ $t('pages.teams.manage.settings.color') }}</label>
            <EhubColorPicker
              v-model="settingsForm.color"
              :swatches="colorSwatches"
            />
          </div>
          <button class="btn btn-primary round px-4" :disabled="settingsSaving" @click="saveSettings">
            {{ settingsSaving ? $t('pages.teams.manage.settings.saving') : $t('pages.teams.manage.settings.save') }}
          </button>
        </div>

        <div class="set-card" v-if="can('manage_visual')">
          <h3>{{ $t('pages.teams.manage.settings.visual') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.settings.visual_desc') }}</p>

          <!-- LOGO -->
          <div class="mb-4">
            <label class="form-label">{{ $t('pages.teams.manage.settings.logo') }}</label>
            <EhubProfileImageUpload
              ref="logoUpload"
              type="logo"
              :current-url="logoUrl"
              :fallback-style="sbLogoStyle"
              @change="logoFile = $event"
              @remove="onRemoveLogo"
            >
              <template #fallback><span>{{ initials }}</span></template>
            </EhubProfileImageUpload>
          </div>

          <!-- COVER -->
          <div class="mb-4">
            <label class="form-label">{{ $t('pages.teams.manage.settings.cover') }}</label>
            <EhubProfileImageUpload
              ref="coverUpload"
              type="cover"
              :current-url="coverUrl"
              :fallback-style="sbLogoStyle"
              @change="coverFile = $event"
              @remove="onRemoveCover"
            />
          </div>

          <button
            class="btn btn-primary round px-4"
            :disabled="visualSaving || (!logoFile && !coverFile && !logoRemoved && !coverRemoved)"
            @click="saveVisual"
          >
            {{ visualSaving ? $t('pages.teams.manage.settings.saving') : $t('pages.teams.manage.settings.save') }}
          </button>
        </div>


        <div class="set-card danger" v-if="can('manage_settings')">
          <h3>{{ $t('pages.teams.manage.settings.danger') }}</h3>
          <p class="set-desc">{{ $t('pages.teams.manage.settings.danger_desc') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn round px-4"
              style="background:color-mix(in srgb,#e23b3b 12%,transparent);color:#e23b3b;border:1px solid color-mix(in srgb,#e23b3b 35%,transparent)"
              @click="openModal('delete')">
              <font-awesome-icon icon="trash" class="me-2" />
              {{ $t('pages.teams.manage.settings.delete') }}
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- CONFIRM MODAL -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="modal" class="cm-overlay" @click.self="closeModal">
          <div class="cm-card">
            <!-- remove member -->
            <template v-if="modal.type === 'remove_member'">
              <div class="cm-icon remove_member">
                <font-awesome-icon icon="user-minus" />
              </div>
              <h3 class="cm-title">{{ $t('pages.teams.manage.roster.remove_confirm_title') }}</h3>
              <p class="cm-desc" v-html="$t('pages.teams.manage.roster.remove_confirm_desc', { name: modal.data?.name })" />
            </template>
            <!-- leave -->
            <template v-else-if="modal.type === 'leave'">
              <div class="cm-icon leave">
                <font-awesome-icon icon="right-from-bracket" />
              </div>
              <h3 class="cm-title">{{ $t('pages.teams.manage.settings.leave') }}</h3>
              <p class="cm-desc">{{ $t('pages.teams.manage.settings.leave_confirm') }}</p>
            </template>
            <!-- delete -->
            <template v-else>
              <div class="cm-icon delete">
                <font-awesome-icon icon="trash" />
              </div>
              <h3 class="cm-title">{{ $t('pages.teams.manage.settings.delete') }}</h3>
              <p class="cm-desc">{{ $t('pages.teams.manage.settings.delete_confirm') }}</p>
            </template>

            <div class="cm-actions">
              <button class="btn btn-outline-secondary round px-4" @click="closeModal" :disabled="modal.loading">
                {{ $t('pages.teams.manage.settings.cancel') }}
              </button>
              <button class="btn btn-danger round px-4" :disabled="modal.loading" @click="onModalConfirm">
                <font-awesome-icon v-if="modal.loading" icon="spinner" spin class="me-2" />
                {{ $t('pages.teams.manage.settings.confirm') }}
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
import EhubColorPicker from '@/components/inputs/ehub-color-picker.vue'
import EhubProfileImageUpload from '@/components/inputs/EhubProfileImageUpload.vue'
import EhubStatCard from '@/components/EhubStatCard.vue'
import EhubActivityLog from '@/components/EhubActivityLog.vue'

const AVATAR_PALETTE = ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a']

function strHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export default {
  name: 'TeamManage',
  components: { EhubColorPicker, EhubProfileImageUpload, EhubStatCard, EhubActivityLog },

  data() {
    return {
      loading: true,
      team: null,
      activePanel: 'overview',
      settingsForm: { name: '', tag: '', description: '', color: '#0098D8', is_open: true },
      settingsSaving: false,
      inviteInput: '',
      inviteRole: 'starter',
      colorSwatches: ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a'],
      modal: null,
      logoFile: null,
      logoVersion: Date.now(),
      logoRemoved: false,
      coverFile: null,
      coverVersion: Date.now(),
      coverRemoved: false,
      visualSaving: false,
      activities: [],
      activitiesLoading: false,
      applications: [],
      applicationsLoading: false,
      rolesData: [],
      rolePermKeys: ['invite_members', 'manage_applications', 'manage_roster', 'manage_settings', 'manage_visual'],
    }
  },

  computed: {
    teamRoute() {
      return this.$route.params.teamRoute
    },
    initials() {
      if (!this.team?.name) return '?'
      return this.team.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    },
    categoryName() {
      if (!this.team?.category) return '—'
      return this.$t(`categories.names.${this.team.category}`)
    },
    logoUrl() {
      if (!this.team?.logo_image) return null
      return SystemVars.baseUrl + 'storage/' + this.team.logo_image + '?v=' + this.logoVersion
    },
    coverUrl() {
      if (!this.team?.cover_image) return null
      return SystemVars.baseUrl + 'storage/' + this.team.cover_image + '?v=' + this.coverVersion
    },
    myRole() {
      return this.team?.my_role || 'member'
    },
    myPermissions() {
      return this.team?.my_permissions || {}
    },
    can() {
      return (perm) => this.myRole === this.rootRoleName || !!this.myPermissions[perm]
    },
    rootRoleName() {
      return this.rolesData.find(r => !r.parent_id)?.name || null
    },
    assignableRoles() {
      return this.team?.assignable_roles || []
    },
    assignableRoleNames() {
      return this.assignableRoles.map(r => r.name)
    },
    invitableRoles() {
      if (!this.rolesData.length) return []
      if (this.myRole === this.rootRoleName) return this.rolesData
      const result = []
      const traverse = (parentId) => {
        this.rolesData.filter(r => r.parent_id === parentId).forEach(r => {
          result.push(r)
          traverse(r.id)
        })
      }
      const mine = this.rolesData.find(r => r.name === this.myRole)
      if (mine) traverse(mine.id)
      return result
    },
    myId() {
      return this.team?.my_id || null
    },
    isOnlyRoot() {
      if (!this.team || !this.rootRoleName) return false
      if (this.myRole !== this.rootRoleName) return false
      return (this.team.members?.filter(m => m.role === this.rootRoleName).length ?? 0) <= 1
    },
    activitiesWithIcons() {
      return this.activities.map(a => ({
        ...a,
        icon: a.type === 'team_member_removed' ? 'user-minus' : a.type === 'team_role_changed' ? 'user-pen' : 'user-plus',
      }))
    },
    activeColor() {
      return this.settingsForm.color || this.team?.color || '#0098D8'
    },
    sbLogoStyle() {
      return { background: this.activeColor }
    },
  },

  methods: {
    async loadTeam() {
      this.loading = true
      const res = await Teams.getByRoute(this.teamRoute)
      if (res.code === 200 && res.data) {
        this.team = res.data
        this.settingsForm = {
          name: this.team.name,
          tag: this.team.tag || '',
          description: this.team.description || '',
          color: this.team.color || '#0098D8',
          is_open: this.team.is_open,
        }
      } else {
        this.team = null
        this.$router.push('/my-teams')
      }
      this.loading = false
    },

    setPanel(panel) {
      this.activePanel = panel
      this.$router.replace({ query: { ...this.$route.query, tab: panel } })
      if (panel === 'applications' && this.team) this.loadApplications()
      if (panel === 'roles' && !this.rolesData.length) this.loadRoles()
      if (panel === 'overview' && this.team) this.loadActivities()
    },

    async loadRoles() {
      const res = await Teams.getRoles()
      if (res.code === 200) {
        const data = res.data
        const sorted = []
        const traverse = (parentId) => {
          data.filter(r => r.parent_id === parentId).forEach(r => {
            sorted.push(r)
            traverse(r.id)
          })
        }
        const root = data.find(r => !r.parent_id)
        if (root) { sorted.push(root); traverse(root.id) }
        this.rolesData = sorted
      }
    },

    async loadActivities() {
      if (!this.team) return
      this.activitiesLoading = true
      const res = await Teams.getActivities(this.team.id)
      if (res.code === 200) this.activities = res.data
      this.activitiesLoading = false
    },

    async loadApplications() {
      this.applicationsLoading = true
      const res = await Teams.listApplications(this.team.id)
      if (res.code === 200) {
        this.applications = res.data
      } else {
        toast.error(this.$t('pages.teams.manage.applications.load_error'))
      }
      this.applicationsLoading = false
    },

    async acceptApplication(app) {
      const res = await Teams.acceptApplication(this.team.id, app.id)
      if (res.code === 200) {
        this.applications = this.applications.filter(a => a.id !== app.id)
        toast.success(this.$t('pages.teams.manage.applications.accepted'))
        await this.loadTeam()
        this.loadActivities()
      }
    },

    async rejectApplication(app) {
      const res = await Teams.rejectApplication(this.team.id, app.id)
      if (res.code === 200) {
        this.applications = this.applications.filter(a => a.id !== app.id)
        toast.success(this.$t('pages.teams.manage.applications.rejected'))
      }
    },

    avatarStyle(member) {
      const color = AVATAR_PALETTE[strHash(member.id || member.name || '') % AVATAR_PALETTE.length]
      return { background: color }
    },

    memberInitials(member) {
      return (member.name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
    },

    async saveSettings() {
      this.settingsSaving = true
      const res = await Teams.updateSettings(this.team.id, {
        name: this.settingsForm.name,
        tag: this.settingsForm.tag,
        description: this.settingsForm.description,
        color: this.settingsForm.color,
        is_open: this.settingsForm.is_open,
      })
      this.settingsSaving = false
      if (res.code === 200) {
        if (res.data) {
          this.team = { ...this.team, ...res.data }
        }
        toast.success(this.$t('pages.teams.manage.settings.saved'))
      } else {
        toast.error(this.$t('pages.teams.manage.settings.save_error'))
      }
    },

    async doRemoveMember(member) {
      if (this.modal) this.modal.loading = true
      const res = await Teams.removeMember(this.team.id, member.id)
      if (this.modal) this.modal.loading = false
      if (res.code === 200) {
        this.modal = null
        this.team.members = this.team.members.filter(m => m.id !== member.id)
        this.team.players_count = Math.max(0, (this.team.players_count || 1) - 1)
        toast.success(this.$t('pages.teams.manage.roster.removed'))
      } else if (res.message === 'no_last_captain') {
        this.modal = null
        toast.error(this.$t('pages.teams.manage.roster.no_last_captain', {
          role: this.$t(`pages.teams.manage.roles.${this.rootRoleName}`)
        }))
      } else {
        this.modal = null
        const key = `pages.teams.manage.roster.${res.message}`
        toast.error(this.$te(key) ? this.$t(key) : this.$t('pages.teams.manage.roster.remove_error'))
      }
    },

    async changeRole(member, newRole) {
      if (newRole === member.role) return
      const res = await Teams.updateMemberRole(this.team.id, member.id, newRole)
      if (res.code === 200) {
        member.role = newRole
        toast.success(this.$t('pages.teams.manage.roster.role_changed'))
      } else {
        const key = `pages.teams.manage.roster.${res.message}`
        toast.error(this.$te(key) ? this.$t(key) : this.$t('pages.teams.manage.roster.role_change_error'))
      }
    },

    async sendInvite() {
      if (!this.inviteInput.trim()) return
      const res = await Teams.invite(this.team.id, { input: this.inviteInput.trim(), role: this.inviteRole })
      if (res.code === 200) {
        this.inviteInput = ''
        toast.success(this.$t('pages.teams.manage.roster.invite_sent'))
        if (res.message === 'Member added') await this.loadTeam()
      } else if (res.code === 409) {
        toast.error(this.$t('pages.teams.manage.roster.invite_already_member'))
      } else if (res.code === 404) {
        toast.error(this.$t('pages.teams.manage.roster.invite_not_found'))
      } else {
        toast.error(this.$t('pages.teams.manage.roster.invite_error'))
      }
    },

    openModal(type, data = null) {
      this.modal = { type, loading: false, data }
    },

    onModalConfirm() {
      if (this.modal.type === 'remove_member') this.doRemoveMember(this.modal.data)
      else if (this.modal.type === 'leave') this.doLeave()
      else if (this.modal.type === 'delete') this.doDelete()
    },

    closeModal() {
      if (this.modal?.loading) return
      this.modal = null
    },

    async doLeave() {
      this.modal.loading = true
      const res = await Teams.leaveTeam(this.team.id)
      this.modal.loading = false
      if (res.code === 200) {
        this.modal = null
        toast.success(this.$t('pages.teams.manage.settings.leave_success'))
        this.$router.push('/my-teams')
      } else if (res.message === 'no_other_captain') {
        this.modal = null
        toast.error(this.$t('pages.teams.manage.settings.leave_no_captain'))
      } else {
        toast.error(this.$t('pages.teams.manage.settings.leave_error'))
      }
    },

    async doDelete() {
      this.modal.loading = true
      const res = await Teams.deleteTeam(this.team.id)
      this.modal.loading = false
      if (res.code === 200) {
        this.modal = null
        toast.success(this.$t('pages.teams.manage.settings.delete_success'))
        this.$router.push('/my-teams')
      } else {
        toast.error(this.$t('pages.teams.manage.settings.delete_error'))
      }
    },

    async saveVisual() {
      this.visualSaving = true
      const tasks = []
      if (this.logoFile) tasks.push(this._uploadLogo())
      else if (this.logoRemoved) tasks.push(this._removeLogo())
      if (this.coverFile) tasks.push(this._uploadCover())
      else if (this.coverRemoved) tasks.push(this._removeCover())
      await Promise.all(tasks)
      this.visualSaving = false
    },

    onRemoveLogo() {
      this.team.logo_image = null
      this.logoFile = null
      this.logoRemoved = true
    },

    onRemoveCover() {
      this.team.cover_image = null
      this.coverFile = null
      this.coverRemoved = true
    },

    async _uploadLogo() {
      const res = await Teams.uploadLogo(this.team.id, this.logoFile)
      if (res.code === 200) {
        this.logoVersion = Date.now()
        this.team.logo_image = res.data?.logo_image || this.team.logo_image || `teams/${this.team.route}/logo.webp`
        this.logoFile = null
        this.$refs.logoUpload?.reset()
        toast.success(this.$t('pages.teams.manage.settings.logo_uploaded'))
      } else {
        toast.error(this.$t('pages.teams.manage.settings.logo_upload_error'))
      }
    },

    async _removeLogo() {
      const res = await Teams.removeLogo(this.team.id)
      if (res.code === 200) {
        this.logoRemoved = false
        this.logoVersion = Date.now()
      }
    },

    async _uploadCover() {
      const res = await Teams.uploadCover(this.team.id, this.coverFile)
      if (res.code === 200) {
        this.coverVersion = Date.now()
        this.team.cover_image = res.data?.cover_image || this.team.cover_image || `teams/${this.team.route}/cover.webp`
        this.coverFile = null
        this.$refs.coverUpload?.reset()
        toast.success(this.$t('pages.teams.manage.settings.cover_uploaded'))
      } else {
        toast.error(this.$t('pages.teams.manage.settings.cover_upload_error'))
      }
    },

    async _removeCover() {
      const res = await Teams.removeCover(this.team.id)
      if (res.code === 200) {
        this.coverRemoved = false
        this.coverVersion = Date.now()
      }
    },
  },

  created() {
    const tab = this.$route.query.tab
    if (tab) this.activePanel = tab
    this.loadTeam().then(() => {
      if (this.activePanel === 'applications' && this.team) this.loadApplications()
      if (this.activePanel === 'overview' && this.team) this.loadActivities()
    })
    this.loadRoles().then(() => {
      if (this.invitableRoles.length) this.inviteRole = this.invitableRoles[0].name
    })
  },
}
</script>

<style scoped>
.mgmt-wrap { display: flex; min-height: calc(100vh - 60px); }

.mgmt-sidebar {
  width: 236px; flex-shrink: 0;
  background: var(--ehub-card); border-right: 1px solid var(--ehub-line);
  position: sticky; top: 60px; height: calc(100vh - 60px);
  overflow-y: auto; display: flex; flex-direction: column;
}

.sb-team {
  padding: 15px 14px; border-bottom: 1px solid var(--ehub-line);
  display: flex; align-items: center; gap: 10px;
}
.sb-logo {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .92rem; font-weight: 800; color: #fff; overflow: hidden;
}
.sb-name { font-size: .84rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-cat  { font-size: .7rem; color: var(--ehub-muted); }

.sb-nav  { padding: 9px 7px; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 9px;
  cursor: pointer; color: var(--ehub-muted); font-size: .875rem; font-weight: 600;
  transition: all .15s; text-decoration: none; border: 0; background: transparent;
  width: 100%; text-align: left; margin-bottom: 2px;
}
.nav-item svg { width: 15px; text-align: center; font-size: .8rem; flex-shrink: 0; }
.nav-item:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); text-decoration: none; }
.nav-item.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.nav-div { height: 1px; background: var(--ehub-line); margin: 6px 3px; }

.mgmt-main { flex: 1; padding: 28px 32px; min-width: 0; }
.mgmt-state { display: flex; align-items: center; justify-content: center; }

.pnl-hd { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.pnl-hd h1 { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 2px; letter-spacing: -.02em; }
.pnl-hd p { color: var(--ehub-muted); font-size: .84rem; margin: 0; }

.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 13px; margin-bottom: 22px; }

.dash-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 16px; }

.cc { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.cc-hd { display: flex; align-items: center; gap: 10px; padding: 13px 17px; border-bottom: 1px solid var(--ehub-line); }
.cc-hd h3 { font-size: .9rem; font-weight: 700; color: var(--ehub-ink); margin: 0; flex: 1; }
.cc-link { font-size: .78rem; font-weight: 600; color: var(--ehub-primary); cursor: pointer; background: none; border: 0; padding: 0; }
.cc-link:hover { text-decoration: underline; }

.mgmt-tbl { width: 100%; border-collapse: collapse; }
.mgmt-tbl th { font-size: .67rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 9px 15px; text-align: left; border-bottom: 1px solid var(--ehub-line); white-space: nowrap; }
.mgmt-tbl td { padding: 11px 15px; border-bottom: 1px solid var(--ehub-line); font-size: .875rem; color: var(--ehub-ink); vertical-align: middle; }
.mgmt-tbl tbody tr:last-child td { border-bottom: 0; }
.mgmt-tbl tbody tr:hover td { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.td-muted { color: var(--ehub-muted) !important; font-size: .82rem !important; }
.td-name  { font-weight: 600; }

.act-row { display: flex; gap: 4px; }
.act-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--ehub-line); background: transparent; color: var(--ehub-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: .75rem; transition: all .15s; }
.act-btn:hover     { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.act-btn.del:hover { background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; border-color: color-mix(in srgb,#e23b3b 35%,transparent); }
.act-btn.up:hover  { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }

.m-av { width: 30px; height: 30px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: .64rem; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; position: relative; }
.m-av-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

.roles-tbl th { text-align: center; font-size: .78rem; }
.roles-tbl th:first-child { text-align: left; }
.perm-label { font-size: .82rem; color: var(--ehub-text); }
.perm-dot { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: .75rem; font-weight: 700; }
.perm-dot--yes       { background: color-mix(in srgb,#1f8a5b 18%,transparent); color: #1f8a5b; }
.perm-dot--always    { background: color-mix(in srgb,var(--ehub-gold) 18%,transparent); color: color-mix(in srgb,var(--ehub-gold),#000 20%); }
.perm-dot--inherited { background: color-mix(in srgb,var(--ehub-primary) 14%,transparent); color: var(--ehub-primary); }
.perm-dot--no        { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.roles-legend { font-size: .75rem; color: var(--ehub-muted); margin-top: 12px; display: flex; align-items: center; gap: 6px; }
html[data-bs-theme="dark"] .perm-dot--yes    { color: #51cf66; background: color-mix(in srgb,#51cf66 14%,transparent); }
html[data-bs-theme="dark"] .perm-dot--always { color: var(--ehub-gold); }


.role-chip { font-size: .7rem; font-weight: 700; padding: 3px 9px; border-radius: 50rem; display: inline-block; }
.role-select { font-size: .7rem; font-weight: 700; padding: 3px 8px; border-radius: 50rem; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); color: var(--ehub-ink); cursor: pointer; }
.role-chip.captain { background: color-mix(in srgb,var(--ehub-gold) 20%,transparent); color: color-mix(in srgb,var(--ehub-gold),#000 28%); }
.role-chip.vice    { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.role-chip.starter { background: color-mix(in srgb,#1f8a5b 14%,transparent); color: #1f8a5b; }
.role-chip.reserve { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.role-chip.coach   { background: color-mix(in srgb,#7C3AED 14%,transparent); color: #7C3AED; }
.role-chip.member  { background: var(--ehub-field-bg); color: var(--ehub-muted); }

.ev-mini { display: flex; align-items: center; gap: 11px; padding: 11px 17px; border-bottom: 1px solid var(--ehub-line); }
.ev-mini:last-child { border-bottom: 0; }
.ev-mini-body { flex: 1; min-width: 0; }
.ev-mini-name { font-size: .87rem; font-weight: 600; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ev-mini-meta { font-size: .73rem; color: var(--ehub-muted); }

.set-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 22px 24px; margin-bottom: 16px; }
.set-card h3 { font-size: .97rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 3px; }
.set-desc { font-size: .83rem; color: var(--ehub-muted); margin: 0 0 18px; }
.set-card.danger { border-color: color-mix(in srgb,#e23b3b 30%,var(--ehub-line)); }
.set-card.danger h3 { color: #e23b3b; }

/* Confirm modal */
.cm-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.45); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.cm-card {
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 18px; padding: 32px 28px; max-width: 420px; width: 100%;
  box-shadow: var(--ehub-shadow); text-align: center;
}
.cm-icon {
  width: 52px; height: 52px; border-radius: 14px; margin: 0 auto 18px;
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.cm-icon.leave { background: var(--ehub-field-bg); color: var(--ehub-muted); }
.cm-icon.delete { background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; }
.cm-icon.remove_member { background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; }
.only-root-msg { margin: 0; font-size: .8rem; color: var(--ehub-muted); max-width: 320px; }
.cm-title { font-size: 1.05rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 8px; }
.cm-desc  { font-size: .875rem; color: var(--ehub-muted); margin: 0 0 24px; line-height: 1.5; }
.cm-actions { display: flex; gap: 10px; justify-content: center; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.swatch-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 10px; }
.grad-sw { width: 32px; height: 32px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: transform .12s, box-shadow .12s; }
.grad-sw:hover { transform: scale(1.1); }
.grad-sw.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.06); }

.app-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--ehub-line); }
.app-row:last-child { border-bottom: 0; }
.app-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--ehub-primary); color: #fff; font-size: .85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.app-info { flex: 1; min-width: 0; }
.app-name { font-weight: 700; color: var(--ehub-ink); font-size: .95rem; }
.app-handle { font-weight: 400; color: var(--ehub-muted); font-size: .85rem; margin-left: 4px; }
.app-role { font-size: .78rem; color: var(--ehub-primary); font-weight: 600; margin-top: 2px; text-transform: capitalize; }
.app-msg { font-size: .88rem; color: var(--ehub-muted); margin-top: 6px; line-height: 1.5; }
.app-actions { display: flex; flex-direction: column; flex-shrink: 0; }

html[data-bs-theme="dark"] .role-chip.captain { color: var(--ehub-gold); }
html[data-bs-theme="dark"] .role-chip.starter { color: #51cf66; background: color-mix(in srgb,#51cf66 14%,transparent); }
html[data-bs-theme="dark"] .role-chip.coach   { color: #c89bff; background: color-mix(in srgb,#b06bff 18%,transparent); }

@media (max-width: 1100px) {
  .stat-grid { grid-template-columns: repeat(2,1fr); }
  .dash-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .mgmt-wrap { flex-direction: column; }
  .mgmt-sidebar { width: 100%; height: auto; position: relative; top: 0; border-right: 0; border-bottom: 1px solid var(--ehub-line); flex-direction: row; overflow-x: auto; }
  .sb-team { border-bottom: 0; border-right: 1px solid var(--ehub-line); flex-shrink: 0; }
  .sb-nav { display: flex; flex-direction: row; padding: 8px; gap: 3px; overflow-x: auto; }
  .nav-item { white-space: nowrap; flex-shrink: 0; margin-bottom: 0; }
  .nav-div { display: none; }
  .mgmt-main { padding: 18px 14px; }
  .stat-grid { grid-template-columns: repeat(2,1fr); }
  .app-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .app-actions { flex-direction: row; gap: 8px; }
  .app-actions .btn { margin-top: 0 !important; }
}
</style>
