<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';
import EhubStatusBadge from '@/components/EhubStatusBadge.vue';
import EhubStreamUrlInput from '@/components/inputs/EhubStreamUrlInput.vue';
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js';
import { toast } from '@/helpers/toast.js';
import { apiError } from './store.js';
import { bracketRounds, matchPhase, matchPublicState, sideName } from '../competition/phases.js';

/**
 * Event manage → Resultados: when each match is played, where to watch it and
 * whether it is on now. Shown under the bracket / group games of a stage.
 */
export default {
  name: 'EmMatchSchedule',
  components: { EhubDialog, EhubStatusBadge, EhubStreamUrlInput },
  inject: ['em'],
  props: {
    stage: { type: Object, required: true },
  },
  data() {
    return { dialog: false, saving: false, form: { match: null, scheduled_at: '', stream_url: '', live: false } };
  },
  computed: {
    canEdit() { return this.em.can('live.write') || this.em.can('event.manage'); },
    rows() {
      const total = bracketRounds(this.stage.matches);
      return (this.stage.matches || [])
        .filter((m) => (m.kind === 'bracket' || m.kind === 'group') && m.status !== 'bye')
        .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'group' ? -1 : 1) || a.round - b.round || a.slot - b.slot)
        .map((m) => ({ m, phase: matchPhase(this.$t, m, total), state: matchPublicState(m) }));
    },
  },
  methods: {
    side(p) { return sideName(this.$t, p); },
    fmt(d) {
      return d ? new Intl.DateTimeFormat(this.$i18n.locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '—';
    },
    toLocal(d) {
      if (!d) return '';
      const x = new Date(d);
      const p = (n) => String(n).padStart(2, '0');
      return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
    },
    open(m) {
      this.form = { match: m, scheduled_at: this.toLocal(m.scheduled_at), stream_url: m.stream_url || '', live: m.status === 'live' };
      this.dialog = true;
    },
    async save() {
      const f = this.form;
      this.saving = true;
      const payload = {
        // Stored as typed (local time, no time zone), like stage dates.
        scheduled_at: f.scheduled_at ? f.scheduled_at.replace('T', ' ') : null,
        stream_url: f.stream_url.trim() || null,
      };
      if (f.match.status !== 'done') payload.live = f.live;
      const res = await OrganizationEventStage.updateMatch(this.em.orgRoute, this.em.eventRoute, this.stage.route, f.match.id, payload);
      this.saving = false;
      if (res.code === 200) {
        this.em.putStage(res.data);
        this.dialog = false;
        toast.success(this.$t('pages.event.manage.toast.saved'));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <div v-if="rows.length" class="cc ems">
    <div class="cc-hd">
      <h3><font-awesome-icon :icon="['fas', 'calendar-days']" />{{ $t('pages.event.manage.res.sched_title') }}</h3>
    </div>
    <p class="ems__hint">{{ $t('pages.event.manage.res.sched_hint') }}</p>
    <div class="ems__scroll">
      <table class="mgmt-tbl">
        <thead>
          <tr>
            <th>{{ $t('pages.event.manage.res.sched_phase') }}</th>
            <th>{{ $t('pages.event.manage.res.sched_match') }}</th>
            <th>{{ $t('pages.event.manage.res.sched_when') }}</th>
            <th>{{ $t('pages.event.manage.res.sched_status') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.m.id">
            <td class="td-muted">{{ r.phase }}</td>
            <td class="td-name">{{ side(r.m.a) }} <span class="td-muted">×</span> {{ side(r.m.b) }}</td>
            <td class="td-muted">
              {{ fmt(r.m.scheduled_at) }}
              <font-awesome-icon v-if="r.m.stream_url" :icon="['fas', 'tower-broadcast']" class="ms-1" :title="$t('stream_input.label')" />
            </td>
            <td><EhubStatusBadge :state="r.state" /></td>
            <td>
              <button v-if="canEdit" class="act-btn" :aria-label="$t('pages.event.manage.res.sched_edit')" :title="$t('pages.event.manage.res.sched_edit')" @click="open(r.m)">
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EhubDialog v-model="dialog" :title="$t('pages.event.manage.res.sched_edit')">
      <template v-if="form.match">
        <p class="ems__who"><strong>{{ side(form.match.a) }}</strong> × <strong>{{ side(form.match.b) }}</strong></p>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label" for="ems-when">{{ $t('pages.event.manage.res.sched_when') }}</label>
            <input id="ems-when" v-model="form.scheduled_at" type="datetime-local" class="form-control" />
          </div>
          <div class="col-12">
            <EhubStreamUrlInput id="ems-stream" v-model="form.stream_url" />
          </div>
          <div v-if="form.match.status !== 'done'" class="col-12">
            <div class="form-check form-switch">
              <input id="ems-live" v-model="form.live" class="form-check-input" type="checkbox" role="switch" />
              <label class="form-check-label" for="ems-live">{{ $t('pages.event.manage.res.sched_live') }}</label>
            </div>
            <div class="form-text">{{ $t('pages.event.manage.res.sched_live_hint') }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-outline-secondary round px-3" @click="dialog = false">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn btn-primary round px-4" :disabled="saving" @click="save">{{ $t('pages.event.manage.c.save') }}</button>
      </template>
    </EhubDialog>
  </div>
</template>

<style scoped>
.ems { margin-top: 16px; }
.ems__hint { font-size: .8rem; color: var(--ehub-muted); margin: 10px 17px 0; }
.ems__scroll { overflow-x: auto; }
.ems__who { margin: 0 0 12px; color: var(--ehub-ink); }
</style>
