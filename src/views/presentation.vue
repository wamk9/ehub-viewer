<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import EhubEventFeed from '@/components/EhubEventFeed.vue'
import EhubOrgFeed from '@/components/EhubOrgFeed.vue'

const store = useStore()
const isLogged = computed(() => !!store.getters.getToken)
</script>

<template>
  <div>

    <!-- HERO -->
    <header class="pres-hero">
      <div class="hero-eyebrow">
        <font-awesome-icon icon="diagram-project" />
        <span>{{ $t('pages.presentation.hero.eyebrow') }}</span>
      </div>
      <h1>
        {{ $t('pages.presentation.hero.title_pre') }}
        <span class="accent">{{ $t('pages.presentation.hero.title_accent') }}</span>
      </h1>
      <p class="lead">{{ $t('pages.presentation.hero.subtitle') }}</p>
      <div class="hero-ctas">
        <router-link v-if="!isLogged" to="/register" class="btn btn-primary round px-4 py-2">
          {{ $t('pages.presentation.hero.cta_primary') }}
        </router-link>
        <router-link to="/pricing" class="btn btn-outline-primary round px-4 py-2">
          {{ $t('pages.presentation.hero.cta_secondary') }}
        </router-link>
      </div>
    </header>

    <!-- PRODUCT PREVIEW -->
    <div class="preview-wrap">
      <div class="container-narrow">
        <div class="preview-frame">
          <div class="preview-bar">
            <span class="preview-dot" style="background:#e05454"></span>
            <span class="preview-dot" style="background:var(--ehub-gold)"></span>
            <span class="preview-dot" style="background:#1f8a5b"></span>
            <div class="preview-address">
              <font-awesome-icon icon="lock" />
              <span>ehubapp.com</span>
            </div>
          </div>
          <div class="preview-body">
            <EhubEventFeed type="upcoming" />
            <div class="preview-gap"></div>
            <EhubOrgFeed :limit="4" />
          </div>
        </div>
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <section class="section-wrap">
      <div class="container-narrow">
        <div class="section-head-center">
          <h2 class="section-title">{{ $t('pages.presentation.how.title') }}</h2>
          <p class="section-sub">{{ $t('pages.presentation.how.sub') }}</p>
        </div>

        <div class="how-grid">
          <div class="how-step">
            <div class="step-ico"><font-awesome-icon icon="building" /></div>
            <h4>{{ $t('pages.presentation.how.s1.title') }}</h4>
            <p>{{ $t('pages.presentation.how.s1.desc') }}</p>
          </div>
          <div class="how-arrow-col"><font-awesome-icon icon="chevron-right" /></div>
          <div class="how-step">
            <div class="step-ico"><font-awesome-icon icon="bullhorn" /></div>
            <h4>{{ $t('pages.presentation.how.s2.title') }}</h4>
            <p>{{ $t('pages.presentation.how.s2.desc') }}</p>
          </div>
          <div class="how-arrow-col"><font-awesome-icon icon="chevron-right" /></div>
          <div class="how-step">
            <div class="step-ico"><font-awesome-icon icon="flag-checkered" /></div>
            <h4>{{ $t('pages.presentation.how.s3.title') }}</h4>
            <p>{{ $t('pages.presentation.how.s3.desc') }}</p>
          </div>
          <div class="how-arrow-col"><font-awesome-icon icon="chevron-right" /></div>
          <div class="how-step">
            <div class="step-ico"><font-awesome-icon icon="trophy" /></div>
            <h4>{{ $t('pages.presentation.how.s4.title') }}</h4>
            <p>{{ $t('pages.presentation.how.s4.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PARA ORGANIZAÇÕES -->
    <section class="section-wrap alt">
      <div class="container-narrow">
        <div class="section-head-center">
          <h2 class="section-title">{{ $t('pages.presentation.orgs.title') }}</h2>
          <p class="section-sub">{{ $t('pages.presentation.orgs.sub') }}</p>
        </div>
        <div class="benefit-grid cols-3">
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="credit-card" /></div>
            <h3>{{ $t('pages.presentation.orgs.c1.title') }}</h3>
            <p>{{ $t('pages.presentation.orgs.c1.desc') }}</p>
          </div>
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="circle-check" /></div>
            <h3>{{ $t('pages.presentation.orgs.c2.title') }}</h3>
            <p>{{ $t('pages.presentation.orgs.c2.desc') }}</p>
          </div>
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="palette" /></div>
            <h3>{{ $t('pages.presentation.orgs.c3.title') }}</h3>
            <p>{{ $t('pages.presentation.orgs.c3.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PARA TIMES/ATLETAS -->
    <section class="section-wrap">
      <div class="container-narrow">
        <div class="section-head-center">
          <h2 class="section-title">{{ $t('pages.presentation.teams.title') }}</h2>
          <p class="section-sub">{{ $t('pages.presentation.teams.sub') }}</p>
        </div>
        <div class="benefit-grid">
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="magnifying-glass" /></div>
            <h3>{{ $t('pages.presentation.teams.c1.title') }}</h3>
            <p>{{ $t('pages.presentation.teams.c1.desc') }}</p>
          </div>
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="bolt" /></div>
            <h3>{{ $t('pages.presentation.teams.c2.title') }}</h3>
            <p>{{ $t('pages.presentation.teams.c2.desc') }}</p>
          </div>
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="medal" /></div>
            <h3>{{ $t('pages.presentation.teams.c3.title') }}</h3>
            <p>{{ $t('pages.presentation.teams.c3.desc') }}</p>
          </div>
          <div class="benefit-card">
            <div class="b-icon"><font-awesome-icon icon="people-group" /></div>
            <h3>{{ $t('pages.presentation.teams.c4.title') }}</h3>
            <p>{{ $t('pages.presentation.teams.c4.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- VITRINE DE RECURSOS -->
    <section class="section-wrap alt">
      <div class="container-narrow">
        <div class="section-head-center">
          <h2 class="section-title">{{ $t('pages.presentation.features.title') }}</h2>
          <p class="section-sub">{{ $t('pages.presentation.features.sub') }}</p>
        </div>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="f-icon"><font-awesome-icon icon="credit-card" /></div>
            <div>
              <h4>{{ $t('pages.presentation.features.f1.title') }}</h4>
              <p>{{ $t('pages.presentation.features.f1.desc') }}</p>
            </div>
          </div>
          <div class="feature-card">
            <div class="f-icon"><font-awesome-icon icon="flag-checkered" /></div>
            <div>
              <h4>{{ $t('pages.presentation.features.f2.title') }}</h4>
              <p>{{ $t('pages.presentation.features.f2.desc') }}</p>
            </div>
          </div>
          <div class="feature-card">
            <div class="f-icon"><font-awesome-icon icon="trophy" /></div>
            <div>
              <h4>{{ $t('pages.presentation.features.f3.title') }}</h4>
              <p>{{ $t('pages.presentation.features.f3.desc') }}</p>
            </div>
          </div>
          <div class="feature-card">
            <div class="f-icon"><font-awesome-icon icon="language" /></div>
            <div>
              <h4>{{ $t('pages.presentation.features.f4.title') }}</h4>
              <p>{{ $t('pages.presentation.features.f4.desc') }}</p>
            </div>
          </div>
          <div class="feature-card">
            <div class="f-icon"><font-awesome-icon icon="swatchbook" /></div>
            <div>
              <h4>{{ $t('pages.presentation.features.f5.title') }}</h4>
              <p>{{ $t('pages.presentation.features.f5.desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING TEASER -->
    <section class="section-wrap">
      <div class="container-narrow">
        <div class="pricing-teaser">
          <div class="pt-body">
            <div class="pt-icon"><font-awesome-icon icon="coins" /></div>
            <div>
              <div class="pt-eyebrow">{{ $t('pages.presentation.pricingteaser.eyebrow') }}</div>
              <h3>{{ $t('pages.presentation.pricingteaser.title') }}</h3>
              <p>{{ $t('pages.presentation.pricingteaser.desc') }}</p>
            </div>
          </div>
          <router-link to="/pricing" class="btn btn-primary round px-4 py-2 flex-shrink-0">
            {{ $t('pages.presentation.pricingteaser.cta') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="section-wrap" style="padding-top:0">
      <div class="container-narrow">
        <div class="cta-strip">
          <template v-if="isLogged">
            <h2>{{ $t('pages.presentation.finalcta.title_logged') }}</h2>
            <p>{{ $t('pages.presentation.finalcta.sub_logged') }}</p>
            <router-link to="/my-orgs" class="btn btn-light-cta round px-4 py-2">
              {{ $t('pages.presentation.finalcta.btn_logged') }}
            </router-link>
          </template>
          <template v-else>
            <h2>{{ $t('pages.presentation.finalcta.title') }}</h2>
            <p>{{ $t('pages.presentation.finalcta.sub') }}</p>
            <router-link to="/register" class="btn btn-light-cta round px-4 py-2">
              {{ $t('pages.presentation.finalcta.btn') }}
            </router-link>
          </template>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.container-narrow { max-width: 1160px; margin: 0 auto; padding: 0 20px; }

/* ── Hero ── */
.pres-hero {
  position: relative; overflow: hidden;
  padding: 88px 20px 64px; text-align: center;
  border-bottom: 1px solid var(--ehub-line);
  background:
    radial-gradient(ellipse 55% 65% at 18% 0%,  var(--ehub-glow) 0%, transparent 60%),
    radial-gradient(ellipse 45% 55% at 88% 110%, color-mix(in srgb, var(--ehub-gold) 10%, transparent) 0%, transparent 55%);
}
.pres-hero::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(118deg, transparent 0 42px, color-mix(in srgb, var(--ehub-ink) 3%, transparent) 42px 44px);
}
.hero-eyebrow {
  position: relative;
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border);
  color: var(--ehub-primary); font-size: .78rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 50rem; margin-bottom: 22px;
}
.pres-hero h1 { position: relative; font-size: clamp(2.1rem, 4.6vw, 3.2rem); font-weight: 800; letter-spacing: -.025em; color: var(--ehub-ink); margin-bottom: 16px; line-height: 1.12; max-width: 800px; margin-left: auto; margin-right: auto; }
.pres-hero h1 .accent { color: var(--ehub-primary); }
.pres-hero p.lead { position: relative; color: var(--ehub-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto 30px; line-height: 1.65; }
.hero-ctas { position: relative; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }

/* ── Section headers ── */
.section-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; color: var(--ehub-ink); margin-bottom: 8px; }
.section-sub { color: var(--ehub-muted); font-size: .95rem; line-height: 1.6; max-width: 560px; }
.section-wrap { padding: 72px 0; }
.section-wrap.alt { background: var(--ehub-field-bg); border-top: 1px solid var(--ehub-line); border-bottom: 1px solid var(--ehub-line); }
.section-head-center { text-align: center; margin: 0 auto 44px; }
.section-head-center .section-sub { margin-left: auto; margin-right: auto; }

/* ── Product preview frame ── */
.preview-wrap { padding: 0 0 72px; }
.preview-frame { border-radius: 18px; overflow: hidden; border: 1px solid var(--ehub-line); background: var(--ehub-card); box-shadow: var(--ehub-shadow); }
.preview-bar { display: flex; align-items: center; gap: 7px; padding: 13px 16px; background: var(--ehub-field-bg); border-bottom: 1px solid var(--ehub-line); }
.preview-dot { width: 10px; height: 10px; border-radius: 50%; }
.preview-address { margin-left: 12px; flex: 1; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 5px 14px; font-size: .74rem; color: var(--ehub-muted); display: flex; align-items: center; gap: 7px; }
.preview-address svg { font-size: .68rem; }
.preview-body { padding: 28px; }
.preview-gap { height: 30px; }

/* ── How it works ── */
.how-grid { display: flex; align-items: flex-start; gap: 6px; }
.how-step { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 0 6px; }
.how-step .step-ico { width: 56px; height: 56px; border-radius: 16px; flex-shrink: 0; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--ehub-primary); }
.how-step h4 { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 0; }
.how-step p { font-size: .88rem; color: var(--ehub-muted); margin: 0; line-height: 1.55; }
.how-arrow-col { flex: 0 0 auto; display: flex; align-items: flex-start; justify-content: center; padding-top: 18px; color: var(--ehub-line); font-size: 1.1rem; }
@media (max-width: 860px) {
  .how-grid { flex-direction: column; align-items: center; gap: 32px; }
  .how-arrow-col { display: none; }
}

/* ── Benefit cards (orgs / teams) ── */
.benefit-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.benefit-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.benefit-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 16px; padding: 26px 22px; transition: transform .18s ease, box-shadow .18s ease; }
.benefit-card:hover { transform: translateY(-3px); box-shadow: var(--ehub-shadow); }
.benefit-card .b-icon { width: 46px; height: 46px; border-radius: 13px; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); color: var(--ehub-primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 16px; }
.benefit-card h3 { font-size: 1rem; font-weight: 700; margin: 0 0 6px; color: var(--ehub-ink); }
.benefit-card p { font-size: .87rem; color: var(--ehub-muted); line-height: 1.55; margin: 0; }
@media (max-width: 960px) { .benefit-grid, .benefit-grid.cols-3 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .benefit-grid, .benefit-grid.cols-3 { grid-template-columns: 1fr; } }

/* ── Feature grid ── */
.feature-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
.feature-card { flex: 1 1 300px; max-width: calc(33.333% - 11px); display: flex; gap: 14px; padding: 22px; border-radius: 14px; background: var(--ehub-card); border: 1px solid var(--ehub-line); }
.feature-card .f-icon { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); color: var(--ehub-primary); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.feature-card h4 { font-size: .93rem; font-weight: 700; margin: 0 0 4px; color: var(--ehub-ink); }
.feature-card p { font-size: .83rem; color: var(--ehub-muted); line-height: 1.5; margin: 0; }
@media (max-width: 960px) { .feature-card { max-width: calc(50% - 8px); } }
@media (max-width: 560px) { .feature-card { max-width: 100%; } }

/* ── Pricing teaser ── */
.pricing-teaser {
  display: flex; align-items: center; justify-content: space-between; gap: 28px; flex-wrap: wrap;
  background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 20px;
  padding: 36px 40px; box-shadow: var(--ehub-shadow);
}
.pricing-teaser .pt-icon { width: 54px; height: 54px; border-radius: 15px; background: color-mix(in srgb, var(--ehub-gold) 16%, transparent); border: 1px solid color-mix(in srgb, var(--ehub-gold) 35%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 25%); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
html[data-bs-theme="dark"] .pricing-teaser .pt-icon { color: var(--ehub-gold); }
.pricing-teaser .pt-eyebrow { font-size: .74rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); margin-bottom: 6px; }
.pricing-teaser h3 { font-size: 1.2rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 6px; letter-spacing: -.01em; }
.pricing-teaser p { font-size: .9rem; color: var(--ehub-muted); margin: 0; max-width: 480px; line-height: 1.55; }
.pricing-teaser .pt-body { display: flex; align-items: flex-start; gap: 18px; flex: 1; min-width: 260px; }

/* ── Final CTA strip ── */
.cta-strip {
  background: var(--ehub-primary);
  border-radius: 24px;
  padding: 52px 40px; text-align: center;
  position: relative; overflow: hidden;
}
.cta-strip::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 80% at 80% 20%, rgba(255,255,255,.12) 0%, transparent 60%);
  pointer-events: none;
}
.cta-strip h2 { position: relative; font-size: 1.9rem; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -.02em; }
.cta-strip p { position: relative; color: rgba(255,255,255,.75); font-size: 1rem; margin-bottom: 26px; }
.cta-strip .btn-light-cta { position: relative; background: #fff; color: var(--ehub-primary-dark); font-weight: 700; border: 0; }
.cta-strip .btn-light-cta:hover { background: #f2f2f2; }

@media (max-width: 640px) {
  .section-wrap { padding: 52px 0; }
  .pres-hero { padding: 64px 16px 44px; }
  .pricing-teaser { padding: 28px 24px; }
  .cta-strip { padding: 40px 24px; }
  .cta-strip h2 { font-size: 1.5rem; }
}
</style>
