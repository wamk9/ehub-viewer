<script>
import Api from '@/helpers/communication/Connection';

/**
 * Participation certificate. /org/:org/event/:event/certificate/:registrationId (participant or organizer)
 * and /certificate/:code (public check of a printed certificate). "Imprimir / PDF" uses the browser.
 */
export default {
  name: 'EventCertificate',
  data() {
    return { cert: null, state: 'loading' };
  },
  computed: {
    verifying() { return this.$route.name === 'certificate-verify'; },
    color() { return /^#[0-9a-f]{6}$/i.test(this.cert?.organization?.color || '') ? this.cert.organization.color : '#0098D8'; },
    verifyUrl() { return window.location.origin + '/certificate/' + (this.cert?.code || ''); },
    dateText() {
      const d = this.cert?.event?.start_at;
      return d ? new Intl.DateTimeFormat(this.$i18n.locale, { dateStyle: 'long' }).format(new Date(String(d).replace(' ', 'T'))) : '';
    },
    categoryText() {
      const c = this.cert?.event?.category;
      return c && this.$te('categories.names.' + c) ? this.$t('categories.names.' + c) : '';
    },
  },
  async mounted() {
    const p = this.$route.params;
    const url = this.verifying ? '/certificate/' + encodeURIComponent(p.code) : `/org/${p.orgRoute}/event/${p.eventRoute}/certificate/${p.registrationId}`;
    const r = await Api.getAsync(url);
    if (r.code === 200) {
      this.cert = r.response.message;
      this.state = 'ok';
      document.title = this.$t('events.certificate.title') + ' — ' + this.cert.participant + ' | eHub';
    } else this.state = 'missing';
  },
  methods: {
    print() { window.print(); },
  },
};
</script>

<template>
  <main class="cert-page">
    <div v-if="state === 'loading'" class="cert-msg"><font-awesome-icon :icon="['fas', 'spinner']" spin /></div>
    <div v-else-if="state === 'missing'" class="cert-msg">
      <font-awesome-icon :icon="['fas', 'circle-xmark']" class="cert-msg__ico" />
      <h1>{{ $t(verifying ? 'events.certificate.invalid_title' : 'events.certificate.missing_title') }}</h1>
      <p>{{ $t(verifying ? 'events.certificate.invalid_desc' : 'events.certificate.missing_desc') }}</p>
      <router-link to="/events" class="btn btn-primary round px-4">{{ $t('events.certificate.events') }}</router-link>
    </div>
    <template v-else>
      <div v-if="verifying" class="cert-valid cert-noprint" role="status">
        <font-awesome-icon :icon="['fas', 'circle-check']" class="me-2" />{{ $t('events.certificate.valid') }}
      </div>
      <div class="cert-tools cert-noprint">
        <router-link :to="`/org/${cert.organization.route}/event/${cert.event.route}`" class="btn btn-ghost round px-3">
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-2" />{{ $t('events.certificate.back') }}
        </router-link>
        <button v-if="!verifying" type="button" class="btn btn-primary round px-4" @click="print">
          <font-awesome-icon :icon="['fas', 'print']" class="me-2" />{{ $t('events.certificate.print') }}
        </button>
      </div>
      <p v-if="!verifying" class="cert-hint cert-noprint">{{ $t('events.certificate.print_hint') }}</p>

      <article class="cert" :style="{ '--cert-color': color }">
        <div class="cert__frame">
          <header class="cert__head">
            <span class="cert__org">{{ cert.organization.name }}</span>
            <span class="cert__brand">eHub</span>
          </header>
          <h1 class="cert__title">{{ $t('events.certificate.title') }}</h1>
          <p class="cert__lead">{{ $t('events.certificate.lead') }}</p>
          <p class="cert__name">{{ cert.participant }}</p>
          <p class="cert__text">
            {{ $t(cert.is_team ? 'events.certificate.text_team' : 'events.certificate.text', { event: cert.event.name, org: cert.organization.name }) }}<template v-if="dateText"> {{ $t('events.certificate.on_date', { date: dateText }) }}</template><template v-if="cert.event.location"> {{ $t('events.certificate.at_place', { place: cert.event.location }) }}</template>.
          </p>
          <p v-if="cert.final_position" class="cert__place">
            <font-awesome-icon :icon="['fas', cert.final_position <= 3 ? 'medal' : 'trophy']" class="me-2" />
            {{ $t(cert.event.finished ? 'events.certificate.place_final' : 'events.certificate.place_stage', { n: cert.final_position, stage: cert.final_stage }) }}
          </p>
          <footer class="cert__foot">
            <div>
              <span class="cert__k">{{ $t('events.certificate.category') }}</span>
              <span>{{ categoryText || '—' }}</span>
            </div>
            <div>
              <span class="cert__k">{{ $t('events.certificate.code') }}</span>
              <span class="cert__code">{{ cert.code }}</span>
            </div>
            <div class="cert__verify">
              <span class="cert__k">{{ $t('events.certificate.verify_at') }}</span>
              <span>{{ verifyUrl }}</span>
            </div>
          </footer>
        </div>
      </article>
    </template>
  </main>
</template>

<style scoped>
.cert-page { min-height: 70vh; padding: 28px 16px 48px; background: var(--ehub-bg); }
.cert-msg { max-width: 460px; margin: 60px auto; text-align: center; color: var(--ehub-muted); }
.cert-msg h1 { font-size: 1.2rem; font-weight: 800; color: var(--ehub-ink); margin: 12px 0 6px; }
.cert-msg__ico { font-size: 2.2rem; color: var(--ehub-danger-text); }
.cert-tools { max-width: 960px; margin: 0 auto 8px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.cert-hint { max-width: 960px; margin: 0 auto 16px; font-size: .8rem; color: var(--ehub-muted); }
.cert-valid { max-width: 960px; margin: 0 auto 14px; padding: 10px 14px; border-radius: 12px; background: color-mix(in srgb, #1f8a5b 12%, transparent); color: var(--ehub-success-text); font-weight: 600; }
.cert { max-width: 960px; margin: 0 auto; background: #fff; color: #1b2433; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, .12); padding: 18px; aspect-ratio: 1.414 / 1; }
.cert__frame { height: 100%; border: 3px solid var(--cert-color); border-radius: 10px; padding: clamp(18px, 4vw, 44px); display: flex; flex-direction: column; text-align: center; position: relative; }
.cert__head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: clamp(.75rem, 1.6vw, 1rem); }
.cert__org { color: var(--cert-color); text-transform: uppercase; letter-spacing: .08em; }
.cert__brand { color: #7a8699; letter-spacing: .04em; }
.cert__title { font-size: clamp(1.3rem, 4vw, 2.6rem); font-weight: 800; margin: auto 0 .3em; letter-spacing: -.01em; }
.cert__lead { color: #5b6677; margin: 0; font-size: clamp(.8rem, 1.6vw, 1rem); }
.cert__name { font-size: clamp(1.5rem, 5vw, 3rem); font-weight: 800; color: var(--cert-color); margin: .25em 0; line-height: 1.1; word-break: break-word; }
.cert__text { max-width: 700px; margin: 0 auto; font-size: clamp(.85rem, 1.8vw, 1.1rem); line-height: 1.5; }
.cert__place { margin: .8em auto 0; font-weight: 700; font-size: clamp(.9rem, 2vw, 1.2rem); }
.cert__foot { margin-top: auto; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: clamp(.65rem, 1.3vw, .82rem); text-align: left; border-top: 1px solid #e3e7ee; padding-top: 12px; }
.cert__foot > div { display: flex; flex-direction: column; }
.cert__k { color: #7a8699; text-transform: uppercase; letter-spacing: .06em; font-size: .9em; font-weight: 700; }
.cert__code { font-family: ui-monospace, Consolas, monospace; font-weight: 700; letter-spacing: .08em; }
.cert__verify { text-align: right; word-break: break-all; }
@media (max-width: 640px) { .cert { aspect-ratio: auto; } .cert__frame { min-height: 420px; } }
</style>

<style>
@media print {
  @page { size: A4 landscape; margin: 0; }
  body * { visibility: hidden !important; }
  .cert, .cert * { visibility: visible !important; }
  .cert { position: fixed; inset: 0; max-width: none; width: 100%; height: 100%; border-radius: 0; box-shadow: none; aspect-ratio: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cert-noprint { display: none !important; }
}
</style>
