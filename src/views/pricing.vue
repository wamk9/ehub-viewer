<template>
  <div>

    <!-- HERO -->
    <header class="pricing-hero">
      <div class="hero-eyebrow">
        <font-awesome-icon icon="chart-line" />
        <span>{{ $t('pages.pricing.hero.eyebrow') }}</span>
      </div>
      <h1 v-html="heroTitleHtml"></h1>
      <p>{{ $t('pages.pricing.hero.subtitle') }}</p>
    </header>

    <!-- MAIN -->
    <main>
      <div class="pricing-wrap">

        <!-- PRICING CARD -->
        <div class="pmc mb-5">
          <div class="pmc-header">
            <div class="pmc-label">{{ $t('pages.pricing.pricing.label') }}</div>
            <div class="pmc-rate">
              <span class="rate-num">2%</span>
              <span class="rate-unit">/ {{ $t('pages.pricing.pricing.per_unit') }}</span>
              <span class="rate-per">{{ $t('pages.pricing.pricing.per_desc') }}</span>
            </div>
            <div class="pmc-min-badge">
              <font-awesome-icon icon="arrow-down-1-9" />
              <span>{{ $t('pages.pricing.pricing.minimum') }}</span>
            </div>
          </div>
          <div class="pmc-footer">
            <div class="pmc-features">
              <div class="pmc-feature" v-for="i in [1,2,3,4]" :key="i">
                <div class="fi-icon"><font-awesome-icon icon="check" /></div>
                <div class="fi-text">
                  <strong>{{ $t(`pages.pricing.feat${i}.title`) }}</strong>
                  <span>{{ $t(`pages.pricing.feat${i}.desc`) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- HOW IT WORKS -->
        <div class="mb-5">
          <h2 class="section-title">{{ $t('pages.pricing.how.title') }}</h2>
          <p class="section-sub">{{ $t('pages.pricing.how.sub') }}</p>
          <div class="how-row">
            <template v-for="(step, idx) in ['s1','s2','s3']" :key="step">
              <div class="how-step">
                <div class="step-ico">
                  <font-awesome-icon :icon="['user-plus','coins','file-invoice-dollar'][idx]" />
                </div>
                <div>
                  <h4>{{ $t(`pages.pricing.how.${step}.title`) }}</h4>
                  <p>{{ $t(`pages.pricing.how.${step}.desc`) }}</p>
                </div>
              </div>
              <div v-if="idx < 2" class="how-arrow">
                <font-awesome-icon icon="chevron-right" />
              </div>
            </template>
          </div>
        </div>

        <!-- EXAMPLES TABLE -->
        <div class="mb-5">
          <h2 class="section-title">{{ $t('pages.pricing.ex.title') }}</h2>
          <p class="section-sub">{{ $t('pages.pricing.ex.sub') }}</p>
          <div class="ehub-card ex-card">
            <div class="ex-scroll">
              <table class="ex-tbl">
                <thead>
                  <tr>
                    <th class="col-event">{{ $t('pages.pricing.ex.col_event') }}</th>
                    <th>{{ $t('pages.pricing.ex.col_value') }}</th>
                    <th class="col-calc">{{ $t('pages.pricing.ex.col_calc') }}</th>
                    <th>{{ $t('pages.pricing.ex.col_fee') }}</th>
                    <th>{{ $t('pages.pricing.ex.col_total') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in exRows" :key="row.name">
                    <td class="col-event">
                      <span class="event-name">{{ row.name }}</span>
                      <span v-if="row.type === 'free'" class="badge-free">
                        <font-awesome-icon icon="lock-open" /> {{ $t('pages.pricing.ex.free_label') }}
                      </span>
                      <span v-else class="badge-paid">
                        <font-awesome-icon icon="coins" /> {{ $t('pages.pricing.ex.paid_label') }}
                      </span>
                    </td>
                    <td class="fw-600">{{ row.value }}</td>
                    <td class="td-muted col-calc">{{ row.calc }}</td>
                    <td class="fee-col">
                      <span class="fee-val">{{ row.fee }}</span>
                      <span v-if="row.min" class="badge-min">
                        <font-awesome-icon icon="arrow-down" /> {{ $t('pages.pricing.ex.min_label') }}
                      </span>
                    </td>
                    <td class="total-col">{{ row.total }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="highlight-note mt-3">
            <font-awesome-icon icon="circle-info" style="flex-shrink:0;margin-top:2px" />
            <span>{{ $t('pages.pricing.ex.note') }}</span>
          </div>
        </div>

        <!-- CURRENCY CONVERSION -->
        <div class="mb-5">
          <h2 class="section-title">{{ $t('pages.pricing.fx.title') }}</h2>
          <p class="section-sub">{{ $t('pages.pricing.fx.sub') }}</p>
          <div class="currency-timeline mb-4">
            <div class="ct-segment">
              <div class="ct-day">{{ $t('pages.pricing.fx.c1.day') }}</div>
              <div class="ct-title">{{ $t('pages.pricing.fx.c1.title') }}</div>
              <div class="ct-desc">{{ $t('pages.pricing.fx.c1.desc') }}</div>
            </div>
            <div class="ct-segment">
              <div class="ct-day">{{ $t('pages.pricing.fx.c2.day') }}</div>
              <div class="ct-title">{{ $t('pages.pricing.fx.c2.title') }}</div>
              <div class="ct-desc">{{ $t('pages.pricing.fx.c2.desc') }}</div>
            </div>
            <div class="ct-segment active-seg">
              <div class="ct-day">{{ $t('pages.pricing.fx.c3.day') }}</div>
              <div class="ct-title">{{ $t('pages.pricing.fx.c3.title') }}</div>
              <div class="ct-desc">{{ $t('pages.pricing.fx.c3.desc') }}</div>
              <div class="ct-badge"><font-awesome-icon icon="rotate" class="me-1" />{{ $t('pages.pricing.fx.c3.badge') }}</div>
            </div>
          </div>
          <div class="fx-cards">
            <div class="ehub-card p-4">
              <div class="fx-card-head">
                <div class="step-ico" style="width:42px;height:42px;border-radius:12px;font-size:1.1rem">
                  <font-awesome-icon icon="calendar-day" />
                </div>
                <h5>{{ $t('pages.pricing.fx.ex_title') }}</h5>
              </div>
              <p class="fx-card-body">{{ $t('pages.pricing.fx.ex_desc') }}</p>
            </div>
            <div class="ehub-card p-4">
              <div class="fx-card-head">
                <div class="step-ico" style="width:42px;height:42px;border-radius:12px;font-size:1.1rem">
                  <font-awesome-icon icon="shield-halved" />
                </div>
                <h5>{{ $t('pages.pricing.fx.protect_title') }}</h5>
              </div>
              <p class="fx-card-body">{{ $t('pages.pricing.fx.protect_desc') }}</p>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="mb-5">
          <h2 class="section-title">{{ $t('pages.pricing.faq.title') }}</h2>
          <p class="section-sub">{{ $t('pages.pricing.faq.sub') }}</p>
          <div class="ehub-card px-4">
            <div class="faq-item" v-for="(item, idx) in faqItems" :key="idx">
              <button class="faq-q" :class="{ open: openFaq === idx }" @click="openFaq = openFaq === idx ? null : idx">
                <span>{{ item.q }}</span>
                <font-awesome-icon icon="plus" class="faq-icon" />
              </button>
              <div class="faq-a" :class="{ open: openFaq === idx }">{{ item.a }}</div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-strip">
          <h2>{{ $t('pages.pricing.cta.title') }}</h2>
          <p>{{ $t('pages.pricing.cta.sub') }}</p>
          <router-link to="/register" class="btn btn-warning round px-4 py-2 fw-bold">
            {{ $t('pages.pricing.cta.btn') }}
          </router-link>
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const openFaq = ref(null)

const exRows = computed(() => tm('pages.pricing.ex.rows') || [])
const faqItems = computed(() => tm('pages.pricing.faq.items') || [])

const heroTitleHtml = computed(() => t('pages.pricing.hero.title', {
  accent_open: '<span class="accent">',
  accent_close: '</span>',
}))
</script>

<style scoped>
.pricing-hero {
  position: relative; overflow: hidden;
  padding: 72px 20px 56px; text-align: center;
  border-bottom: 1px solid var(--ehub-line);
  background:
    radial-gradient(ellipse 55% 65% at 18% 0%,  var(--ehub-glow) 0%, transparent 60%),
    radial-gradient(ellipse 45% 55% at 88% 110%, color-mix(in srgb, var(--ehub-gold) 10%, transparent) 0%, transparent 55%);
}
.pricing-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(118deg, transparent 0 42px, color-mix(in srgb, var(--ehub-ink) 3%, transparent) 42px 44px);
}
.hero-eyebrow {
  position: relative;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border);
  color: var(--ehub-primary); font-size: .78rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 50rem; margin-bottom: 20px;
}
.pricing-hero h1 { position: relative; font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 800; letter-spacing: -.025em; color: var(--ehub-ink); margin-bottom: 14px; line-height: 1.1; }
.pricing-hero h1 :deep(.accent) { font-weight: 400; color: var(--ehub-primary); }
.pricing-hero p { position: relative; color: var(--ehub-muted); font-size: 1.08rem; max-width: 560px; margin: 0 auto; line-height: 1.65; }

.pricing-wrap { max-width: 900px; margin: 0 auto; padding: 60px 20px; }

/* Pricing main card */
.pmc { background: var(--ehub-card); border-radius: 24px; box-shadow: var(--ehub-shadow); border: 1px solid var(--ehub-line); overflow: hidden; }
.pmc-header {
  padding: 36px 40px 28px; border-bottom: 1px solid var(--ehub-line);
  background: radial-gradient(ellipse 70% 120% at 50% 140%, var(--ehub-primary-tint) 0%, transparent 70%);
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.pmc-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--ehub-muted); margin-bottom: 10px; }
.pmc-rate { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; justify-content: center; }
.pmc-rate .rate-num { font-size: 5rem; font-weight: 800; color: var(--ehub-primary); letter-spacing: -.04em; line-height: 1; }
.pmc-rate .rate-unit { font-size: 1.3rem; font-weight: 700; color: var(--ehub-muted); padding-bottom: 10px; }
.pmc-rate .rate-per { font-size: .88rem; color: var(--ehub-muted); padding-bottom: 12px; max-width: 160px; line-height: 1.3; text-align: left; }
.pmc-min-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: color-mix(in srgb, var(--ehub-gold) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--ehub-gold) 35%, transparent);
  color: color-mix(in srgb, var(--ehub-gold), #000 30%);
  font-size: .84rem; font-weight: 700; padding: 8px 16px; border-radius: 50rem; margin-top: 16px;
}
html[data-bs-theme="dark"] .pmc-min-badge { color: var(--ehub-gold); }
.pmc-footer { padding: 28px 40px; }
.pmc-features { display: flex; flex-direction: column; gap: 12px; }
.pmc-feature { display: flex; align-items: flex-start; gap: 10px; font-size: .93rem; color: var(--ehub-ink); }
.fi-icon { width: 22px; height: 22px; border-radius: 50%; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); color: var(--ehub-primary); display: flex; align-items: center; justify-content: center; font-size: .7rem; flex-shrink: 0; margin-top: 1px; }
.fi-text span { color: var(--ehub-muted); font-size: .84rem; display: block; margin-top: 1px; }

/* Section titles */
.section-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -.02em; color: var(--ehub-ink); margin-bottom: 6px; }
.section-sub { color: var(--ehub-muted); font-size: .92rem; line-height: 1.55; margin-bottom: 32px; }

/* How it works */
.how-row { display: flex; align-items: flex-start; gap: 0; flex-wrap: nowrap; }
.how-step { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; flex: 1; position: relative; }
.how-step h4 { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 0; }
.how-step p { font-size: .88rem; color: var(--ehub-muted); margin: 0; line-height: 1.55; }
.how-arrow { color: var(--ehub-line); font-size: 1.1rem; flex-shrink: 0; padding: 16px 8px 0; align-self: flex-start; }
.step-ico { width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--ehub-primary); }

/* Examples table */
.ex-card { overflow: hidden; }
.ex-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.ex-tbl { width: 100%; border-collapse: collapse; min-width: 480px; }
.ex-tbl thead th { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 10px 16px; background: var(--ehub-field-bg); border-bottom: 1px solid var(--ehub-line); white-space: nowrap; text-align: center; }
.ex-tbl thead th.col-event { text-align: left; }
.ex-tbl tbody tr { border-bottom: 1px solid var(--ehub-line); transition: background .12s; }
.ex-tbl tbody tr:last-child { border-bottom: 0; }
.ex-tbl tbody tr:hover { background: var(--ehub-primary-tint); }
.ex-tbl td { padding: 14px 16px; font-size: .9rem; color: var(--ehub-ink); vertical-align: middle; white-space: nowrap; text-align: center; }
.ex-tbl td.col-event { white-space: normal; min-width: 140px; text-align: left; }
.event-name { display: block; }
.fw-600 { font-weight: 600; }
.td-muted { color: var(--ehub-muted) !important; font-size: .83rem !important; }
.fee-col { font-size: 1rem; font-weight: 700; color: var(--ehub-primary); }
.fee-val { display: block; }
.total-col { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); }
.badge-free { display: inline-flex; align-items: center; gap: 5px; background: var(--ehub-primary-tint); color: var(--ehub-primary); font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 50rem; margin-top: 5px; }
.badge-paid { display: inline-flex; align-items: center; gap: 5px; background: color-mix(in srgb,#1f8a5b 14%,transparent); color: #1f8a5b; font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 50rem; margin-top: 5px; }
.badge-min  { display: inline-flex; align-items: center; gap: 4px; background: color-mix(in srgb,var(--ehub-gold) 14%,transparent); color: color-mix(in srgb,var(--ehub-gold),#000 25%); font-size: .68rem; font-weight: 700; padding: 2px 8px; border-radius: 50rem; margin-top: 4px; }
html[data-bs-theme="dark"] .badge-min { color: var(--ehub-gold); }
html[data-bs-theme="dark"] .badge-paid { color: #51cf66; background: color-mix(in srgb,#51cf66 14%,transparent); }

/* Highlight note */
.highlight-note { display: flex; align-items: flex-start; gap: 10px; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); border-radius: 12px; padding: 14px 16px; font-size: .87rem; color: var(--ehub-ink); line-height: 1.5; }
.highlight-note svg { color: var(--ehub-primary); }

/* Currency timeline */
.currency-timeline { display: flex; align-items: stretch; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.ct-segment { flex: 1; padding: 20px 18px; display: flex; flex-direction: column; gap: 6px; border-right: 1px solid var(--ehub-line); }
.ct-segment:last-child { border-right: 0; }
.ct-segment.active-seg { background: var(--ehub-card); box-shadow: inset 0 2px 0 var(--ehub-primary); }
.ct-day { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.ct-title { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); }
.ct-desc { font-size: .78rem; color: var(--ehub-muted); line-height: 1.4; }
.ct-badge { display: inline-flex; align-items: center; gap: 5px; background: var(--ehub-primary); color: #fff; font-size: .65rem; font-weight: 700; padding: 3px 8px; border-radius: 50rem; margin-top: 4px; width: fit-content; }
.fx-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.fx-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.fx-card-head h5 { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); margin: 0; }
.fx-card-body { font-size: .88rem; color: var(--ehub-muted); margin: 0; line-height: 1.65; }

/* FAQ */
.faq-item { border-bottom: 1px solid var(--ehub-line); }
.faq-item:last-child { border-bottom: 0; }
.faq-q { width: 100%; background: none; border: none; text-align: left; padding: 18px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: .95rem; font-weight: 600; color: var(--ehub-ink); cursor: pointer; transition: color .15s; }
.faq-q:hover, .faq-q.open { color: var(--ehub-primary); }
.faq-icon { color: var(--ehub-muted); transition: transform .2s, color .15s; font-size: .8rem; flex-shrink: 0; }
.faq-q.open .faq-icon { transform: rotate(45deg); color: var(--ehub-primary); }
.faq-a { display: none; padding: 0 0 18px; color: var(--ehub-muted); font-size: .9rem; line-height: 1.65; }
.faq-a.open { display: block; }

/* CTA */
.cta-strip { background: var(--ehub-primary); border-radius: var(--ehub-radius-card); padding: 48px 40px; text-align: center; position: relative; overflow: hidden; }
.cta-strip::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%); pointer-events: none; }
.cta-strip h2 { font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -.02em; position: relative; }
.cta-strip p { color: rgba(255,255,255,.75); font-size: 1rem; margin-bottom: 24px; position: relative; }
.cta-strip .btn { position: relative; }


@media (max-width: 768px) {
  .how-row { flex-direction: column; gap: 24px; }
  .how-arrow { display: none; }
  .how-step { flex-direction: row; text-align: left; }
  .how-step > div:last-child { flex: 1; }
  .fx-cards { grid-template-columns: 1fr; }
  .pmc-header { padding: 28px 24px 22px; }
  .pmc-footer { padding: 22px 24px; }
  .pmc-rate .rate-num { font-size: 3.6rem; }
  .cta-strip { padding: 36px 24px; }
  .cta-strip h2 { font-size: 1.4rem; }
  .currency-timeline { flex-direction: column; }
  .ct-segment { border-right: 0; border-bottom: 1px solid var(--ehub-line); }
  .ct-segment:last-child { border-bottom: 0; }
  .col-calc { display: none; }
  .ex-tbl { min-width: 0; }
  .fee-col { font-size: .9rem; }
  .total-col { font-size: .9rem; }
}
</style>
