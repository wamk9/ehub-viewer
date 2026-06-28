<template>
  <div class="mv-wrap" v-if="team">
    <div class="mv-header" :style="headerStyle">
      <div class="mv-header-inner">
        <div class="mv-logo" :style="{ background: team.color || '#0098D8' }">
          <img v-if="team.logo_image" :src="logoUrl" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px" />
          <span v-else>{{ initials }}</span>
        </div>
        <div>
          <h1 class="mv-name">{{ team.name }}</h1>
          <router-link :to="`/teams/${team.route}`" class="mv-back">
            <font-awesome-icon icon="arrow-left" class="me-1" />
            {{ $t('pages.teams.members_view.back') }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="mv-content">
      <div class="mv-card">
        <h2 class="mv-section-title">{{ $t('pages.teams.members_view.title') }}</h2>
        <p class="mv-section-sub">{{ $t('pages.teams.members_view.sub') }}</p>

        <div v-if="loading" class="mv-loading">{{ $t('pages.teams.members_view.loading') }}</div>
        <table v-else class="mv-tbl">
          <thead>
            <tr>
              <th>{{ $t('pages.teams.members_view.col_player') }}</th>
              <th>{{ $t('pages.teams.members_view.col_handle') }}</th>
              <th>{{ $t('pages.teams.members_view.col_role') }}</th>
              <th v-if="can('manage_roster')">{{ $t('pages.teams.members_view.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in team.members" :key="m.id">
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="mv-av" :style="avatarStyle(m)">{{ memberInitials(m) }}</div>
                  <span class="mv-td-name">{{ m.name }}</span>
                </div>
              </td>
              <td class="mv-td-muted">@{{ m.username }}</td>
              <td>
                <select
                  v-if="can('manage_roster') && assignableRoleNames.includes(m.role) && m.id !== myId"
                  class="mv-role-select"
                  :value="m.role"
                  @change="changeRole(m, $event.target.value)"
                >
                  <option v-for="r in assignableRoles" :key="r.id" :value="r.name">
                    {{ $t(`pages.teams.manage.roles.${r.name}`) }}
                  </option>
                </select>
                <span v-else class="mv-role-chip" :class="m.role">{{ $t(`pages.teams.manage.roles.${m.role}`) }}</span>
              </td>
              <td v-if="can('manage_roster')">
                <div class="mv-act-row" v-if="assignableRoleNames.includes(m.role) && m.id !== myId">
                  <button class="mv-act-btn del" :title="$t('pages.teams.members_view.remove')" @click="openModal('remove', m)">
                    <font-awesome-icon icon="xmark" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mv-card" v-if="can('invite_members')">
        <h2 class="mv-section-title">{{ $t('pages.teams.manage.roster.invite') }}</h2>
        <p class="mv-section-sub">{{ $t('pages.teams.manage.roster.invite_sub') }}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input v-model="inviteInput" type="text" class="form-control"
            :placeholder="$t('pages.teams.manage.roster.invite_ph')"
            style="flex:1;min-width:180px" />
          <select v-model="inviteRole" class="form-select" style="flex:0 0 140px">
            <option v-for="r in assignableRoles" :key="r.id" :value="r.name">
              {{ $t(`pages.teams.manage.roles.${r.name}`) }}
            </option>
          </select>
          <button class="btn btn-primary round px-4" @click="sendInvite">
            {{ $t('pages.teams.manage.roster.send_invite') }}
          </button>
        </div>
      </div>

      <div class="mv-card mv-card--danger">
        <h2 class="mv-section-title">{{ $t('pages.teams.manage.settings.leave') }}</h2>
        <p class="mv-section-sub">{{ $t('pages.teams.manage.settings.leave_confirm') }}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn btn-outline-secondary round px-4" @click="openModal('leave')" :disabled="isOnlyRoot">
            <font-awesome-icon icon="right-from-bracket" class="me-2" />
            {{ $t('pages.teams.manage.settings.leave') }}
          </button>
          <p v-if="isOnlyRoot" class="mv-only-root-msg">
            {{ $t('pages.teams.manage.settings.leave_only_root', { role: $t(`pages.teams.manage.roles.${rootRoleName}`) }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="modal.type" class="cm-overlay" @click.self="modal = {}">
      <div class="cm-box">
        <template v-if="modal.type === 'remove'">
          <div class="cm-icon danger"><font-awesome-icon icon="user-xmark" /></div>
          <h3 class="cm-title">{{ $t('pages.teams.manage.roster.remove_confirm_title') }}</h3>
          <p class="cm-desc" v-html="$t('pages.teams.manage.roster.remove_confirm_desc', { name: modal.data?.name })" />
        </template>
        <template v-else-if="modal.type === 'leave'">
          <div class="cm-icon leave"><font-awesome-icon icon="right-from-bracket" /></div>
          <h3 class="cm-title">{{ $t('pages.teams.manage.settings.leave') }}</h3>
          <p class="cm-desc">{{ $t('pages.teams.manage.settings.leave_confirm') }}</p>
        </template>
        <div class="cm-actions">
          <button class="btn btn-outline-secondary round" @click="modal = {}">{{ $t('pages.teams.manage.modal.cancel') }}</button>
          <button class="btn btn-danger round" :disabled="modal.loading" @click="confirmModal">
            {{ modal.loading ? '...' : $t('pages.teams.manage.modal.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!loading" class="mv-wrap" style="display:flex;align-items:center;justify-content:center;min-height:60vh">
    <p style="color:var(--ehub-muted)">{{ $t('pages.teams.members_view.error') }}</p>
  </div>
</template>

<script>
import Teams from '@/helpers/communication/Teams.js'
import SystemVars from '@/helpers/General/SystemVars.js'
import { toast } from '@/helpers/toast.js'

const AVATAR_PALETTE = ['#0098D8','#e23b3b','#e2883b','#3be28f','#8b3be2','#e23bb4','#3b8be2']
const strHash = s => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)

export default {
  name: 'TeamMembersView',

  data() {
    return {
      team: null,
      loading: true,
      inviteInput: '',
      inviteRole: '',
      modal: {},
    }
  },

  computed: {
    teamRoute() { return this.$route.params.teamRoute },
    myId() { return this.team?.my_id },
    myRole() { return this.team?.my_role },
    myPermissions() {
      const perms = this.team?.my_permissions ?? {}
      return typeof perms === 'object' && !Array.isArray(perms) ? perms : {}
    },
    assignableRoles() { return this.team?.assignable_roles ?? [] },
    assignableRoleNames() { return this.assignableRoles.map(r => r.name) },
    rootRoleName() { return 'captain' },
    isOnlyRoot() {
      return (this.team?.members?.filter(m => m.role === this.rootRoleName).length ?? 0) <= 1 &&
        this.myRole === this.rootRoleName
    },
    can() {
      return (perm) => this.myRole === this.rootRoleName || !!this.myPermissions[perm]
    },
    initials() {
      return (this.team?.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    logoUrl() {
      return this.team?.logo_image ? SystemVars.baseUrl + 'storage/' + this.team.logo_image : null
    },
    headerStyle() {
      return { borderBottom: `3px solid ${this.team?.color || '#0098D8'}` }
    },
  },

  methods: {
    async load() {
      this.loading = true
      const res = await Teams.getMembersView(this.teamRoute)
      if (res.code === 200 && res.data) {
        this.team = res.data
        if (this.assignableRoles.length) this.inviteRole = this.assignableRoles[0].name
      } else {
        this.$router.push('/my-teams')
      }
      this.loading = false
    },

    avatarStyle(m) {
      const color = AVATAR_PALETTE[Math.abs(strHash(m.id || m.name || '')) % AVATAR_PALETTE.length]
      return { background: color }
    },

    memberInitials(m) {
      return (m.name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },

    openModal(type, data = null) {
      this.modal = { type, loading: false, data }
    },

    async confirmModal() {
      if (this.modal.type === 'remove') await this.removeMember(this.modal.data)
      else if (this.modal.type === 'leave') await this.leaveTeam()
    },

    async changeRole(member, newRole) {
      const res = await Teams.updateMemberRole(this.team.id, member.id, newRole)
      if (res.code === 200) {
        this.toast.success(this.$t('pages.teams.manage.roster.role_changed'))
        await this.load()
      } else {
        const key = res.message === 'cannot_assign_role' ? 'cannot_assign_role' : 'role_change_error'
        this.toast.error(this.$t(`pages.teams.manage.roster.${key}`))
      }
    },

    async removeMember(member) {
      this.modal.loading = true
      const res = await Teams.removeMember(this.team.id, member.id)
      if (res.code === 200) {
        this.modal = {}
        this.toast.success(this.$t('pages.teams.manage.roster.removed'))
        await this.load()
      } else {
        this.modal.loading = false
        this.toast.error(this.$t('pages.teams.manage.roster.remove_error'))
      }
    },

    async leaveTeam() {
      this.modal.loading = true
      const res = await Teams.leaveTeam(this.team.id)
      if (res.code === 200) {
        this.toast.success(this.$t('pages.teams.manage.settings.leave_success'))
        this.$router.push('/my-teams')
      } else {
        this.modal.loading = false
        const key = res.message === 'no_other_captain' ? 'leave_no_captain' : 'leave_error'
        this.toast.error(this.$t(`pages.teams.manage.settings.${key}`))
      }
    },

    async sendInvite() {
      if (!this.inviteInput.trim()) return
      const res = await Teams.invite(this.team.id, { input: this.inviteInput.trim(), role: this.inviteRole })
      if (res.code === 200) {
        this.inviteInput = ''
        this.toast.success(this.$t('pages.teams.manage.roster.invite_sent'))
        await this.load()
      } else if (res.code === 409) {
        this.toast.error(this.$t('pages.teams.manage.roster.invite_already_member'))
      } else if (res.code === 404) {
        this.toast.error(this.$t('pages.teams.manage.roster.invite_not_found'))
      } else {
        this.toast.error(this.$t('pages.teams.manage.roster.invite_error'))
      }
    },
  },

  mounted() {
    this.load()
  },
}
</script>

<style scoped>
.mv-wrap { min-height: 100vh; background: var(--ehub-bg); }

.mv-header {
  background: var(--ehub-card);
  padding: 20px 32px;
  margin-bottom: 0;
}
.mv-header-inner { display: flex; align-items: center; gap: 16px; max-width: 860px; margin: 0 auto; }
.mv-logo {
  width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 700; color: #fff;
}
.mv-name { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--ehub-ink); }
.mv-back { font-size: .82rem; color: var(--ehub-muted); text-decoration: none; }
.mv-back:hover { color: var(--ehub-ink); }

.mv-content { max-width: 860px; margin: 0 auto; padding: 28px 24px; display: flex; flex-direction: column; gap: 20px; }

.mv-card {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-border);
  border-radius: 12px;
  padding: 24px;
}
.mv-card--danger { border-color: color-mix(in srgb, #e23b3b 30%, transparent); }

.mv-section-title { margin: 0 0 4px; font-size: 1rem; font-weight: 700; color: var(--ehub-ink); }
.mv-section-sub { margin: 0 0 16px; font-size: .85rem; color: var(--ehub-muted); }

.mv-loading { text-align: center; padding: 32px; color: var(--ehub-muted); font-size: .85rem; }

.mv-tbl { width: 100%; border-collapse: collapse; }
.mv-tbl th { text-align: left; font-size: .78rem; color: var(--ehub-muted); font-weight: 600; padding: 6px 10px; border-bottom: 1px solid var(--ehub-border); }
.mv-tbl td { padding: 10px; border-bottom: 1px solid var(--ehub-border); font-size: .88rem; color: var(--ehub-ink); }
.mv-tbl tr:last-child td { border-bottom: none; }

.mv-av {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; color: #fff;
}
.mv-td-name { font-weight: 600; }
.mv-td-muted { color: var(--ehub-muted); }

.mv-role-chip {
  display: inline-block; padding: 2px 10px; border-radius: 20px;
  font-size: .78rem; font-weight: 600;
  background: color-mix(in srgb, var(--ehub-accent) 15%, transparent);
  color: var(--ehub-accent);
}
.mv-role-chip.captain { background: color-mix(in srgb,#f5c518 18%,transparent); color: #c9a000; }
.mv-role-chip.vice    { background: color-mix(in srgb,#aaa 18%,transparent);   color: #777; }
.mv-role-chip.coach   { background: color-mix(in srgb,#3be28f 18%,transparent); color: #1a9960; }

.mv-role-select {
  background: var(--ehub-input, var(--ehub-bg));
  border: 1px solid var(--ehub-border);
  color: var(--ehub-ink); border-radius: 6px; padding: 3px 8px; font-size: .82rem;
}

.mv-act-row { display: flex; gap: 6px; }
.mv-act-btn { background: none; border: 1px solid var(--ehub-border); border-radius: 6px; width: 30px; height: 30px; cursor: pointer; color: var(--ehub-muted); display: flex; align-items: center; justify-content: center; }
.mv-act-btn.del:hover { border-color: #e23b3b; color: #e23b3b; }

.mv-only-root-msg { margin: 0; font-size: .8rem; color: var(--ehub-muted); }

/* modal */
.cm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 999; display: flex; align-items: center; justify-content: center; }
.cm-box { background: var(--ehub-card); border: 1px solid var(--ehub-border); border-radius: 14px; padding: 32px 28px; max-width: 400px; width: 90%; text-align: center; }
.cm-icon { width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.cm-icon.danger { background: color-mix(in srgb,#e23b3b 15%,transparent); color: #e23b3b; }
.cm-icon.leave  { background: color-mix(in srgb,#f5c518 15%,transparent); color: #c9a000; }
.cm-title { margin: 0 0 8px; font-size: 1.1rem; font-weight: 700; color: var(--ehub-ink); }
.cm-desc { font-size: .9rem; color: var(--ehub-muted); margin: 0 0 24px; }
.cm-actions { display: flex; gap: 10px; justify-content: center; }
</style>
