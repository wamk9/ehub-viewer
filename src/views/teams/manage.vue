<template>
  <div class="mgmt-wrap">

    <!-- SIDEBAR -->
    <aside class="mgmt-sidebar">
      <div class="sb-team">
        <template v-if="team">
          <div class="sb-logo" :style="sbLogoStyle">
            <img v-if="team.logo_image" :src="logoUrl" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:9px" />
            <span v-else>{{ initials }}</span>
          </div>
          <div style="min-width:0">
            <div class="sb-name">{{ team.name }}</div>
            <div class="sb-cat">{{ categoryName }}</div>
          </div>
        </template>
        <template v-else>
          <div class="sb-logo sb-skel"></div>
          <div style="flex:1;min-width:0">
            <div class="sb-skel" style="height:12px;border-radius:4px;width:75%;margin-bottom:6px"></div>
            <div class="sb-skel" style="height:10px;border-radius:4px;width:45%"></div>
          </div>
        </template>
      </div>
      <button class="mob-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
        <font-awesome-icon :icon="activeNavIcon" style="width:15px;flex-shrink:0" />
        <span>{{ activeNavLabel }}</span>
        <font-awesome-icon icon="chevron-down" class="mob-chevron" :class="{ 'mob-chevron-open': mobileMenuOpen }" />
      </button>

      <nav class="sb-nav" :class="{ 'mob-open': mobileMenuOpen }">
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
        <button class="nav-item" :class="{ active: activePanel === 'activity' }" @click="setPanel('activity')">
          <font-awesome-icon icon="calendar-days" />
          <span>{{ $t('pages.teams.manage.nav.activity') }}</span>
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
        <router-link class="nav-item sb-util" :to="`/team/${teamRoute}`">
          <font-awesome-icon icon="arrow-up-right-from-square" />
          <span>{{ $t('pages.teams.manage.nav.public') }}</span>
        </router-link>
        <router-link class="nav-item sb-util" to="/my-teams">
          <font-awesome-icon icon="arrow-left" />
          <span>{{ $t('pages.teams.manage.nav.back') }}</span>
        </router-link>
      </nav>
    </aside>
    <div v-if="mobileMenuOpen" class="mob-nav-backdrop" @click="mobileMenuOpen = false"></div>

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
            :activities="activitiesWithIcons.slice(0, 10)"
            :loading="activitiesLoading"
            :loading-label="$t('pages.teams.manage.loading')"
            :empty-label="$t('pages.teams.manage.activity_empty')"
            :show-more="activitiesWithIcons.length >= 10"
            @view-more="setPanel('activity')"
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
              <span v-else-if="activity.type === 'team_invite_sent'" v-html="$t('pages.teams.manage.activity_invite_sent', {
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
              <tr v-for="m in team.members" :key="m.id"
                  :class="{ 'roster-clickable': can('manage_roster') && assignableRoleNames.includes(m.role) && m.id !== myId }"
                  @click="openMemberModal(m)">
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
                  <span class="role-chip mob-role" :class="m.role">{{ $t(`pages.teams.manage.roles.${m.role}`) }}</span>
                </td>
                <td>
                  <div class="act-row" v-if="can('manage_roster') && assignableRoleNames.includes(m.role) && m.id !== myId">
                    <button class="act-btn del" :title="$t('pages.teams.manage.roster.remove')" @click.stop="openModal('remove_member', m)">
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
              style="flex:1;min-width:180px" :disabled="inviteLoading" />
            <select v-model="inviteRole" class="form-select" style="flex:0 0 140px" :disabled="inviteLoading">
              <option v-for="r in invitableRoles" :key="r.id" :value="r.name">
                {{ $t(`pages.teams.manage.roles.${r.name}`) }}
              </option>
            </select>
          </div>
          <button class="btn btn-primary round px-4 w-100 mt-2"
            @click="sendInvite" :disabled="!inviteInput.trim() || inviteLoading">
            <font-awesome-icon v-if="inviteLoading" :icon="['fas', 'circle-notch']" spin class="me-2" />
            {{ $t('pages.teams.manage.roster.send_invite') }}
          </button>
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
                <div v-if="app.desired_role" class="app-role">{{ $t('pages.teams.manage.applications.role_prefix') }}: {{ $t('pages.teams.manage.roles.' + app.desired_role, app.desired_role) }}</div>
                <div class="app-msg">{{ app.message }}</div>
              </div>
              <div class="app-actions">
                <button class="btn btn-sm btn-success round" @click="acceptApplication(app)"
                  :disabled="!invitableRoles.some(r => r.name === app.desired_role)">{{ $t('pages.teams.manage.applications.accept') }}</button>
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

        <EhubRolePermissionsTable
          v-if="rolesData.length"
          :roles="rolesData"
          :perm-keys="rolePermKeys"
          role-prefix="pages.teams.manage.roles"
          perm-prefix="pages.teams.manage.roles_panel.permissions"
          :col-label="$t('pages.teams.manage.roster.col_role')"
          :granted-label="$t('pages.teams.manage.roles_panel.granted')"
          :inherited-label="$t('pages.teams.manage.roles_panel.inherited')"
          :denied-label="$t('pages.teams.manage.roles_panel.denied')"
        />
        <div v-else class="mgmt-state">
          <font-awesome-icon icon="spinner" spin style="font-size:1.5rem;color:var(--ehub-muted)" />
        </div>
      </section>

      <!-- ACTIVITY -->
      <section v-show="activePanel === 'activity'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('pages.teams.manage.activity_all_title') }}</h1>
            <p>{{ $t('pages.teams.manage.activity_all_sub') }}</p>
          </div>
        </div>

        <div class="act-pag-bar">
          <div class="act-pag-info" v-if="allActivitiesTotal > 0">
            {{ allActivitiesTotal }} {{ $t('pages.teams.manage.activity_total') }}
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-left:auto">
            <label style="font-size:.78rem;color:var(--ehub-muted)">{{ $t('pages.teams.manage.activity_per_page') }}</label>
            <select class="form-select form-select-sm" style="width:auto" :value="allActivitiesPerPage" @change="changeActivityPerPage(+$event.target.value)" :disabled="allActivitiesLoading">
              <option v-for="n in [10,20,50,100]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>

        <div v-if="allActivitiesLoading" class="mgmt-state">
          <font-awesome-icon icon="spinner" spin style="font-size:1.5rem;color:var(--ehub-muted)" />
        </div>

        <template v-else-if="activitiesGroupedByDate.length">
          <div v-for="group in activitiesGroupedByDate" :key="group[0]" class="act-cal-group">
            <div class="act-cal-date">
              <font-awesome-icon icon="calendar-day" class="me-2" style="opacity:.5" />
              {{ group[0] }}
            </div>
            <div class="cc">
              <div v-for="a in group[1]" :key="a.id" class="act-item">
                <div class="act-icon">
                  <font-awesome-icon :icon="['fas', a.icon || 'user-plus']" />
                </div>
                <div class="act-body">
                  <div class="act-text" v-html="activityHtml(a)" />
                  <div class="act-time">{{ activityTime(a.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="act-pag-nav" v-if="allActivitiesPages > 1">
            <button class="pag-btn" :disabled="allActivitiesPage <= 1" @click="changeActivityPage(allActivitiesPage - 1)">
              <font-awesome-icon icon="chevron-left" />
            </button>
            <button v-for="p in allActivitiesPages" :key="p" class="pag-btn" :class="{ active: p === allActivitiesPage }" @click="changeActivityPage(p)">
              {{ p }}
            </button>
            <button class="pag-btn" :disabled="allActivitiesPage >= allActivitiesPages" @click="changeActivityPage(allActivitiesPage + 1)">
              <font-awesome-icon icon="chevron-right" />
            </button>
          </div>
        </template>

        <div v-else class="cc" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 20px;color:var(--ehub-muted)">
          <font-awesome-icon icon="clock-rotate-left" style="font-size:1.5rem;opacity:.3;margin-bottom:10px" />
          <p style="margin:0;font-size:.83rem">{{ $t('pages.teams.manage.activity_empty') }}</p>
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
          <button class="btn btn-primary round px-4" :disabled="settingsSaving || !settingsChanged" @click="saveSettings">
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

    <!-- MOBILE MEMBER MODAL -->
    <teleport to="body">
      <transition name="mob-mm-slide">
        <div v-if="mobileMemberModal" class="mob-mm-overlay" @click.self="closeMemberModal">
          <div class="mob-mm-card">
            <div class="mob-mm-head">
              <div class="m-av" :style="avatarStyle(mobileMemberModal)" style="width:42px;height:42px;border-radius:11px;font-size:.82rem">
                <img :src="mobileMemberModal.avatar" class="m-av-img" alt=""
                  @error="$event.target.style.display='none'"
                  @load="$event.target.nextElementSibling.style.display='none'" />
                <span>{{ memberInitials(mobileMemberModal) }}</span>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;color:var(--ehub-ink);font-size:.97rem">{{ mobileMemberModal.name }}</div>
                <div style="font-size:.8rem;color:var(--ehub-muted)">@{{ mobileMemberModal.username }}</div>
              </div>
              <button class="mob-mm-close" @click="closeMemberModal">
                <font-awesome-icon icon="xmark" />
              </button>
            </div>
            <div class="mob-mm-section">
              <p class="mob-mm-label">{{ $t('pages.teams.manage.roster.col_role') }}</p>
              <select v-model="mobileMemberRole" class="form-select">
                <option v-for="r in assignableRoles" :key="r.id" :value="r.name">
                  {{ $t(`pages.teams.manage.roles.${r.name}`) }}
                </option>
              </select>
            </div>
            <div class="mob-mm-actions">
              <button class="btn btn-primary round" style="flex:1" @click="applyMobileMemberRole">
                {{ $t('pages.teams.manage.settings.save') }}
              </button>
              <button class="btn round mob-mm-remove" @click="removeMobileMember">
                <font-awesome-icon icon="user-minus" class="me-1" />
                {{ $t('pages.teams.manage.roster.remove') }}
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
import EhubRolePermissionsTable from '@/components/EhubRolePermissionsTable.vue'

const AVATAR_PALETTE = ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a']

function strHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export default {
  name: 'TeamManage',
  components: { EhubColorPicker, EhubProfileImageUpload, EhubStatCard, EhubActivityLog, EhubRolePermissionsTable },

  data() {
    return {
      loading: true,
      team: null,
      activePanel: 'overview',
      settingsForm: { name: '', tag: '', description: '', color: '#0098D8', is_open: true },
      settingsSaving: false,
      inviteInput: '',
      inviteRole: 'starter',
      inviteLoading: false,
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
      allActivities: [],
      allActivitiesLoading: false,
      allActivitiesTotal: 0,
      allActivitiesPage: 1,
      allActivitiesPerPage: 20,
      applications: [],
      applicationsLoading: false,
      rolesData: [],
      rolePermKeys: ['invite_members', 'manage_applications', 'manage_roster', 'manage_settings', 'manage_visual'],
      mobileMenuOpen: false,
      mobileMemberModal: null,
      mobileMemberRole: '',
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
    settingsChanged() {
      if (!this.team) return false
      return (
        this.settingsForm.name !== (this.team.name || '') ||
        this.settingsForm.tag !== (this.team.tag || '') ||
        this.settingsForm.description !== (this.team.description || '') ||
        this.settingsForm.color !== (this.team.color || '#0098D8')
      )
    },
    activitiesWithIcons() {
      return this.activities.map(a => ({
        ...a,
        icon: a.type === 'team_member_removed' ? 'user-minus' : a.type === 'team_role_changed' ? 'user-pen' : 'user-plus',
      }))
    },
    allActivitiesWithIcons() {
      return this.allActivities.map(a => ({
        ...a,
        icon: a.type === 'team_member_removed' ? 'user-minus' : a.type === 'team_role_changed' ? 'user-pen' : 'user-plus',
      }))
    },
    activitiesGroupedByDate() {
      const locale = this.$i18n?.locale === 'pt-BR' ? 'pt-BR' : this.$i18n?.locale === 'es' ? 'es' : 'en-US'
      const groups = {}
      for (const a of this.allActivitiesWithIcons) {
        const key = new Date(a.created_at).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
        if (!groups[key]) groups[key] = []
        groups[key].push(a)
      }
      return Object.entries(groups)
    },
    allActivitiesPages() {
      return Math.max(1, Math.ceil(this.allActivitiesTotal / this.allActivitiesPerPage))
    },
    activeColor() {
      return this.settingsForm.color || this.team?.color || '#0098D8'
    },
    sbLogoStyle() {
      return { background: this.activeColor }
    },
    activeNavLabel() {
      const map = {
        overview: this.$t('pages.teams.manage.nav.overview'),
        roster: this.$t('pages.teams.manage.nav.roster'),
        applications: this.$t('pages.teams.manage.nav.applications'),
        activity: this.$t('pages.teams.manage.nav.activity'),
        roles: this.$t('pages.teams.manage.nav.roles'),
        settings: this.$t('pages.teams.manage.nav.settings'),
      }
      return map[this.activePanel] || this.activePanel
    },
    activeNavIcon() {
      const map = { overview: 'chart-line', roster: 'users', applications: 'inbox', activity: 'calendar-days', roles: 'shield-halved', settings: 'gear' }
      return map[this.activePanel] || 'bars'
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
      this.mobileMenuOpen = false
      this.$router.replace({ name: 'team-manage', params: { teamRoute: this.teamRoute, tab: panel } })
      if (panel === 'applications' && this.team) this.loadApplications()
      if (panel === 'roles' && !this.rolesData.length) this.loadRoles()
      if (panel === 'overview' && this.team) this.loadActivities()
      if (panel === 'activity' && this.team) this.loadAllActivities()
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
      const res = await Teams.getActivities(this.team.id, 1, 20)
      if (res.code === 200) this.activities = res.data
      this.activitiesLoading = false
    },

    async loadAllActivities() {
      if (!this.team) return
      this.allActivitiesLoading = true
      const res = await Teams.getActivities(this.team.id, this.allActivitiesPage, this.allActivitiesPerPage)
      if (res.code === 200) {
        this.allActivities = res.data
        this.allActivitiesTotal = res.total
      }
      this.allActivitiesLoading = false
    },

    async changeActivityPage(page) {
      this.allActivitiesPage = page
      await this.loadAllActivities()
    },

    async changeActivityPerPage(perPage) {
      this.allActivitiesPerPage = perPage
      this.allActivitiesPage = 1
      await this.loadAllActivities()
    },

    activityHtml(a) {
      const p = a.params || {}
      const r  = (key) => this.$t(`pages.teams.manage.roles.${key}`)
      if (a.type === 'team_role_changed')
        return this.$t('pages.teams.manage.activity_role_changed', { actor: p.actor, target: p.target, old_role: r(p.old_role), new_role: r(p.new_role) })
      if (a.type === 'team_member_removed')
        return this.$t('pages.teams.manage.activity_member_removed', { actor: p.actor, target: p.target, role: r(p.role) })
      if (a.type === 'team_member_joined_application')
        return this.$t('pages.teams.manage.activity_member_joined_application', { actor: p.actor, target: p.target, role: r(p.role) })
      if (a.type === 'team_member_joined_invite')
        return this.$t('pages.teams.manage.activity_member_joined_invite', { actor: p.actor, target: p.target, role: r(p.role) })
      if (a.type === 'team_invite_sent')
        return this.$t('pages.teams.manage.activity_invite_sent', { actor: p.actor, target: p.target, role: r(p.role) })
      return a.type
    },

    activityTime(ts) {
      const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
      if (diff < 60) return this.$t('notification.time.just_now')
      if (diff < 3600) return this.$t('notification.time.minutes_ago', { n: Math.floor(diff / 60) })
      if (diff < 86400) return this.$t('notification.time.hours_ago', { n: Math.floor(diff / 3600) })
      return this.$t('notification.time.days_ago', { n: Math.floor(diff / 86400) })
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
      } else if (res.code === 403) {
        toast.error(this.$t('pages.teams.manage.applications.error_authority'))
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
      if (!this.inviteInput.trim() || this.inviteLoading) return
      this.inviteLoading = true
      const res = await Teams.invite(this.team.id, { input: this.inviteInput.trim(), role: this.inviteRole })
      this.inviteLoading = false
      if (res.code === 200) {
        this.inviteInput = ''
        toast.success(this.$t('pages.teams.manage.roster.invite_sent'))
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

    openMemberModal(m) {
      if (window.innerWidth > 600) return
      if (!this.can('manage_roster') || !this.assignableRoleNames.includes(m.role) || m.id === this.myId) return
      this.mobileMemberModal = m
      this.mobileMemberRole = m.role
    },

    closeMemberModal() {
      this.mobileMemberModal = null
      this.mobileMemberRole = ''
    },

    async applyMobileMemberRole() {
      const m = this.mobileMemberModal
      const newRole = this.mobileMemberRole
      this.closeMemberModal()
      if (newRole !== m.role) await this.changeRole(m, newRole)
    },

    removeMobileMember() {
      const m = this.mobileMemberModal
      this.closeMemberModal()
      this.openModal('remove_member', m)
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
    const tab = this.$route.params.tab
    if (tab) this.activePanel = tab
    this.loadTeam().then(() => {
      if (this.activePanel === 'applications' && this.team) this.loadApplications()
      if (this.activePanel === 'overview' && this.team) this.loadActivities()
      if (this.activePanel === 'activity' && this.team) this.loadAllActivities()
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
.sb-skel { background: var(--ehub-field-bg); animation: skel-pulse 1.4s ease-in-out infinite; }
@keyframes skel-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
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
.act-pag-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.act-pag-info { font-size: .78rem; color: var(--ehub-muted); }
.act-pag-nav { display: flex; gap: 4px; justify-content: center; margin-top: 16px; flex-wrap: wrap; }
.pag-btn { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--ehub-line) !important; background: var(--ehub-card) !important; color: var(--ehub-ink) !important; font-size: .82rem; cursor: pointer; transition: all .15s; appearance: none; outline: none; display: inline-flex; align-items: center; justify-content: center; }
.pag-btn:hover:not(:disabled) { background: var(--ehub-field-bg) !important; }
.pag-btn.active { background: var(--ehub-primary) !important; color: #fff !important; border-color: var(--ehub-primary) !important; }
.pag-btn:disabled { opacity: .4; cursor: default; }
.act-cal-group { margin-bottom: 18px; }
.act-cal-date { font-size: .78rem; font-weight: 700; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; padding: 0 2px 8px; }
.act-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 15px; border-bottom: 1px solid var(--ehub-line); }
.act-item:last-child { border-bottom: 0; }
.act-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--ehub-field-bg); color: var(--ehub-muted); display: flex; align-items: center; justify-content: center; font-size: .72rem; flex-shrink: 0; margin-top: 1px; }
.act-body { flex: 1; min-width: 0; }
.act-text { font-size: .82rem; color: var(--ehub-ink); line-height: 1.4; }
.act-text :deep(strong) { font-weight: 700; }
.act-time { font-size: .72rem; color: var(--ehub-muted); margin-top: 2px; }
.act-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--ehub-line); background: transparent; color: var(--ehub-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: .75rem; transition: all .15s; }
.act-btn:hover     { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.act-btn.del:hover { background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; border-color: color-mix(in srgb,#e23b3b 35%,transparent); }
.act-btn.up:hover  { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }

.m-av { width: 30px; height: 30px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: .64rem; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; position: relative; }
.m-av-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }


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

.mob-menu-toggle { display: none; }
.mob-role { display: none !important; }
.mob-nav-backdrop { display: none; }

/* Member action modal (mobile) — always defined so teleport + transition work */
.mob-mm-overlay {
  position: fixed; inset: 0; z-index: 9998;
  background: rgba(0,0,0,.5); backdrop-filter: blur(2px);
  display: flex; align-items: flex-end;
}
.mob-mm-card {
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 20px 20px 0 0; width: 100%;
  padding: 20px 20px 36px;
  box-shadow: 0 -4px 24px rgba(0,0,0,.2);
}
.mob-mm-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.mob-mm-section { margin-bottom: 16px; }
.mob-mm-label { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 6px; }
.mob-mm-actions { display: flex; gap: 10px; }
.mob-mm-close {
  margin-left: auto; width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--ehub-line); background: var(--ehub-field-bg);
  color: var(--ehub-muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.mob-mm-remove {
  background: color-mix(in srgb,#e23b3b 12%,transparent);
  color: #e23b3b; border: 1px solid color-mix(in srgb,#e23b3b 35%,transparent);
  white-space: nowrap;
}
.mob-mm-slide-enter-active { transition: transform .22s ease; }
.mob-mm-slide-leave-active { transition: transform .18s ease; }
.mob-mm-slide-enter-from, .mob-mm-slide-leave-to { transform: translateY(100%); }

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
  .mgmt-sidebar {
    width: 100%; height: auto; overflow-y: visible; overflow-x: visible;
    position: sticky; top: 60px; z-index: 20;
    flex-direction: column;
    border-right: 0; border-bottom: 1px solid var(--ehub-line);
  }
  .sb-team { border-right: 0; border-bottom: 1px solid var(--ehub-line); flex-shrink: 0; padding: 8px 14px; }
  .sb-logo { width: 32px; height: 32px; border-radius: 8px; font-size: .72rem; }
  .sb-name { font-size: .78rem; }
  .sb-cat  { font-size: .65rem; }

  .mob-menu-toggle {
    display: flex; align-items: center; gap: 9px; width: 100%;
    padding: 11px 14px; border: 0; background: transparent;
    color: var(--ehub-ink); font-size: .875rem; font-weight: 600;
    cursor: pointer; text-align: left;
  }
  .mob-menu-toggle:hover { background: var(--ehub-field-bg); }
  .mob-chevron { margin-left: auto; font-size: .75rem; transition: transform .2s; }
  .mob-chevron-open { transform: rotate(180deg); }

  /* Dropdown: absolute so it floats over content, not pushing it */
  .sb-nav {
    display: none;
    position: absolute; left: 0; right: 0; top: 100%;
    flex-direction: column; padding: 6px; gap: 2px;
    background: var(--ehub-card);
    border-bottom: 1px solid var(--ehub-line);
    box-shadow: 0 8px 24px rgba(0,0,0,.15);
    z-index: 21;
  }
  .sb-nav.mob-open { display: flex; }
  .mob-nav-backdrop { display: block; position: fixed; inset: 0; z-index: 19; }

  .nav-item {
    flex: unset; flex-direction: row; justify-content: flex-start; align-items: center;
    padding: 10px 12px; border-radius: 9px; gap: 9px;
    font-size: .875rem; white-space: nowrap; text-align: left;
    margin-bottom: 0; border-bottom: 0; width: 100%;
  }
  .nav-item svg { font-size: .875rem; width: 15px; }
  .nav-item:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }
  .nav-item.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-bottom: 0; }
  .nav-div { display: block; }
  .sb-util { display: flex !important; }

  .mgmt-main { padding: 16px 14px; }
  .stat-grid { grid-template-columns: repeat(2,1fr); }
  .app-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .app-actions { flex-direction: row; gap: 8px; }
  .app-actions .btn { margin-top: 0 !important; }
}
@media (max-width: 600px) {
  .mgmt-tbl { display: block; }
  .mgmt-tbl thead { display: none; }
  .mgmt-tbl tbody { display: block; }
  .mgmt-tbl tbody tr { display: flex; align-items: center; gap: 8px; padding: 10px 14px; }
  .mgmt-tbl tbody td { display: block; padding: 0; border: 0; }
  .mgmt-tbl tbody td:nth-child(1) { flex: 1; min-width: 0; }
  .mgmt-tbl tbody td:nth-child(2) { display: none; }
  .mgmt-tbl tbody td:nth-child(3) { flex-shrink: 0; }
  .mgmt-tbl tbody td:nth-child(4) { display: none; }
  .role-select { display: none !important; }
  .role-chip:not(.mob-role) { display: none !important; }
  .mob-role { display: inline-block !important; }
  .roster-clickable { cursor: pointer; }

}
</style>
