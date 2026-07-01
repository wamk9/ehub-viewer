<template>
  <div class="cc">
    <div class="cc-hd">
      <h3>{{ title }}</h3>
      <button v-if="showMore" class="cc-link" @click="$emit('view-more')">{{ $t('pages.teams.manage.view_more') }}</button>
    </div>
    <div v-if="loading" class="act-loading">{{ loadingLabel }}</div>
    <div v-else-if="activities.length">
      <div v-for="a in activities" :key="a.id" class="act-item">
        <div class="act-icon">
          <font-awesome-icon :icon="['fas', a.icon || 'user-plus']" />
        </div>
        <div class="act-body">
          <div class="act-text">
            <slot name="text" :activity="a" />
          </div>
          <div class="act-time">{{ formatTime(a.created_at) }}</div>
        </div>
      </div>
    </div>
    <div v-else class="act-empty">
      <font-awesome-icon icon="clock-rotate-left" class="act-empty-ico" />
      <p>{{ emptyLabel }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EhubActivityLog',
  emits: ['view-more'],
  props: {
    title: { type: String, required: true },
    activities: { type: Array, default: () => [] },
    loading: Boolean,
    loadingLabel: { type: String, default: '...' },
    emptyLabel: { type: String, default: '—' },
    showMore: { type: Boolean, default: false },
  },
  methods: {
    formatTime(ts) {
      const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
      if (diff < 60) return this.$t('notification.time.just_now')
      if (diff < 3600) return this.$t('notification.time.minutes_ago', { n: Math.floor(diff / 60) })
      if (diff < 86400) return this.$t('notification.time.hours_ago', { n: Math.floor(diff / 3600) })
      return this.$t('notification.time.days_ago', { n: Math.floor(diff / 86400) })
    },
  },
}
</script>

<style scoped>
.cc { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.cc-hd { display: flex; align-items: center; gap: 10px; padding: 13px 17px; border-bottom: 1px solid var(--ehub-line); }
.cc-hd h3 { font-size: .9rem; font-weight: 700; color: var(--ehub-ink); margin: 0; flex: 1; }
.cc-link { font-size: .78rem; font-weight: 600; color: var(--ehub-primary); cursor: pointer; background: none; border: 0; padding: 0; }
.cc-link:hover { text-decoration: underline; }
.act-loading { padding: 32px; text-align: center; color: var(--ehub-muted); font-size: .83rem; }
.act-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 15px; border-bottom: 1px solid var(--ehub-line); }
.act-item:last-child { border-bottom: 0; }
.act-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--ehub-field-bg); color: var(--ehub-muted); display: flex; align-items: center; justify-content: center; font-size: .72rem; flex-shrink: 0; margin-top: 1px; }
.act-body { flex: 1; min-width: 0; }
.act-text { font-size: .82rem; color: var(--ehub-ink); line-height: 1.4; }
.act-text :deep(strong) { font-weight: 700; }
.act-time { font-size: .72rem; color: var(--ehub-muted); margin-top: 2px; }
.act-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--ehub-muted); }
.act-empty-ico { font-size: 1.5rem; opacity: .3; margin-bottom: 8px; }
.act-empty p { margin: 0; font-size: .83rem; }
</style>
