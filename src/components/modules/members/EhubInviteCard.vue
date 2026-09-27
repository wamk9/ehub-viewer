<template>
  <div class="set-card">
    <h3>{{ title }}</h3>
    <p class="set-desc">{{ description }}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input v-model="identifier" type="text" class="form-control" style="flex:1;min-width:180px"
        :placeholder="placeholder" :disabled="loading" @keyup.enter="submit" />
      <select v-model="role" class="form-select" style="flex:0 0 190px" :disabled="loading">
        <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>
    </div>
    <button class="btn btn-primary round px-4 w-100 mt-2" :disabled="!identifier.trim() || !role || loading" @click="submit">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      {{ buttonLabel }}
    </button>
  </div>
</template>

<script>
/**
 * Invite by e-mail or username + role. Used by team roster and org members.
 * Emits submit({ identifier, role, reset }) — call reset() after a successful invite.
 */
export default {
  name: 'EhubInviteCard',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    buttonLabel: { type: String, required: true },
    roles: { type: Array, required: true }, // [{ value, label }]
    loading: { type: Boolean, default: false },
  },
  emits: ['submit'],
  data() {
    return { identifier: '', role: this.roles[0]?.value || '' };
  },
  watch: {
    roles(list) {
      if (!list.some((r) => r.value === this.role)) this.role = list[0]?.value || '';
    },
  },
  methods: {
    submit() {
      const identifier = this.identifier.trim();
      if (!identifier || !this.role || this.loading) return;
      this.$emit('submit', { identifier, role: this.role, reset: () => { this.identifier = ''; } });
    },
  },
};
</script>
