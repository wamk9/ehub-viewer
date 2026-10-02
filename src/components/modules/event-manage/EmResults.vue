<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import EhubBracket from '@/components/modules/competition/EhubBracket.vue';
import EhubGroupTable from '@/components/modules/competition/EhubGroupTable.vue';
import EhubGroupMatches from '@/components/modules/competition/EhubGroupMatches.vue';
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js';
import { toast } from '@/helpers/toast.js';
import { POINTS, stageState, userName, apiError } from './store.js';

export default {
  name: 'EmResults',
  components: { InitialsAvatar, EhubBracket, EhubGroupTable, EhubGroupMatches },
  inject: ['em'],
  data() {
    return { stageId: null, rows: [], auto: true, dirty: false, saving: false, addId: '', busyMatch: null };
  },
  computed: {
    ev() { return this.em.event; },
    /** Marketing reads results; only managers edit. Finished events are frozen for everyone. */
    readonly() { return !this.em.can('event.manage') || this.ev.finished; },
    stages() { return [...(this.ev.stages || [])].sort((a, b) => a.stage_order - b.stage_order); },
    stage() { return this.stages.find((s) => s.id === this.stageId) || null; },
    eligible() { return this.em.regs.filter((r) => r.payment_status !== 'pending'); },
    addable() {
      const used = new Set(this.rows.map((r) => r.registration_id));
      return this.eligible.filter((r) => !used.has(r.id));
    },
    sortedRows() { return [...this.rows].sort((a, b) => (a.position || 999) - (b.position || 999)); },
    isBracket() { return this.stage?.stage_type === 'bracket'; },
    isGroup() { return this.stage?.stage_type === 'group'; },
    groupStages() { return this.stages.filter((s) => s.stage_type === 'group'); },
    groupMatches() { return (this.stage?.matches || []).filter((m) => m.kind === 'group'); },
    groupsDone() { return this.groupStages.length > 0 && this.groupStages.every((s) => s.finished); },
    bracketMatches() { return (this.stage?.matches || []).filter((m) => m.kind === 'bracket'); },
    // Final decided: the champion is known.
    bracketDone() {
      const ms = this.bracketMatches;
      const last = Math.max(0, ...ms.map((m) => m.round));
      return ms.some((m) => m.round === last && m.status === 'done');
    },
    bracketPlayed() { return this.bracketMatches.some((m) => m.status === 'done'); },
    // "8 confirmed → bracket of 8" / "5 confirmed → bracket of 8 with 3 byes"
    bracketPreview() {
      // After a group phase only the qualifiers play the final.
      const n = this.groupStages.length
        ? this.groupStages.reduce((sum, g) => sum + Number(g.config?.advance ?? 2), 0)
        : this.eligible.length;
      let size = 2;
      while (size < n) size *= 2;
      return { n, size, byes: Math.max(0, size - n) };
    },
    dupPositions() {
      // Shared places (two semifinal losers are both 3rd) are normal in a bracket.
      if (this.isBracket || this.isGroup) return false;
      const seen = new Set();
      return this.rows.some((r) => { if (seen.has(r.position)) return true; seen.add(r.position); return false; });
    },
    standings() {
      const pts = {};
      this.stages.filter((s) => s.results_published).forEach((s) => {
        (s.results || []).forEach((x) => {
          pts[x.registration_id] = (pts[x.registration_id] || 0) + (Number(x.score) || 0);
        });
      });
      return Object.entries(pts)
        .map(([id, p]) => ({ id, pts: p, name: this.nameOf(id), avatar: this.em.regById(id)?.user?.avatar || '' }))
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 15);
    },
  },
  watch: {
    stageId() { this.load(); },
  },
  created() {
    const q = this.$route.params.sub;
    const byQuery = q && this.stages.find((s) => s.route === q);
    const live = this.stages.find((s) => stageState(s) === 'live');
    const started = [...this.stages].reverse().find((s) => s.initialized);
    this.stageId = (byQuery || live || started || this.stages[0])?.id ?? null;
  },
  methods: {
    stageState,
    nameOf(regId) {
      const reg = this.em.regById(regId);
      if (reg) return userName(reg);
      for (const s of this.stages) {
        const r = (s.results || []).find((x) => x.registration_id === regId);
        if (r?.user) return r.user.name || r.user.username;
      }
      return '—';
    },
    avatarOf(regId) { return this.em.regById(regId)?.user?.avatar || ''; },
    load() {
      this.rows = (this.stage?.results || []).map((r) => ({
        registration_id: r.registration_id,
        position: r.position,
        score: r.score,
        qualified: !!r.qualified,
        best: r.result_data?.best ?? '',
        laps: r.result_data?.laps ?? '',
        pen: r.result_data?.pen ?? '',
      }));
      this.dirty = false;
      this.addId = '';
    },
    fill() {
      this.rows = this.eligible.map((r, i) => ({ registration_id: r.id, position: i + 1, score: POINTS[i] ?? 0, qualified: false, best: '', laps: '', pen: '' }));
      this.dirty = true;
    },
    addRow() {
      if (!this.addId) return;
      const pos = this.rows.reduce((m, r) => Math.max(m, r.position || 0), 0) + 1;
      this.rows.push({ registration_id: this.addId, position: pos, score: this.auto ? (POINTS[pos - 1] ?? 0) : 0, qualified: false, best: '', laps: '', pen: '' });
      this.addId = '';
      this.dirty = true;
    },
    removeRow(row) {
      this.rows = this.rows.filter((r) => r !== row);
      this.dirty = true;
    },
    onPos(row) {
      if (this.auto) row.score = POINTS[(row.position || 0) - 1] ?? 0;
      this.dirty = true;
    },
    payload() {
      return this.rows.map((r) => {
        const data = {};
        if (r.best !== '' && r.best !== null) data.best = String(r.best);
        if (r.laps !== '' && r.laps !== null) data.laps = Number(r.laps);
        if (r.pen !== '' && r.pen !== null) data.pen = String(r.pen);
        return {
          registration_id: r.registration_id,
          position: Number(r.position),
          score: r.score === '' || r.score === null ? null : Number(r.score),
          qualified: !!r.qualified,
          result_data: Object.keys(data).length ? data : null,
        };
      });
    },
    // Published results of a running stage: the next thing to do is closing it.
    async finishStage() {
      const st = this.stage;
      if (!st) return;
      const ok = await this.em.ask(this.$t('pages.event.manage.stg.finish_q', { s: st.name }), this.$t('pages.event.manage.stg.finish'));
      if (!ok) return;
      this.saving = true;
      const res = await OrganizationEventStage.control(this.em.orgRoute, this.em.eventRoute, st.route, 'finish');
      this.saving = false;
      if (res.code === 200) {
        this.em.putStage(res.data);
        toast.success(this.$t('pages.event.manage.toast.finished'));
      } else toast.error(apiError(this, res.data));
    },
    async drawBracket(mode) {
      if (!this.stage || this.saving) return;
      if (this.bracketMatches.length) {
        const ok = await this.em.ask(this.$t('competition.bracket.redraw_q'), this.$t('competition.bracket.redraw'));
        if (!ok) return;
      }
      this.saving = true;
      const res = await OrganizationEventStage.generateBracket(this.em.orgRoute, this.em.eventRoute, this.stage.route, mode);
      this.saving = false;
      if (res.code === 200) {
        this.em.putStage(res.data);
        this.load();
        toast.success(this.$t('competition.bracket.drawn'));
      } else toast.error(apiError(this, res.data));
    },
    async drawGroups(mode) {
      if (this.saving) return;
      if (this.groupStages.some((g) => (g.matches || []).length)) {
        const ok = await this.em.ask(this.$t('competition.group.redraw_q'), this.$t('competition.group.redraw'));
        if (!ok) return;
      }
      this.saving = true;
      const res = await OrganizationEventStage.drawGroups(this.em.orgRoute, this.em.eventRoute, mode);
      this.saving = false;
      if (res.code === 200 && Array.isArray(res.data)) {
        res.data.forEach((st) => this.em.putStage(st));
        this.load();
        toast.success(this.$t('competition.group.drawn'));
      } else toast.error(apiError(this, res.data));
    },
    async saveGame({ match, score_a, score_b }) {
      return this.decide({ match, winner: null, score_a, score_b });
    },
    async decide({ match, winner, score_a, score_b }) {
      if (!this.stage || this.busyMatch) return;
      this.busyMatch = match.id;
      const res = await OrganizationEventStage.decideMatch(this.em.orgRoute, this.em.eventRoute, this.stage.route, match.id, {
        winner, score_a: score_a === '' ? null : score_a, score_b: score_b === '' ? null : score_b,
      });
      this.busyMatch = null;
      if (res.code === 200) {
        this.em.putStage(res.data);
        this.load();
      } else toast.error(apiError(this, res.data));
    },
    async save(publish) {
      if (!this.stage || this.saving) return;
      if (this.rows.some((r) => !r.position || r.position < 1)) return;
      this.saving = true;
      const res = await OrganizationEventStage.setResults(this.em.orgRoute, this.em.eventRoute, this.stage.route, this.payload(), publish);
      this.saving = false;
      if (res.code === 200) {
        const was = this.stage.results_published;
        this.em.putStage(res.data);
        this.load();
        const key = publish && !was ? 'published' : (!publish && was ? 'unpublished' : (publish ? 'saved' : 'draft_saved'));
        toast.success(this.$t('pages.event.manage.toast.' + key));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.res.title') }}</h1>
        <p>{{ $t('pages.event.manage.res.sub') }}</p>
      </div>
      <div class="spacer"></div>
      <div v-if="stage?.initialized && !readonly && rows.length" class="hd-acts">
        <template v-if="stage.results_published">
          <button class="btn btn-outline-secondary round px-3" :disabled="saving" @click="save(false)">
            <font-awesome-icon :icon="['fas', 'eye-slash']" class="me-2" />{{ $t('pages.event.manage.res.unpublish') }}
          </button>
          <button class="btn btn-primary round px-3" :disabled="saving || !dirty || dupPositions" @click="save(true)">
            {{ $t('pages.event.manage.c.save') }}
          </button>
        </template>
        <template v-else>
          <button class="btn btn-outline-secondary round px-3" :disabled="saving || dupPositions" @click="save(false)">{{ $t('pages.event.manage.res.save_draft') }}</button>
          <button class="btn btn-primary round px-3" :disabled="saving || dupPositions" @click="save(true)">
            <font-awesome-icon :icon="['fas', 'upload']" class="me-2" />{{ $t('pages.event.manage.res.publish') }}
          </button>
        </template>
      </div>
    </div>

    <div v-if="stage && stage.results_published && stageState(stage) === 'live' && !dirty && em.can('event.manage') && (!isBracket || bracketDone)" class="next-step">
      <font-awesome-icon :icon="['fas', 'circle-check']" class="next-step__ico" />
      <div class="next-step__txt">
        <strong>{{ $t('pages.event.manage.res.next_title') }}</strong>
        <span>{{ $t(stages.some((x) => x.id !== stage.id && !x.finished) ? 'pages.event.manage.res.next_text' : 'pages.event.manage.res.next_text_last', { s: stage.name }) }}</span>
      </div>
      <button class="btn btn-primary round px-3" :disabled="saving" @click="finishStage">
        <font-awesome-icon :icon="['fas', 'flag']" class="me-2" />{{ $t('pages.event.manage.stg.finish') }}
      </button>
    </div>

    <div v-if="!stages.length" class="cc">
      <div class="cc-empty"><font-awesome-icon :icon="['fas', 'ranking-star']" class="ico" />{{ $t('pages.event.manage.res.no_stages') }}</div>
    </div>

    <template v-else>
      <div class="sec-bar">
        <label class="form-label m-0" style="font-weight:600">{{ $t('pages.event.manage.res.stage') }}</label>
        <select v-model="stageId" class="form-select form-select-sm" style="max-width:320px">
          <option v-for="(s, i) in stages" :key="s.id" :value="s.id">{{ i + 1 }}. {{ s.name }} — {{ $t('pages.event.manage.stg.state.' + stageState(s)) }}</option>
        </select>
        <span v-if="stage?.results_published" class="s-badge ok"><font-awesome-icon :icon="['fas', 'check']" />{{ $t('pages.event.manage.res.published') }}</span>
        <span v-else-if="stage?.initialized" class="s-badge warn"><font-awesome-icon :icon="['fas', 'eye-slash']" />{{ $t('pages.event.manage.res.not_published') }}</span>
        <span v-if="dirty" class="s-badge pri">{{ $t('pages.event.manage.res.unsaved') }}</span>
      </div>

      <div class="res-grid">
        <div>
          <div class="cc">
            <template v-if="isGroup">
              <div v-if="!groupMatches.length" class="cc-empty">
                <font-awesome-icon :icon="['fas', 'layer-group']" class="ico" />
                <p class="mb-1"><strong>{{ $t('competition.group.empty_title') }}</strong></p>
                <p class="mb-3 small">{{ $t('competition.group.preview', { n: eligible.length, g: groupStages.length }) }}</p>
                <div v-if="!readonly" class="d-flex gap-2 justify-content-center flex-wrap">
                  <button class="btn btn-primary round px-3" :disabled="saving || eligible.length < groupStages.length * 2" @click="drawGroups('random')">
                    <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />{{ $t('competition.group.draw_random') }}
                  </button>
                  <button class="btn btn-outline-secondary round px-3" :disabled="saving || eligible.length < groupStages.length * 2" @click="drawGroups('registration')">
                    <font-awesome-icon :icon="['fas', 'list-ol']" class="me-2" />{{ $t('competition.group.draw_order') }}
                  </button>
                </div>
                <p v-if="eligible.length < groupStages.length * 2" class="small mt-2 mb-0">{{ $t('competition.group.need_two', { n: groupStages.length * 2 }) }}</p>
              </div>
              <div v-else class="bk-wrap">
                <p class="hint mb-2">
                  <font-awesome-icon :icon="['fas', 'circle-info']" />
                  {{ $t(!stage.initialized ? 'competition.group.hint_not_started' : (readonly ? 'competition.bracket.hint_readonly' : 'competition.group.hint')) }}
                </p>
                <EhubGroupTable :results="stage.results || []" :name-of="nameOf" class="mb-3" />
                <EhubGroupMatches :matches="groupMatches" :editable="!readonly && stage.initialized && !stage.finished" :busy-id="busyMatch" @save="saveGame" />
                <div v-if="!readonly && !groupStages.some((g) => (g.matches || []).some((m) => m.status === 'done')) && !stage.finished" class="mt-3">
                  <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="saving" @click="drawGroups('random')">
                    <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />{{ $t('competition.group.redraw') }}
                  </button>
                </div>
              </div>
            </template>
            <template v-else-if="isBracket">
              <div v-if="!bracketMatches.length" class="cc-empty">
                <font-awesome-icon :icon="['fas', 'sitemap']" class="ico" />
                <p class="mb-1"><strong>{{ $t('competition.bracket.empty_title') }}</strong></p>
                <p class="mb-3 small">{{ $t(groupStages.length ? 'competition.bracket.preview_groups' : (bracketPreview.byes ? 'competition.bracket.preview_byes' : 'competition.bracket.preview'), bracketPreview) }}</p>
                <div v-if="!readonly" class="d-flex gap-2 justify-content-center flex-wrap">
                  <button v-if="groupStages.length" class="btn btn-primary round px-3" :disabled="saving || !groupsDone" @click="drawBracket('groups')">
                    <font-awesome-icon :icon="['fas', 'sitemap']" class="me-2" />{{ $t('competition.bracket.draw_groups') }}
                  </button>
                  <button class="btn round px-3" :class="groupStages.length ? 'btn-outline-secondary' : 'btn-primary'" :disabled="saving || bracketPreview.n < 2" @click="drawBracket('random')">
                    <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />{{ $t('competition.bracket.draw_random') }}
                  </button>
                  <button class="btn btn-outline-secondary round px-3" :disabled="saving || bracketPreview.n < 2" @click="drawBracket('registration')">
                    <font-awesome-icon :icon="['fas', 'list-ol']" class="me-2" />{{ $t('competition.bracket.draw_order') }}
                  </button>
                </div>
                <p v-if="bracketPreview.n < 2" class="small mt-2 mb-0">{{ $t('competition.bracket.need_two') }}</p>
                <p v-if="groupStages.length && !groupsDone" class="small mt-2 mb-0">{{ $t('competition.bracket.groups_pending') }}</p>
              </div>
              <div v-else class="bk-wrap">
                <p class="hint mb-2">
                  <font-awesome-icon :icon="['fas', 'circle-info']" />
                  {{ $t(!stage.initialized ? 'competition.bracket.hint_not_started' : (readonly ? 'competition.bracket.hint_readonly' : 'competition.bracket.hint')) }}
                </p>
                <EhubBracket :matches="bracketMatches" :editable="!readonly && stage.initialized && !stage.finished" :busy-id="busyMatch" @decide="decide" />
                <div v-if="!readonly && !bracketPlayed && !stage.finished" class="mt-3">
                  <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="saving" @click="drawBracket('random')">
                    <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />{{ $t('competition.bracket.redraw') }}
                  </button>
                </div>
              </div>
            </template>
            <div v-else-if="!stage?.initialized" class="cc-empty">
              <font-awesome-icon :icon="['fas', 'clock']" class="ico" />{{ $t('pages.event.manage.res.not_started') }}
            </div>
            <div v-else-if="!rows.length" class="cc-empty">
              <font-awesome-icon :icon="['fas', 'ranking-star']" class="ico" />
              <p class="mb-3">{{ $t('pages.event.manage.res.empty') }}</p>
              <button v-if="!readonly" class="btn btn-primary round px-3" :disabled="!eligible.length" @click="fill">
                <font-awesome-icon :icon="['fas', 'list-ol']" class="me-2" />{{ $t('pages.event.manage.res.fill') }}
              </button>
            </div>
            <div v-else class="tbl-wrap">
              <table class="mgmt-tbl">
                <thead>
                  <tr>
                    <th>{{ $t('pages.event.manage.res.pos') }}</th>
                    <th>{{ $t('pages.event.manage.res.part') }}</th>
                    <th>{{ $t('pages.event.manage.res.score') }}</th>
                    <th>{{ $t('pages.event.manage.res.best') }}</th>
                    <th>{{ $t('pages.event.manage.res.laps') }}</th>
                    <th>{{ $t('pages.event.manage.res.pen') }}</th>
                    <th>{{ $t('pages.event.manage.res.qual') }}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in sortedRows" :key="row.registration_id">
                    <td class="pos-cell"><input :value="row.position" type="number" min="1" class="form-control res-in sm" :disabled="readonly" @change="row.position = Number($event.target.value); onPos(row)" /></td>
                    <td>
                      <div class="who">
                        <InitialsAvatar :name="nameOf(row.registration_id)" :image="avatarOf(row.registration_id)" :size="26" />
                        <b>{{ nameOf(row.registration_id) }}</b>
                      </div>
                    </td>
                    <td><input v-model.number="row.score" type="number" step="any" class="form-control res-in sm" :disabled="readonly" @input="dirty = true" /></td>
                    <td><input v-model="row.best" class="form-control res-in" placeholder="0:00.000" maxlength="20" :disabled="readonly" @input="dirty = true" /></td>
                    <td><input v-model.number="row.laps" type="number" min="0" class="form-control res-in sm" :disabled="readonly" @input="dirty = true" /></td>
                    <td><input v-model="row.pen" class="form-control res-in sm" placeholder="—" maxlength="20" :disabled="readonly" @input="dirty = true" /></td>
                    <td><div class="form-check form-switch m-0"><input v-model="row.qualified" class="form-check-input" type="checkbox" :disabled="readonly" @change="dirty = true" /></div></td>
                    <td><button v-if="!readonly" class="act-btn del" :title="$t('pages.event.manage.res.remove_row')" @click="removeRow(row)"><font-awesome-icon :icon="['fas', 'xmark']" /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="!isBracket && !isGroup && stage?.initialized && rows.length && !readonly && addable.length" class="add-row">
              <select v-model="addId" class="form-select form-select-sm" style="max-width:260px">
                <option value="" disabled>{{ $t('pages.event.manage.res.add_row') }}</option>
                <option v-for="r in addable" :key="r.id" :value="r.id">{{ userName(r) }}</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="!addId" @click="addRow">
                <font-awesome-icon :icon="['fas', 'plus']" />
              </button>
            </div>
          </div>
          <div v-if="!isBracket && !isGroup && stage?.initialized && rows.length && !readonly" class="hint" style="margin-top:10px">
            <div class="form-check form-switch m-0">
              <input id="resAuto" v-model="auto" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="resAuto">{{ $t('pages.event.manage.res.auto_pts') }}</label>
            </div>
          </div>
          <div v-if="dupPositions" class="hint" style="margin-top:6px;color:var(--ehub-danger-text)">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />{{ $t('pages.event.manage.res.dup_pos') }}
          </div>
        </div>

        <div class="cc">
          <div class="cc-hd">
            <h3><font-awesome-icon :icon="['fas', 'trophy']" style="color:var(--ehub-gold)" />{{ $t('pages.event.manage.res.standings') }}</h3>
          </div>
          <div v-if="!standings.length" class="cc-empty">{{ $t('pages.event.manage.res.standings_empty') }}</div>
          <div v-for="(x, i) in standings" :key="x.id" class="std-row">
            <span class="std-pos">{{ i + 1 }}</span>
            <InitialsAvatar :name="x.name" :image="x.avatar" :size="24" />
            <span class="std-name">{{ x.name }}</span>
            <span class="std-pts">{{ x.pts }} <span class="td-muted">{{ $t('pages.event.manage.res.pts') }}</span></span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.next-step { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: color-mix(in srgb, #1f8a5b 10%, var(--ehub-card)); border: 1px solid color-mix(in srgb, #1f8a5b 35%, transparent); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; }
.next-step__ico { color: var(--ehub-success-text); font-size: 1.2rem; }
.next-step__txt { flex: 1; min-width: 200px; display: flex; flex-direction: column; font-size: .85rem; color: var(--ehub-muted); }
.next-step__txt strong { color: var(--ehub-ink); font-size: .92rem; }

.res-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.res-in { width: 84px; padding: 4px 8px; font-size: .82rem; border-radius: 7px; }
.res-in.sm { width: 62px; }
.pos-cell { width: 70px; }
.bk-wrap { padding: 14px 16px; }
.add-row { display: flex; gap: 8px; padding: 10px 15px; border-top: 1px solid var(--ehub-line); }
.std-row { display: flex; align-items: center; gap: 10px; padding: 8px 17px; border-bottom: 1px solid var(--ehub-line); font-size: .83rem; }
.std-row:last-child { border-bottom: 0; }
.std-pos { width: 20px; font-weight: 800; color: var(--ehub-muted); font-variant-numeric: tabular-nums; }
.std-name { flex: 1; font-weight: 600; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.std-pts { font-weight: 700; font-variant-numeric: tabular-nums; color: var(--ehub-ink); }
@media (max-width: 1100px) { .res-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
