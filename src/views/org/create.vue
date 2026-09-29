<script setup>
import AvatarUpload from '@/components/inputs/AvatarUpload.vue';
</script>

<template>
  <main class="co-page">
    <div class="co-head">
      <span class="co-eyebrow"><font-awesome-icon :icon="['fas', 'building']" />{{ $t(K + 'eyebrow') }}</span>
      <h1>{{ $t(K + 'title_default') }}</h1>
      <p>{{ $t(K + 'subtitle') }}</p>
    </div>

    <div class="co-grid">
      <!-- Form -->
      <section class="co-card">
        <div class="co-logo">
          <AvatarUpload
            v-model="orgForm.logo_image"
            :buttonLabel="$t('users.create.form.image.upload')"
            :dropLabel="$t('users.create.form.image.drop')"
          />
          <p class="co-hint">{{ $t(K + 'tips.image') }}</p>
        </div>

        <div class="co-fields">
          <label class="co-label" for="org-name">{{ $t(K + 'form.org_name') }} <span class="req">*</span></label>
          <input id="org-name" v-model="orgForm.name" class="form-control co-input" maxlength="64" :placeholder="$t(K + 'form.org_name_ph')" autofocus />
          <div class="co-meta"><span class="co-hint">{{ $t(K + 'form.org_name_hint') }}</span><span :class="charCounterClass(orgForm.name.length, 64)">{{ orgForm.name.length }}/64</span></div>

          <label class="co-label" for="org-route">{{ $t(K + 'form.org_identifier') }} <span class="req">*</span></label>
          <div class="co-url" :class="{ ok: routeState === 'available', bad: routeState === 'taken' || routeState === 'short' }">
            <span class="co-url-prefix">ehubapp.com/org/</span>
            <input id="org-route" v-model="orgForm.route" class="co-url-input" maxlength="64" :placeholder="$t(K + 'url_placeholder')" />
            <span class="co-url-state">
              <span v-if="routeState === 'checking'" class="spinner-border spinner-border-sm"></span>
              <font-awesome-icon v-else-if="routeState === 'available'" :icon="['fas', 'circle-check']" />
              <font-awesome-icon v-else-if="routeState === 'taken' || routeState === 'short'" :icon="['fas', 'circle-exclamation']" />
            </span>
          </div>
          <div class="co-meta">
            <span class="co-hint" :class="{ ok: routeState === 'available', bad: routeState === 'taken' || routeState === 'short' }">{{ routeMessage }}</span>
          </div>

          <label class="co-label" for="org-description">{{ $t(K + 'form.org_description') }}</label>
          <textarea id="org-description" v-model="orgForm.description" class="form-control co-input" rows="2" maxlength="180" :placeholder="$t(K + 'form.org_description_ph')"></textarea>
          <div class="co-meta"><span class="co-hint">{{ $t(K + 'form.optional') }}</span><span :class="charCounterClass(orgForm.description.length, 180)">{{ orgForm.description.length }}/180</span></div>

          <button type="button" class="btn btn-primary round w-100 co-submit" :disabled="!canSubmit || isLoading" @click="executeAction">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? $t(K + 'loading.creating') : $t(K + 'form.org_submit') }}
          </button>
          <p class="co-free"><font-awesome-icon :icon="['fas', 'circle-check']" />{{ $t(K + 'free_note') }}</p>
        </div>
      </section>

      <!-- What comes next -->
      <aside class="co-next">
        <h3>{{ $t(K + 'next.title') }}</h3>
        <ol>
          <li><span class="n">1</span><div><strong>{{ $t(K + 'next.s1_title') }}</strong><p>{{ $t(K + 'next.s1_desc') }}</p></div></li>
          <li><span class="n">2</span><div><strong>{{ $t(K + 'next.s2_title') }}</strong><p>{{ $t(K + 'next.s2_desc') }}</p></div></li>
          <li><span class="n">3</span><div><strong>{{ $t(K + 'next.s3_title') }}</strong><p>{{ $t(K + 'next.s3_desc') }}</p></div></li>
        </ol>
      </aside>
    </div>
  </main>
</template>

<script>
import Organization from '@/helpers/communication/Organization.js';
import router from '@/router';
import { i18n } from '@/helpers/i18n';
import { toast } from '@/helpers/toast.js';

export default {
  data() {
    return {
      K: 'pages.organization.create.',
      orgForm: { name: '', description: '', route: '', logo_image: '' },
      routeManuallyEdited: false,
      routeState: 'idle', // idle | short | checking | available | taken
      routeTimer: null,
      isLoading: false,
    };
  },
  computed: {
    canSubmit() {
      return this.orgForm.name.trim().length >= 2 && this.routeState === 'available';
    },
    routeMessage() {
      const K = this.K + 'validation.';
      return {
        idle: i18n.t(K + 'route_hint'),
        short: i18n.t(K + 'route_min'),
        checking: i18n.t(K + 'route_checking'),
        available: i18n.t(K + 'route_available'),
        taken: i18n.t(K + 'route_taken'),
      }[this.routeState];
    },
  },
  watch: {
    'orgForm.name'(val) {
      const clean = val.replace(/\s+/g, ' ').slice(0, 64);
      if (clean !== val) { this.orgForm.name = clean; return; }
      if (!this.routeManuallyEdited) this.orgForm.route = this.slugify(clean);
    },
    'orgForm.route'(val) {
      const sanitized = this.sanitizeRoute(val);
      if (sanitized !== val) { this.orgForm.route = sanitized; return; }
      if (val !== this.slugify(this.orgForm.name)) this.routeManuallyEdited = true;
      this.checkRoute();
    },
  },
  beforeUnmount() { clearTimeout(this.routeTimer); },
  methods: {
    charCounterClass(len, max) {
      if (len >= max) return 'text-danger';
      if (len >= max * 0.875) return 'text-warning';
      return 'co-count';
    },
    sanitizeRoute(val) {
      return val.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').slice(0, 64);
    },
    slugify(val) {
      return this.sanitizeRoute(val).replace(/^[-_]+|[-_]+$/g, '');
    },
    // Asks the API whether the address is already used (debounced).
    checkRoute() {
      clearTimeout(this.routeTimer);
      const route = this.slugify(this.orgForm.route);
      if (!route) { this.routeState = 'idle'; return; }
      if (route.length < 3) { this.routeState = 'short'; return; }
      this.routeState = 'checking';
      this.routeTimer = setTimeout(async () => {
        const res = await Organization.show(route);
        if (this.slugify(this.orgForm.route) !== route) return;
        this.routeState = res.code === 200 ? 'taken' : 'available';
      }, 400);
    },
    async executeAction() {
      if (!this.canSubmit) return;
      this.isLoading = true;
      const route = this.slugify(this.orgForm.route);
      const response = await Organization.create({ ...this.orgForm, route });

      if (response.created) {
        toast.success(i18n.t(this.K + 'loading.created', { name: this.orgForm.name.trim() }));
        router.push({ path: `/org/${route}/manage`, query: { welcome: 1 } });
        return;
      }
      this.isLoading = false;
      if (response.errors?.route) this.routeState = 'taken';
      toast.error(response.message || i18n.t(this.K + 'loading.error'));
    },
  },
};
</script>

<style scoped>
.co-page { max-width: 1040px; margin: 0 auto; padding: 32px 16px 48px; }
.co-head { text-align: center; margin-bottom: 26px; }
.co-eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-primary); background: var(--ehub-primary-tint); padding: 4px 12px; border-radius: 50rem; margin-bottom: 12px; }
.co-head h1 { font-size: 1.9rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; margin: 0 0 6px; }
.co-head p { font-size: .95rem; color: var(--ehub-muted); margin: 0 auto; max-width: 560px; }
.co-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 18px; align-items: start; }
.co-card, .co-next { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card, 14px); }
.co-card { display: flex; gap: 22px; padding: 22px; }
.co-logo { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 150px; flex-shrink: 0; text-align: center; }
.co-fields { flex: 1; min-width: 0; }
.co-label { display: block; font-size: .8rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 5px; }
.co-label .req { color: #e23b3b; }
.co-input { font-size: .9rem; }
.co-meta { display: flex; justify-content: space-between; gap: 10px; font-size: .72rem; margin: 4px 0 14px; }
.co-hint { font-size: .74rem; color: var(--ehub-muted); }
.co-hint.ok { color: #1f8a5b; }
.co-hint.bad { color: #e23b3b; }
.co-count { color: var(--ehub-muted); }
.co-url { display: flex; align-items: center; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); border-radius: 8px; overflow: hidden; }
.co-url:focus-within { border-color: var(--ehub-primary); }
.co-url.ok { border-color: #1f8a5b; }
.co-url.bad { border-color: #e23b3b; }
.co-url-prefix { padding: 0 2px 0 12px; font-size: .85rem; color: var(--ehub-muted); white-space: nowrap; }
.co-url-input { flex: 1; min-width: 0; border: 0; background: transparent; padding: 9px 4px; font-size: .9rem; color: var(--ehub-ink); outline: none; }
.co-url-state { padding: 0 12px; color: var(--ehub-muted); }
.co-url.ok .co-url-state { color: #1f8a5b; }
.co-url.bad .co-url-state { color: #e23b3b; }
.co-submit { padding: 10px; font-weight: 700; margin-top: 4px; }
.co-free { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: .76rem; color: var(--ehub-muted); margin: 10px 0 0; }
.co-free svg { color: #1f8a5b; }
.co-next { padding: 20px; }
.co-next h3 { font-size: .92rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 14px; }
.co-next ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.co-next li { display: flex; gap: 12px; }
.co-next .n { width: 26px; height: 26px; border-radius: 50%; background: var(--ehub-primary-tint); color: var(--ehub-primary); font-weight: 800; font-size: .76rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.co-next strong { display: block; font-size: .84rem; color: var(--ehub-ink); }
.co-next p { margin: 2px 0 0; font-size: .76rem; color: var(--ehub-muted); line-height: 1.45; }
@media (max-width: 860px) {
  .co-grid { grid-template-columns: minmax(0, 1fr); }
  .co-card { flex-direction: column; align-items: stretch; }
  .co-logo { width: auto; }
}
</style>
