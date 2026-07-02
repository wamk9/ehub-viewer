<script setup>
import { computed } from 'vue'

const props = defineProps({
  members: { type: Array, default: () => [] },
  roleLabelPrefix: { type: String, required: true },
  profileBase: { type: String, default: '/profile/' },
})

const AVATAR_PALETTE = ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a']

function strHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function avatarStyle(member) {
  const color = AVATAR_PALETTE[strHash(String(member.id ?? member.name ?? '')) % AVATAR_PALETTE.length]
  return { background: color }
}

const groups = computed(() => {
  const byRole = {}
  const order = []
  for (const m of props.members) {
    const role = m.role || 'member'
    if (!byRole[role]) { byRole[role] = []; order.push(role) }
    byRole[role].push(m)
  }
  return order.map(role => ({ role, members: byRole[role] }))
})
</script>

<template>
  <div class="ehub-roster">
    <div v-if="!members.length" class="er-empty">
      <div class="er-empty-ico"><font-awesome-icon :icon="['fas', 'users']" /></div>
      <p class="mb-0">{{ $t('common.ui.roster_empty') }}</p>
    </div>
    <template v-else>
      <div v-for="group in groups" :key="group.role" class="er-role-group">
        <div class="er-role-group-hd">
          <span class="er-role-group-label" :class="group.role">
            {{ $t(roleLabelPrefix + group.role) }}
          </span>
        </div>
        <div class="er-grid">
          <router-link
            v-for="member in group.members"
            :key="member.id"
            :to="member.username ? `${profileBase}${member.username}` : '#'"
            class="er-card"
          >
            <span class="er-av" :style="avatarStyle(member)">
              <img v-if="member.avatarUrl" :src="member.avatarUrl" class="er-photo" @error="e => e.target.style.display = 'none'" alt="" />
              {{ initials(member.name) }}
            </span>
            <div class="er-info">
              <div class="er-name">{{ member.name }}</div>
              <span v-if="member.username" class="er-handle">@{{ member.username }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.er-empty { text-align: center; padding: 56px 20px; color: var(--ehub-muted); }
.er-empty-ico { font-size: 2.4rem; opacity: .4; margin-bottom: 12px; }

.er-role-group { margin-bottom: 28px; }
.er-role-group-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.er-role-group-label { font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 11px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); }
.er-role-group-label.owner   { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.er-role-group-label.captain { background: color-mix(in srgb, var(--ehub-gold) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.er-role-group-label.admin   { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.er-role-group-label.vice    { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.er-role-group-label.coach   { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.er-role-group-label.starter { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
html[data-bs-theme="dark"] .er-role-group-label.owner   { color: var(--ehub-gold); }
html[data-bs-theme="dark"] .er-role-group-label.captain { color: var(--ehub-gold); }
html[data-bs-theme="dark"] .er-role-group-label.coach   { color: #c89bff; background: color-mix(in srgb, #b06bff 18%, transparent); }
html[data-bs-theme="dark"] .er-role-group-label.starter { color: #51cf66; background: color-mix(in srgb, #51cf66 14%, transparent); }

.er-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.er-card {
  display: flex; align-items: center; gap: 14px; padding: 16px;
  background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px;
  transition: border-color .15s, transform .15s;
  text-decoration: none; color: inherit;
}
.er-card:hover { border-color: color-mix(in srgb, var(--ehub-primary) 40%, var(--ehub-line)); transform: translateY(-2px); text-decoration: none; color: inherit; }
.er-av { position: relative; overflow: hidden; width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: .01em; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
.er-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 14px; }
.er-info { min-width: 0; flex: 1; }
.er-name { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.er-handle { font-size: .78rem; color: var(--ehub-muted); margin-top: 1px; }
</style>
