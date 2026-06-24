<template>
  <div class="wiz-wrap">

    <!-- ── SIDEBAR ── -->
    <aside class="wiz-sidebar">
      <div class="sb-team-row">
        <div class="sb-team-logo" :style="logoThumbStyle" id="sbLogoThumb">
          <img v-if="logoPreview" :src="logoPreview" alt="logo" />
          <font-awesome-icon v-else icon="shield-halved" />
        </div>
        <div>
          <div class="sb-team-name">{{ form.name || '—' }}</div>
          <div class="sb-team-tag">{{ $t('pages.teams.create.new_team') }}</div>
        </div>
      </div>

      <div class="v-steps">
        <div
          v-for="(step, i) in steps"
          :key="step.key"
          class="v-step"
          :class="{ active: currentStep === i, done: currentStep > i }"
          @click="goToStep(i)"
        >
          <div class="v-dot">
            <font-awesome-icon v-if="currentStep > i" icon="check" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="v-label">
            <div class="v-step-name">{{ $t(`pages.teams.create.steps.${step.key}.name`) }}</div>
            <div class="v-step-hint">{{ $t(`pages.teams.create.steps.${step.key}.hint`) }}</div>
          </div>
        </div>
      </div>

      <!-- Live preview card -->
      <div class="sb-preview">
        <div class="sb-preview-label">{{ $t('pages.teams.create.preview') }}</div>
        <div class="sb-preview-card">
          <div class="sb-prev-banner" :style="bannerBgStyle">
            <div class="stripe"></div>
          </div>
          <div class="sb-prev-body">
            <div class="sb-prev-logo" :style="logoAccentStyle">
              <img v-if="logoPreview" :src="logoPreview" alt="logo" />
              <span v-else>{{ form.tag ? form.tag.slice(0,2) : '?' }}</span>
            </div>
            <div class="sb-prev-info">
              <div class="sb-prev-name">{{ form.name || $t('pages.teams.create.team_name_placeholder') }}</div>
              <div class="sb-prev-tag">#{{ form.tag || 'TAG' }}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── MAIN ── -->
    <div class="wiz-main">
      <div class="wiz-content">
        <transition name="slide-step" mode="out-in">

          <!-- ═══ STEP 1: Identidade ═══ -->
          <div v-if="currentStep === 0" key="s1">
            <h2 class="step-title">{{ $t('pages.teams.create.s1.title') }}</h2>
            <p class="step-sub">{{ $t('pages.teams.create.s1.sub') }}</p>

            <!-- Name + Tag -->
            <div class="row g-3 mb-3">
              <div class="col-8">
                <label class="form-label">{{ $t('pages.teams.create.s1.name') }} <span style="color:#e23b3b">*</span></label>
                <input v-model="form.name" type="text" class="form-control" :placeholder="$t('pages.teams.create.s1.name_ph')" maxlength="60" />
                <div class="char-count"><span>{{ form.name.length }}</span>/60</div>
              </div>
              <div class="col-4">
                <label class="form-label">{{ $t('pages.teams.create.s1.tag') }} <span style="color:#e23b3b">*</span></label>
                <div class="input-group">
                  <span class="input-group-text tag-prefix">#</span>
                  <input v-model="form.tag" type="text" class="form-control" :placeholder="$t('pages.teams.create.s1.tag_ph')" maxlength="5" @input="form.tag = form.tag.toUpperCase()" />
                </div>
                <div class="field-hint">{{ $t('pages.teams.create.s1.tag_hint') }}</div>
              </div>
            </div>

            <!-- Description -->
            <div class="form-section">
              <label class="form-label">{{ $t('pages.teams.create.s1.desc') }}</label>
              <textarea v-model="form.description" class="form-control" rows="3" maxlength="280" :placeholder="$t('pages.teams.create.s1.desc_ph')" style="resize:vertical"></textarea>
              <div class="char-count">{{ form.description.length }}/280</div>
            </div>

            <!-- Banner -->
            <div class="form-section">
              <label class="form-label">{{ $t('pages.teams.create.s1.banner') }}</label>
              <div class="banner-thumb" :style="bannerBgStyle">
                <div class="bt-stripe"></div>
              </div>
              <p class="field-hint mb-2">{{ $t('pages.teams.create.s1.banner_hint') }}</p>
              <div class="d-flex gap-2 flex-wrap">
                <label class="btn btn-sm btn-outline-secondary round px-3 mb-0" style="cursor:pointer">
                  <font-awesome-icon icon="image" class="me-2" />{{ $t('pages.teams.create.s1.banner_change') }}
                  <input ref="bannerInput" type="file" accept="image/*" class="d-none" @change="onBannerChange" />
                </label>
                <button v-if="bannerPreview" class="btn btn-sm btn-outline-danger round px-3" @click="removeBanner">{{ $t('pages.teams.create.s1.banner_remove') }}</button>
              </div>
            </div>

            <!-- Logo -->
            <div class="form-section">
              <label class="form-label">{{ $t('pages.teams.create.s1.logo') }}</label>
              <p class="field-hint mb-2">{{ $t('pages.teams.create.s1.logo_hint') }}</p>
              <div class="d-flex align-items-center gap-4">
                <div class="logo-thumb" :style="logoAccentStyle">
                  <img v-if="logoPreview" :src="logoPreview" alt="logo" />
                  <font-awesome-icon v-else icon="shield-halved" />
                </div>
                <div class="d-flex flex-column gap-2">
                  <label class="btn btn-sm btn-outline-secondary round px-3 mb-0" style="cursor:pointer">
                    <font-awesome-icon icon="image" class="me-2" />{{ $t('pages.teams.create.s1.logo_upload') }}
                    <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="onLogoChange" />
                  </label>
                  <button v-if="logoPreview" class="btn btn-sm btn-outline-danger round px-3" @click="removeLogo">{{ $t('pages.teams.create.s1.logo_remove') }}</button>
                </div>
              </div>
            </div>

            <!-- Color -->
            <div class="form-section">
              <label class="form-label">{{ $t('pages.teams.create.s1.color') }}</label>
              <div class="color-grid">
                <div
                  v-for="sw in accentColors"
                  :key="sw"
                  class="color-sw"
                  :class="{ sel: form.color === sw }"
                  :style="{ background: sw }"
                  @click="form.color = sw"
                ></div>
              </div>
              <div class="color-custom-wrap">
                <input type="color" v-model="form.color" style="width:36px;height:36px;border-radius:8px;border:1px solid var(--ehub-line);cursor:pointer;padding:2px" />
                <input type="text" class="form-control color-hex-inp" v-model="form.color" placeholder="#0098D8" maxlength="7" />
                <span class="field-hint mb-0">{{ $t('pages.teams.create.s1.color_hint') }}</span>
              </div>
            </div>
          </div>

          <!-- ═══ STEP 2: Categoria & Região ═══ -->
          <div v-else-if="currentStep === 1" key="s2">
            <h2 class="step-title">{{ $t('pages.teams.create.s2.title') }}</h2>
            <p class="step-sub">{{ $t('pages.teams.create.s2.sub') }}</p>

            <!-- Category -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s2.cat_label') }}</div>

              <div v-if="!form.category">
                <div class="cat-search-wrap">
                  <font-awesome-icon icon="magnifying-glass" class="search-ico" />
                  <input v-model="catSearch" type="text" class="form-control cat-search-inp" :placeholder="$t('pages.teams.create.s2.cat_search')" />
                </div>
                <div class="cat-scroll">
                  <div class="cat-grid">
                    <div
                      v-for="cat in filteredCategories"
                      :key="cat.route"
                      class="cat-card"
                      @click="form.category = cat.route"
                    >
                      <div class="cat-ico">
                        <font-awesome-icon :icon="categoryIcons[cat.route] || 'gamepad'" />
                      </div>
                      <div class="cat-name">{{ $t(`categories.names.${cat.route}`, cat.name) }}</div>
                    </div>
                  </div>
                  <div v-if="filteredCategories.length === 0" class="cat-no-results">{{ $t('pages.teams.create.s2.cat_none') }}</div>
                </div>
              </div>

              <div v-else class="cat-sel-badge badge-reveal">
                <div class="cat-sel-ico">
                  <font-awesome-icon :icon="categoryIcons[form.category] || 'gamepad'" />
                </div>
                <div>
                  <div class="cat-sel-name">{{ $t(`categories.names.${form.category}`, form.category) }}</div>
                  <div class="cat-sel-hint">{{ $t('pages.teams.create.s2.cat_selected') }}</div>
                </div>
                <font-awesome-icon icon="circle-check" style="color:var(--ehub-primary);font-size:1.1rem;margin-left:auto" />
                <button class="cat-change-btn" @click="form.category = ''">{{ $t('pages.teams.create.s2.cat_change') }}</button>
              </div>
            </div>

            <!-- Skill level -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s2.level_label') }}</div>
              <div class="vis-cards">
                <div v-for="lvl in skillLevels" :key="lvl" class="vis-card" :class="{ sel: form.skill_level === lvl }" @click="form.skill_level = lvl">
                  <div class="vi"><font-awesome-icon :icon="levelIcons[lvl]" /></div>
                  <div class="vn">{{ $t(`pages.teams.create.s2.levels.${lvl}.name`) }}</div>
                  <div class="vd">{{ $t(`pages.teams.create.s2.levels.${lvl}.desc`) }}</div>
                </div>
              </div>
            </div>

            <!-- Region -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s2.location_label') }}</div>
              <div class="region-grid">
                <div
                  v-for="reg in regions"
                  :key="reg.id"
                  class="region-card"
                  :class="{ sel: form.location === reg.id }"
                  @click="form.location = reg.id"
                >
                  <span class="region-flag">{{ reg.flag }}</span>
                  <span class="region-name">{{ reg.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ STEP 3: Visibilidade & Membros ═══ -->
          <div v-else-if="currentStep === 2" key="s3">
            <h2 class="step-title">{{ $t('pages.teams.create.s3.title') }}</h2>
            <p class="step-sub">{{ $t('pages.teams.create.s3.sub') }}</p>

            <!-- Visibility -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s3.vis_label') }}</div>
              <div class="vis-cards">
                <div class="vis-card" :class="{ sel: form.visibility === 'public' }" @click="form.visibility = 'public'">
                  <div class="vi"><font-awesome-icon icon="earth-americas" /></div>
                  <div class="vn">{{ $t('pages.teams.create.s3.vis_public') }}</div>
                  <div class="vd">{{ $t('pages.teams.create.s3.vis_public_d') }}</div>
                </div>
                <div class="vis-card" :class="{ sel: form.visibility === 'private' }" @click="form.visibility = 'private'">
                  <div class="vi"><font-awesome-icon icon="lock" /></div>
                  <div class="vn">{{ $t('pages.teams.create.s3.vis_private') }}</div>
                  <div class="vd">{{ $t('pages.teams.create.s3.vis_private_d') }}</div>
                </div>
              </div>
            </div>

            <!-- Recruitment -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s3.rec_label') }}</div>
              <div class="vis-cards">
                <div class="vis-card" :class="{ sel: form.is_open === true }" @click="form.is_open = true">
                  <div class="vi"><font-awesome-icon icon="door-open" /></div>
                  <div class="vn">{{ $t('pages.teams.create.s3.rec_open') }}</div>
                  <div class="vd">{{ $t('pages.teams.create.s3.rec_open_d') }}</div>
                </div>
                <div class="vis-card" :class="{ sel: form.is_open === false }" @click="form.is_open = false">
                  <div class="vi"><font-awesome-icon icon="envelope" /></div>
                  <div class="vn">{{ $t('pages.teams.create.s3.rec_invite') }}</div>
                  <div class="vd">{{ $t('pages.teams.create.s3.rec_invite_d') }}</div>
                </div>
              </div>
            </div>

            <!-- Max members -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s3.size_label') }}</div>
              <div class="row g-2 align-items-center">
                <div class="col-auto">
                  <input v-model.number="form.max_members" type="number" class="form-control" min="2" max="100" style="width:100px" />
                </div>
                <div class="col">
                  <span class="field-hint mb-0">{{ $t('pages.teams.create.s3.size_hint') }}</span>
                </div>
              </div>
            </div>

            <!-- Settings toggles -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s3.opt_label') }}</div>
              <div class="ehub-card" style="overflow:hidden">
                <div class="toggle-field-row">
                  <div class="toggle-field-ico"><font-awesome-icon icon="star" /></div>
                  <div class="toggle-field-info">
                    <div class="toggle-field-name">{{ $t('pages.teams.create.s3.opt_stats') }}</div>
                    <div class="toggle-field-sub">{{ $t('pages.teams.create.s3.opt_stats_sub') }}</div>
                  </div>
                  <input type="checkbox" class="ehub-toggle" v-model="form.show_stats" />
                </div>
                <div class="toggle-field-row">
                  <div class="toggle-field-ico"><font-awesome-icon icon="calendar-check" /></div>
                  <div class="toggle-field-info">
                    <div class="toggle-field-name">{{ $t('pages.teams.create.s3.opt_events') }}</div>
                    <div class="toggle-field-sub">{{ $t('pages.teams.create.s3.opt_events_sub') }}</div>
                  </div>
                  <input type="checkbox" class="ehub-toggle" v-model="form.show_events" />
                </div>
                <div class="toggle-field-row">
                  <div class="toggle-field-ico"><font-awesome-icon icon="comment" /></div>
                  <div class="toggle-field-info">
                    <div class="toggle-field-name">{{ $t('pages.teams.create.s3.opt_msg') }}</div>
                    <div class="toggle-field-sub">{{ $t('pages.teams.create.s3.opt_msg_sub') }}</div>
                  </div>
                  <input type="checkbox" class="ehub-toggle" v-model="form.allow_messages" />
                </div>
              </div>
            </div>

            <!-- Social links -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s3.social_label') }}</div>
              <div class="social-row">
                <div class="social-ico" style="color:#1DA1F2"><font-awesome-icon :icon="['fab', 'twitter']" /></div>
                <input v-model="form.social_twitter" type="url" class="form-control" placeholder="https://twitter.com/suaequipe" />
              </div>
              <div class="social-row">
                <div class="social-ico" style="color:#833AB4"><font-awesome-icon :icon="['fab', 'instagram']" /></div>
                <input v-model="form.social_instagram" type="url" class="form-control" placeholder="https://instagram.com/suaequipe" />
              </div>
              <div class="social-row">
                <div class="social-ico" style="color:#5865F2"><font-awesome-icon :icon="['fab', 'discord']" /></div>
                <input v-model="form.social_discord" type="url" class="form-control" placeholder="https://discord.gg/convite" />
              </div>
              <div class="social-row">
                <div class="social-ico" style="color:#FF0000"><font-awesome-icon :icon="['fab', 'youtube']" /></div>
                <input v-model="form.social_youtube" type="url" class="form-control" placeholder="https://youtube.com/@suaequipe" />
              </div>
            </div>
          </div>

          <!-- ═══ STEP 4: Revisão & Publicar ═══ -->
          <div v-else-if="currentStep === 3" key="s4">
            <h2 class="step-title">{{ $t('pages.teams.create.s4.title') }}</h2>
            <p class="step-sub">{{ $t('pages.teams.create.s4.sub') }}</p>

            <!-- Preview card -->
            <div class="review-team-card mb-4">
              <div class="rev-banner" :style="bannerBgStyle">
                <div class="rev-stripe"></div>
              </div>
              <div class="rev-logo" :style="logoAccentStyle">
                <img v-if="logoPreview" :src="logoPreview" alt="logo" />
                <span v-else>{{ form.tag ? form.tag.slice(0,2) : '?' }}</span>
              </div>
              <div class="rev-body">
                <div class="rev-name">{{ form.name || $t('pages.teams.create.team_name_placeholder') }}</div>
                <div class="rev-chips">
                  <span v-if="form.category" class="rev-chip primary">{{ $t(`categories.names.${form.category}`, form.category) }}</span>
                  <span v-if="form.skill_level" class="rev-chip">{{ $t(`pages.teams.create.levels.${form.skill_level}`) }}</span>
                  <span class="rev-chip">{{ form.visibility === 'public' ? $t('pages.teams.create.vis.public') : $t('pages.teams.create.vis.private') }}</span>
                </div>
              </div>
            </div>

            <!-- Summary fields -->
            <div class="review-fields mb-4">
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.tag') }}</div>
                <div class="rf-v" :class="{ muted: !form.tag }">#{{ form.tag || '—' }}</div>
              </div>
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.category') }}</div>
                <div class="rf-v" :class="{ muted: !form.category }">{{ form.category ? $t(`categories.names.${form.category}`, form.category) : $t('pages.teams.create.s4.not_set') }}</div>
              </div>
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.level') }}</div>
                <div class="rf-v" :class="{ muted: !form.skill_level }">{{ form.skill_level ? $t(`pages.teams.create.levels.${form.skill_level}`) : $t('pages.teams.create.s4.not_set') }}</div>
              </div>
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.location') }}</div>
                <div class="rf-v" :class="{ muted: !form.location }">{{ regionName || $t('pages.teams.create.s4.not_set') }}</div>
              </div>
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.visibility') }}</div>
                <div class="rf-v">{{ form.visibility === 'public' ? $t('pages.teams.create.vis.public') : $t('pages.teams.create.vis.private') }}</div>
              </div>
              <div class="rf">
                <div class="rf-k">{{ $t('pages.teams.create.s4.recruitment') }}</div>
                <div class="rf-v">{{ form.is_open ? $t('pages.teams.create.rec.open') : $t('pages.teams.create.rec.invite') }}</div>
              </div>
            </div>

            <!-- Publish mode -->
            <div class="form-section">
              <div class="form-section-label">{{ $t('pages.teams.create.s4.pub_label') }}</div>
              <div class="pub-cards">
                <div class="pub-card" :class="{ sel: publishNow === true }" @click="publishNow = true">
                  <div class="pi"><font-awesome-icon icon="rocket" /></div>
                  <div class="pn">{{ $t('pages.teams.create.s4.pub_now') }}</div>
                  <div class="pd">{{ $t('pages.teams.create.s4.pub_now_d') }}</div>
                </div>
                <div class="pub-card" :class="{ sel: publishNow === false }" @click="publishNow = false">
                  <div class="pi"><font-awesome-icon icon="pen-to-square" /></div>
                  <div class="pn">{{ $t('pages.teams.create.s4.pub_draft') }}</div>
                  <div class="pd">{{ $t('pages.teams.create.s4.pub_draft_d') }}</div>
                </div>
              </div>
            </div>
          </div>

        </transition>
      </div><!-- /wiz-content -->

      <!-- ── BOTTOM ACTION BAR ── -->
      <div class="wiz-actions">
        <button v-if="currentStep > 0" class="btn btn-outline-secondary round" :disabled="submitting" @click="prevStep">
          <font-awesome-icon icon="arrow-left" class="me-1" />{{ $t('pages.teams.create.act.back') }}
        </button>
        <div style="flex:1"></div>
        <div v-if="errorMsg" class="text-danger small me-3">{{ errorMsg }}</div>
        <button v-if="currentStep < steps.length - 1" class="btn btn-primary round px-4" @click="nextStep">
          {{ $t('pages.teams.create.act.next') }}
          <font-awesome-icon icon="arrow-right" class="ms-1" />
        </button>
        <button v-else class="btn btn-primary round px-4" :disabled="submitting" @click="submit">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ submitting ? $t('pages.teams.create.act.creating') : $t('pages.teams.create.act.create') }}
        </button>
      </div>
    </div><!-- /wiz-main -->
  </div><!-- /wiz-wrap -->
</template>

<script>
import Teams from '@/helpers/communication/Teams.js';
import Tournament from '@/helpers/communication/Tournament.js';
import router from '@/router';
import { toast } from '@/helpers/toast.js';
import { i18n } from '@/helpers/i18n';

export default {
  data() {
    return {
      currentStep: 0,
      submitting: false,
      errorMsg: '',
      publishNow: true,
      catSearch: '',
      categories: [],
      logoPreview: null,
      bannerPreview: null,
      steps: [
        { key: 'identity' },
        { key: 'category' },
        { key: 'members' },
        { key: 'review' },
      ],
      skillLevels: ['casual', 'semi', 'pro', 'academy'],
      levelIcons: { casual: 'gamepad', semi: 'trophy', pro: 'crown', academy: 'graduation-cap' },
      accentColors: ['#0098D8', '#7C3AED', '#dc2626', '#059669', '#d97706', '#db2777', '#0f172a', '#374151'],
      categoryIcons: {
        'simracing':          'flag-checkered',
        'esports-fps':        'crosshairs',
        'esports-moba':       'dragon',
        'esports-fighting':   'hand-fist',
        'esports-strategy':   'chess-pawn',
        'esports-sports':     'futbol',
        'motorsport':         'car-side',
        'motorbike':          'motorcycle',
        'cycling':            'bicycle',
        'running':            'person-running',
        'swimming':           'person-swimming',
        'triathlon':          'bolt',
        'hiking':             'person-hiking',
        'crossfit':           'dumbbell',
        'rowing':             'water',
        'archery':            'bullseye',
        'chess':              'chess-knight',
        'drone-racing':       'helicopter',
      },
      regions: [
        { id: 'BR', flag: '🇧🇷', name: 'Brasil' },
        { id: 'LATAM', flag: '🌎', name: 'América Latina' },
        { id: 'NA', flag: '🇺🇸', name: 'América do Norte' },
        { id: 'EU', flag: '🇪🇺', name: 'Europa' },
        { id: 'ASIA', flag: '🌏', name: 'Ásia' },
        { id: 'OCE', flag: '🇦🇺', name: 'Oceania' },
      ],
      form: {
        name: '',
        tag: '',
        description: '',
        category: '',
        skill_level: '',
        location: '',
        color: '#0098D8',
        visibility: 'public',
        is_open: true,
        logo: '',
        max_members: 10,
        show_stats: true,
        show_events: true,
        allow_messages: false,
        social_twitter: '',
        social_instagram: '',
        social_discord: '',
        social_youtube: '',
      },
    };
  },
  computed: {
    filteredCategories() {
      const q = this.catSearch.toLowerCase().trim();
      if (!q) return this.categories;
      return this.categories.filter(c =>
        c.name.toLowerCase().includes(q) || c.route.toLowerCase().includes(q)
      );
    },
    bannerBgStyle() {
      if (this.bannerPreview) return { backgroundImage: `url(${this.bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      return { background: `linear-gradient(135deg, ${this.form.color}, ${this.lighten(this.form.color, 30)})` };
    },
    logoAccentStyle() {
      return { background: `linear-gradient(135deg, ${this.form.color}, ${this.lighten(this.form.color, 30)})` };
    },
    logoThumbStyle() {
      if (this.logoPreview) return { background: 'transparent' };
      return { background: `linear-gradient(135deg, ${this.form.color}, ${this.lighten(this.form.color, 30)})` };
    },
    regionName() {
      const r = this.regions.find(r => r.id === this.form.location);
      return r ? r.name : this.form.location;
    },
  },
  async mounted() {
    const result = await Tournament.getAllCategories();
    if (result.code === 200 && result.data) this.categories = result.data;
  },
  methods: {
    lighten(hex, pct) {
      try {
        const n = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (n >> 16) + pct);
        const g = Math.min(255, ((n >> 8) & 0xff) + pct);
        const b = Math.min(255, (n & 0xff) + pct);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      } catch { return hex; }
    },
    goToStep(i) {
      if (i < this.currentStep) { this.currentStep = i; this.errorMsg = ''; }
    },
    nextStep() {
      this.errorMsg = '';
      if (this.currentStep === 0 && (!this.form.name.trim() || !this.form.tag.trim())) {
        this.errorMsg = i18n.t('pages.teams.create.act.required');
        return;
      }
      if (this.currentStep === 1 && !this.form.category) {
        this.errorMsg = i18n.t('pages.teams.create.act.required_cat');
        return;
      }
      if (this.currentStep < this.steps.length - 1) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 0) { this.currentStep--; this.errorMsg = ''; }
    },
    onLogoChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { this.logoPreview = ev.target.result; this.form.logo = ev.target.result; };
      reader.readAsDataURL(file);
    },
    removeLogo() {
      this.logoPreview = null;
      this.form.logo = '';
      if (this.$refs.logoInput) this.$refs.logoInput.value = '';
    },
    onBannerChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { this.bannerPreview = ev.target.result; };
      reader.readAsDataURL(file);
    },
    removeBanner() {
      this.bannerPreview = null;
      if (this.$refs.bannerInput) this.$refs.bannerInput.value = '';
    },
    async submit() {
      this.errorMsg = '';
      this.submitting = true;
      const payload = {
        name: this.form.name,
        tag: this.form.tag,
        description: this.form.description,
        category: this.form.category,
        skill_level: this.form.skill_level,
        location: this.form.location,
        color: this.form.color,
        is_open: this.form.is_open,
      };
      if (this.form.logo) payload.logo = this.form.logo;
      const res = await Teams.create(payload);
      this.submitting = false;
      if (res.code === 201 && res.data) {
        toast.success(i18n.t('pages.teams.create.act.create'));
        router.push('/my-teams');
      } else {
        this.errorMsg = res.message || i18n.t('pages.teams.create.act.error');
      }
    },
  },
};
</script>

<style scoped>
/* ── Wizard shell ── */
.wiz-wrap {
  display: grid;
  grid-template-columns: 256px 1fr;
  min-height: calc(100vh - 60px);
}
.wiz-sidebar {
  background: var(--ehub-card);
  border-right: 1px solid var(--ehub-line);
  padding: 28px 20px;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Sidebar team row */
.sb-team-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--ehub-line);
}
.sb-team-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .85rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
}
.sb-team-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sb-team-name { font-size: .85rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; }
.sb-team-tag { font-size: .72rem; color: var(--ehub-muted); }

/* Vertical step list */
.v-steps { display: flex; flex-direction: column; gap: 0; flex: 1; }
.v-step { display: flex; gap: 13px; position: relative; cursor: pointer; }
.v-step:not(:last-child) { padding-bottom: 6px; }
.v-step:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 30px; width: 2px; bottom: 0; background: var(--ehub-line); z-index: 0; }
.v-step.done:not(:last-child)::after { background: var(--ehub-primary); }
.v-dot {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; position: relative; z-index: 1;
  border: 2px solid var(--ehub-line); background: var(--ehub-card);
  display: flex; align-items: center; justify-content: center;
  font-size: .74rem; font-weight: 700; color: var(--ehub-muted);
  transition: all .2s; margin-top: 2px;
}
.v-step.active .v-dot { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.v-step.done .v-dot { border-color: var(--ehub-primary); background: var(--ehub-primary); color: #fff; }
.v-label { padding-bottom: 22px; }
.v-step-name { font-size: .85rem; font-weight: 700; color: var(--ehub-muted); line-height: 1.2; transition: color .15s; }
.v-step-hint { font-size: .73rem; color: var(--ehub-muted); opacity: .65; margin-top: 2px; }
.v-step.active .v-step-name { color: var(--ehub-primary); }
.v-step.done .v-step-name { color: var(--ehub-ink); }

/* Sidebar preview */
.sb-preview { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--ehub-line); }
.sb-preview-label { font-size: .67rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; }
.sb-preview-card { border: 1px solid var(--ehub-line); border-radius: 12px; overflow: hidden; background: var(--ehub-card); }
.sb-prev-banner { height: 44px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.stripe { position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg,transparent 0 28px,rgba(255,255,255,.07) 28px 30px); }
.sb-prev-body { padding: 8px 12px 12px; display: flex; align-items: center; gap: 10px; }
.sb-prev-logo {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 800; color: #fff; flex-shrink: 0;
  margin-top: -20px; border: 2.5px solid var(--ehub-card); overflow: hidden;
}
.sb-prev-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sb-prev-info { flex: 1; min-width: 0; padding-top: 4px; }
.sb-prev-name { font-size: .82rem; font-weight: 700; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-prev-tag { font-size: .7rem; color: var(--ehub-muted); }

/* ── Main content ── */
.wiz-main { display: flex; flex-direction: column; min-height: calc(100vh - 60px); }
.wiz-content { flex: 1; padding: 36px 44px; }
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }

/* ── Form helpers ── */
.form-section { margin-bottom: 26px; }
.form-section-label {
  font-size: .7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); margin-top: 5px; }
.char-count { font-size: .73rem; color: var(--ehub-muted); text-align: right; margin-top: 3px; }
.tag-prefix { font-weight: 700; font-size: .95rem; color: var(--ehub-muted); }

/* ── Banner thumb ── */
.banner-thumb { width: 100%; height: 78px; border-radius: 11px; margin-bottom: 10px; overflow: hidden; position: relative; }
.bt-stripe { position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg,transparent 0 42px,rgba(255,255,255,.06) 42px 44px); pointer-events: none; }

/* ── Logo thumb ── */
.logo-thumb { width: 72px; height: 72px; border-radius: 18px; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: #fff; }
.logo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ── Color picker ── */
.color-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.color-sw { width: 34px; height: 34px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: transform .12s, box-shadow .12s; flex-shrink: 0; }
.color-sw:hover { transform: scale(1.12); }
.color-sw.sel { box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.06); }
.color-custom-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.color-hex-inp { width: 110px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: .85rem; padding: .45rem .75rem; }

/* ── Category grid ── */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
.cat-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 14px 10px 12px; cursor: pointer; text-align: center; transition: all .15s; background: var(--ehub-card); }
.cat-card:hover { border-color: var(--ehub-primary); background: var(--ehub-primary-tint2); }
.cat-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.cat-ico { font-size: 1.5rem; margin-bottom: 7px; line-height: 1; }
.cat-name { font-size: .8rem; font-weight: 700; color: var(--ehub-ink); }
.cat-search-wrap { position: relative; margin-bottom: 10px; }
.search-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ehub-muted); font-size: .8rem; pointer-events: none; z-index: 1; }
.cat-search-inp { padding-left: 36px !important; }
.cat-scroll { max-height: 240px; overflow-y: auto; padding-right: 2px; }
.cat-scroll::-webkit-scrollbar { width: 4px; }
.cat-scroll::-webkit-scrollbar-thumb { background: var(--ehub-line); border-radius: 4px; }
.cat-no-results { text-align: center; padding: 20px; color: var(--ehub-muted); font-size: .84rem; }

/* ── Category selected badge ── */
.cat-sel-badge { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 12px; background: var(--ehub-primary-tint); border: 1.5px solid var(--ehub-primary-border); }
.cat-sel-ico { width: 38px; height: 38px; border-radius: 10px; background: var(--ehub-primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; flex-shrink: 0; }
.cat-sel-name { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); }
.cat-sel-hint { font-size: .73rem; color: var(--ehub-muted); }
.cat-change-btn { font-size: .78rem; font-weight: 600; cursor: pointer; color: var(--ehub-primary); background: none; border: 1px solid var(--ehub-primary-border); border-radius: 8px; padding: 4px 12px; transition: background .12s; white-space: nowrap; }
.cat-change-btn:hover { background: var(--ehub-primary-tint); }
@keyframes badgeReveal { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
.badge-reveal { animation: badgeReveal .2s ease both; }

/* ── Visibility / recruitment / level cards ── */
.vis-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.vis-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 15px 16px; cursor: pointer; transition: all .15s; background: var(--ehub-card); }
.vis-card:hover { border-color: var(--ehub-primary); }
.vis-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.vi { font-size: 1.1rem; color: var(--ehub-muted); margin-bottom: 7px; }
.vis-card.sel .vi { color: var(--ehub-primary); }
.vn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 2px; }
.vd { font-size: .76rem; color: var(--ehub-muted); line-height: 1.4; }

/* ── Toggle ── */
.ehub-toggle { -webkit-appearance: none; appearance: none; width: 36px; height: 20px; border-radius: 10px; background: var(--ehub-line); cursor: pointer; position: relative; transition: background .15s; flex-shrink: 0; }
.ehub-toggle:checked { background: var(--ehub-primary); }
.ehub-toggle::after { content: ''; position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: transform .15s; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.ehub-toggle:checked::after { transform: translateX(16px); }

/* ── Toggle rows ── */
.toggle-field-row { display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-bottom: 1px solid var(--ehub-line); transition: background .12s; }
.toggle-field-row:last-child { border-bottom: 0; }
.toggle-field-row:hover { background: color-mix(in srgb, var(--ehub-primary) 3%, transparent); }
.toggle-field-ico { width: 26px; text-align: center; color: var(--ehub-muted); font-size: .88rem; flex-shrink: 0; }
.toggle-field-info { flex: 1; min-width: 0; }
.toggle-field-name { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.toggle-field-sub { font-size: .72rem; color: var(--ehub-muted); line-height: 1.3; margin-top: 1px; }

/* ── Social ── */
.social-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.social-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .9rem; flex-shrink: 0; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); }

/* ── Region grid ── */
.region-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px,1fr)); gap: 7px; }
.region-card { border: 2px solid var(--ehub-line); border-radius: 10px; padding: 10px 14px; cursor: pointer; transition: all .15s; background: var(--ehub-card); display: flex; align-items: center; gap: 10px; }
.region-card:hover { border-color: var(--ehub-primary); }
.region-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.region-flag { font-size: 1.25rem; flex-shrink: 0; }
.region-name { font-size: .82rem; font-weight: 600; color: var(--ehub-ink); }

/* ── Review card ── */
.review-team-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; max-width: 360px; }
.rev-banner { height: 72px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.rev-stripe { position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg,transparent 0 42px,rgba(255,255,255,.06) 42px 44px); }
.rev-logo { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; color: #fff; margin: -26px 0 0 16px; border: 3px solid var(--ehub-card); position: relative; overflow: hidden; }
.rev-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.rev-body { padding: 8px 16px 14px; }
.rev-name { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 6px 0 4px; }
.rev-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.rev-chip { font-size: .7rem; font-weight: 600; padding: 3px 9px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.rev-chip.primary { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }

/* ── Summary fields ── */
.review-fields { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.rf { display: flex; padding: 12px 16px; border-bottom: 1px solid var(--ehub-line); gap: 12px; align-items: flex-start; }
.rf:last-child { border-bottom: 0; }
.rf-k { font-size: .73rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); width: 120px; flex-shrink: 0; padding-top: 2px; }
.rf-v { font-size: .88rem; font-weight: 600; color: var(--ehub-ink); flex: 1; }
.rf-v.muted { color: var(--ehub-muted); font-weight: 400; font-style: italic; }

/* ── Publish cards ── */
.pub-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-top: 4px; }
.pub-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 16px; cursor: pointer; transition: all .15s; background: var(--ehub-card); }
.pub-card:hover { border-color: var(--ehub-primary); }
.pub-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.pi { font-size: 1.1rem; color: var(--ehub-muted); margin-bottom: 6px; }
.pub-card.sel .pi { color: var(--ehub-primary); }
.pn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 2px; }
.pd { font-size: .76rem; color: var(--ehub-muted); line-height: 1.4; }

/* ── Bottom action bar ── */
.wiz-actions {
  position: sticky; bottom: 0;
  background: color-mix(in srgb, var(--ehub-card) 92%, transparent);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--ehub-line);
  padding: 14px 44px;
  display: flex; align-items: center; gap: 10px;
}

/* ── Transitions ── */
.slide-step-enter-active, .slide-step-leave-active { transition: all .2s ease; }
.slide-step-enter-from { opacity: 0; transform: translateX(20px); }
.slide-step-leave-to { opacity: 0; transform: translateX(-20px); }

/* ── Responsive ── */
@media (max-width: 860px) {
  .wiz-wrap { grid-template-columns: 1fr; }
  .wiz-sidebar { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--ehub-line); padding: 14px 16px 0; }
  .v-steps { flex-direction: row; gap: 0; overflow-x: auto; padding: 10px 0 14px; scrollbar-width: none; }
  .v-steps::-webkit-scrollbar { display: none; }
  .v-step { flex-direction: column; align-items: center; flex: 1 0 62px; gap: 5px; padding-bottom: 0; }
  .v-step::after { display: none !important; }
  .v-step:not(:last-child)::before { content: ''; position: absolute; top: 15px; left: calc(50% + 15px); right: calc(-50% + 15px); height: 2px; background: var(--ehub-line); z-index: 0; }
  .v-step.done:not(:last-child)::before { background: var(--ehub-primary); }
  .v-dot { position: relative; z-index: 1; }
  .v-label { padding-bottom: 0; text-align: center; }
  .v-step-name { font-size: .67rem; font-weight: 600; line-height: 1.3; }
  .v-step-hint { display: none; }
  .sb-team-row, .sb-preview { display: none; }
  .wiz-content { padding: 20px 16px; }
  .wiz-actions { padding: 12px 16px; }
  .vis-cards, .pub-cards { grid-template-columns: 1fr; }
}
</style>
