<script>
import Api from '@/helpers/communication/Connection';
import EhubDialog from '@/components/modals/EhubDialog.vue';
import { toast } from '@/helpers/toast.js';

/**
 * Reports for an organization or a team: ready-made reports, a builder to
 * customize one (dataset, columns, grouping, filters, sort, chart) and saved
 * layouts. Results can be downloaded (CSV) or printed / saved as PDF.
 *
 * Props: base = API prefix ("/org/<route>/reports" or "/team/<route>/reports"), scope = org | team.
 */
const PERIODS = ['all', '7d', '30d', '90d', '365d', 'month', 'last_month', 'year', 'custom'];

export default {
  name: 'EhubReportBuilder',
  components: { EhubDialog },
  props: {
    base: { type: String, required: true },
    scope: { type: String, default: 'org' },
    ownerName: { type: String, default: '' },
  },
  data() {
    return {
      loading: true,
      catalog: null,
      templates: [],
      tab: 'ready',
      view: 'home', // home | builder
      def: null,
      editingId: null,
      name: '',
      result: null,
      running: false,
      saving: false,
      confirmDelete: null,
      periods: PERIODS,
      generatedAt: null,
    };
  },
  computed: {
    datasets() { return this.catalog?.datasets || []; },
    ds() { return this.datasets.find((d) => d.key === this.def?.dataset) || null; },
    grouped() { return !!this.def?.group_by; },
    chartRows() {
      if (!this.result?.grouped || this.def?.chart !== 'bar') return [];
      const key = this.result.columns.some((c) => c.key === 'total') && this.result.rows.some((r) => r.total) ? 'total' : 'count';
      const max = Math.max(1, ...this.result.rows.map((r) => Number(r[key]) || 0));
      return this.result.rows.map((r) => ({ label: this.fmt(r.group, this.groupType), value: r[key], pct: Math.round(((Number(r[key]) || 0) / max) * 100), key }));
    },
    groupType() {
      const g = this.def?.group_by;
      const map = { month: 'month', checked_in: 'bool', position: 'number', gateway: 'gateway', category: 'category', situation: 'situation', format: 'format', reason: 'refund_reason' };
      if (g === 'status') return { refunds: 'refund_status', applications: 'application_status' }[this.def.dataset] || 'status';
      if (g === 'role') return this.scope === 'team' ? 'team_role' : 'org_role';
      return map[g] || 'text';
    },
    title() {
      return this.name || this.dsLabel(this.def?.dataset);
    },
  },
  async mounted() {
    await Promise.all([this.loadCatalog(), this.loadTemplates()]);
    this.loading = false;
  },
  methods: {
    t(k, p) { return this.$t('reports.' + k, p); },
    dsLabel(key) {
      if (!key) return '';
      const team = 'reports.team_datasets.' + key + '.label';
      return this.scope === 'team' && this.$te(team) ? this.$t(team) : this.$t('reports.datasets.' + key + '.label');
    },
    dsDesc(key) {
      const team = 'reports.team_datasets.' + key + '.desc';
      return this.scope === 'team' && this.$te(team) ? this.$t(team) : this.$t('reports.datasets.' + key + '.desc');
    },
    async loadCatalog() {
      const r = await Api.getAsync(this.base + '/catalog');
      if (r.code === 200) this.catalog = r.response.message;
    },
    async loadTemplates() {
      const r = await Api.getAsync(this.base + '/templates');
      if (r.code === 200) this.templates = r.response.message || [];
    },
    blankDef(dataset) {
      const d = this.datasets.find((x) => x.key === dataset) || this.datasets[0];
      return { dataset: d.key, columns: [...d.default_columns], group_by: null, filters: { period: 'all' }, sort: { by: null, dir: 'asc' }, chart: 'bar' };
    },
    newReport() {
      this.def = this.blankDef(this.datasets[0]?.key);
      this.editingId = null; this.name = ''; this.result = null; this.view = 'builder';
    },
    openPreset(p) {
      const def = { ...this.blankDef(p.definition.dataset), ...p.definition };
      def.filters = { period: 'all', ...(p.definition.filters || {}) };
      this.def = def; this.editingId = null; this.name = this.$t('reports.presets.' + p.key + '.label'); this.view = 'builder';
      this.run();
    },
    openTemplate(tpl, runNow = true) {
      const def = { ...this.blankDef(tpl.definition.dataset), ...tpl.definition };
      def.filters = { period: 'all', ...(tpl.definition.filters || {}) };
      def.sort = { by: null, dir: 'asc', ...(tpl.definition.sort || {}) };
      this.def = def; this.editingId = tpl.id; this.name = tpl.name; this.result = null; this.view = 'builder';
      if (runNow) this.run();
    },
    onDatasetChange() {
      const keep = this.def.filters;
      this.def = { ...this.blankDef(this.def.dataset), filters: { period: keep.period || 'all', from: keep.from, to: keep.to } };
      this.result = null;
    },
    setMode(group) {
      this.def.group_by = group ? (this.ds.groups[0] || null) : null;
      this.result = null;
    },
    toggleColumn(key) {
      const i = this.def.columns.indexOf(key);
      if (i >= 0) this.def.columns.splice(i, 1); else this.def.columns.push(key);
    },
    moveColumn(key, dir) {
      const cols = this.def.columns; const i = cols.indexOf(key); const j = i + dir;
      if (i < 0 || j < 0 || j >= cols.length) return;
      [cols[i], cols[j]] = [cols[j], cols[i]];
    },
    orderedColumns() {
      // Chosen columns first (in their order), then the rest.
      const all = this.ds?.columns || [];
      return [...this.def.columns.map((k) => all.find((c) => c.key === k)).filter(Boolean), ...all.filter((c) => !this.def.columns.includes(c.key))];
    },
    payload() {
      const f = { ...this.def.filters };
      if (f.period !== 'custom') { delete f.from; delete f.to; }
      if (f.period === 'all') delete f.period;
      return { ...this.def, filters: f };
    },
    async run() {
      this.running = true;
      const r = await Api.postAsync(this.base + '/run', { definition: this.payload(), template_id: this.editingId });
      this.running = false;
      if (r.code === 200) {
        this.result = r.response.message;
        this.generatedAt = new Date();
        if (this.editingId) this.loadTemplates();
      } else toast.error(this.t('error'));
    },
    async save(asNew = false) {
      if (!this.name.trim()) { toast.error(this.t('builder.name_required')); return; }
      this.saving = true;
      const body = { name: this.name.trim(), definition: this.payload() };
      const r = this.editingId && !asNew
        ? await Api.patchAsync(this.base + '/templates/' + this.editingId, body)
        : await Api.postAsync(this.base + '/templates', body);
      this.saving = false;
      if (r.code === 200 || r.code === 201) {
        if (r.response?.message?.id) this.editingId = r.response.message.id;
        toast.success(this.t('saved'));
        this.loadTemplates();
      } else toast.error(this.t('error'));
    },
    async remove() {
      const tpl = this.confirmDelete; this.confirmDelete = null;
      const r = await Api.deleteAsync(this.base + '/templates/' + tpl.id);
      if (r.code === 200) { toast.success(this.t('deleted')); this.loadTemplates(); } else toast.error(this.t('error'));
    },
    colLabel(key) {
      if (key === 'group') return this.def?.group_by ? this.$t('reports.groups.' + this.def.group_by) : this.t('result.group');
      return this.$t('reports.cols.' + key);
    },
    fmt(v, type, row = {}) {
      if (v === null || v === undefined || v === '') return type === 'bool' ? this.t('v.no') : '—';
      const loc = this.$i18n.locale;
      const label = (path) => (this.$te(path) ? this.$t(path) : String(v));
      switch (type) {
        case 'number': return new Intl.NumberFormat(loc).format(Number(v));
        case 'money': return new Intl.NumberFormat(loc, { style: 'currency', currency: String(row.currency || 'BRL').toUpperCase() }).format(Number(v) || 0);
        case 'date': return new Intl.DateTimeFormat(loc, { dateStyle: 'short' }).format(new Date(v));
        case 'datetime': return new Intl.DateTimeFormat(loc, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(String(v).replace(' ', 'T')));
        case 'month': { const [y, m] = String(v).split('-'); return new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(+y, +m - 1, 1)); }
        case 'bool': return Number(v) ? this.t('v.yes') : this.t('v.no');
        case 'category': return label('categories.names.' + v);
        case 'org_role': return label('pages.organization.manage.roles.' + v);
        case 'team_role': return label('pages.teams.manage.roles.' + v);
        case 'status': case 'gateway': case 'refund_status': case 'refund_reason': case 'publication': case 'situation': case 'format': case 'application_status':
          return label('reports.v.' + type + '.' + v);
        default: return String(v);
      }
    },
    totalCell(col) {
      const t = this.result?.totals || {};
      if (col.key === 'count') return this.fmt(t.count, 'number');
      if (col.type === 'money' && t.total !== undefined) return this.fmt(t.total, 'money', this.result.rows[0] || {});
      return '';
    },
    downloadCsv() {
      const cols = this.result.columns;
      const esc = (s) => { const x = String(s ?? ''); return /[";\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
      const lines = [cols.map((c) => esc(this.colLabel(c.key))).join(';')];
      for (const r of this.result.rows) {
        lines.push(cols.map((c) => {
          const v = r[c.key];
          if (c.type === 'money' || c.type === 'number') return v === null || v === undefined ? '' : String(v).replace('.', this.$i18n.locale === 'en' ? '.' : ',');
          return esc(this.fmt(v, c.key === 'group' ? this.groupType : c.type, r));
        }).join(';'));
      }
      const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (this.title || 'relatorio').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').toLowerCase() + '.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    print() { window.print(); },
    fmtWhen(d) { return d ? new Intl.DateTimeFormat(this.$i18n.locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : ''; },
    periodText() {
      const f = this.def.filters;
      if (f.period === 'custom') return [f.from, f.to].filter(Boolean).map((d) => this.fmt(d, 'date')).join(' – ');
      return this.t('periods.' + (f.period || 'all'));
    },
  },
};
</script>

<template>
  <div class="erb">
    <div v-if="loading" class="cc"><div class="cc-empty"><font-awesome-icon :icon="['fas', 'spinner']" spin class="ico" /></div></div>

    <!-- ── Home: ready-made + saved layouts ── -->
    <template v-else-if="view === 'home'">
      <div class="erb-bar">
        <div class="role-seg" role="tablist">
          <button role="tab" :aria-selected="tab === 'ready'" :class="{ active: tab === 'ready' }" @click="tab = 'ready'">{{ t('tab_ready') }}</button>
          <button role="tab" :aria-selected="tab === 'saved'" :class="{ active: tab === 'saved' }" @click="tab = 'saved'">
            {{ t('tab_saved') }}<span v-if="templates.length" class="erb-count">{{ templates.length }}</span>
          </button>
        </div>
        <button class="btn btn-primary round px-3" @click="newReport">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />{{ t('new') }}
        </button>
      </div>

      <div v-show="tab === 'ready'" class="rep-grid">
        <div v-for="p in catalog.presets" :key="p.key" class="rep-card">
          <div class="rep-card-ico erb-ico"><font-awesome-icon :icon="['fas', p.icon]" /></div>
          <h4>{{ $t('reports.presets.' + p.key + '.label') }}</h4>
          <p>{{ $t('reports.presets.' + p.key + '.desc') }}</p>
          <div class="rep-card-foot">
            <span class="rep-last">{{ dsLabel(p.definition.dataset) }}</span>
            <button class="btn btn-sm btn-primary round px-3" @click="openPreset(p)">{{ t('generate') }}</button>
          </div>
        </div>
      </div>

      <div v-show="tab === 'saved'">
        <div v-if="!templates.length" class="cc"><div class="cc-empty">
          <font-awesome-icon :icon="['fas', 'bookmark']" class="ico" />
          <p class="mb-3">{{ t('saved_empty') }}</p>
          <button class="btn btn-primary round px-4" @click="newReport">{{ t('new') }}</button>
        </div></div>
        <div v-else class="cc">
          <div class="erb-scroll">
            <table class="mgmt-tbl">
              <thead><tr><th>{{ t('col_name') }}</th><th>{{ t('col_data') }}</th><th>{{ t('col_last') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="tpl in templates" :key="tpl.id">
                  <td class="td-name">{{ tpl.name }}</td>
                  <td class="td-muted">{{ dsLabel(tpl.definition.dataset) }}<template v-if="tpl.definition.group_by"> · {{ $t('reports.groups.' + tpl.definition.group_by) }}</template></td>
                  <td class="td-muted small">{{ tpl.last_run_at ? t('last_run', { date: fmtWhen(tpl.last_run_at) }) : t('never') }}<template v-if="tpl.author"> · {{ t('by', { name: tpl.author }) }}</template></td>
                  <td>
                    <div class="act-row">
                      <button class="btn btn-sm btn-primary round px-3" @click="openTemplate(tpl)">{{ t('run') }}</button>
                      <button class="act-btn" :aria-label="t('edit')" :title="t('edit')" @click="openTemplate(tpl, false)"><font-awesome-icon :icon="['fas', 'pen']" /></button>
                      <button class="act-btn del" :aria-label="t('delete')" :title="t('delete')" @click="confirmDelete = tpl"><font-awesome-icon :icon="['fas', 'trash']" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Builder + result ── -->
    <template v-else>
      <div class="erb-bar erb-noprint">
        <button class="btn btn-ghost round px-3" @click="view = 'home'; result = null">
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-2" />{{ t('back') }}
        </button>
      </div>

      <div class="cc erb-noprint">
        <div class="cc-hd"><h3><font-awesome-icon :icon="['fas', 'sliders']" />{{ t('builder.title') }}</h3></div>
        <div class="cc-bd">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="erb-ds">{{ t('builder.dataset') }}</label>
              <select id="erb-ds" v-model="def.dataset" class="form-select" @change="onDatasetChange">
                <option v-for="d in datasets" :key="d.key" :value="d.key">{{ dsLabel(d.key) }}</option>
              </select>
              <p class="erb-hint">{{ dsDesc(def.dataset) }}</p>
            </div>
            <div class="col-md-6">
              <span class="form-label d-block">{{ t('builder.mode') }}</span>
              <div class="role-seg" role="radiogroup">
                <button type="button" role="radio" :aria-checked="!grouped" :class="{ active: !grouped }" @click="setMode(false)">{{ t('builder.mode_list') }}</button>
                <button v-if="ds && ds.groups.length" type="button" role="radio" :aria-checked="grouped" :class="{ active: grouped }" @click="setMode(true)">{{ t('builder.mode_group') }}</button>
              </div>
            </div>

            <div v-if="grouped" class="col-md-6">
              <label class="form-label" for="erb-group">{{ t('builder.group_by') }}</label>
              <select id="erb-group" v-model="def.group_by" class="form-select">
                <option v-for="g in ds.groups" :key="g" :value="g">{{ $t('reports.groups.' + g) }}</option>
              </select>
            </div>
            <div v-if="grouped" class="col-md-6">
              <label class="form-label" for="erb-chart">{{ t('builder.chart') }}</label>
              <select id="erb-chart" v-model="def.chart" class="form-select">
                <option value="bar">{{ t('builder.chart_bar') }}</option>
                <option value="none">{{ t('builder.chart_none') }}</option>
              </select>
            </div>

            <div v-if="!grouped" class="col-12">
              <span class="form-label d-block">{{ t('builder.columns') }}</span>
              <p class="erb-hint">{{ t('builder.columns_hint') }}</p>
              <ul class="erb-cols">
                <li v-for="c in orderedColumns()" :key="c.key" :class="{ on: def.columns.includes(c.key) }">
                  <label class="erb-col-check">
                    <input type="checkbox" :checked="def.columns.includes(c.key)" @change="toggleColumn(c.key)" />
                    <span>{{ $t('reports.cols.' + c.key) }}</span>
                  </label>
                  <template v-if="def.columns.includes(c.key)">
                    <button type="button" class="act-btn" :aria-label="t('builder.move_up')" :title="t('builder.move_up')" :disabled="def.columns.indexOf(c.key) === 0" @click="moveColumn(c.key, -1)"><font-awesome-icon :icon="['fas', 'arrow-up']" /></button>
                    <button type="button" class="act-btn" :aria-label="t('builder.move_down')" :title="t('builder.move_down')" :disabled="def.columns.indexOf(c.key) === def.columns.length - 1" @click="moveColumn(c.key, 1)"><font-awesome-icon :icon="['fas', 'arrow-down']" /></button>
                  </template>
                </li>
              </ul>
              <p v-if="catalog.sensitive && ds.columns.some((c) => ['mail', 'phone'].includes(c.key))" class="erb-hint"><font-awesome-icon :icon="['fas', 'shield-halved']" class="me-1" />{{ t('builder.sensitive') }}</p>
            </div>

            <div class="col-12"><span class="erb-sec">{{ t('builder.filters') }}</span></div>
            <div v-if="ds.filters.includes('period')" class="col-md-4">
              <label class="form-label" for="erb-period">{{ t('builder.period') }}</label>
              <select id="erb-period" v-model="def.filters.period" class="form-select">
                <option v-for="p in periods" :key="p" :value="p">{{ t('periods.' + p) }}</option>
              </select>
            </div>
            <template v-if="ds.filters.includes('period') && def.filters.period === 'custom'">
              <div class="col-md-4"><label class="form-label" for="erb-from">{{ t('builder.from') }}</label><input id="erb-from" v-model="def.filters.from" type="date" class="form-control" /></div>
              <div class="col-md-4"><label class="form-label" for="erb-to">{{ t('builder.to') }}</label><input id="erb-to" v-model="def.filters.to" type="date" class="form-control" /></div>
            </template>
            <div v-if="ds.filters.includes('event') && catalog.events.length" class="col-md-4">
              <label class="form-label" for="erb-event">{{ t('builder.event') }}</label>
              <select id="erb-event" v-model="def.filters.event" class="form-select">
                <option :value="undefined">{{ t('builder.all_events') }}</option>
                <option v-for="e in catalog.events" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
            <div v-if="ds.filters.includes('status') && ds.statuses.length" class="col-md-4">
              <label class="form-label" for="erb-status">{{ t('builder.status') }}</label>
              <select id="erb-status" v-model="def.filters.status" class="form-select">
                <option :value="undefined">{{ t('builder.all_status') }}</option>
                <option v-for="s in ds.statuses" :key="s" :value="s">{{ fmt(s, def.dataset === 'refunds' ? 'refund_status' : (def.dataset === 'applications' ? 'application_status' : 'status')) }}</option>
              </select>
            </div>
            <div v-if="!grouped" class="col-md-4">
              <label class="form-label" for="erb-sort">{{ t('builder.sort') }}</label>
              <div class="d-flex gap-2">
                <select id="erb-sort" v-model="def.sort.by" class="form-select">
                  <option :value="null">{{ t('builder.sort_default') }}</option>
                  <option v-for="k in def.columns" :key="k" :value="k">{{ $t('reports.cols.' + k) }}</option>
                </select>
                <select v-model="def.sort.dir" class="form-select erb-dir" :aria-label="t('builder.sort')">
                  <option value="asc">{{ t('builder.asc') }}</option>
                  <option value="desc">{{ t('builder.desc') }}</option>
                </select>
              </div>
            </div>

            <div class="col-12 erb-actions">
              <div class="erb-save">
                <label class="visually-hidden" for="erb-name">{{ t('builder.name') }}</label>
                <input id="erb-name" v-model="name" class="form-control" maxlength="120" :placeholder="t('builder.name_ph')" />
                <button class="btn btn-outline-secondary round px-3" :disabled="saving" @click="save(false)">
                  <font-awesome-icon :icon="['fas', 'bookmark']" class="me-2" />{{ t('builder.save') }}
                </button>
                <button v-if="editingId" class="btn btn-ghost round px-3" :disabled="saving" @click="save(true)">{{ t('builder.save_new') }}</button>
              </div>
              <button class="btn btn-primary round px-4" :disabled="running || (!grouped && !def.columns.length)" @click="run">
                <font-awesome-icon :icon="['fas', running ? 'spinner' : 'play']" :spin="running" class="me-2" />{{ t('generate') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Result (this block is what gets printed) -->
      <div v-if="result" class="cc erb-result">
        <div class="cc-hd">
          <h3>{{ title }}</h3>
          <div class="erb-noprint d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="!result.rows.length" @click="downloadCsv"><font-awesome-icon :icon="['fas', 'file-csv']" class="me-2" />{{ t('result.csv') }}</button>
            <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="!result.rows.length" @click="print"><font-awesome-icon :icon="['fas', 'print']" class="me-2" />{{ t('result.print') }}</button>
          </div>
        </div>
        <div class="erb-meta">
          <span v-if="ownerName">{{ ownerName }}</span>
          <span>{{ dsLabel(def.dataset) }}<template v-if="grouped"> · {{ $t('reports.groups.' + def.group_by) }}</template></span>
          <span v-if="ds.filters.includes('period')">{{ periodText() }}</span>
          <span>{{ $t('reports.result.rows', { n: result.rows.length }, result.rows.length) }}</span>
          <span>{{ t('result.generated_at', { date: fmtWhen(generatedAt) }) }}</span>
        </div>
        <p v-if="result.truncated" class="erb-warn">{{ t('result.truncated') }}</p>

        <div v-if="!result.rows.length" class="cc-empty"><font-awesome-icon :icon="['fas', 'magnifying-glass']" class="ico" />{{ t('result.empty') }}</div>
        <template v-else>
          <div v-if="chartRows.length" class="erb-chart" role="img" :aria-label="title">
            <div v-for="(b, i) in chartRows" :key="i" class="erb-bar-row">
              <span class="erb-bar-label" :title="b.label">{{ b.label }}</span>
              <span class="erb-bar-track"><span class="erb-bar-fill" :style="{ width: b.pct + '%' }"></span></span>
              <span class="erb-bar-val">{{ b.key === 'total' ? fmt(b.value, 'money', result.rows[0]) : fmt(b.value, 'number') }}</span>
            </div>
          </div>
          <div class="erb-scroll">
            <table class="mgmt-tbl erb-tbl">
              <thead><tr><th v-for="c in result.columns" :key="c.key" :class="{ num: ['number', 'money'].includes(c.type) }">{{ colLabel(c.key) }}</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in result.rows" :key="i">
                  <td v-for="c in result.columns" :key="c.key" :class="{ num: ['number', 'money'].includes(c.type) }">
                    {{ c.key === 'group' ? (r.group === null || r.group === undefined || r.group === '' ? t('result.no_value') : fmt(r.group, groupType)) : fmt(r[c.key], c.type, r) }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="result.columns.some((c) => totalCell(c))">
                <tr>
                  <td v-for="(c, i) in result.columns" :key="c.key" :class="{ num: ['number', 'money'].includes(c.type) }">{{ i === 0 && !totalCell(c) ? t('result.total') : totalCell(c) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </template>
      </div>
    </template>

    <EhubDialog :model-value="!!confirmDelete" :title="t('delete')" @close="confirmDelete = null">
      <p>{{ confirmDelete ? t('delete_q', { name: confirmDelete.name }) : '' }}</p>
      <template #footer>
        <button class="btn btn-outline-secondary round px-3" @click="confirmDelete = null">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn btn-danger round px-3" @click="remove">{{ t('delete') }}</button>
      </template>
    </EhubDialog>
  </div>
</template>

<style scoped>
.erb-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.erb-count { margin-left: 6px; font-size: .7rem; background: var(--ehub-primary-tint); color: var(--ehub-primary-text); border-radius: 999px; padding: 1px 7px; }
.erb-ico { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.erb-hint { font-size: .78rem; color: var(--ehub-muted); margin: 6px 0 0; }
.erb-sec { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.erb-cols { list-style: none; padding: 0; margin: 8px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; }
.erb-cols li { display: flex; align-items: center; gap: 6px; border: 1px solid var(--ehub-line); border-radius: 9px; padding: 5px 8px; background: var(--ehub-card); }
.erb-cols li.on { border-color: color-mix(in srgb, var(--ehub-primary) 45%, var(--ehub-line)); background: var(--ehub-primary-tint); }
.erb-col-check { display: flex; align-items: center; gap: 8px; flex: 1; cursor: pointer; font-size: .84rem; color: var(--ehub-ink); margin: 0; }
.erb-dir { max-width: 150px; }
.erb-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--ehub-line); padding-top: 14px; }
.erb-save { display: flex; gap: 8px; flex: 1; min-width: 260px; flex-wrap: wrap; }
.erb-save input { flex: 1; min-width: 200px; }
.erb-result { margin-top: 16px; }
.erb-meta { display: flex; flex-wrap: wrap; gap: 6px 16px; padding: 10px 17px 0; font-size: .78rem; color: var(--ehub-muted); }
.erb-warn { margin: 8px 17px 0; font-size: .8rem; color: var(--ehub-warning-text, #8a5a00); }
.erb-scroll { overflow-x: auto; }
.erb-tbl th.num, .erb-tbl td.num { text-align: right; white-space: nowrap; }
.erb-tbl tfoot td { font-weight: 700; border-top: 2px solid var(--ehub-line); }
.erb-chart { padding: 14px 17px 4px; display: flex; flex-direction: column; gap: 7px; }
.erb-bar-row { display: grid; grid-template-columns: minmax(90px, 200px) 1fr auto; align-items: center; gap: 10px; font-size: .8rem; }
.erb-bar-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ehub-ink); }
.erb-bar-track { height: 12px; border-radius: 999px; background: var(--ehub-field-bg); overflow: hidden; }
.erb-bar-fill { display: block; height: 100%; border-radius: 999px; background: var(--ehub-primary); min-width: 2px; }
.erb-bar-val { font-weight: 700; color: var(--ehub-ink); white-space: nowrap; }
@media (max-width: 576px) { .erb-bar-row { grid-template-columns: 90px 1fr auto; } }
</style>

<style>
/* Printing a report: only the result card, full width, no app chrome. */
@media print {
  body * { visibility: hidden !important; }
  .erb-result, .erb-result * { visibility: visible !important; }
  .erb-result { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; }
  .erb-noprint { display: none !important; }
  .erb-result .erb-scroll { overflow: visible !important; }
  .erb-result .erb-bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
