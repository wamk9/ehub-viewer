<template>
  <div>
    <div class="rpt-cc rpt-scroll" style="margin-bottom:8px">
      <table class="rpt-tbl">
        <thead>
          <tr>
            <th class="rpt-sticky">{{ colLabel }}</th>
            <th v-for="r in roles" :key="r.id" class="rpt-center">
              {{ $t(`${rolePrefix}.${r.name}`) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="perm in permKeys" :key="perm">
            <td class="rpt-perm rpt-sticky">{{ $t(`${permPrefix}.${perm}`) }}</td>
            <td v-for="r in roles" :key="r.id" class="rpt-center">
              <span v-if="!r.parent_id" class="pd pd--yes pd--always">✓</span>
              <template v-else>
                <span v-if="r.effective[perm]" class="pd"
                  :class="r.own[perm] ? 'pd--yes' : 'pd--inherited'"
                  :title="r.own[perm] ? '' : inheritedLabel">
                  {{ r.own[perm] ? '✓' : '↑' }}
                </span>
                <span v-else class="pd pd--no">—</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="rpt-legend">
      <span class="pd pd--yes">✓</span> {{ grantedLabel }}
      <span class="pd pd--inherited" style="margin-left:8px">↑</span> {{ inheritedLabel }}
      <span class="pd pd--no" style="margin-left:8px">—</span> {{ deniedLabel }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'EhubRolePermissionsTable',
  props: {
    roles:          { type: Array,  required: true },
    permKeys:       { type: Array,  required: true },
    rolePrefix:     { type: String, required: true },
    permPrefix:     { type: String, required: true },
    colLabel:       { type: String, default: '' },
    grantedLabel:   { type: String, default: '' },
    inheritedLabel: { type: String, default: '' },
    deniedLabel:    { type: String, default: '' },
  },
}
</script>

<style scoped>
.rpt-cc {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: var(--ehub-radius-card);
}
.rpt-scroll { overflow: auto; -webkit-overflow-scrolling: touch; }

.rpt-tbl { width: 100%; border-collapse: collapse; }

.rpt-tbl th {
  font-size: .67rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--ehub-muted);
  padding: 9px 15px; border-bottom: 1px solid var(--ehub-line);
  white-space: nowrap; text-align: center;
}
.rpt-tbl th:first-child { text-align: left; }
.rpt-tbl th:not(:first-child) { min-width: 76px; }

.rpt-tbl td {
  padding: 11px 15px; border-bottom: 1px solid var(--ehub-line);
  font-size: .875rem; color: var(--ehub-ink); vertical-align: middle;
  text-align: center;
}
.rpt-tbl tbody tr:last-child td { border-bottom: 0; }
.rpt-tbl tbody tr:hover td {
  background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent);
}

.rpt-sticky {
  position: sticky; left: 0; z-index: 2;
  background: var(--ehub-card);
  border-right: 1px solid var(--ehub-line);
  text-align: left;
}
.rpt-tbl tbody tr:hover .rpt-sticky { background: var(--ehub-card); }

.rpt-center { text-align: center; }
.rpt-perm { font-size: .82rem; color: var(--ehub-text); min-width: 150px; }

.pd {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%; font-size: .75rem; font-weight: 700;
}
.pd--yes       { background: color-mix(in srgb,#1f8a5b 18%,transparent); color: #1f8a5b; }
.pd--always    { background: color-mix(in srgb,var(--ehub-gold) 18%,transparent); color: color-mix(in srgb,var(--ehub-gold),#000 20%); }
.pd--inherited { background: color-mix(in srgb,var(--ehub-primary) 14%,transparent); color: var(--ehub-primary); }
.pd--no        { background: var(--ehub-field-bg); color: var(--ehub-muted); }

.rpt-legend {
  font-size: .75rem; color: var(--ehub-muted);
  margin-top: 12px; display: flex; align-items: center; gap: 6px;
}

html[data-bs-theme="dark"] .pd--yes    { color: #51cf66; background: color-mix(in srgb,#51cf66 14%,transparent); }
html[data-bs-theme="dark"] .pd--always { color: var(--ehub-gold); }

@media (max-width: 600px) {
  .rpt-tbl th { font-size: .63rem; padding: 7px 10px; }
  .rpt-tbl td { padding: 7px 10px; }
  .rpt-perm   { font-size: .75rem; min-width: 110px; }
  .pd         { width: 20px; height: 20px; font-size: .68rem; }
}
</style>
