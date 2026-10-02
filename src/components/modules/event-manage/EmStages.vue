<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js';
import { toast } from '@/helpers/toast.js';
import { stageState, roundState, apiError } from './store.js';

const ROUND_ICONS = ['road', 'stopwatch', 'flag'];

function slugify(v) {
  return (v || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'etapa';
}

export default {
  name: 'EmStages',
  components: { EhubDialog },
  inject: ['em'],
  data() {
    return {
      dialog: false,
      editing: null, // stage being edited, null = new
      form: { name: '', stage_type: 'points', start_at: '', description: '', sessions: '' },
      saving: false,
      newRound: {}, // stageId → name being typed
      busy: null,
    };
  },
  computed: {
    ev() { return this.em.event; },
    /** Marketing sees stages read-only. */
    canRun() { return this.em.can('event.manage'); },
    stages() { return [...(this.ev.stages || [])].sort((a, b) => a.stage_order - b.stage_order); },
  },
  methods: {
    stageState,
    roundState,
    roundIcon(i, total) {
      return total === 3 ? ROUND_ICONS[i] : (i === total - 1 ? 'flag' : 'circle-play');
    },
    fmtDT(d) {
      if (!d) return '—';
      return new Intl.DateTimeFormat(this.$i18n.locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
    },
    canStart(i) {
      // Groups are played side by side: earlier groups don't block a group.
      const st = this.stages[i];
      return stageState(st) === 'pending' && !this.ev.finished
        && this.stages.slice(0, i).every((s) => s.finished || (st.stage_type === 'group' && s.stage_type === 'group'));
    },
    canMove(i, dir) {
      const j = i + dir;
      return j >= 0 && j < this.stages.length && !this.stages[i].initialized && !this.stages[j].initialized;
    },
    goResults(stage) {
      this.$router.push({ name: 'manage-event', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute, panel: 'results', sub: stage.route } });
    },

    // ── Stage CRUD ──
    openNew() {
      this.editing = null;
      this.form = { name: '', stage_type: 'points', start_at: '', description: '', sessions: '' };
      this.dialog = true;
    },
    openEdit(stage) {
      this.editing = stage;
      this.form = {
        name: stage.name,
        stage_type: ['bracket', 'group', 'time'].includes(stage.stage_type) ? stage.stage_type : 'points',
        start_at: stage.start_at ? this.toLocalInput(stage.start_at) : '',
        description: stage.description || '',
        sessions: '',
      };
      this.dialog = true;
    },
    toLocalInput(d) {
      const x = new Date(d);
      const p = (n) => String(n).padStart(2, '0');
      return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
    },
    usePreset() {
      this.form.sessions = [0, 1, 2].map((i) => this.$t('pages.event.manage.stg.preset.' + i)).join('\n');
    },
    uniqueRoute(name) {
      const used = new Set(this.stages.map((s) => s.route));
      const base = slugify(name);
      let r = base;
      for (let i = 2; used.has(r); i++) r = `${base}-${i}`;
      return r;
    },
    async save() {
      if (!this.form.name.trim() || this.saving) return;
      this.saving = true;
      const payload = {
        name: this.form.name.trim(),
        description: this.form.description || null,
        // Dates are stored as typed (local, no time zone): never convert to UTC.
        start_at: this.form.start_at ? this.form.start_at.replace('T', ' ') : null,
      };
      let res;
      if (this.editing) {
        if (!this.editing.initialized) payload.stage_type = this.form.stage_type;
        res = await OrganizationEventStage.update(this.em.orgRoute, this.em.eventRoute, this.editing.route, payload);
      } else {
        payload.stage_type = this.form.stage_type;
        payload.route = this.uniqueRoute(payload.name);
        payload.rounds = this.form.sessions.split('\n').map((x) => x.trim()).filter(Boolean);
        res = await OrganizationEventStage.create(this.em.orgRoute, this.em.eventRoute, payload);
      }
      this.saving = false;
      if (res.code === 200 || res.code === 201) {
        this.em.putStage(res.data);
        this.dialog = false;
        toast.success(this.$t('pages.event.manage.toast.' + (this.editing ? 'saved' : 'created')));
      } else toast.error(apiError(this, res.data));
    },
    async remove(stage) {
      const ok = await this.em.ask(this.$t('pages.event.manage.stg.del_q', { s: stage.name }), this.$t('pages.event.manage.c.confirm'), true);
      if (!ok) return;
      const res = await OrganizationEventStage.remove(this.em.orgRoute, this.em.eventRoute, stage.route);
      if (res.code === 200) {
        await this.em.loadEvent();
        toast.success(this.$t('pages.event.manage.toast.deleted'));
      } else toast.error(this.$t('pages.event.manage.c.error'));
    },
    async move(i, dir) {
      const order = this.stages.map((s) => s.route);
      [order[i], order[i + dir]] = [order[i + dir], order[i]];
      const res = await OrganizationEventStage.reorder(this.em.orgRoute, this.em.eventRoute, order);
      if (res.code === 200) {
        order.forEach((route, idx) => {
          const s = this.ev.stages.find((x) => x.route === route);
          if (s) s.stage_order = idx + 1;
        });
      } else toast.error(apiError(this, res.data));
    },

    // ── Stage control ──
    async control(stage, action) {
      let msg = this.$t(`pages.event.manage.stg.${action}_q`, { s: stage.name });
      if (action === 'start' && !this.ev.initialized) msg = this.$t('pages.event.manage.stg.start_first_q');
      // Finishing without published results leaves the standings empty: say so plainly.
      // A group table is always public: nothing to publish there.
      const noResults = action === 'finish' && !stage.results_published && stage.stage_type !== 'group';
      if (noResults) msg = this.$t('pages.event.manage.stg.finish_no_results_q', { s: stage.name });
      const ok = await this.em.ask(msg, this.$t(noResults ? 'pages.event.manage.stg.finish_anyway' : 'pages.event.manage.stg.' + action), noResults);
      if (!ok) return;
      this.busy = stage.id;
      const res = await OrganizationEventStage.control(this.em.orgRoute, this.em.eventRoute, stage.route, action);
      this.busy = null;
      if (res.code === 200) {
        this.em.putStage(res.data);
        if (action === 'start') this.ev.initialized = true;
        // Starting one group starts every group: refresh them all.
        if (action === 'start' && stage.stage_type === 'group') await this.em.loadEvent();
        toast.success(this.$t('pages.event.manage.toast.' + (action === 'start' ? 'started' : 'finished')));
      } else toast.error(apiError(this, res.data));
    },

    // ── Rounds ──
    async addRound(stage) {
      const name = (this.newRound[stage.id] || '').trim();
      if (!name) return;
      const res = await OrganizationEventStage.createRound(this.em.orgRoute, this.em.eventRoute, stage.route, { name });
      if (res.code === 201) {
        this.em.putStage(res.data);
        this.newRound[stage.id] = '';
      } else toast.error(apiError(this, res.data));
    },
    async removeRound(stage, round) {
      const res = await OrganizationEventStage.removeRound(this.em.orgRoute, this.em.eventRoute, stage.route, round.id);
      if (res.code === 200) this.em.putStage(res.data);
      else toast.error(apiError(this, res.data));
    },
    async controlRound(stage, round, action) {
      this.busy = round.id;
      const res = await OrganizationEventStage.controlRound(this.em.orgRoute, this.em.eventRoute, stage.route, round.id, action);
      this.busy = null;
      if (res.code === 200) {
        this.em.putStage(res.data);
        toast.success(this.$t('pages.event.manage.toast.round_' + (action === 'start' ? 'started' : 'finished')));
      } else toast.error(apiError(this, res.data));
    },
    canStartRound(stage, j) {
      return stage.in_progress && roundState(stage.rounds[j]) === 'pending' && stage.rounds.slice(0, j).every((r) => r.finished);
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.stg.title') }}</h1>
        <p>{{ $t('pages.event.manage.stg.sub') }}</p>
      </div>
      <div class="spacer"></div>
      <button v-if="canRun && !ev.finished" class="btn btn-primary round px-3" @click="openNew">
        <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />{{ $t('pages.event.manage.stg.new') }}
      </button>
    </div>

    <div v-if="!stages.length" class="cc">
      <div class="cc-empty">
        <font-awesome-icon :icon="['fas', 'layer-group']" class="ico" />
        {{ $t('pages.event.manage.stg.empty') }}
      </div>
    </div>

    <div v-for="(s, i) in stages" :key="s.id" class="stg" :class="stageState(s)">
      <div class="stg-hd">
        <div v-if="canRun" class="stg-move">
          <button class="mv" :disabled="!canMove(i, -1)" :title="$t('pages.event.manage.stg.move_up')" @click="move(i, -1)"><font-awesome-icon :icon="['fas', 'chevron-up']" /></button>
          <button class="mv" :disabled="!canMove(i, 1)" :title="$t('pages.event.manage.stg.move_down')" @click="move(i, 1)"><font-awesome-icon :icon="['fas', 'chevron-down']" /></button>
        </div>
        <div class="stg-ord">{{ i + 1 }}</div>
        <div class="stg-main">
          <div class="stg-name">
            {{ s.name }}
            <span class="s-badge" :class="{ pending: 'mute', live: 'live', done: 'ok' }[stageState(s)]">
              <font-awesome-icon :icon="['fas', { pending: 'clock', live: 'circle', done: 'check' }[stageState(s)]]" />
              {{ $t('pages.event.manage.stg.state.' + stageState(s)) }}
            </span>
            <span v-if="s.results_published" class="s-badge ok"><font-awesome-icon :icon="['fas', 'ranking-star']" />{{ $t('pages.event.manage.res.published') }}</span>
          </div>
          <div class="stg-meta">
            <font-awesome-icon :icon="['fas', 'calendar-days']" class="me-1" />{{ fmtDT(s.start_at) }}
            · {{ $t('pages.event.manage.stg.type.' + (['bracket', 'group', 'time'].includes(s.stage_type) ? s.stage_type : 'points')) }}
          </div>
        </div>
        <div class="stg-acts">
          <button v-if="canRun && canStart(i)" class="btn btn-sm btn-primary round px-3" :disabled="busy === s.id" @click="control(s, 'start')">
            <font-awesome-icon :icon="['fas', 'play']" class="me-1" />{{ $t('pages.event.manage.stg.start') }}
          </button>
          <button v-if="s.stage_type === 'bracket' && stageState(s) === 'pending' && em.canPanel('results')" class="btn btn-sm btn-outline-secondary round px-3" @click="goResults(s)">
            <font-awesome-icon :icon="['fas', 'sitemap']" class="me-1" />{{ $t((s.matches || []).length ? 'competition.bracket.view' : 'competition.bracket.build') }}
          </button>
          <template v-if="stageState(s) !== 'pending' && em.canPanel('results')">
            <button class="btn btn-sm round px-3" :class="stageState(s) === 'live' && !s.results_published ? 'btn-primary' : 'btn-outline-secondary'" @click="goResults(s)">
              <font-awesome-icon :icon="['fas', 'ranking-star']" class="me-1" />{{ s.results_published ? $t('pages.event.manage.stg.view_results') : $t('pages.event.manage.stg.results') }}
            </button>
          </template>
          <button v-if="canRun && stageState(s) === 'live'" class="btn btn-sm round px-3" :class="s.results_published ? 'btn-primary' : 'btn-outline-secondary'" :disabled="busy === s.id" @click="control(s, 'finish')">
            <font-awesome-icon :icon="['fas', 'flag']" class="me-1" />{{ $t('pages.event.manage.stg.finish') }}
          </button>
          <button v-if="canRun && !ev.finished" class="act-btn" :title="$t('pages.event.manage.stg.edit')" @click="openEdit(s)"><font-awesome-icon :icon="['fas', 'pen']" /></button>
          <button v-if="canRun && !s.initialized" class="act-btn del" @click="remove(s)"><font-awesome-icon :icon="['fas', 'trash']" /></button>
        </div>
      </div>

      <div v-if="s.rounds?.length" class="rounds">
        <div v-for="(r, j) in s.rounds" :key="r.id" class="rnd" :class="roundState(r)">
          <div class="rnd-ico"><font-awesome-icon :icon="['fas', roundIcon(j, s.rounds.length)]" /></div>
          <div class="rnd-body">
            <div class="rnd-name">{{ r.name }}</div>
            <div class="rnd-st">
              <span v-if="roundState(r) === 'live'" class="live-txt">● {{ $t('pages.event.manage.ov.live_now') }}</span>
              <template v-else>{{ $t('pages.event.manage.stg.state.' + roundState(r)) }}</template>
            </div>
          </div>
          <button v-if="canRun && canStartRound(s, j)" class="btn btn-xs btn-outline-secondary" :disabled="busy === r.id" @click="controlRound(s, r, 'start')">{{ $t('pages.event.manage.stg.r_start') }}</button>
          <button v-else-if="canRun && roundState(r) === 'live'" class="btn btn-xs btn-outline-secondary" :disabled="busy === r.id" @click="controlRound(s, r, 'finish')">{{ $t('pages.event.manage.stg.r_finish') }}</button>
          <button v-if="canRun && !r.initialized && !s.finished" class="act-btn del rnd-del" :title="$t('pages.event.manage.stg.r_remove')" @click="removeRound(s, r)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
      </div>
      <div v-else class="rounds rounds-empty">{{ $t('pages.event.manage.stg.no_sessions') }}</div>

      <div v-if="canRun && !s.finished && !ev.finished" class="rnd-add">
        <input v-model="newRound[s.id]" class="form-control form-control-sm" :placeholder="$t('pages.event.manage.stg.session_name')" maxlength="100" @keyup.enter="addRound(s)" />
        <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="!(newRound[s.id] || '').trim()" @click="addRound(s)">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('pages.event.manage.stg.add_session') }}
        </button>
      </div>
    </div>

    <!-- New / edit stage -->
    <EhubDialog v-model="dialog" :title="editing ? $t('pages.event.manage.stg.edit') : $t('pages.event.manage.stg.new')">
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">{{ $t('pages.event.manage.stg.m_name') }}</label>
          <input v-model="form.name" class="form-control" maxlength="255" />
        </div>
        <div class="col-md-6">
          <label class="form-label">{{ $t('pages.event.manage.stg.m_type') }}</label>
          <select v-model="form.stage_type" class="form-select" :disabled="editing?.initialized">
            <option value="points">{{ $t('pages.event.manage.stg.type.points') }}</option>
            <option value="bracket">{{ $t('pages.event.manage.stg.type.bracket') }}</option>
            <option value="group">{{ $t('pages.event.manage.stg.type.group') }}</option>
            <option value="time">{{ $t('pages.event.manage.stg.type.time') }}</option>
          </select>
          <div v-if="editing?.initialized" class="form-text">{{ $t('pages.event.manage.stg.type_locked') }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">{{ $t('pages.event.manage.stg.m_date') }}</label>
          <input v-model="form.start_at" type="datetime-local" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label">{{ $t('pages.event.manage.stg.m_desc') }}</label>
          <textarea v-model="form.description" class="form-control" rows="3" style="resize:vertical"></textarea>
        </div>
        <div v-if="!editing" class="col-12">
          <div class="d-flex align-items-center justify-content-between mb-1 gap-2 flex-wrap">
            <label class="form-label m-0">{{ $t('pages.event.manage.stg.m_sessions') }}</label>
            <button type="button" class="btn btn-link btn-sm p-0" @click="usePreset">{{ $t('pages.event.manage.stg.m_preset') }}</button>
          </div>
          <textarea v-model="form.sessions" class="form-control" rows="3" style="resize:vertical"></textarea>
          <div class="form-text">{{ $t('pages.event.manage.stg.m_sessions_hint') }}</div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline-secondary round px-3" @click="dialog = false">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn btn-primary round px-4" :disabled="!form.name.trim() || saving" @click="save">
          {{ editing ? $t('pages.event.manage.c.save') : $t('pages.event.manage.stg.create') }}
        </button>
      </template>
    </EhubDialog>
  </section>
</template>

<style scoped>
.stg { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); margin-bottom: 12px; overflow: hidden; }
.stg.live { border-color: color-mix(in srgb, #e23b3b 40%, var(--ehub-line)); }
.stg-hd { display: flex; align-items: center; gap: 14px; padding: 14px 18px; flex-wrap: wrap; }
.stg-move { display: flex; flex-direction: column; gap: 2px; }
.mv { border: 0; background: transparent; color: var(--ehub-muted); font-size: .72rem; line-height: 1; padding: 2px 4px; border-radius: 4px; }
.mv:hover:not(:disabled) { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.mv:disabled { opacity: .25; }
.stg-ord { width: 34px; height: 34px; border-radius: 9px; background: var(--ehub-field-bg); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .85rem; color: var(--ehub-ink); flex-shrink: 0; }
.stg.done .stg-ord { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.stg-main { flex: 1; min-width: 180px; }
.stg-name { font-weight: 700; color: var(--ehub-ink); font-size: .95rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.stg-meta { font-size: .76rem; color: var(--ehub-muted); margin-top: 2px; }
.stg-acts { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.rounds { display: flex; border-top: 1px solid var(--ehub-line); background: color-mix(in srgb, var(--ehub-field-bg) 50%, transparent); }
.rounds-empty { padding: 10px 18px; font-size: .78rem; color: var(--ehub-muted); }
.rnd { flex: 1; display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-right: 1px solid var(--ehub-line); min-width: 0; }
.rnd:last-child { border-right: 0; }
.rnd-ico { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: .7rem; flex-shrink: 0; background: var(--ehub-card); border: 1px solid var(--ehub-line); color: var(--ehub-muted); }
.rnd.done .rnd-ico { color: var(--ehub-success-text); }
.rnd.live .rnd-ico { color: var(--ehub-danger-text); border-color: color-mix(in srgb, #e23b3b 40%, var(--ehub-line)); }
.rnd-body { flex: 1; min-width: 0; }
.rnd-name { font-size: .8rem; font-weight: 600; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rnd-st { font-size: .72rem; color: var(--ehub-muted); }
.live-txt { color: var(--ehub-danger-text); font-weight: 700; }
.rnd-del { width: 22px; height: 22px; font-size: .72rem; }
.rnd-add { display: flex; gap: 8px; padding: 10px 18px; border-top: 1px solid var(--ehub-line); }
.rnd-add input { max-width: 260px; }
@media (max-width: 768px) {
  .rounds { flex-direction: column; }
  .rnd { border-right: 0; border-bottom: 1px solid var(--ehub-line); }
  .rnd:last-child { border-bottom: 0; }
}
</style>
