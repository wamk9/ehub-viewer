<script>
import EventNews from '@/components/modules/org/manage/events/event-news.vue';
import OrganizationEventNotice from '@/helpers/communication/OrganizationEventNotice.js';
import { toast } from '@/helpers/toast.js';
import { apiError } from './store.js';

const AUDIENCE_STATUSES = { all: ['free', 'confirmed', 'pending'], confirmed: ['free', 'confirmed'], pending: ['pending'] };

export default {
  name: 'EmNews',
  components: { EventNews },
  inject: ['em'],
  data() {
    return { form: { audience: 'confirmed', subject: '', message: '' }, sending: false };
  },
  computed: {
    recipients() {
      const ok = AUDIENCE_STATUSES[this.form.audience];
      return this.em.regs.filter((r) => ok.includes(r.payment_status)).length;
    },
  },
  beforeUnmount() {
    // Articles may have changed inside the embedded editor; refresh for the overview feed.
    this.em.loadArticles();
  },
  methods: {
    fmtDT(d) {
      return new Intl.DateTimeFormat(this.$i18n.locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
    },
    async send() {
      const subject = this.form.subject.trim();
      if (!subject || this.sending) return;
      const ok = await this.em.ask(this.$t('pages.event.manage.news.send_q', { s: subject, n: this.recipients }), this.$t('pages.event.manage.news.send'));
      if (!ok) return;
      this.sending = true;
      const res = await OrganizationEventNotice.send(this.em.orgRoute, this.em.eventRoute, {
        subject, message: this.form.message.trim() || null, audience: this.form.audience,
      });
      this.sending = false;
      if (res.code === 201) {
        toast.success(this.$t('pages.event.manage.toast.sent'));
        this.form.subject = '';
        this.form.message = '';
        await this.em.loadNotices();
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="cc news-wrap">
      <div class="cc-bd">
        <EventNews :show="true" :event="em.event" :org-route="em.orgRoute" />
      </div>
    </div>

    <div class="dash-grid" style="margin-top:16px">
      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'bullhorn']" style="color:var(--ehub-gold)" />{{ $t('pages.event.manage.news.notice') }}</h3>
        </div>
        <div class="cc-bd">
          <p class="set-desc" style="margin-bottom:14px">{{ $t('pages.event.manage.news.notice_hint') }}</p>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">{{ $t('pages.event.manage.news.to') }}</label>
              <select v-model="form.audience" class="form-select">
                <option v-for="k in ['all', 'confirmed', 'pending']" :key="k" :value="k">{{ $t('pages.event.manage.news.to_' + k) }}</option>
              </select>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <span class="td-muted">{{ $t('pages.event.manage.news.recipients', { n: recipients }) }}</span>
            </div>
            <div class="col-12">
              <label class="form-label">{{ $t('pages.event.manage.news.subject') }}</label>
              <input v-model="form.subject" class="form-control" maxlength="160" />
            </div>
            <div class="col-12">
              <label class="form-label">{{ $t('pages.event.manage.news.msg') }}</label>
              <textarea v-model="form.message" class="form-control" rows="4" maxlength="2000" style="resize:vertical"></textarea>
            </div>
            <div class="col-12 d-flex justify-content-end">
              <button class="btn btn-primary round px-4" :disabled="!form.subject.trim() || !recipients || sending" @click="send">
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="me-2" />{{ $t('pages.event.manage.news.send') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'clock-rotate-left']" style="color:var(--ehub-muted)" />{{ $t('pages.event.manage.news.history') }}</h3>
        </div>
        <div v-if="!em.notices.length" class="cc-empty">{{ $t('pages.event.manage.news.history_empty') }}</div>
        <div v-for="n in em.notices" :key="n.id" class="act-item">
          <div class="act-dot" style="background:var(--ehub-primary-tint);color:var(--ehub-primary-text)"><font-awesome-icon :icon="['fas', 'envelope']" /></div>
          <div style="min-width:0">
            <p class="act-text"><b>{{ n.subject }}</b></p>
            <p v-if="n.message" class="act-msg">{{ n.message }}</p>
            <div class="act-when">
              {{ $t('pages.event.manage.news.to_' + n.audience) }} · {{ $t('pages.event.manage.news.recipients', { n: n.recipients_count }) }} · {{ fmtDT(n.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.act-msg { font-size: .78rem; color: var(--ehub-muted); margin: 0 0 2px; white-space: pre-line; overflow-wrap: anywhere; }
</style>
